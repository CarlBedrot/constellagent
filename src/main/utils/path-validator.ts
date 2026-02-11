import { resolve, normalize } from 'path';

export function validatePath(requestedPath: string, allowedBasePaths: string[]): string {
  const resolved = resolve(normalize(requestedPath));

  const isAllowed = allowedBasePaths.some((basePath) => {
    const normalizedBase = resolve(normalize(basePath));
    return resolved === normalizedBase || resolved.startsWith(normalizedBase + '/');
  });

  if (!isAllowed) {
    throw new Error(`Path access denied: ${resolved} is outside allowed directories`);
  }

  return resolved;
}
