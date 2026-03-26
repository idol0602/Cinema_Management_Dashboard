type PermissionItem = {
  path?: string;
  method?: string;
};

const routePermissionPrefixes: Record<string, string[]> = {
  '/refunds': ['/api/orders', '/api/payment/momo/refund', '/api/payment/vnpay/refund'],
  '/statisticals': ['/api/statistics'],
};

export function hasRoutePermission(
  permissions: PermissionItem[] | undefined,
  routePath: string,
  requiredMethods: string[] = ['GET']
): boolean {
  if (!Array.isArray(permissions)) return false;

  const methods = new Set(requiredMethods.map((m) => m.toUpperCase()));
  const prefixes = routePermissionPrefixes[routePath] || [`/api${routePath}`];

  return permissions.some((p) => {
    if (!p?.path || typeof p.path !== 'string') return false;
    if (!p?.method || typeof p.method !== 'string') return false;
    const method = p.method.toUpperCase();

    return methods.has(method) && prefixes.some((prefix) => p.path?.startsWith(prefix));
  });
}
