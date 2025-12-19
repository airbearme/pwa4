const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();

// Configuration
const config = {
  host: 'access-5018328928.webspace-host.com',
  port: 22,
  username: 'a2096159',
  password: 'Danknugs420420',
  localDir: path.join(__dirname, 'dist', 'public'),
  remoteDir: '/public_html'
};

console.log('Starting deployment to airbear.me...');

conn.on('ready', () => {
  console.log('SSH connection established');
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    // Function to upload a file
    const uploadFile = (localPath, remotePath) => {
      return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(localPath);
        const writeStream = sftp.createWriteStream(remotePath);
        
        writeStream.on('close', () => {
          console.log(`Uploaded: ${localPath} -> ${remotePath}`);
          resolve();
        });
        
        writeStream.on('error', (err) => {
          console.error(`Error uploading ${localPath}:`, err);
          reject(err);
        });
        
        readStream.pipe(writeStream);
      });
    };
    
    // Function to create directory if it doesn't exist
    const ensureDir = (dir) => {
      return new Promise((resolve, reject) => {
        sftp.mkdir(dir, (err) => {
          // Ignore error if directory already exists
          if (err && err.code !== 4) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    };
    
    // Function to read directory recursively
    const readDir = (localPath, remotePath) => {
      return new Promise((resolve, reject) => {
        fs.readdir(localPath, { withFileTypes: true }, async (err, items) => {
          if (err) return reject(err);
          
          try {
            await ensureDir(remotePath);
            
            for (const item of items) {
              const localItemPath = path.join(localPath, item.name);
              const remoteItemPath = path.posix.join(remotePath, item.name);
              
              if (item.isDirectory()) {
                console.log(`Creating directory: ${remoteItemPath}`);
                await readDir(localItemPath, remoteItemPath);
              } else {
                await uploadFile(localItemPath, remoteItemPath);
              }
            }
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });
    };
    
    // Start the deployment
    readDir(config.localDir, config.remoteDir)
      .then(() => {
        console.log('\n✅ Deployment completed successfully!');
        console.log('Your PWA should now be live at: https://airbear.me');
        conn.end();
      })
      .catch((err) => {
        console.error('\n❌ Deployment failed:', err);
        conn.end();
        process.exit(1);
      });
  });
});

conn.on('error', (err) => {
  console.error('SSH connection error:', err);
  process.exit(1);
});

// Connect to the server
console.log('Connecting to server...');
conn.connect({
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  tryKeyboard: true,
  debug: console.log
});
