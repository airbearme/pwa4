const SftpClient = require('ssh2-sftp-client');
const path = require('path');

const log = (message, ...args) => console.log(`[SFTP Deploy] ${message}`, ...args);
const logError = (message, ...args) => console.error(`[SFTP Deploy ERROR] ${message}`, ...args);

// The script will now rely on environment variables being set
// in the execution environment (e.g., CI/CD secrets).
const sftpConfig = {
  host: process.env.SFTP_HOST,
  port: process.env.SFTP_PORT || 22,
  username: process.env.SFTP_USERNAME,
  password: process.env.SFTP_PASSWORD,
  debug: console.log // Verbose logging for debugging
};

const remotePath = process.env.SFTP_REMOTE_PATH || '/var/www/html';
const localPath = path.join(__dirname, 'dist', 'public');

const sftp = new SftpClient();

async function main() {
  log("Starting deployment...");

  if (!sftpConfig.host || !sftpConfig.username || !sftpConfig.password) {
    logError("Required SFTP environment variables (SFTP_HOST, SFTP_USERNAME, SFTP_PASSWORD) are not set. Aborting.");
    logError("Please ensure these are configured in your CI/CD environment or execution context.");
    process.exit(1);
  }

  try {
    log(`Connecting to ${sftpConfig.host}:${sftpConfig.port}...`);
    await sftp.connect(sftpConfig);
    log("Connection successful.");

    log(`Ensuring remote directory exists: ${remotePath}`);
    await sftp.mkdir(remotePath, true);
    log(`Cleaning remote directory: ${remotePath}`);
    await sftp.rmdir(remotePath, true);
    await sftp.mkdir(remotePath, true);
    log('Remote directory is clean and ready.');

    log(`Uploading files from ${localPath} to ${remotePath}...`);
    const uploadResult = await sftp.uploadDir(localPath, remotePath);
    log(uploadResult);
    log("File upload complete.");

  } catch (err) {
    logError("Deployment failed:", err.message);
    if (err.code === 'ENOTFOUND') {
        logError("Host not found. Check your SFTP_HOST and network connection.");
    } else if (err.message.includes('permission denied')) {
        logError("Permission denied. Check your SFTP username, password, and file permissions on the server.");
    }
  } finally {
    log("Closing SFTP connection.");
    try {
      await sftp.end();
      log("Connection closed.");
    } catch (endErr) {
      logError("Error closing connection:", endErr.message);
    }
    log("Deployment script finished.");
  }
}

main();
