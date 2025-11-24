#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import SftpClient from 'ssh2-sftp-client';

// Using the correct credentials from FileZilla
const IONOS_CONFIG = {
  host: 'access-5018328928.webspace-host.com',
  username: 'a2096159',
  password: 'Danknugs420420',  // Correct password from FileZilla
  port: 22,
  remoteBase: '/public_html',  // Try public_html first
  localDist: 'dist/public'
};

console.log('🚀 Deploying AirBear PWA to airbear.me with correct credentials...');

const joinRemotePath = (...parts) => 
  parts.filter(Boolean).join('/').replace(/\\/g, '/');

async function deploy() {
  const sftp = new SftpClient();
  
  try {
    // 1. Verify build output exists
    const distPath = path.resolve(IONOS_CONFIG.localDist);
    if (!fs.existsSync(distPath)) {
      throw new Error(`Build output not found at ${distPath}. Please run npm run build first.`);
    }
    console.log('✅ Build verified at', distPath);

    // 2. Connect to IONOS SFTP
    console.log('🌐 Connecting to IONOS server...');
    await sftp.connect({
      host: IONOS_CONFIG.host,
      username: IONOS_CONFIG.username,
      password: IONOS_CONFIG.password,
      port: IONOS_CONFIG.port
    });
    console.log('✅ Connected successfully to IONOS!');

    // 3. Find the correct remote directory
    let targetDir = IONOS_CONFIG.remoteBase;
    const possibleDirs = ['/public_html', '/httpdocs', '/www', '/htdocs'];
    
    for (const dir of possibleDirs) {
      try {
        await sftp.stat(dir);
        targetDir = dir;
        console.log('✅ Found web directory:', targetDir);
        break;
      } catch (err) {
        continue;
      }
    }

    // 4. Backup existing files
    console.log('📦 Creating backup of existing files...');
    try {
      const existingFiles = await sftp.list(targetDir);
      if (existingFiles.length > 0) {
        const backupDir = `${targetDir}_backup_${Date.now()}`;
        await sftp.mkdir(backupDir, true);
        
        for (const file of existingFiles) {
          if (file.name !== '.' && file.name !== '..') {
            const oldPath = joinRemotePath(targetDir, file.name);
            const newPath = joinRemotePath(backupDir, file.name);
            try {
              await sftp.rename(oldPath, newPath);
            } catch (err) {
              console.log('⚠️ Could not backup file:', file.name);
            }
          }
        }
        console.log('✅ Backup created');
      }
    } catch (err) {
      console.log('ℹ️ No existing files to backup');
    }

    // 5. Clear remote directory for fresh deployment
    console.log('🧹 Clearing remote directory...');
    try {
      const remoteFiles = await sftp.list(targetDir);
      for (const file of remoteFiles) {
        if (file.name !== '.' && file.name !== '..') {
          const remotePath = joinRemotePath(targetDir, file.name);
          try {
            if (file.type === 'd') {
              await sftp.rmdir(remotePath, true);
            } else {
              await sftp.delete(remotePath);
            }
          } catch (err) {
            console.log('⚠️ Could not delete:', file.name);
          }
        }
      }
    } catch (err) {
      console.log('ℹ️ Remote directory already clean');
    }

    // 6. Upload new files
    console.log('📤 Uploading AirBear PWA with orange & green UI...');
    
    async function uploadDir(localPath, remotePath) {
      const files = fs.readdirSync(localPath);
      
      for (const file of files) {
        const localFilePath = path.join(localPath, file);
        const remoteFilePath = joinRemotePath(remotePath, file);
        const stats = fs.statSync(localFilePath);

        if (stats.isDirectory()) {
          await sftp.mkdir(remoteFilePath, true);
          await uploadDir(localFilePath, remoteFilePath);
        } else {
          await sftp.fastPut(localFilePath, remoteFilePath);
          console.log(`✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        }
      }
    }

    await uploadDir(distPath, targetDir);

    // 7. Verification
    console.log('\n🔍 Final verification...');
    const indexExists = await sftp.exists(joinRemotePath(targetDir, 'index.html'));
    const manifestExists = await sftp.exists(joinRemotePath(targetDir, 'manifest.json'));
    
    console.log(`✅ index.html: ${indexExists ? 'DEPLOYED' : 'MISSING'}`);
    console.log(`✅ manifest.json: ${manifestExists ? 'DEPLOYED' : 'MISSING'}`);
    
    if (indexExists && manifestExists) {
      console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
      console.log('🌐 Your AirBear PWA is now live at: https://airbear.me');
      console.log('🍊🎨 Beautiful orange and green UI deployed!');
      console.log('📱 PWA install prompt will appear on first visit');
      console.log('🚗 Solar-powered rides with onboard bodegas ready!');
    } else {
      throw new Error('Deployment verification failed');
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.message.includes('authentication')) {
      console.error('🔐 Authentication error - checking credentials...');
    }
    process.exit(1);
  } finally {
    if (sftp) {
      await sftp.end();
      console.log('🔌 Disconnected from IONOS');
    }
  }
}

deploy();
