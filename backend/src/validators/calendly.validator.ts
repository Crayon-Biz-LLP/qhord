import { CalendlyService } from '../services/calendly.service';

export async function validateCalendly(apiKey: string): Promise<boolean> {
  if (apiKey.startsWith('mock_')) return true;
  const service = new CalendlyService(apiKey);
  try {
    await service.getCurrentUser();
    return true;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('Invalid Calendly API key');
    }
    const msg = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid Calendly API key';
    throw new Error(msg);
  }
}
