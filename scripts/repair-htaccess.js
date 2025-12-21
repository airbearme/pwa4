
import SftpClient from 'ssh2-sftp-client';
import fs from 'fs';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

const HTACCESS_CONTENT = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;

async function repair() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // 1. Upload .htaccess to Root
        console.log('Uploading .htaccess to /');
        await sftp.put(Buffer.from(HTACCESS_CONTENT), '/.htaccess');
        await sftp.chmod('/.htaccess', 0o644);

        // 2. Ensuring index.html and assets are there (they should be, but let's touch them)
        // We already uploaded them.

        // 3. Try to Identify if we are in a subfolder jail
        console.log('PWD:', await sftp.cwd());

        console.log('Repair complete. Please check https://airbear.me');

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

repair();
