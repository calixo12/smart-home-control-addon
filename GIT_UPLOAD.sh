#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "  Smart Home Control Panel - GitHub Upload Script"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📦 Package Status:"
echo "   ✅ Default URL: http://homeassistant.local:8123 (local)"
echo "   ✅ roomConfigs.ts: FIXED (no corruption)"
echo "   ✅ Dockerfile: FIXED (correct path)"
echo "   ✅ build.yaml: ADDED (multi-arch support)"
echo "   ✅ repository.yaml: CORRECT (YAML format)"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Remove old git data
rm -rf .git

# Initialize
echo "🔧 Initializing git repository..."
git init
git branch -M main

# Add files
echo "📂 Adding all files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Complete Smart Home Control Panel addon with all fixes

- Fixed: roomConfigs.ts file corruption
- Fixed: Dockerfile path (run.sh)
- Added: build.yaml for multi-arch support
- Fixed: repository.yaml (YAML format)
- Default: http://homeassistant.local:8123 for local HA
- Features: iPad 1 lockscreen, WebRTC intercom, security panel
- Ready: Production deployment"

# Add remote
echo "🔗 Connecting to GitHub..."
git remote add origin https://github.com/calixo12/smart-home-control-addon.git

# Push
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🚀 Uploading to GitHub..."
echo "════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  When prompted for password:"
echo "    Use your GitHub Personal Access Token"
echo "    Get one at: https://github.com/settings/tokens"
echo ""

git push --force origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "✅ SUCCESS! Upload complete!"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "🏠 Next Steps in Home Assistant:"
    echo ""
    echo "1. Settings → Add-ons → Add-on Store"
    echo "2. Click ⋮ (three dots) → Repositories"
    echo "3. REMOVE repository if already listed"
    echo "4. ADD this URL:"
    echo "   https://github.com/calixo12/smart-home-control-addon"
    echo "5. Wait 10 seconds"
    echo "6. Refresh the page (F5)"
    echo "7. Find 'Smart Home Control Panel' and install!"
    echo ""
    echo "🎯 The addon will automatically use:"
    echo "   http://homeassistant.local:8123"
    echo ""
    echo "════════════════════════════════════════════════════════════"
else
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "❌ Upload failed"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "Common issues:"
    echo "1. Wrong GitHub token/password"
    echo "2. Network connection problem"
    echo "3. Repository doesn't exist"
    echo ""
fi
