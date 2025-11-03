# Quick Installation Guide

## Prerequisites
- Home Assistant installed (any installation method)
- SSH or file access to your Home Assistant machine
- Port 5000 available (or configure a different port)

## Installation Steps

### Step 1: Package the Addon

On this Replit, run the package script:

```bash
bash home-assistant-addon/package-addon.sh
```

This creates a ready-to-install folder in `addon-package/local/smart-home-control/`

### Step 2: Download the Package

Download the entire `addon-package/local/` folder to your computer.

### Step 3: Copy to Home Assistant

**IMPORTANT:** The folder must be placed at `/addons/local/smart-home-control/` for Home Assistant to detect it.

Choose one method:

**Method A: Via Samba/File Share (Recommended)**
1. Access your HA via network share (e.g., `\\homeassistant.local`)
2. Navigate to `/addons/` folder
3. Copy the **entire `local` folder** there (not just smart-home-control)
4. Final path should be: `/addons/local/smart-home-control/`

**Method B: Via SSH**
```bash
# Replace with your HA IP address
scp -r local root@192.168.1.xxx:/addons/
```

**Method C: Via Terminal Addon**
1. Install "Terminal & SSH" addon in HA
2. Create directory: `mkdir -p /addons/local`
3. Upload `smart-home-control` folder to `/addons/local/`

### Step 4: Verify and Install

1. Open Home Assistant web interface
2. Go to **Settings** → **Add-ons** → **Add-on Store**
3. Click the **three dots (⋮)** → **Check for updates**
4. Look under **"Local add-ons"** section
5. You should see "Smart Home Control Panel"
6. Click on it and click **INSTALL**

**If addon doesn't appear:**
- Verify path is `/addons/local/smart-home-control/`
- Restart Supervisor: Settings → System → ⋮ → Restart (choose "Supervisor")
- Wait 30 seconds and check again

### Step 5: Configure

1. After installation, go to the **Configuration** tab
2. Set your Home Assistant URL (default: `http://homeassistant.local:8123`)
3. Optionally add allowed IPs for access restriction
4. Click **SAVE**

### Step 6: Start the Addon

1. Go to the **Info** tab
2. Click **START**
3. Wait for it to start (check the **Log** tab if needed)
4. Enable **Start on boot** (recommended)
5. Click **OPEN WEB UI** to access your control panel!

## Access the Control Panel

### Local Access
```
http://homeassistant.local:5000
http://YOUR_HA_IP:5000
```

### Initial Setup
1. Swipe the shield to unlock
2. Click the ⚙️ settings icon
3. Configure your entity IDs
4. Select your room
5. Start controlling your smart home!

## Troubleshooting

### Addon won't start
- Check the **Log** tab for errors
- Verify port 5000 is not in use
- Ensure Home Assistant URL is correct

### Can't access the web UI
- Verify the addon is running (green icon)
- Check your firewall settings
- Try accessing via IP instead of hostname

### Connection to Home Assistant fails
- Verify the URL in configuration
- Try leaving the token empty (uses Supervisor API)
- Check Home Assistant is running and accessible

## Updating

To update after making changes in Replit:

1. Run `bash home-assistant-addon/package-addon.sh` again
2. Download the new `addon-package/local/` folder
3. Copy to `/addons/` (overwrite existing `/addons/local/smart-home-control/`)
4. In HA, go to addon → **Rebuild** (if available) or **Restart**

## Need Help?

Check the full README.md for detailed documentation, configuration options, and advanced features.
