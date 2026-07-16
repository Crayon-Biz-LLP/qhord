import { SmartLeadService } from '../services/smartlead.service';

export async function validateSmartlead(apiKey: string): Promise<boolean> {
  if (apiKey.startsWith('mock_')) return true;
  const service = new SmartLeadService(apiKey);
  try {
    await service.getAllEmailAccounts({});
    return true;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('Invalid Smartlead API key');
    }
    const msg = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid Smartlead API key';
    throw new Error(msg);
  }
}
