import { supabase } from './supabase_client';

export const api = {
  getCameras: async () => {
    const { data } = await supabase.from('cameras').select('*');
    return data || [];
  },
  getEvents: async (filters?: any) => {
    let q = supabase.from('security_events').select('*');
    if (filters?.device_id) q = q.eq('device_id', filters.device_id);
    if (filters?.severity) q = q.eq('severity', filters.severity);
    const { data } = await q;
    return data || [];
  },
  getEvidenceList: async () => {
    const { data } = await supabase.from('evidence').select('*');
    return data || [];
  },
  getThreats: async (filters?: any) => {
    let q = supabase.from('threats').select('*');
    if (filters?.device_id) q = q.eq('device_id', filters.device_id);
    const { data } = await q;
    return data || [];
  }
};
