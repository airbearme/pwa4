import { Client } from 'ssh2';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  host: process.env.IONOS_SFTP_HOST,
  username: process.env.IONOS_SFTP_USER,
  password: process.env.IONOS_SFTP_PASSWORD,
  port: 22,
};

console.log('Testing SSH connection to', config.host);

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH Client :: ready');
  conn.exec('node -v && npm -v', (err, stream) => {
    if (err) {
        console.error('❌ Exec error:', err);
        return conn.end();
    }
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).on('error', (err) => {
    console.error('❌ Connection failed:', err.message);
}).connect(config);
