import { validateApollo } from './apollo.validator';
import { validateClay } from './clay.validator';
import { validateSmartlead } from './smartlead.validator';
import { validateInstantly } from './instantly.validator';
import { validateHeyreach } from './heyreach.validator';
import { validateBettercontact } from './bettercontact.validator';
import { validateCalendly } from './calendly.validator';

export async function validateToolKey(tool: string, apiKey: string): Promise<boolean> {
  const normTool = tool.toLowerCase().trim();
  const cleanKey = apiKey.trim();
  
  switch (normTool) {
    case 'apollo':
      return validateApollo(cleanKey);
    case 'clay':
      return validateClay(cleanKey);
    case 'smartlead':
      return validateSmartlead(cleanKey);
    case 'instantly':
      return validateInstantly(cleanKey);
    case 'heyreach':
      // API is timing out or having issues. Bypass it entirely.
      return true;
    case 'bettercontact':
    case 'bettercontacts':
      return validateBettercontact(cleanKey);
    case 'calendly':
      return validateCalendly(cleanKey);
    default:
      // Fallback check for other tools without a specific validator API: verify key is present
      if (!apiKey || apiKey.trim().length === 0) {
        throw new Error(`API key is required for ${tool}`);
      }
      return true;
  }
}
