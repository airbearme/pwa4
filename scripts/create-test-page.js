#!/usr/bin/env node

import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const IONOS_CONFIG = {
  host: process.env.IONOS_SFTP_HOST || 'access-5018328928.webspace-host.com',
  username: process.env.IONOS_SFTP_USER || 'a2096159',
  password: process.env.IONOS_SFTP_PASSWORD || 'Yaa7Rih^_gpej+-',
  port: 22,
};

console.log('🧪 Creating test page on IONOS...');

async function createTestPage() {
  try {
    const sftp = new SftpClient();

    await sftp.connect({
      host: IONOS_CONFIG.host,
      username: IONOS_CONFIG.username,
      password: IONOS_CONFIG.password,
      port: IONOS_CONFIG.port
    });

    console.log('📡 Connected to IONOS SFTP');

    // Create a simple test HTML page
    const testContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AirBear PWA Test - DEPLOYMENT SUCCESS!</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(45deg, #22c55e, #f97316);
            color: white;
            margin: 0;
        }
        .container {
            background: rgba(0,0,0,0.1);
            padding: 40px;
            border-radius: 20px;
            max-width: 600px;
            margin: 0 auto;
        }
        h1 { color: #fff; }
        .success { 
            font-size: 48px; 
            margin: 20px 0; 
        }
        .info {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 AirBear PWA Deployment Test</h1>
        <div class="success">✅ SUCCESS!</div>
        <div class="info">
            <h3>✅ Deployment Status</h3>
            <p>✅ Files uploaded successfully to IONOS</p>
            <p>✅ IONOS SFTP connection working</p>
            <p>✅ Green and Orange UI styling applied</p>
            <p>✅ AirBear PWA content deployed</p>
        </div>
        <div class="info">
            <h3>🌐 Server Information</h3>
            <p><strong>Domain:</strong> airbear.me</p>
            <p><strong>Server:</strong> IONOS</p>
            <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
        </div>
        <div class="info">
            <h3>🔗 Next Steps</h3>
            <p>If you can see this page, the server is working!</p>
            <p>Try accessing the main app: <a href="/index.html" style="color: #fff; text-decoration: underline;">Main PWA App</a></p>
        </div>
    </div>
</body>
</html>`;

    // Upload to multiple locations for testing
    const locations = ['/', '/httpdocs', '/public_html'];
    
    for (const location of locations) {
      const testFilePath = `${location}/test.html`;
      try {
        await sftp.put(Buffer.from(testContent), testFilePath);
        console.log(`✅ Created test page at: ${testFilePath}`);
        console.log(`🌐 Try accessing: https://airbear.me/test.html`);
      } catch (err) {
        console.log(`❌ Failed to create test page at ${testFilePath}: ${err.message}`);
      }
    }

    await sftp.end();
    console.log('\n🎯 Test page creation completed!');
    console.log('🔗 Try accessing: https://airbear.me/test.html');

  } catch (error) {
    console.error('❌ Test page creation failed:', error.message);
  }
}

createTestPage();
