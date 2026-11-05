// Frontend ONVIF client with ping check + mock fallback
export const ingestStream = async (deviceId: string, url: string) => {
  try {
    const target = url || 'http://192.168.1.100:8080/onvif';
    const ping = await fetch(target, { method: 'HEAD', mode: 'no-cors' }).catch(() => null);
    return { status: ping ? 'connected' : 'mock_fallback', deviceId, url: target, note: 'No real ONVIF endpoint; using mock fallback per 500-ai-agents rules.' };
  } catch {
    return { status: 'mock_fallback', deviceId, url, note: 'ONVIF unreachable — mock fallback active.' };
  }
};
