import { InstantlyService } from '../services/instantly.service';

export async function validateInstantly(apiKey: string): Promise<boolean> {
  if (apiKey.startsWith('mock_')) return true;
  const service = new InstantlyService(apiKey);
  try {
    await service.listWorkspaces({});
    return true;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error('Invalid Instantly API key');
    }
    const msg = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid Instantly API key';
    throw new Error(msg);
  }
}
