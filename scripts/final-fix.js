
import SftpClient from 'ssh2-sftp-client';

const IONOS_CONFIG = {
    host: 'access-5018328928.webspace-host.com',
    username: 'a2096159',
    password: 'Danknugs420420',
    port: 22,
};

const HTACCESS_SIMPLE = `
DirectoryIndex index.html
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [QSA,L]
</IfModule>
`;

async function finalFix() {
    const sftp = new SftpClient();
    try {
        await sftp.connect(IONOS_CONFIG);
        console.log('Connected.');

        // 1. Upload test.php to root
        console.log('Uploading test.php...');
        await sftp.put(Buffer.from('<?php echo "PHP WORKS: " . getcwd(); ?>'), '/test.php');
        await sftp.chmod('/test.php', 0o644);

        // 2. Upload simplified .htaccess
        console.log('Uploading simplified .htaccess...');
        await sftp.put(Buffer.from(HTACCESS_SIMPLE), '/.htaccess');
        await sftp.chmod('/.htaccess', 0o644);

        console.log('Complete.');

    } catch (e) {
        console.error(e);
    } finally {
        sftp.end();
    }
}

finalFix();
