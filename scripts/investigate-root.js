
import SftpClient from 'ssh2-sftp-client';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

async function investigate() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // 1. Remove recursive-killing .htaccess from root
        try {
            await sftp.delete('/.htaccess');
            console.log('Deleted root .htaccess');
        } catch (e) { }

        // 2. Permission fix on subdirs
        const dirs = ['/httpdocs', '/public_html'];
        for (const d of dirs) {
            try {
                await sftp.mkdir(d, true).catch(() => { });
                await sftp.chmod(d, 0o755);
                console.log(`Chmod 755 ${d}`);

                // Upload test file
                await sftp.put(Buffer.from('<h1>SUBDIR TEST</h1>'), `${d}/test_subdir.html`);
                await sftp.chmod(`${d}/test_subdir.html`, 0o644);
                console.log(`Uploaded ${d}/test_subdir.html`);
            } catch (e) {
                console.log(`Error on ${d}: ${e.message}`);
            }
        }

        // 3. Try to peek at logs
        try {
            console.log('--- Logs ---');
            const logs = await sftp.list('/logs');
            logs.forEach(l => console.log(l.name));
            // Try to read the latest error log if possible (often blocked)
            // const errorLog = logs.find(l => l.name.includes('error'));
            // if (errorLog) {
            //    const content = await sftp.get('/logs/' + errorLog.name);
            //    console.log(content.toString().slice(-500));
            // }
        } catch (e) {
            console.log('Cannot list logs: ' + e.message);
        }
    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

investigate();
