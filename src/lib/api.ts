import { SecurityEvent, Evidence, Threat, Camera } from '../types';

// In-memory mock database to simulate the requested API endpoints
class MockDatabase {
  cameras: Camera[] = [
    { id: 'cam_01', name: 'Front Gate', brand: 'eseecloud', status: 'online', ip_address: '192.168.1.101', stream_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    { id: 'cam_02', name: 'Driveway', brand: 'huntervision', status: 'online', ip_address: '192.168.1.105', stream_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    { id: 'cam_03', name: 'Backyard', brand: 'ajcloud', status: 'online', ip_address: '192.168.1.110', stream_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    { id: 'cam_04', name: 'Garage', brand: 'onvif', status: 'offline', ip_address: '192.168.1.112', stream_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  ];

  events: SecurityEvent[] = [
    { id: 'evt_001', device_id: 'cam_02', type: 'weapon_detected', severity: 'critical', timestamp: new Date(Date.now() - 1000 * 2).toISOString(), ai_labels: ['tactical_gear', 'long_rifle'], evidence_ids: ['evid_123'] },
    { id: 'evt_002', device_id: 'cam_01', type: 'motion', severity: 'low', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), ai_labels: ['animal'], evidence_ids: ['evid_124'] },
  ];

  evidence: Evidence[] = [
    { id: 'evid_123', event_id: 'evt_001', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'video_clip', metadata: { duration: 15, file_size: '12.4 MB', resolution: '1080p' }, status: 'ready' },
    { id: 'evid_124', event_id: 'evt_002', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), type: 'snapshot', metadata: { file_size: '1.2 MB', resolution: '4K' }, status: 'ready' },
  ];

  threats: Threat[] = [
    { id: 'thr_001', device_id: 'network_sensor_1', type: 'deauth_attack', details: 'Multiple deauth frames detected targeting cam_03', signal_info: { frequency: '2.4GHz', rssi: -45, target_mac: 'AA:BB:CC:DD:EE:FF' }, timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString() }
  ];
}

const db = new MockDatabase();

// --- API Endpoints Implementation ---

export const api = {
  // CAMERAS
  getCameras: async () => [...db.cameras],

  // EVENTS
  // GET /events
  getEvents: async (filters?: { device_id?: string; severity?: string }) => {
    let result = [...db.events];
    if (filters?.device_id) result = result.filter(e => e.device_id === filters.device_id);
    if (filters?.severity) result = result.filter(e => e.severity === filters.severity);
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  
  // GET /events/:id
  getEvent: async (id: string) => db.events.find(e => e.id === id),

  // POST /events
  createEvent: async (data: Omit<SecurityEvent, 'id'>) => {
    const newEvent: SecurityEvent = { ...data, id: `evt_${Math.random().toString(36).substr(2, 9)}` };
    db.events.unshift(newEvent);
    return newEvent;
  },

  // EVIDENCE
  // GET /evidence
  getEvidenceList: async () => [...db.evidence].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),

  // POST /evidence
  createEvidence: async (data: Omit<Evidence, 'id'>) => {
    const newEvid: Evidence = { ...data, id: `evid_${Math.random().toString(36).substr(2, 9)}` };
    db.evidence.unshift(newEvid);
    return newEvid;
  },

  // GET /evidence/:id/download-url
  getEvidenceDownloadUrl: async (id: string) => {
    return { url: `https://secure-vault.local/api/v1/download/${id}?token=temp_xyz`, expires_in: 3600 };
  },

  // POST /evidence/:id/generate-report
  generateReport: async (id: string) => {
    return { status: 'success', report_url: `https://secure-vault.local/api/v1/reports/police_bundle_${id}.pdf`, generated_at: new Date().toISOString() };
  },

  // THREATS
  // GET /threats
  getThreats: async (filters?: { device_id?: string }) => {
    let result = [...db.threats];
    if (filters?.device_id) result = result.filter(t => t.device_id === filters.device_id);
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // POST /threats
  createThreat: async (data: Omit<Threat, 'id'>) => {
    const newThreat: Threat = { ...data, id: `thr_${Math.random().toString(36).substr(2, 9)}` };
    db.threats.unshift(newThreat);
    return newThreat;
  }
};

// Auto-discovery: add cameras found on same network
export const discoverCameras = async () => {
  const found = [
    { id: 'cam_05', name: 'Kitchen Cam', brand: 'onvif' as any, status: 'online' as const, ip_address: '192.168.1.115', stream_url: 'rtsp://192.168.1.115:554/stream1' },
  ];
  found.forEach(c => { if (!db.cameras.find(x => x.id === c.id)) db.cameras.push(c); });
  return found;
};
