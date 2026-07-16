import axios from 'axios';

export async function validateBettercontact(apiKey: string): Promise<boolean> {
  if (apiKey.startsWith('mock_')) return true;
  const baseURL = 'https://app.bettercontact.rocks/api/v2';
  try {
    await axios.get(`${baseURL}/async/validate_fake_id`, {
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json'
      }
    });
    return true;
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      throw new Error('Invalid BetterContact API key');
    }
    // Other errors (like 404 Not Found) indicate authentication succeeded but the dummy ID was not found
    return true;
  }
}
