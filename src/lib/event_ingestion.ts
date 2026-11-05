// Frontend ingestion hook
export const ingestEvent = async (eventData: any) => {
  console.log('[Ingest]', eventData);
  return eventData;
};
