import { ALLOWED_CAMERA_DOMAINS, isAllowedCameraUrl } from './CameraUrlAllowlist.js';

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
}

export class CameraProxySecurity {
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
  private static readonly REQUEST_TIMEOUT_MS = 8000; // 8s timeout

  public static isPrivateOrInternalIp(hostname: string): boolean {
    const lower = hostname.toLowerCase();
    if (lower === 'localhost' || lower === '127.0.0.1' || lower === '::1' || lower === '0.0.0.0') {
      return true;
    }
    // Private IPv4 ranges
    if (/^10\./.test(lower) || /^192\.168\./.test(lower) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(lower)) {
      return true;
    }
    // Link local
    if (/^169\.254\./.test(lower)) {
      return true;
    }
    return false;
  }

  public static validateProxyRequestUrl(targetUrlStr: string): SecurityCheckResult {
    if (!targetUrlStr) {
      return { allowed: false, reason: 'Missing target URL' };
    }

    try {
      const url = new URL(targetUrlStr);

      // HTTPS-only policy
      if (url.protocol !== 'https:') {
        return { allowed: false, reason: 'HTTPS protocol is strictly required.' };
      }

      // Check for private IP or localhost
      if (this.isPrivateOrInternalIp(url.hostname)) {
        return { allowed: false, reason: 'Access to private or localhost IP ranges is strictly forbidden.' };
      }

      // Domain allowlist check
      if (!isAllowedCameraUrl(targetUrlStr)) {
        return { allowed: false, reason: `Domain ${url.hostname} is not in the approved camera allowlist.` };
      }

      return { allowed: true };
    } catch {
      return { allowed: false, reason: 'Invalid URL format' };
    }
  }

  public static validateContentType(contentTypeHeader: string | null | undefined): boolean {
    if (!contentTypeHeader) return false;
    const lower = contentTypeHeader.toLowerCase();
    const validPrefixes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/m3u8',
      'application/vnd.apple.mpegurl',
      'application/x-mpegurl'
    ];
    return validPrefixes.some(prefix => lower.includes(prefix));
  }

  public static getMaxFileSize(): number {
    return this.MAX_FILE_SIZE_BYTES;
  }

  public static getRequestTimeoutMs(): number {
    return this.REQUEST_TIMEOUT_MS;
  }
}
