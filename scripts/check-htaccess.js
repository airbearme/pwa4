
import SftpClient from 'ssh2-sftp-client';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

async function checkHtaccess() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // Check root .htaccess
        try {
            const rootHtaccess = await sftp.get('/.htaccess');
            console.log('\n--- ROOT /.htaccess ---');
            console.log(rootHtaccess.toString());
        } catch (e) { console.log('No root .htaccess or error reading it'); }

        // Check httpdocs .htaccess
        try {
            const httpdocsHtaccess = await sftp.get('/httpdocs/.htaccess');
            console.log('\n--- /httpdocs/.htaccess ---');
            console.log(httpdocsHtaccess.toString());
        } catch (e) { console.log('No /httpdocs/.htaccess or error reading it'); }

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

checkHtaccess();
