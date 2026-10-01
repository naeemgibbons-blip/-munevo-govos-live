/**
 * Munevo Workstation Guard Credential Provider Abstraction Architecture
 * Abstracts multi-provider identity verification (WebAuthn, Entra CBA, PIV Hardware, Dev Simulation)
 */

export type AuthMethodAssurance = 'PASSWORD' | 'WEBAUTHN' | 'PIV_CBA' | 'ENTRA_CBA' | 'DEV_SIMULATION';

export type WorkstationGuardState = 
  | 'LOCKED'
  | 'WAITING_FOR_CREDENTIAL'
  | 'AUTHENTICATING'
  | 'VERIFIED'
  | 'PIN_REQUIRED_BY_CREDENTIAL_PROVIDER'
  | 'ACCESS_DENIED'
  | 'CREDENTIAL_REVOKED'
  | 'READER_UNAVAILABLE'
  | 'IDENTITY_NOT_AUTHORIZED';

export interface AuthenticationResult {
  success: boolean;
  guardState: WorkstationGuardState;
  userEmail?: string;
  employeeName?: string;
  role?: string;
  badgeId?: string;
  authMethod: AuthMethodAssurance;
  error?: string;
  pinRequired?: boolean;
}

export interface WorkstationCredentialProvider {
  id: string;
  name: string;
  type: 'DEV_SIMULATION' | 'WEBAUTHN' | 'ENTRA_CBA' | 'PIV_CBA';
  isAvailable(): Promise<boolean>;
  authenticate(options?: { badgeId?: string; pin?: string; credentialId?: string }): Promise<AuthenticationResult>;
}

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : 'https://munevo-govos-live.onrender.com');

/**
 * 1. Development Badge Provider (Simulation Mode)
 * Strictly gated behind server-side simulation flag
 */
export class DevelopmentBadgeProvider implements WorkstationCredentialProvider {
  id = 'dev-badge-provider';
  name = 'Development Badge Simulation Provider';
  type = 'DEV_SIMULATION' as const;

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/api/auth/config`);
      if (res.ok) {
        const config = await res.json();
        return Boolean(config.badgeSimulationEnabled);
      }
    } catch (err) {}
    return false;
  }

  async authenticate(options?: { badgeId?: string; pin?: string }): Promise<AuthenticationResult> {
    const badgeId = options?.badgeId || 'BDG-NWK-0092';
    const pin = options?.pin;

    try {
      const res = await fetch(`${API_URL}/api/auth/badge-unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId, pin })
      });

      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          guardState: 'VERIFIED',
          userEmail: data.userEmail,
          employeeName: data.employeeName,
          role: data.role,
          badgeId: data.badgeId,
          authMethod: 'DEV_SIMULATION'
        };
      } else if (res.status === 403) {
        return {
          success: false,
          guardState: 'ACCESS_DENIED',
          authMethod: 'DEV_SIMULATION',
          error: data.error || 'Simulated badge authentication is disabled in production.'
        };
      } else if (data.pinRequired) {
        return {
          success: false,
          guardState: 'PIN_REQUIRED_BY_CREDENTIAL_PROVIDER',
          authMethod: 'DEV_SIMULATION',
          pinRequired: true,
          error: '4-Digit Security PIN required for high-security credential.'
        };
      } else {
        return {
          success: false,
          guardState: 'ACCESS_DENIED',
          authMethod: 'DEV_SIMULATION',
          error: data.error || 'Badge authentication denied.'
        };
      }
    } catch (err: any) {
      return {
        success: false,
        guardState: 'READER_UNAVAILABLE',
        authMethod: 'DEV_SIMULATION',
        error: 'Authentication endpoint unreachable.'
      };
    }
  }
}

/**
 * 2. WebAuthn / FIDO2 Cryptographic Credential Provider
 * Server-generated single-use challenge + WebAuthn navigator.credentials.get() signature
 */
export class WebAuthnProvider implements WorkstationCredentialProvider {
  id = 'webauthn-fido2-provider';
  name = 'FIDO2 / WebAuthn Hardware Token Provider';
  type = 'WEBAUTHN' as const;

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);
  }

  async authenticate(): Promise<AuthenticationResult> {
    try {
      // Step 1: Request single-use challenge from Munevo Server
      const challengeRes = await fetch(`${API_URL}/api/auth/webauthn/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!challengeRes.ok) {
        throw new Error('Failed to generate server WebAuthn challenge.');
      }

      const { challengeId, challenge, rpId } = await challengeRes.json();

      // Convert base64url challenge string to Uint8Array
      const challengeBuffer = Uint8Array.from(atob(challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

      // Step 2: Invoke WebAuthn Hardware Authenticator
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer,
          rpId: rpId || window.location.hostname,
          userVerification: 'required',
          timeout: 60000
        }
      }) as any;

      if (!credential) {
        return {
          success: false,
          guardState: 'ACCESS_DENIED',
          authMethod: 'WEBAUTHN',
          error: 'WebAuthn hardware assertion canceled or denied.'
        };
      }

      // Step 3: Send signed assertion to Munevo server for cryptographic verification
      const verifyRes = await fetch(`${API_URL}/api/auth/webauthn/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          credentialId: credential.id,
          rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
          response: {
            clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
            authenticatorData: btoa(String.fromCharCode(...new Uint8Array(credential.response.authenticatorData))),
            signature: btoa(String.fromCharCode(...new Uint8Array(credential.response.signature))),
            userHandle: credential.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(credential.response.userHandle))) : null
          }
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.status === 'VERIFIED') {
        return {
          success: true,
          guardState: 'VERIFIED',
          userEmail: verifyData.userEmail || 'mayor@munevo.gov',
          employeeName: verifyData.employeeName || 'Mayor Naeem Gibbons',
          role: verifyData.role || 'Mayor / City Manager',
          authMethod: 'WEBAUTHN'
        };
      } else {
        return {
          success: false,
          guardState: 'ACCESS_DENIED',
          authMethod: 'WEBAUTHN',
          error: verifyData.error || 'Cryptographic WebAuthn signature verification failed.'
        };
      }
    } catch (err: any) {
      console.warn('[WebAuthnProvider] WebAuthn flow fallback/error:', err);
      return {
        success: false,
        guardState: 'READER_UNAVAILABLE',
        authMethod: 'WEBAUTHN',
        error: err.message || 'WebAuthn hardware authenticator unavailable or user cancelled prompt.'
      };
    }
  }

  /**
   * Register a new physical FIDO2 / WebAuthn Security Key
   */
  async registerCredential(keyName: string, userEmail?: string, employeeName?: string): Promise<{ success: boolean; credential?: any; error?: string }> {
    try {
      const challengeRes = await fetch(`${API_URL}/api/auth/webauthn/register-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, employeeName })
      });

      if (!challengeRes.ok) {
        throw new Error('Failed to generate WebAuthn registration challenge.');
      }

      const options = await challengeRes.json();
      const challengeBuffer = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      const userIdBuffer = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0));

      // Invoke real browser WebAuthn creation API (Windows Hello / Hardware key)
      const newCred = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: options.rp,
          user: {
            id: userIdBuffer,
            name: options.user.name,
            displayName: options.user.displayName
          },
          pubKeyCredParams: options.pubKeyCredParams,
          timeout: options.timeout,
          authenticatorSelection: options.authenticatorSelection,
          attestation: options.attestation
        }
      }) as any;

      if (!newCred) {
        return { success: false, error: 'Windows Hello / WebAuthn creation cancelled or prompt dismissed.' };
      }

      const credId = newCred.id;
      const rawIdStr = btoa(String.fromCharCode(...new Uint8Array(newCred.rawId)));
      const attestationJSON = btoa(String.fromCharCode(...new Uint8Array(newCred.response.attestationObject)));
      const clientDataJSONStr = btoa(String.fromCharCode(...new Uint8Array(newCred.response.clientDataJSON)));

      const verifyRes = await fetch(`${API_URL}/api/auth/webauthn/register-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: options.challengeId,
          name: keyName,
          credentialId: credId,
          userEmail: userEmail || options.user.name,
          employeeName: employeeName || options.user.displayName,
          response: {
            rawId: rawIdStr,
            attestationObject: attestationJSON,
            clientDataJSON: clientDataJSONStr
          }
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.status === 'REGISTERED') {
        return { success: true, credential: verifyData.credential };
      } else {
        return { success: false, error: verifyData.error || 'Failed to verify credential registration.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'WebAuthn registration error.' };
    }
  }

  async fetchCredentials(): Promise<any[]> {
    try {
      const res = await fetch(`${API_URL}/api/auth/webauthn/credentials`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {}
    return [];
  }

  async revokeCredential(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/api/auth/webauthn/credentials/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      return false;
    }
  }
}

/**
 * 3. Microsoft Entra Certificate-Based Authentication (CBA) Provider
 * Federated X.509 PIV smart card authentication via Azure AD / Entra ID CBA endpoint
 */
export class EntraCertificateProvider implements WorkstationCredentialProvider {
  id = 'entra-cba-provider';
  name = 'Microsoft Entra Certificate-Based Authentication';
  type = 'ENTRA_CBA' as const;

  async isAvailable(): Promise<boolean> {
    return true; // Federated SSO redirect available
  }

  async authenticate(): Promise<AuthenticationResult> {
    return {
      success: false,
      guardState: 'ACCESS_DENIED',
      authMethod: 'ENTRA_CBA',
      error: 'Entra Certificate-Based Authentication requires active Azure AD tenant configuration.'
    };
  }
}

/**
 * 4. PIV/CAC Hardware Smart Card Provider
 * Native Windows Smart Card Subsystem / PC-SC daemon integration
 */
export class PIVCertificateProvider implements WorkstationCredentialProvider {
  id = 'piv-cac-provider';
  name = 'PIV / CAC Smart Card Hardware Provider';
  type = 'PIV_CBA' as const;

  async isAvailable(): Promise<boolean> {
    return false; // Requires PC-SC client daemon or Entra CBA bridge
  }

  async authenticate(): Promise<AuthenticationResult> {
    return {
      success: false,
      guardState: 'READER_UNAVAILABLE',
      authMethod: 'PIV_CBA',
      error: 'Physical PIV/CAC smart-card reader daemon is not connected.'
    };
  }
}

/**
 * Master Provider Manager
 */
export class WorkstationCredentialManager {
  private providers: WorkstationCredentialProvider[] = [
    new DevelopmentBadgeProvider(),
    new WebAuthnProvider(),
    new EntraCertificateProvider(),
    new PIVCertificateProvider()
  ];

  async getAvailableProviders(): Promise<WorkstationCredentialProvider[]> {
    const available: WorkstationCredentialProvider[] = [];
    for (const p of this.providers) {
      if (await p.isAvailable()) {
        available.push(p);
      }
    }
    return available;
  }

  getProvider(id: string): WorkstationCredentialProvider | undefined {
    return this.providers.find(p => p.id === id);
  }
}

export const credentialManager = new WorkstationCredentialManager();
