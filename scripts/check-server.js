
import SftpClient from 'ssh2-sftp-client';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

async function checkServerDir() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // Cleanup root .htaccess just in case
        try { await sftp.delete('/.htaccess'); } catch (e) { }

        console.log('--- /server Listing ---');
        try {
            const list = await sftp.list('/server');
            list.forEach(f => console.log(f.name));
        } catch (e) { console.log('Cannot list /server: ' + e.message); }

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

checkServerDir();
