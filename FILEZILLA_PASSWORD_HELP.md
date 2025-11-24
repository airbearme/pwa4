# How to Find SFTP Password in FileZilla

## Method 1: Site Manager (Recommended)
1. Open FileZilla
2. Go to **File** → **Site Manager** (or click the Site Manager icon)
3. Select your site from the left panel
4. Click **General** tab
5. The password should be visible in the **Password** field (click "Show passwords" if needed)

## Method 2: Recently Used Connections
1. In FileZilla, click the dropdown arrow next to the "Quick connect" bar
2. Recent connection details should show the saved password

## Method 3: FileZilla.xml (Advanced)
**Windows**: `C:\Users\[YourUsername]\AppData\Roaming\FileZilla\sitemanager.xml`
**Mac**: `~/Library/Application Support/FileZilla/sitemanager.xml`
**Linux**: `~/.config/filezilla/sitemanager.xml`

Look for the entry with host "access-5018328928.webspace-host.com" and username "a2096159"

## For IONOS Webspace
The IONOS SFTP password is usually the same as your IONOS account password for the webspace. You can also reset it in your IONOS control panel.

Once you find the password, please provide it so I can update the .env file and proceed with the deployment.
