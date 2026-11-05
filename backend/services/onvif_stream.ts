// ONVIF / RTSP stream ingestion service
export const ingestStream = async (deviceId: string, streamUrl: string) => {
  console.log(`[ONVIF] Connecting to ${deviceId}: ${streamUrl}`);
  return { status: 'connected', deviceId, streamUrl, timestamp: new Date().toISOString() };
};

export const disconnectStream = async (deviceId: string) => {
  console.log(`[ONVIF] Disconnecting ${deviceId}`);
  return { status: 'disconnected', deviceId };
};
