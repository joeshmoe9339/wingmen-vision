// Stable device ID for this agent/portal instance
import fs from 'node:fs';
import path from 'node:path';

export const getDeviceId = () => {
  let id = process.env.DEVICE_ID || '';
  if (!id) {
    const dir = '/home/pi/wingmen-agent';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'device_id');
    if (fs.existsSync(file)) {
      id = fs.readFileSync(file, 'utf8').trim();
    } else {
      id = `dev_${Math.random().toString(36).slice(2, 9)}`;
      fs.writeFileSync(file, id, 'utf8');
    }
  }
  return id;
};
