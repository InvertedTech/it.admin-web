export function getApiBase(): string | null {
  const base = process.env.API_BASE_URL;
  return typeof base === 'string' && base.length > 0 ? base : null;
}

export function requireApiBase(): string {
  const base = getApiBase();
  if (!base) throw new Error('API_BASE_URL is not set');
  return base;
}
