
import SftpClient from 'ssh2-sftp-client';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

async function audit() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        console.log('--- Root / Listing ---');
        const rootList = await sftp.list('/');
        rootList.forEach(f => console.log(`${f.type} ${f.name} (${f.size})`));

        if (rootList.find(f => f.name === 'httpdocs')) {
            console.log('\n--- /httpdocs Listing ---');
            const hList = await sftp.list('/httpdocs');
            hList.forEach(f => console.log(`${f.type} ${f.name} (${f.size})`));
        }

        if (rootList.find(f => f.name === 'public_html')) {
            console.log('\n--- /public_html Listing ---');
            const pList = await sftp.list('/public_html');
            pList.forEach(f => console.log(`${f.type} ${f.name} (${f.size})`));
        }

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

audit();
