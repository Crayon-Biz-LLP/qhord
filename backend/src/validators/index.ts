import { validateApollo } from './apollo.validator';
import { validateClay } from './clay.validator';
import { validateSmartlead } from './smartlead.validator';
import { validateInstantly } from './instantly.validator';
import { validateHeyreach } from './heyreach.validator';
import { validateBettercontact } from './bettercontact.validator';
import { validateCalendly } from './calendly.validator';

export async function validateToolKey(tool: string, apiKey: string): Promise<boolean> {
  const normTool = tool.toLowerCase().trim();
  switch (normTool) {
    case 'apollo':
      return validateApollo(apiKey);
    case 'clay':
      return validateClay(apiKey);
    case 'smartlead':
      return validateSmartlead(apiKey);
    case 'instantly':
      return validateInstantly(apiKey);
    case 'heyreach':
      return validateHeyreach(apiKey);
    case 'bettercontact':
    case 'bettercontacts':
      return validateBettercontact(apiKey);
    case 'calendly':
      return validateCalendly(apiKey);
    default:
      // Fallback check for other tools without a specific validator API: verify key is present
      if (!apiKey || apiKey.trim().length === 0) {
        throw new Error(`API key is required for ${tool}`);
      }
      return true;
  }
}
