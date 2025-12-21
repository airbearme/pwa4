
import SftpClient from 'ssh2-sftp-client';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

async function check() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // List root
        console.log('--- Root / Contents ---');
        const list = await sftp.list('/');
        list.forEach(i => console.log(`${i.type === 'd' ? 'DIR ' : 'FILE'} ${i.name}`));

        // Check httpdocs if exists
        if (list.find(i => i.name === 'httpdocs')) {
            console.log('\n--- /httpdocs Contents ---');
            const list2 = await sftp.list('/httpdocs');
            list2.forEach(i => console.log(`${i.type === 'd' ? 'DIR ' : 'FILE'} ${i.name}`));
        }

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

check();
