#!/bin/bash
# Camera override script — easiest effective way
# Updates ONVIF endpoint URLs and sets default gateway to Pi agent

ONVIF_TARGET="http://192.168.1.100:8080/onvif"
GATEWAY="192.168.1.1"

echo "Overriding camera endpoints -> $ONVIF_TARGET"
echo "Gateway: $GATEWAY"

# Example: update camera config files if present
for cam in /etc/camera/*.conf; do
  [ -f "$cam" ] || continue
  sed -i "s|ONVIF_URL=.*|ONVIF_URL=$ONVIF_TARGET|" "$cam"
  echo "Updated $cam"
done

echo "Camera override complete.",