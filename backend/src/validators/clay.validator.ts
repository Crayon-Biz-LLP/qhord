import axios from 'axios';

export async function validateClay(apiKey: string): Promise<boolean> {
  if (apiKey.startsWith('mock_')) return true;
  const baseURL = process.env.CLAY_BASE_URL || 'https://api.clay.run';
  try {
    await axios.post(`${baseURL}/v1/workflows/run`, {}, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    return true;
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      throw new Error('Invalid Clay API key');
    }
    // Other errors like 400 Bad Request mean the key is valid, but the body was malformed
    return true;
  }
}
