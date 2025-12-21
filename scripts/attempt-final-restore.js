
import SftpClient from 'ssh2-sftp-client';
import fs from 'fs';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

const SAFEST_HTACCESS = `
<IfModule mod_rewrite.c>
    Options +FollowSymLinks
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
`;

async function restore() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // Upload safe .htaccess to /
        await sftp.put(Buffer.from(SAFEST_HTACCESS), '/.htaccess');
        await sftp.chmod('/.htaccess', 0o644);

        // Create dummy favicon to test 500
        await sftp.put(Buffer.from(''), '/favicon.ico');
        await sftp.chmod('/favicon.ico', 0o644);

        console.log('Restored .htaccess in root.');
    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

restore();
