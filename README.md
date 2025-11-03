# Smart Home Control Panel - Home Assistant Addon

A retro iPad 1 OS-inspired smart home control panel with WebRTC video intercom for Home Assistant.

## Features

- 🎨 Skeuomorphic monochrome dark mode design with carbon fiber background
- 💡 Multi-room lighting control with vertical brightness sliders
- 🪟 Smart shade/cover control
- 📹 WebRTC video intercom with iOS 4 FaceTime-style UI
- 🔒 iPad 1-style lockscreen with swipe-to-unlock
- 🛡️ DSC Neo Touchscreen-style security panel
- 🏠 Multi-room support (Media Room, Main Room, Master Bedroom, Playroom)

## Installation

### Step 1: Add Repository to Home Assistant

1. In Home Assistant, go to **Settings** → **Add-ons** → **Add-on Store**
2. Click the **three dots (⋮)** in the top right corner
3. Select **Repositories**
4. Add this repository URL:
   ```
   https://github.com/calixo12/smart-home-control-addon
   ```
5. Click **Add**

### Step 2: Install the Addon

1. Close the repositories dialog
2. Refresh the page or scroll down to find **"Smart Home Control Panel"**
3. Click on it and click **INSTALL**
4. Wait for installation to complete

### Step 3: Configure

1. After installation, go to the **Configuration** tab
2. Set your Home Assistant URL (default: `http://homeassistant.local:8123`)
3. Optionally add allowed IPs for access restriction
4. Click **SAVE**

### Step 4: Start

1. Go to the **Info** tab
2. Click **START**
3. Enable **Start on boot** (recommended)
4. Click **OPEN WEB UI** to access your control panel!

## Access

Once started, access the control panel at:

- `http://homeassistant.local:5000`
- `http://YOUR_HA_IP:5000`

## Configuration

### Home Assistant URL

Default: `http://homeassistant.local:8123`

You can change this to your specific Home Assistant URL or IP address.

### Allowed IPs (Optional)

Comma-separated list of IPs allowed to access the control panel. Leave empty to allow all.

Example: `192.168.1.100,192.168.1.101`

### Home Assistant Token (Optional)

Long-lived access token from Home Assistant. Leave empty to use the Supervisor API (recommended for addon installation).

## Usage

1. **Unlock**: Swipe the shield to unlock the interface
2. **Settings**: Click the ⚙️ icon to configure entity IDs
3. **Rooms**: Select your room from the dropdown
4. **Tabs**: Switch between Lighting, Media, Shades, Intercom, and Security
5. **Intercom**: Make video calls between rooms using the Intercommunications panel

## Troubleshooting

### Addon won't start

- Check the **Log** tab for errors
- Verify port 5000 is not in use
- Ensure Home Assistant URL is correct

### Can't access the web UI

- Verify the addon is running (green status)
- Check firewall settings
- Try accessing via IP instead of hostname

### Connection to Home Assistant fails

- Verify the URL in configuration
- Leave the token empty (uses Supervisor API)
- Check Home Assistant is running and accessible

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License
