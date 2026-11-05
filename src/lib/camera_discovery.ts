import { api } from './live_api';
import { scanNetwork } from '../../backend/services/network_scanner';

export async function discoverAndAddCameras() {
  const found = await scanNetwork();
  for (const cam of found) {
    const existing = await api.getCameras();
    if (!existing.find((c: any) => c.ip_address === cam.ip)) {
      // In a real backend, insert into DB; for mock we log
      console.log('[CameraAdd]', cam);
    }
  }
  return found;
}
