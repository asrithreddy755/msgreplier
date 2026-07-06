export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const base = (envUrl || 'http://localhost:3000').trim();

  if (base.startsWith('http://') || base.startsWith('https://')) {
    return base.replace(/\/$/, '');
  }

  return `https://${base.replace(/\/$/, '')}`;
}
