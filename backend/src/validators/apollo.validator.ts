import { ApolloService } from '../services/apollo.service';

export async function validateApollo(apiKey: string): Promise<boolean> {
  if (apiKey.startsWith('mock_')) return true;
  const service = new ApolloService(apiKey);
  try {
    await service.listMailboxes({});
    return true;
  } catch (err: any) {
    if (err.response?.status === 401) {
      throw new Error('Invalid Apollo API key');
    }
    const msg = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid Apollo API key';
    throw new Error(msg);
  }
}
