// Real event ingestion pipeline: weapon / motion / deauth
import { supabase } from '../lib/supabase_client';

export const ingestEvent = async (eventData: { device_id: string; type: string; severity: string; ai_labels: string[] }) => {
  const { data, error } = await supabase
    .from('security_events')
    .insert([{
      event_id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      device_id: eventData.device_id,
      type: eventData.type,
      severity: eventData.severity,
      ai_labels: eventData.ai_labels,
      timestamp: new Date().toISOString(),
    }])
    .select();
  if (error) console.error('[EventIngest] Error:', error);
  return data?.[0] || null;
};
