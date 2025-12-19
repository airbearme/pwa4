#!/usr/bin/env node

import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const IONOS_CONFIG = {
  host: process.env.IONOS_SFTP_HOST || 'access-5018328928.webspace-host.com',
  username: process.env.IONOS_SFTP_USER || 'a2096159',
  password: process.env.IONOS_SFTP_PASSWORD || 'Danknugs420420',
  port: 22,
  remoteBase: '/public' // Confirmed correct path
};

console.log('🔍 Verifying AirBear PWA deployment on IONOS...');

async function verifyDeployment() {
  const sftp = new SftpClient();

  try {
    await sftp.connect({
      host: IONOS_CONFIG.host,
      username: IONOS_CONFIG.username,
      password: IONOS_CONFIG.password,
      port: IONOS_CONFIG.port
    });

    console.log('📡 Connected to IONOS SFTP');
    console.log(`📂 Checking deployment directory: ${IONOS_CONFIG.remoteBase}`);

    const exists = await sftp.exists(IONOS_CONFIG.remoteBase);
    if (!exists) {
      throw new Error(`Remote directory ${IONOS_CONFIG.remoteBase} does not exist!`);
    }

    const list = await sftp.list(IONOS_CONFIG.remoteBase);
    const files = list.map(f => f.name);
    console.log(`📄 Files found: ${files.length}`);

    // Critical files to check
    const criticalFiles = [
      'index.html',
      'sw.js',
      'manifest.webmanifest',
      'assets'
    ];

    let allGood = true;

    for (const file of criticalFiles) {
      if (files.includes(file)) {
        const fileStat = list.find(f => f.name === file);
        console.log(`✅ ${file} exists (Size: ${fileStat.size} bytes)`);

        // For index.html, check content briefly
        if (file === 'index.html') {
          const content = await sftp.get(`${IONOS_CONFIG.remoteBase}/${file}`);
          const text = content.toString();
          if (text.includes('<div id="root"></div>') && text.includes('src="/assets/')) {
            console.log('   MATCH: Valid React root and assets found');
          } else {
            console.warn('   WARNING: index.html content might be suspicious');
            allGood = false;
          }
        }
      } else {
        console.error(`❌ MISSING: ${file}`);
        allGood = false;
      }
    }

    // Check assets folder
    if (files.includes('assets')) {
      const assetsList = await sftp.list(`${IONOS_CONFIG.remoteBase}/assets`);
      const jsFiles = assetsList.filter(f => f.name.endsWith('.js'));
      const cssFiles = assetsList.filter(f => f.name.endsWith('.css'));
      console.log(`📦 Assets: ${jsFiles.length} JS files, ${cssFiles.length} CSS files`);

      if (jsFiles.length > 0 && cssFiles.length > 0) {
        console.log('✅ Assets folder populated');
      } else {
        console.warn('⚠️ Assets folder looks empty or missing types');
        allGood = false;
      }
    }

    if (allGood) {
      console.log('\n🎉 Verification SUCCESSFUL! The deployment structure looks correct.');
      console.log(`🌐 Live URL: https://airbear.me`);
    } else {
      console.error('\n⚠️ Verification found issues. Please review logs above.');
      process.exit(1);
    }

    await sftp.end();

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyDeployment();
