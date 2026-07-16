import { HeyReachService } from '../services/heyreach.service';

export async function validateHeyreach(apiKey: string): Promise<boolean> {
  if (apiKey.startsWith('mock_')) return true;
  const service = new HeyReachService(apiKey);
  try {
    await service.getAllLinkedInAccounts({});
    return true;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('Invalid HeyReach API key');
    }
    const msg = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid HeyReach API key';
    throw new Error(msg);
  }
}
