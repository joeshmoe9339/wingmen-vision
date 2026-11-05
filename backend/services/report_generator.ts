// PDF report bundle generator
export const generateReport = async (eventId: string) => {
  return { status: 'success', report_url: `/api/reports/${eventId}.pdf` };
};
