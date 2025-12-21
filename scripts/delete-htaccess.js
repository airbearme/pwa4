
import SftpClient from 'ssh2-sftp-client';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

async function fix() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // 1. Try to delete .htaccess to see if it fixes the 500 error
        try {
            await sftp.delete('/.htaccess');
            console.log('✅ Deleted /.htaccess');
        } catch (e) {
            console.log('⚠️ Could not delete /.htaccess (maybe not there): ' + e.message);
        }

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

fix();
