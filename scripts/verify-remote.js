#!/usr/bin/env node

import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const IONOS_CONFIG = {
  host: 'access-5018328928.webspace-host.com',
  username: 'a2096159',
  password: 'Yaa7Rih^_gpej+-',
  port: 22,
};

async function verifyRemote() {
  const sftp = new SftpClient();
  
  try {
    console.log('🔍 Connecting to IONOS SFTP to verify deployment...');
    await sftp.connect({
      host: IONOS_CONFIG.host,
      username: IONOS_CONFIG.username,
      password: IONOS_CONFIG.password,
      port: IONOS_CONFIG.port
    });

    console.log('✅ Connected to IONOS SFTP');
    
    // Check httpdocs directory
    console.log('\n📂 Contents of /httpdocs:');
    try {
      const files = await sftp.list('/httpdocs');
      files.forEach(file => {
        console.log(`- ${file.name} (${file.type}, ${file.size} bytes, ${file.modifyTime})`);
      });
    } catch (err) {
      console.error('❌ Error listing /httpdocs:', err.message);
    }

    // Check for index.html
    try {
      const indexExists = await sftp.exists('/httpdocs/index.html');
      console.log('\n🔍 /httpdocs/index.html exists:', indexExists);
      
      if (indexExists) {
        const stats = await sftp.stat('/httpdocs/index.html');
        console.log('   Size:', stats.size, 'bytes');
        console.log('   Modified:', stats.modifyTime);
        console.log('   Permissions:', stats.permissions.toString(8).slice(-3));
      }
    } catch (err) {
      console.error('❌ Error checking index.html:', err.message);
    }

    // Check for assets directory
    try {
      const assetsExists = await sftp.exists('/httpdocs/assets');
      console.log('\n📁 /httpdocs/assets exists:', assetsExists);
      
      if (assetsExists) {
        const assets = await sftp.list('/httpdocs/assets');
        console.log(`   Contains ${assets.length} files:`);
        assets.slice(0, 5).forEach(file => {
          console.log(`   - ${file.name} (${file.size} bytes)`);
        });
        if (assets.length > 5) {
          console.log(`   ...and ${assets.length - 5} more files`);
        }
      }
    } catch (err) {
      console.error('❌ Error checking assets directory:', err.message);
    }

  } catch (error) {
    console.error('❌ Error connecting to IONOS SFTP:', error.message);
  } finally {
    await sftp.end();
  }
}

// Run the verification
verifyRemote();
