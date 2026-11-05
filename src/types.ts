export interface Camera {
  id: string;
  name: string;
  brand: 'eseecloud' | 'huntervision' | 'ajcloud' | 'onvif';
  status: 'online' | 'offline';
  ip_address: string;
  stream_url: string;
}

export interface SecurityEvent {
  id: string;
  device_id: string;
  type: 'motion' | 'tamper' | 'intrusion' | 'wireless_anomaly' | 'weapon_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  ai_labels: string[];
  evidence_ids: string[];
}

export interface Evidence {
  id: string;
  event_id: string;
  timestamp: string;
  type: 'video_clip' | 'snapshot' | 'log_bundle';
  metadata: {
    duration?: number;
    file_size: string;
    resolution?: string;
  };
  status: 'processing' | 'ready' | 'archived';
}

export interface Threat {
  id: string;
  device_id: string;
  type: 'deauth_attack' | 'jamming' | 'rogue_ap' | 'mac_spoofing';
  details: string;
  signal_info: {
    frequency: string;
    rssi: number;
    target_mac: string;
  };
  timestamp: string;
}
