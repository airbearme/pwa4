#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import SftpClient from 'ssh2-sftp-client';

const CONFIG = {
  host: 'access-5018328928.webspace-host.com',
  username: 'a2096159',
  password: 'Danknugs420420',
  port: 22
};

const LOCAL_DIR = path.resolve('dist/public');
const REMOTE_DIR = '/public';

const joinRemote = (...parts) => parts.filter(Boolean).join('/').replace(/\\/g, '/');

async function uploadDir(sftp, localDir, remoteDir) {
  const entries = fs.readdirSync(localDir);
  for (const entry of entries) {
    const localPath = path.join(localDir, entry);
    const remotePath = joinRemote(remoteDir, entry);
    const stat = fs.statSync(localPath);

    if (stat.isDirectory()) {
      await sftp.mkdir(remotePath, true);
      await uploadDir(sftp, localPath, remotePath);
    } else {
      await sftp.fastPut(localPath, remotePath);
    }
  }
}

async function cleanRemote(sftp, dir) {
  const entries = await sftp.list(dir);
  for (const entry of entries) {
    if (entry.name === '.' || entry.name === '..') continue;
    const remotePath = joinRemote(dir, entry.name);
    if (entry.type === 'd') {
      await sftp.rmdir(remotePath, true);
    } else {
      await sftp.delete(remotePath);
    }
  }
}

async function setPerms(sftp, dir) {
  const entries = await sftp.list(dir);
  for (const entry of entries) {
    if (entry.name === '.' || entry.name === '..') continue;
    const remotePath = joinRemote(dir, entry.name);
    if (entry.type === 'd') {
      await sftp.chmod(remotePath, '755');
      await setPerms(sftp, remotePath);
    } else {
      await sftp.chmod(remotePath, '644');
    }
  }
}

async function main() {
  if (!fs.existsSync(LOCAL_DIR)) {
    throw new Error(`Missing build output at ${LOCAL_DIR}. Run "npm run build:static" first.`);
  }

  const sftp = new SftpClient();
  try {
    console.log('🌐 Connecting to IONOS...');
    await sftp.connect(CONFIG);
    console.log('✅ Connected');

    await sftp.mkdir(REMOTE_DIR, true);
    console.log(`🧹 Clearing ${REMOTE_DIR}...`);
    await cleanRemote(sftp, REMOTE_DIR);

    console.log('📤 Uploading build...');
    await uploadDir(sftp, LOCAL_DIR, REMOTE_DIR);

    console.log('🔧 Setting permissions...');
    await sftp.chmod(REMOTE_DIR, '755');
    await setPerms(sftp, REMOTE_DIR);

    const indexExists = await sftp.exists(joinRemote(REMOTE_DIR, 'index.html'));
    const manifestExists = await sftp.exists(joinRemote(REMOTE_DIR, 'manifest.json'));
    if (!indexExists || !manifestExists) {
      throw new Error('Deployment verification failed (missing index or manifest)');
    }

    console.log('🎉 Deployed! Live at https://airbear.me');
  } finally {
    await sftp.end();
    console.log('🔌 Disconnected');
  }
}

main().catch((err) => {
  console.error('❌ Deployment failed:', err.message);
  process.exit(1);
});
