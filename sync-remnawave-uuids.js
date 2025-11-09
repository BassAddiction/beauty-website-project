#!/usr/bin/env node

/**
 * Sync user UUIDs from Remnawave API to database
 * 
 * This script:
 * 1. Fetches all users from Remnawave API
 * 2. Inserts username and UUID into user_uuids table
 * 3. Reports how many UUIDs were synced
 */

import https from 'https';
import http from 'http';
import pg from 'pg';
const { Client } = pg;

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const REMNAWAVE_API_URL = process.env.REMNAWAVE_API_URL?.replace(/\/$/, '');
const REMNAWAVE_API_TOKEN = process.env.REMNAWAVE_API_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

if (!REMNAWAVE_API_URL || !REMNAWAVE_API_TOKEN || !DATABASE_URL) {
  console.error('❌ Missing required environment variables:');
  console.error('  - REMNAWAVE_API_URL');
  console.error('  - REMNAWAVE_API_TOKEN');
  console.error('  - DATABASE_URL');
  process.exit(1);
}

async function fetchUsers() {
  const url = `${REMNAWAVE_API_URL}/api/users`;
  
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'Authorization': `Bearer ${REMNAWAVE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function syncUUIDs() {
  console.log('🚀 Starting UUID sync from Remnawave...\n');
  
  // Step 1: Fetch users from Remnawave
  console.log('📡 Fetching users from Remnawave API...');
  console.log(`   URL: ${REMNAWAVE_API_URL}/api/users`);
  
  let usersData;
  try {
    usersData = await fetchUsers();
  } catch (error) {
    console.error(`❌ Failed to fetch users: ${error.message}`);
    process.exit(1);
  }
  
  const users = usersData?.response?.users || [];
  console.log(`✅ Fetched ${users.length} users from Remnawave\n`);
  
  if (users.length === 0) {
    console.log('⚠️  No users found in Remnawave API response');
    return;
  }
  
  // Step 2: Connect to database
  console.log('🔌 Connecting to database...');
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
  } catch (error) {
    console.error(`❌ Failed to connect to database: ${error.message}`);
    process.exit(1);
  }
  
  // Step 3: Insert UUIDs
  console.log('💾 Syncing UUIDs to database...');
  let syncedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const user of users) {
    const username = user.username;
    const uuid = user.uuid;
    
    if (!username || !uuid) {
      console.log(`⚠️  Skipping user with missing data: ${JSON.stringify(user)}`);
      skippedCount++;
      continue;
    }
    
    try {
      const query = `
        INSERT INTO user_uuids (username, remnawave_uuid, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (username, remnawave_uuid) DO NOTHING
      `;
      
      const result = await client.query(query, [username, uuid]);
      
      if (result.rowCount > 0) {
        console.log(`✅ Synced: ${username} → ${uuid}`);
        syncedCount++;
      } else {
        console.log(`⏭️  Already exists: ${username} → ${uuid}`);
      }
    } catch (error) {
      console.error(`❌ Failed to sync ${username}: ${error.message}`);
      errorCount++;
    }
  }
  
  await client.end();
  
  // Step 4: Report results
  console.log('\n' + '='.repeat(60));
  console.log('📊 Sync Summary:');
  console.log('='.repeat(60));
  console.log(`Total users fetched:     ${users.length}`);
  console.log(`✅ New UUIDs synced:     ${syncedCount}`);
  console.log(`⏭️  Already existed:      ${users.length - syncedCount - skippedCount - errorCount}`);
  console.log(`⚠️  Skipped (no data):   ${skippedCount}`);
  console.log(`❌ Errors:               ${errorCount}`);
  console.log('='.repeat(60));
  
  console.log('\n🎉 UUID sync completed!');
}

syncUUIDs().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
