
import SftpClient from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

// Standard React .htaccess used in subfolders
const SUBDIR_HTACCESS = `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;

async function deployToHttpdocs() {
    const sftp = new SftpClient();
    const distPath = path.resolve('dist/public');

    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // 1. Clean root .htaccess to permit subfolders to work
        try {
            await sftp.delete('/.htaccess');
            console.log('Deleted root .htaccess');
        } catch (e) { }

        // 2. Clear httpdocs
        try {
            const list = await sftp.list('/httpdocs');
            for (const item of list) {
                if (item.name === '.' || item.name === '..') continue;
                await sftp.rmdir('/httpdocs/' + item.name, true).catch(async () => await sftp.delete('/httpdocs/' + item.name));
            }
        } catch (e) { console.log('Clean error', e.message); }

        // 3. Upload content to httpdocs
        console.log('Uploading app to /httpdocs...');

        async function upload(local, remote) {
            const items = fs.readdirSync(local);
            for (const item of items) {
                const locPath = path.join(local, item);
                const remPath = remote + '/' + item;
                const stats = fs.statSync(locPath);
                if (stats.isDirectory()) {
                    await sftp.mkdir(remPath, true).catch(() => { });
                    await sftp.chmod(remPath, 0o755);
                    await upload(locPath, remPath);
                } else {
                    await sftp.put(locPath, remPath);
                    await sftp.chmod(remPath, 0o644);
                }
            }
        }

        await upload(distPath, '/httpdocs');

        // 4. Upload .htaccess to httpdocs
        await sftp.put(Buffer.from(SUBDIR_HTACCESS), '/httpdocs/.htaccess');
        await sftp.chmod('/httpdocs/.htaccess', 0o644);

        console.log('Deployed to /httpdocs');

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

deployToHttpdocs();
