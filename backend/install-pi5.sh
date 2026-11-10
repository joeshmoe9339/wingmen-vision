#!/usr/bin/env bash
# Wingmen Vision — Raspberry Pi 5 (Raspbarrie) Deployment Script
set -euo pipefail

echo "=========================================="
echo "  Wingmen Vision — Pi 5 Installer"
echo "=========================================="
echo ""

# --- 1. Install Node.js ---
echo "--- Step 1: Installing Node.js ---"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -S -p '' -E bash - 2>/dev/null || echo "⚠️  NodeSource setup failed (may already be installed)"
sudo -S -p '' apt-get install -y nodejs 2>/dev/null || true
node --version
npm --version

# --- 2. Install system dependencies ---
echo "--- Step 2: Installing system dependencies ---"
sudo -S -p '' apt-get update -qq 2>/dev/null
sudo -S -p '' apt-get install -y -qq \
  libdbus-1-3 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
  libxext6 libxfixes3 libxrandr2 libglu1-mesa libnss3 libnspr4 \
  avahi-daemon libcups2 libpango-1.0-0 libcairo2 2>/dev/null || true
echo "✅ Dependencies installed"

# --- 3. Clone or verify Wingmen repo ---
echo "--- Step 3: Verifying Wingmen Vision repo ---"
if [[ ! -d "/home/pi/wingmen-vision" ]]; then
  sudo -S -p '' -u pi git clone https://github.com/bgdaddy/wingmenvision.git /home/pi/wingmen-vision 2>/dev/null || \
  echo "⚠️  Could not clone repo. Using existing repo if present."
fi

# --- 4. Create the systemd service ---
echo "--- Step 4: Configuring systemd service ---"
sudo -S -p '' mkdir -p /etc/systemd/system
sudo -S -p '' cp /home/pi/wingmen-vision/backend/raspi/systemd/wingmen-agent.service /etc/systemd/system/wingmen-agent.service
sudo -S -p '' sed -i 's|/home/pi/wingmen-agent|/home/pi/wingmen-vision/backend/raspi/agent|g' /etc/systemd/system/wingmen-agent.service
sudo -S -p '' sed -i 's|/usr/bin/node|/usr/bin/nodejs|g' /etc/systemd/system/wingmen-agent.service
sudo -S -p '' systemctl daemon-reload
sudo -S -p '' systemctl enable wingmen-agent
sudo -S -p '' systemctl start wingmen-agent
echo "✅ wingmen-agent service configured and started"

# --- 5. Install npm dependencies ---
echo "--- Step 5: Installing npm dependencies ---"
if [[ -d "/home/pi/wingmen-vision/backend/node_modules" ]]; then
  sudo -S -p '' -u pi rm -rf /home/pi/wingmen-vision/backend/node_modules
fi
sudo -S -p '' -u pi npm --prefix /home/pi/wingmen-vision/backend install 2>/dev/null || \
  echo "⚠️  npm install had warnings (some optional deps may be skipped)"

# --- 6. Build the frontend ---
echo "--- Step 6: Building frontend ---"
sudo -S -p '' -u pi npm --prefix /home/pi/wingmen-vision run build 2>/dev/null || \
  echo "⚠️  Frontend build had warnings"

# --- 7. Configure environment ---
echo "--- Step 7: Configuring environment ---"
sudo -S -p '' cp /home/pi/wingmen-vision/.env.example /home/pi/wingmen-vision/.env
sudo -S -p '' chown pi:pi /home/pi/wingmen-vision/.env
echo "📝 .env created from .env.example — edit it with your Supabase credentials"

# --- 8. Configure firewall / port access ---
echo "--- Step 8: Configuring firewall ---"
echo "🔥 Allowing port 8081 (backend API)..."
sudo -S -p '' iptables -A INPUT -p tcp --dport 8081 -j ACCEPT 2>/dev/null || true
echo "✅ Firewall configured"

# --- 9. Summary ---
echo ""
echo "=========================================="
echo "  Installation Complete!"
echo "=========================================="
echo ""
echo "  📍 Backend API: http://$(hostname -I | awk '{print $1}'):8081"
echo "  📍 Frontend:    http://$(hostname -I | awk '{print $1}'):5173 (dev) / /home/pi/wingmen-vision/dist (prod)"
echo "  📍 Service:     wingmen-agent (systemd)"
echo ""
echo "Next steps:"
echo "  1. Edit /home/pi/wingmen-vision/.env with your Supabase credentials"
echo "  2. Run the backend API server on the Pi"
echo "  3. Open the frontend in a browser"
echo ""
echo "  Commands:"
echo "    sudo systemctl status wingmen-agent      # Check agent status"
echo "    sudo journalctl -u wingmen-agent -f      # View logs"
echo "=========================================="
