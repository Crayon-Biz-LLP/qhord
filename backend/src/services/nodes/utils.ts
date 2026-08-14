export function resolveJsonPath(path: string, obj: any): any {
  const parts = path.trim().split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

export function interpolateString(value: string, previousOutputs: Record<string, any>): string {
  if (!value || typeof value !== 'string') return value;

  // Match expressions like {{nodeId.output.path.to.field}} or {{contact.email}}
  return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const current = resolveJsonPath(path, previousOutputs);
    return current !== undefined && current !== null ? String(current) : match;
  });
}

export function interpolateConfig(config: any, previousOutputs: Record<string, any>): any {
  if (config === null || config === undefined) {
    return config;
  }

  if (typeof config === 'string') {
    return interpolateString(config, previousOutputs);
  }

  if (Array.isArray(config)) {
    return config.map(item => interpolateConfig(item, previousOutputs));
  }

  if (typeof config === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(config)) {
      result[key] = interpolateConfig(value, previousOutputs);
    }
    return result;
  }

  return config;
}
