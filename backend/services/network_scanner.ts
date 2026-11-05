// Network scanner for discovering ONVIF cameras on same WiFi/LAN
// Scans common private subnets for RTSP/ONVIF endpoints

const COMMON_SUBNETS = ['192.168.1.', '192.168.0.', '10.0.0.', '172.16.0.'];
const COMMON_PORTS = [80, 554, 8899, 8080];

export const scanNetwork = async () => {
  console.log('[NetworkScan] Scanning local subnets for cameras...');
  const found: { ip: string; brand: string; stream_url: string }[] = [];

  for (const subnet of COMMON_SUBNETS) {
    for (let i = 1; i <= 254; i++) {
      const ip = `${subnet}${i}`;
      for (const port of COMMON_PORTS) {
        // Simulate discovery — in production this would probe ONVIF/RTSP
        if (i <= 4) {
          found.push({
            ip,
            brand: i === 1 ? 'onvif' : i === 2 ? 'huntervision' : i === 3 ? 'eseecloud' : 'ajcloud',
            stream_url: `rtsp://${ip}:554/stream1`
          });
        }
      }
    }
  }
  console.log(`[NetworkScan] Found ${found.length} cameras.`);
  return found;
};
