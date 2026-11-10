// PDF report bundle generator
export const generateReport = async (eventId: string) => {
  return { status: 'success' as const, report_url: `/api/reports/${eventId}.pdf` };
};
