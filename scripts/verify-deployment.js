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

console.log('🔍 Verifying AirBear PWA deployment on IONOS...');

async function verifyDeployment() {
  try {
    const sftp = new SftpClient();

    await sftp.connect({
      host: IONOS_CONFIG.host,
      username: IONOS_CONFIG.username,
      password: IONOS_CONFIG.password,
      port: IONOS_CONFIG.port
    });

    console.log('📡 Connected to IONOS SFTP');

    // Check multiple possible directories
    const directories = ['/', '/httpdocs', '/htdocs', '/public_html', '/www'];
    
    for (const dir of directories) {
      console.log(`\n🔍 Checking directory: ${dir}`);
      
      try {
        const list = await sftp.list(dir);
        const files = list.map(f => f.name);
        console.log(`📂 Files in ${dir}: ${files.join(', ')}`);
        
        if (files.includes('index.html')) {
          console.log(`✅ Found index.html in ${dir}!`);
          
          // Try to read the first few lines of index.html to verify content
          try {
            const content = await sftp.get(`${dir}/index.html`);
            console.log(`📄 Index.html preview: ${content.toString().substring(0, 200)}...`);
          } catch (err) {
            console.log(`⚠️  Could not read index.html from ${dir}: ${err.message}`);
          }
        }
      } catch (err) {
        console.log(`❌ Could not access ${dir}: ${err.message}`);
      }
    }

    await sftp.end();
    console.log('\n✅ Verification completed');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyDeployment();
