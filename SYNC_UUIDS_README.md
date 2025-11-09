# Remnawave UUID Sync Script

This script syncs user UUIDs from the Remnawave API to your database.

## What it does:

1. Fetches all users from Remnawave API (GET https://{{REMNAWAVE_API_URL}}/api/users)
2. For each user, inserts their username and UUID into the `user_uuids` table
3. Uses `INSERT INTO user_uuids (username, remnawave_uuid, created_at) VALUES (...) ON CONFLICT DO NOTHING`
4. Reports how many UUIDs were synced

## Prerequisites:

Make sure your `.env` file contains:
```
REMNAWAVE_API_URL=your_remnawave_api_url
REMNAWAVE_API_TOKEN=your_remnawave_api_token
DATABASE_URL=your_database_connection_string
```

## How to run:

```bash
# Using node
node sync-remnawave-uuids.js

# Or using bun
bun sync-remnawave-uuids.js

# Or using npm script (if added to package.json)
npm run sync-uuids
```

## Output:

The script will display:
- Progress of fetching users from Remnawave
- Each UUID being synced
- Final summary showing:
  - Total users fetched
  - New UUIDs synced
  - UUIDs that already existed
  - Any errors

## Example output:

```
🚀 Starting UUID sync from Remnawave...

📡 Fetching users from Remnawave API...
   URL: https://api.remnawave.com/api/users
✅ Fetched 150 users from Remnawave

🔌 Connecting to database...
✅ Connected to database

💾 Syncing UUIDs to database...
✅ Synced: john_doe → 123e4567-e89b-12d3-a456-426614174000
✅ Synced: jane_smith → 123e4567-e89b-12d3-a456-426614174001
⏭️  Already exists: bob_wilson → 123e4567-e89b-12d3-a456-426614174002
...

============================================================
📊 Sync Summary:
============================================================
Total users fetched:     150
✅ New UUIDs synced:     95
⏭️  Already existed:     55
⚠️  Skipped (no data):  0
❌ Errors:               0
============================================================

🎉 UUID sync completed!
```

## Database table structure:

The script expects a `user_uuids` table with this structure:

```sql
CREATE TABLE user_uuids (
  username VARCHAR(255),
  remnawave_uuid VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (username, remnawave_uuid)
);
```

## Notes:

- The script uses `ON CONFLICT DO NOTHING` so it's safe to run multiple times
- Only new UUIDs will be inserted; existing ones will be skipped
- The script will show detailed progress for each user being synced
