import { NodeProcessorContext, NodeExecutionResult } from './index';
import { decrypt } from '../../config/encryption';
import { findToolAccount } from '../../ai/pipeline/ensure-tool-accounts';

export abstract class BaseProcessor {
  /**
   * Helper to fetch and decrypt the API key for a tool.
   * If accountId is provided in config, it uses that exact account.
   * Otherwise, it uses a fallback but in Phase 2 we want to enforce accountId.
   */
  protected async getCredentials(
    toolName: string,
    config: any,
    context: NodeProcessorContext
  ): Promise<{ apiKey: string; account: any } | NodeExecutionResult> {
    const accountId = config.accountId;
    let account;

    if (accountId) {
      account = await context.prisma.clientToolAccount.findUnique({
        where: { id: accountId }
      });
    } else {
      // Fallback for legacy / test configs if absolutely necessary
      account = await findToolAccount(context.clientId, toolName);
    }

    if (!account || !account.api_key_encrypted) {
      if (context.isTestMode) {
        return { apiKey: 'mock-key', account: {} };
      }
      return {
        status: 'failed',
        error: accountId 
          ? `Selected ${toolName} account is no longer connected. Please reconnect ${toolName}.` 
          : `${toolName} account not connected or API key missing.`
      };
    }
    
    let apiKey = '';
    try {
      apiKey = decrypt(account.api_key_encrypted).trim();
    } catch (err) {
      return {
        status: 'failed',
        error: `Failed to decrypt ${toolName} API key.`
      };
    }

    if (!apiKey || account.account_label === 'Auto (mock-ready)') {
      if (context.isTestMode) {
        // Allow mock accounts to pass if in test mode
        return { apiKey: 'mock-key', account };
      }
      return {
        status: 'failed',
        error: `${toolName} API key is invalid or not properly configured.`
      };
    }

    return { apiKey, account };
  }

  /**
   * Shared API error handler to normalize responses.
   * Masks sensitive credentials and formats error strings safely.
   */
  protected handleError(error: any, toolName: string): NodeExecutionResult {
    let errorMessage = 'Unknown error occurred.';
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Handle common HTTP error codes
      if (status === 401 || status === 403) {
        errorMessage = `Authentication failed with ${toolName}. Your API key might be invalid or expired.`;
      } else if (status === 429) {
        errorMessage = `Rate limit exceeded for ${toolName}. Please wait and try again.`;
      } else if (status >= 500) {
        errorMessage = `${toolName} experienced an internal server error.`;
      } else if (data && typeof data === 'object') {
        // Try to extract readable message from tool API
        errorMessage = data.message || data.error || data.detail || JSON.stringify(data);
      } else {
        errorMessage = `HTTP ${status}: ${error.message}`;
      }
    } else if (error.request) {
      errorMessage = `Network error: Could not reach ${toolName}.`;
    } else {
      errorMessage = error.message || String(error);
    }

    // Security: Strip out potential API keys from error messages just in case
    // (Very basic masking, can be improved)
    errorMessage = errorMessage.replace(/(sk-|bearer\s+)[A-Za-z0-9\-_]{10,}/gi, '$1***MASKED***');

    return {
      status: 'failed',
      error: `[${toolName}] ${errorMessage}`
    };
  }
}
