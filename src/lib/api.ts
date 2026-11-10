import { SecurityEvent, Evidence, Threat, Camera } from '../types';

// Frontend API client
// Talks to the Wingmen Vision backend server (http://localhost:8080 by default).
// If the backend is unreachable (e.g. not running yet), it falls back to an
// in-memory mock so the UI still renders — useful for development.
const BACKEND_BASE = (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8081').replace(/\/$/, '');

interface ApiResponse<T> {
  data: T;
  count?: number;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_BASE}/api${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return (await res.json()) as T;
}

// --- CAMERAS ---
export async function getCameras(): Promise<Camera[]> {
  return apiFetch<ApiResponse<Camera[]>>('/cameras').then(r => r.data);
}

export async function createCamera(data: Omit<Camera, 'id' | 'created_at'>): Promise<Camera> {
  return apiFetch<Camera>('/cameras', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- EVENTS ---
export async function getEvents(filters?: { device_id?: string; severity?: string }): Promise<SecurityEvent[]> {
  let url = '/events';
  const params = new URLSearchParams();
  if (filters?.device_id) params.set('device_id', filters.device_id);
  if (filters?.severity) params.set('severity', filters.severity);
  if (params.toString()) url += `?${params.toString()}`;
  return apiFetch<ApiResponse<SecurityEvent[]>>(url).then(r => r.data);
}

export async function getEvent(id: string): Promise<SecurityEvent | null> {
  // Backend doesn't expose GET /events/:id yet; fall back to list
  const all = await getEvents();
  return all.find(e => e.id === id) || null;
}

export async function createEvent(data: Omit<SecurityEvent, 'id'>): Promise<SecurityEvent> {
  return apiFetch<SecurityEvent>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- EVIDENCE ---
export async function getEvidenceList(): Promise<Evidence[]> {
  return apiFetch<ApiResponse<Evidence[]>>('/evidence').then(r => r.data);
}

export async function createEvidence(data: Omit<Evidence, 'id'>): Promise<Evidence> {
  return apiFetch<Evidence>('/evidence', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEvidenceDownloadUrl(id: string): Promise<{ url: string; expires_in: number }> {
  return apiFetch<{ url: string; expires_in: number }>(`/evidence/${id}/download-url`);
}

export async function generateReport(id: string): Promise<{ status: string; report_url: string; generated_at: string }> {
  return apiFetch<{ status: string; report_url: string; generated_at: string }>(`/evidence/${id}/generate-report`, { method: 'POST' });
}

// --- THREATS ---
export async function getThreats(filters?: { device_id?: string }): Promise<Threat[]> {
  let url = '/threats';
  if (filters?.device_id) url += `?device_id=${filters.device_id}`;
  return apiFetch<ApiResponse<Threat[]>>(url).then(r => r.data);
}

export async function createThreat(data: Omit<Threat, 'id'>): Promise<Threat> {
  return apiFetch<Threat>('/threats', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- ONVIF / RTSPS ---
export async function getOnvifStatus(): Promise<{ status: string; timestamp: string }> {
  return apiFetch<{ status: string; timestamp: string }>('/onvif/status');
}

// --- Network scan (reuse backend scanner) ---
export async function scanNetwork(): Promise<any[]> {
  const { data } = await apiFetch<{ data: any[]; count: number; network: any[] }>('/status');
  return data;
}

// --- Graceful fallback when backend is unreachable (dev mode) ---
export class MockApi {
  cameras: Camera[] = [
    { id: 'cam_01', name: 'Front Gate', brand: 'eseecloud', status: 'online', ip_address: '192.168.1.101', stream_url: 'rtsp://192.168.1.101:554/stream1' },
    { id: 'cam_02', name: 'Driveway', brand: 'huntervision', status: 'online', ip_address: '192.168.1.105', stream_url: 'rtsp://192.168.1.105:554/stream1' },
    { id: 'cam_03', name: 'Backyard', brand: 'ajcloud', status: 'online', ip_address: '192.168.1.110', stream_url: 'rtsp://192.168.1.110:554/stream1' },
    { id: 'cam_04', name: 'Garage', brand: 'onvif', status: 'offline', ip_address: '192.168.1.112', stream_url: 'rtsp://192.168.1.112:554/stream1' },
  ];
  events: SecurityEvent[] = [];
  evidence: Evidence[] = [];
  threats: Threat[] = [];

  constructor(private readonly fallback: boolean) {}

  async getCameras(): Promise<Camera[]> {
    if (!this.fallback) throw new Error('Backend unavailable — no fallback');
    return [...this.cameras];
  }
  async getEvents(): Promise<SecurityEvent[]> { return this.events; }
  async getEvent(): Promise<SecurityEvent | null> { return null; }
  async createEvent(): Promise<SecurityEvent> { return { id: `evt_${Date.now()}`, device_id: '', type: 'motion', severity: 'low', timestamp: new Date().toISOString(), ai_labels: [], evidence_ids: [] }; }
  async getEvidenceList(): Promise<Evidence[]> { return this.evidence; }
  async createEvidence(): Promise<Evidence> { return { id: `evid_${Date.now()}`, event_id: '', timestamp: new Date().toISOString(), type: 'video_clip', metadata: { file_size: '0 B' }, status: 'ready' }; }
  async getEvidenceDownloadUrl(): Promise<{ url: string; expires_in: number }> { return { url: '', expires_in: 0 }; }
  async generateReport(): Promise<{ status: string; report_url: string; generated_at: string }> { return { status: 'success', report_url: '#mock', generated_at: new Date().toISOString() }; }
  async getThreats(): Promise<Threat[]> { return this.threats; }
  async createThreat(): Promise<Threat> { return { id: `thr_${Date.now()}`, device_id: '', type: 'deauth_attack', details: 'mock', signal_info: { frequency: '', rssi: 0, target_mac: '' }, timestamp: new Date().toISOString() }; }
  async getOnvifStatus(): Promise<{ status: string; timestamp: string }> { return { status: 'mock_fallback', timestamp: new Date().toISOString() }; }
  async scanNetwork(): Promise<any[]> { return []; }
}

let _fallback: MockApi | null = null;

async function realClient(): Promise<typeof api> {
  try {
    await getCameras().catch(() => {});
    return api;
  } catch {
    if (!_fallback) {
      _fallback = new MockApi(true);
      _fallback.events = [
        { id: 'evt_001', device_id: 'cam_02', type: 'weapon_detected', severity: 'critical', timestamp: new Date(Date.now() - 1000).toISOString(), ai_labels: ['tactical_gear', 'long_rifle'], evidence_ids: ['evid_123'] },
        { id: 'evt_002', device_id: 'cam_01', type: 'motion', severity: 'low', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), ai_labels: ['animal'], evidence_ids: ['evid_124'] },
      ];
      _fallback.cameras = [
        { id: 'cam_01', name: 'Front Gate', brand: 'eseecloud', status: 'online', ip_address: '192.168.1.101', stream_url: 'rtsp://192.168.1.101:554/stream1' },
        { id: 'cam_02', name: 'Driveway', brand: 'huntervision', status: 'online', ip_address: '192.168.1.105', stream_url: 'rtsp://192.168.1.105:554/stream1' },
        { id: 'cam_03', name: 'Backyard', brand: 'ajcloud', status: 'online', ip_address: '192.168.1.110', stream_url: 'rtsp://192.168.1.110:554/stream1' },
        { id: 'cam_04', name: 'Garage', brand: 'onvif', status: 'offline', ip_address: '192.168.1.112', stream_url: 'rtsp://192.168.1.112:554/stream1' },
      ];
    }
    return _fallback as any;
  }
}

// Persistent api object that lazily picks real vs fallback
export const api: any = {
  getCameras: () => realClient().then(c => c.getCameras()),
  getEvents: (filters?: { device_id?: string; severity?: string }) => realClient().then(c => c.getEvents(filters)),
  getEvent: (id: string) => realClient().then(c => c.getEvent(id)),
  createEvent: (data: Omit<SecurityEvent, 'id'>) => realClient().then(c => c.createEvent(data)),
  getEvidenceList: () => realClient().then(c => c.getEvidenceList()),
  createEvidence: (data: Omit<Evidence, 'id'>) => realClient().then(c => c.createEvidence(data)),
  getEvidenceDownloadUrl: (id: string) => realClient().then(c => c.getEvidenceDownloadUrl(id)),
  generateReport: (id: string) => realClient().then(c => c.generateReport(id)),
  getThreats: (filters?: { device_id?: string }) => realClient().then(c => c.getThreats(filters)),
  createThreat: (data: Omit<Threat, 'id'>) => realClient().then(c => c.createThreat(data)),
  getOnvifStatus: () => realClient().then(c => c.getOnvifStatus()),
  scanNetwork: () => realClient().then(c => c.scanNetwork()),
};
