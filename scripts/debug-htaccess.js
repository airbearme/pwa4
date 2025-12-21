
import SftpClient from 'ssh2-sftp-client';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

async function debug() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // Test 1: Empty .htaccess
        console.log('Testing Empty .htaccess...');
        await sftp.put(Buffer.from('# Empty'), '/.htaccess');
        await sftp.chmod('/.htaccess', 0o644);

        // We can't curl from here, we have to trust the user/agent flow.
        // But we will sleep to allow manual check if needed, or just proceed.

        // Test 2: DirectoryIndex only
        // console.log('Testing DirectoryIndex...');
        // await sftp.put(Buffer.from('DirectoryIndex index.html'), '/.htaccess');

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

debug();
