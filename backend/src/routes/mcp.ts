import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { McpHostService } from '../services/mcp-host.service';
import { McpToolTranslator } from '../services/mcp-tool-translator';

const router = Router();

router.use(requireAuth);

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { clientId, message, conversationHistory } = req.body as {
      clientId: string;
      message: string;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!clientId || !message) {
      res.status(400).json({ success: false, error: 'clientId and message are required' });
      return;
    }

    const host = new McpHostService();
    const result = await host.chat({ clientId, message, conversationHistory });
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('MCP chat error', err);
    res.status(500).json({ success: false, error: err.message || 'MCP chat failed' });
  }
});

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { clientId, toolName, arguments: args } = req.body as {
      clientId: string;
      toolName: string;
      arguments: Record<string, unknown>;
    };

    if (!clientId || !toolName) {
      res.status(400).json({ success: false, error: 'clientId and toolName are required' });
      return;
    }

    const translator = new McpToolTranslator();
    const result = await translator.execute(toolName, args || {}, clientId);
    res.json(result);
  } catch (err: any) {
    console.error('MCP execute error', err);
    res.status(500).json({ success: false, error: err.message || 'MCP execution failed' });
  }
});

export default router;
