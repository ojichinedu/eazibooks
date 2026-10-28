export interface HealthCheckResult {
  isDatabaseReady: boolean;
  isStorageReady: boolean;
  isAuthReady: boolean;
  errors: string[];
  warnings: string[];
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isDatabaseReady = false;
  let isStorageReady = false;
  let isAuthReady = false;

  try {
    const response = await fetch('/api/health', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
    const health = await response.json();
    isDatabaseReady = response.ok && health.database === 'ok';
    if (!isDatabaseReady) errors.push('Laravel could not connect to the configured database.');
  } catch (error: any) {
    errors.push('Laravel health check failed: ' + (error?.message || 'Connection error'));
  }

  try {
    const { error } = await fetch('/api/auth/me', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(async (response) => ({ response, body: await response.json() }))
      .then(({ response, body }) => ({ error: response.ok && 'user' in body ? null : new Error(body.message || 'Authentication API is unavailable.') }));
    if (error) errors.push('Authentication check failed: ' + error.message);
    else isAuthReady = true;
  } catch (error: any) {
    errors.push('Authentication check failed: ' + (error?.message || 'Connection error'));
  }

  try {
    const response = await fetch('/api/storage/buckets', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
    isStorageReady = response.ok;
    if (!response.ok) warnings.push('Laravel file storage is unavailable. Check the public storage link and permissions.');
  } catch (error: any) {
    warnings.push('Laravel file storage check failed: ' + (error?.message || 'Connection error'));
  }

  return { isDatabaseReady, isStorageReady, isAuthReady, errors, warnings };
}

export async function isDatabaseSetup(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
    const health = await response.json();
    return response.ok && health.database === 'ok';
  } catch {
    return false;
  }
}