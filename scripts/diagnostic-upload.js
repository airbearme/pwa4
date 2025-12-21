
import SftpClient from 'ssh2-sftp-client';
import fs from 'fs';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

async function diagnose() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected to SFTP.');

        // Create a simple test file
        fs.writeFileSync('test_diag.html', '<html><body><h1>DIAGNOSTIC WORKS</h1></body></html>');

        const locs = ['/', '/httpdocs', '/public_html'];

        for (const loc of locs) {
            try {
                // Ensure dir exists or is root
                if (loc !== '/') {
                    await sftp.mkdir(loc, true).catch(() => { });
                }

                console.log(`Uploading test_diag.html to ${loc}...`);
                await sftp.put('test_diag.html', `${loc === '/' ? '' : loc}/test_diag.html`);
                await sftp.chmod(`${loc === '/' ? '' : loc}/test_diag.html`, 0o644);
            } catch (e) {
                console.log(`Failed to upload to ${loc}: ${e.message}`);
            }
        }

        console.log('Uploads complete.');

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

diagnose();
