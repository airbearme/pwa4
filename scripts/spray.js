
import SftpClient from 'ssh2-sftp-client';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

async function spray() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // Remove root .htaccess
        try { await sftp.delete('/.htaccess'); } catch (e) { }

        const candidates = [
            '/',
            '/httpdocs',
            '/public_html',
            '/www',
            '/htdocs',
            '/web',
            '/site',
            '/airbear.me',
            '/airbear',
            '/AirBear',
            '/app'
        ];

        const content = '<h1>MAGIC FOUND</h1>';

        for (const dir of candidates) {
            try {
                if (dir !== '/') {
                    await sftp.mkdir(dir, true).catch(() => { });
                    await sftp.chmod(dir, 0o755);
                }
                const path = dir === '/' ? '/magic.html' : `${dir}/magic.html`;
                await sftp.put(Buffer.from(content), path);
                await sftp.chmod(path, 0o644);
                console.log(`Sprayed ${path}`);
            } catch (e) {
                console.log(`Failed ${dir}: ${e.message}`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

spray();
