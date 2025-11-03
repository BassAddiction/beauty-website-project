const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const BACKEND_DIR = path.join(__dirname, 'backend');

const functionCache = new Map();

function loadPythonFunction(functionPath) {
  const indexPath = path.join(functionPath, 'index.py');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Function not found: ${indexPath}`);
  }
  
  return (event, context) => {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import sys
import json
sys.path.insert(0, '${functionPath}')
from index import handler

event = json.loads('''${JSON.stringify(event)}''')
context = type('Context', (), ${JSON.stringify(context)})()

result = handler(event, context)
print(json.dumps(result))
      `;
      
      exec(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Python execution error:', stderr);
          reject(new Error(stderr));
          return;
        }
        
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });
    });
  };
}

async function loadTypeScriptFunction(functionPath) {
  const indexPath = path.join(functionPath, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Function not found: ${indexPath}`);
  }
  
  try {
    const module = require(indexPath);
    return module.handler;
  } catch (error) {
    console.error(`Failed to load TS function: ${error.message}`);
    throw error;
  }
}

function getFunction(functionName) {
  if (functionCache.has(functionName)) {
    return functionCache.get(functionName);
  }
  
  const functionPath = path.join(BACKEND_DIR, functionName);
  
  if (!fs.existsSync(functionPath)) {
    throw new Error(`Function directory not found: ${functionName}`);
  }
  
  let handler;
  
  if (fs.existsSync(path.join(functionPath, 'index.py'))) {
    handler = loadPythonFunction(functionPath);
  } else if (fs.existsSync(path.join(functionPath, 'index.ts'))) {
    handler = loadTypeScriptFunction(functionPath);
  } else {
    throw new Error(`No index.py or index.ts found in ${functionName}`);
  }
  
  functionCache.set(functionName, handler);
  return handler;
}

app.all('/api/:functionName', async (req, res) => {
  const { functionName } = req.params;
  
  console.log(`📞 Request to function: ${functionName} (${req.method})`);
  
  try {
    const handler = getFunction(functionName);
    
    const event = {
      httpMethod: req.method,
      headers: req.headers,
      url: req.url,
      params: req.params,
      queryStringParameters: req.query,
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
      isBase64Encoded: false,
      requestContext: {
        requestId: req.id || Date.now().toString(),
        identity: {
          sourceIp: req.ip,
          userAgent: req.get('user-agent')
        },
        httpMethod: req.method,
        requestTime: new Date().toUTCString(),
        requestTimeEpoch: Date.now()
      }
    };
    
    const context = {
      requestId: event.requestContext.requestId,
      functionName: functionName,
      functionVersion: '1.0',
      memoryLimitInMB: 256,
      getRemainingTimeInMillis: () => 30000
    };
    
    const result = await handler(event, context);
    
    const statusCode = result.statusCode || 200;
    const headers = result.headers || {};
    const body = result.body || '';
    
    res.status(statusCode).set(headers).send(body);
    
    console.log(`✅ Function ${functionName} completed with status ${statusCode}`);
  } catch (error) {
    console.error(`❌ Function ${functionName} error:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV
  });
});

app.get('/', (req, res) => {
  const functions = fs.readdirSync(BACKEND_DIR)
    .filter(name => {
      const stat = fs.statSync(path.join(BACKEND_DIR, name));
      return stat.isDirectory() && name !== 'node_modules';
    });
  
  res.json({
    service: 'Speed VPN Backend API',
    version: '1.0.0',
    functions: functions,
    endpoints: functions.map(f => `/api/${f}`),
    health: '/health'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    availableFunctions: fs.readdirSync(BACKEND_DIR)
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on port ${PORT}`);
  console.log(`📁 Backend directory: ${BACKEND_DIR}`);
  console.log(`🔍 Available functions:`, fs.readdirSync(BACKEND_DIR));
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});
