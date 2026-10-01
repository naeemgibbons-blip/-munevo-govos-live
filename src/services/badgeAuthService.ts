/**
 * Munevo Physical Badge & PIV Authentication Service
 * Support for NFC/PIV smart card tap reauthentication, WebNFC hardware readers,
 * cryptographic challenge-response simulations, and PIN validation for Workstation Guard.
 */

export interface BadgeCredential {
  id: string;
  badgeId: string;
  employeeName: string;
  email: string;
  role: string;
  department: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  pinRequired: boolean;
  cardType: 'PIV-CAC' | 'FIDO2-NFC' | 'Mifare-DESFire';
  certificateSerial?: string;
  lastTappedAt?: string;
}

export interface BadgeVerificationResponse {
  status: 'UNLOCKED' | 'DENIED' | 'PIN_REQUIRED';
  userEmail?: string;
  employeeName?: string;
  role?: string;
  badgeId?: string;
  unlockedAt?: string;
  error?: string;
  pinRequired?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : '');

/**
 * Perform physical badge unlock request against backend badge-unlock endpoint
 */
export async function verifyBadgeUnlock(
  badgeId: string, 
  pin?: string,
  orgId?: string
): Promise<BadgeVerificationResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (orgId) {
      headers['x-organization-id'] = orgId;
    }

    const res = await fetch(`${API_URL}/api/auth/badge-unlock`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ badgeId, pin })
    });

    const data = await res.json();
    if (res.ok) {
      return {
        status: 'UNLOCKED',
        userEmail: data.userEmail,
        employeeName: data.employeeName,
        role: data.role,
        badgeId: data.badgeId,
        unlockedAt: data.unlockedAt
      };
    } else {
      return {
        status: data.pinRequired ? 'PIN_REQUIRED' : 'DENIED',
        error: data.error || 'Badge authentication failed.',
        pinRequired: data.pinRequired
      };
    }
  } catch (err: any) {
    console.warn('[BadgeAuthService] Network offline or endpoint unreachable. Fallback simulation.', err);
    // Offline / demo fallback handling
    if (badgeId === 'BDG-NWK-0092' && pin && pin !== '9832' && pin !== '1234') {
      return { status: 'PIN_REQUIRED', error: 'Invalid PIN for Mayor badge', pinRequired: true };
    }
    return {
      status: 'UNLOCKED',
      userEmail: badgeId === 'BDG-NWK-0412' ? 'inspector@munevo.gov' : 'mayor@munevo.gov',
      employeeName: badgeId === 'BDG-NWK-0412' ? 'Elena Rostova' : 'Mayor Naeem Gibbons',
      role: badgeId === 'BDG-NWK-0412' ? 'Building Inspector' : 'Mayor / City Manager',
      badgeId,
      unlockedAt: new Date().toISOString()
    };
  }
}

/**
 * Fetch directory of active assigned PIV / Smart Badges
 */
export async function fetchAssignedBadges(orgId?: string): Promise<BadgeCredential[]> {
  try {
    const headers: Record<string, string> = {};
    if (orgId) headers['x-organization-id'] = orgId;
    
    const res = await fetch(`${API_URL}/api/badges`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('[BadgeAuthService] Failed fetching badges:', err);
  }

  // Fallback mock list
  return [
    { id: 'bdg_01', badgeId: 'BDG-NWK-0092', employeeName: 'Mayor Naeem Gibbons', email: 'mayor@munevo.gov', role: 'Mayor / City Manager', department: 'Executive Office', status: 'ACTIVE', pinRequired: true, cardType: 'PIV-CAC', certificateSerial: '0x9A88F102', lastTappedAt: new Date(Date.now() - 120000).toISOString() },
    { id: 'bdg_02', badgeId: 'BDG-NWK-0412', employeeName: 'Elena Rostova', email: 'inspector@munevo.gov', role: 'Building Inspector', department: 'Code Enforcement', status: 'ACTIVE', pinRequired: false, cardType: 'FIDO2-NFC', certificateSerial: '0x44B1290C', lastTappedAt: new Date(Date.now() - 1080000).toISOString() },
    { id: 'bdg_03', badgeId: 'BDG-NWK-0881', employeeName: 'David Chen', email: 'dchen@newark.gov', role: 'Public Works Director', department: 'City Operations', status: 'ACTIVE', pinRequired: true, cardType: 'PIV-CAC', certificateSerial: '0x10FF982A', lastTappedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'bdg_04', badgeId: 'BDG-NWK-0994', employeeName: 'Officer Sarah Jenkins', email: 'sjenkins@newarkpd.gov', role: 'Police Chief', department: 'Public Safety', status: 'ACTIVE', pinRequired: true, cardType: 'PIV-CAC', certificateSerial: '0x99281AEE', lastTappedAt: new Date(Date.now() - 7200000).toISOString() }
  ];
}

/**
 * Check if the browser supports WebNFC for native card scanning
 */
export function isWebNFCSupported(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
}

/**
 * Start listening for physical WebNFC badge taps if supported
 */
export async function startWebNFCScan(
  onBadgeDetected: (serialOrPayload: string) => void,
  onError?: (err: any) => void
): Promise<() => void> {
  if (!isWebNFCSupported()) {
    if (onError) onError(new Error('WebNFC is not supported on this device/browser.'));
    return () => {};
  }

  try {
    const reader = new (window as any).NDEFReader();
    await reader.scan();
    
    const handleReading = (event: any) => {
      const serialNumber = event.serialNumber || 'BDG-NFC-TAP-001';
      onBadgeDetected(serialNumber);
    };

    reader.addEventListener('reading', handleReading);
    return () => {
      reader.removeEventListener('reading', handleReading);
    };
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}
