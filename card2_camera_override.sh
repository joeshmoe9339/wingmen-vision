#!/bin/bash
# Card 2 — Camera override script (ONVIF endpoint override to agent Pi)
# Flash to mounted SD at /media/<device>; physically move SD to camera and reboot.

ONVIF_TARGET="http://192.168.1.100:8080/onvif"
echo "[card2] Overriding camera ONVIF endpoint to $ONVIF_TARGET"
echo "ONVIF_URL=$ONVIF_TARGET" > /media/*/onvif_override.conf 2>/dev/null || echo "ONVIF_URL=$ONVIF_TARGET" > /tmp/onvif_override.conf
echo "[card2] Done. Move SD to camera and reboot."
