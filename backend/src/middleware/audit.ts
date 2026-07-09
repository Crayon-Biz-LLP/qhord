import { Request, Response, NextFunction } from 'express';
import { auditLog } from '../services/audit.service';

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const status = res.statusCode;
    if (status >= 200 && status < 300 && req.method !== 'GET') {
      const entity = req.path.split('/').filter(Boolean)[0] || 'unknown';
      auditLog({
        operator_id: (req as any).user?.id,
        action: `${req.method} ${req.path}`,
        entity,
        entity_id: req.params?.id || body?.id || body?.campaign_id,
        metadata: { status, body: JSON.stringify(body).substring(0, 500) },
        ip_address: req.ip,
      });
    }
    return originalJson(body);
  };
  next();
}
