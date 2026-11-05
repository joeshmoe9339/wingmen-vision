// Clearcam -> Wingmen Vision integration bridge
// Uses clearcam detection (YOLOv9) and feeds events into Wingmen event pipeline

import { api } from './live_api';

export async function ingestClearcamEvent(detection: { camId: string; label: string; confidence: number }) {
  const event: any = {
    device_id: detection.camId,
    type: 'weapon_detected',
    severity: detection.confidence > 0.7 ? 'critical' : 'low',
    timestamp: new Date().toISOString(),
    ai_labels: [detection.label],
    evidence_ids: [],
  };
  const result = await api.createEvent(event);
  console.log('[ClearcamBridge] Wired event:', result);
  return result;
}
