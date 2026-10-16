import { ApolloService } from '../services/apollo.service';

export async function validateApollo(apiKey: string): Promise<boolean> {
  if (apiKey.startsWith('mock_')) return true;
  const service = new ApolloService(apiKey);
  try {
    await service.listMailboxes({});
    return true;
  } catch (err: any) {
    const status = err.response?.status;

    // Only a 401 actually means the key itself is wrong. Other statuses
    // (403 plan restrictions, 429 rate limits, network errors) got mislabeled
    // as "Invalid Apollo API key" before, which is misleading for a key that
    // works fine elsewhere but hits a plan-gated endpoint.
    if (status === 401) {
      throw new Error('Invalid Apollo API key');
    }

    const apolloMessage = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.message || err.response?.data?.error;

    if (status === 403) {
      throw new Error(apolloMessage || 'This Apollo API key doesn\'t have access to this feature — it may require a higher Apollo plan.');
    }
    if (status === 429) {
      throw new Error('Apollo rate limit reached. Please try again in a moment.');
    }

    throw new Error(apolloMessage || err.message || 'Could not verify the Apollo connection. Please try again.');
  }
}
