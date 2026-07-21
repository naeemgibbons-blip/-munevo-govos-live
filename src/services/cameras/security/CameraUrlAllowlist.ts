export const ALLOWED_CAMERA_DOMAINS = [
  'webcams.nyctmc.org',
  '511nj.org',
  'www.511nj.org',
  'njta.gov',
  'www.njta.gov',
  'images.unsplash.com'
];

export function isAllowedCameraUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_CAMERA_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}
