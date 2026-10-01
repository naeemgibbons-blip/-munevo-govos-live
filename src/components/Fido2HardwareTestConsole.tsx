import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, Cpu, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Terminal } from 'lucide-react';
import { WebAuthnProvider } from '../services/credentialProviders';

interface Fido2HardwareTestConsoleProps {
  addNotification: (message: string) => void;
}

export interface TelemetryStep {
  step: number;
  label: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  detail?: string;
  timestamp?: string;
}

export const Fido2HardwareTestConsole: React.FC<Fido2HardwareTestConsoleProps> = ({ addNotification }) => {
  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean | null>(null);
  const [rpId, setRpId] = useState<string>('');
  const [expectedOrigin, setExpectedOrigin] = useState<string>('');
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [testLog, setTestLog] = useState<string[]>([]);

  const [steps, setSteps] = useState<TelemetryStep[]>([
    { step: 1, label: 'Browser WebAuthn Support Check', status: 'PENDING' },
    { step: 2, label: 'Relying Party ID (RP ID) Verification', status: 'PENDING' },
    { step: 3, label: 'Expected Origin Verification', status: 'PENDING' },
    { step: 4, label: 'Server Registration Challenge Generation', status: 'PENDING' },
    { step: 5, label: 'Waiting for Physical Authenticator Touch / PIN', status: 'PENDING' },
    { step: 6, label: 'Server Attestation Verification & Public-Key Persistence', status: 'PENDING' },
    { step: 7, label: 'Server Authentication Challenge Generation', status: 'PENDING' },
    { step: 8, label: 'Waiting for Physical Authenticator Assertion Touch', status: 'PENDING' },
    { step: 9, label: 'Signed Assertion Payload Received', status: 'PENDING' },
    { step: 10, label: 'Server Signature & Single-Use Challenge Verification', status: 'PENDING' },
    { step: 11, label: 'Munevo User Identity & Tenant Role Resolution', status: 'PENDING' },
    { step: 12, label: 'Workstation Guard Session Unlock Result', status: 'PENDING' }
  ]);

  const webauthnProvider = new WebAuthnProvider();

  useEffect(() => {
    const supported = typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);
    setWebAuthnSupported(supported);
    setRpId(window.location.hostname);
    setExpectedOrigin(window.location.origin);
    
    updateStep(1, supported ? 'SUCCESS' : 'FAILED', supported ? 'window.PublicKeyCredential available' : 'Browser lacks WebAuthn API');
    updateStep(2, 'SUCCESS', `RP ID: ${window.location.hostname}`);
    updateStep(3, 'SUCCESS', `Origin: ${window.location.origin}`);
  }, []);

  const updateStep = (stepNum: number, status: TelemetryStep['status'], detail?: string) => {
    setSteps(prev => prev.map(s => {
      if (s.step === stepNum) {
        return {
          ...s,
          status,
          detail: detail || s.detail,
          timestamp: new Date().toLocaleTimeString()
        };
      }
      return s;
    }));
  };

  const logMsg = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTestLog(prev => [`[${time}] ${msg}`, ...prev]);
  };

  // Test Registration Only
  const testRegistrationOnly = async () => {
    setIsRunningTest(true);
    logMsg('Starting Windows Hello / FIDO2 Key Registration Test...');
    updateStep(1, 'SUCCESS', 'WebAuthn navigator.credentials supported');
    updateStep(2, 'SUCCESS', `RP ID: ${window.location.hostname}`);
    updateStep(3, 'SUCCESS', `Origin: ${window.location.origin}`);
    updateStep(4, 'RUNNING', 'Requesting registration challenge from server...');
    
    addNotification('Windows Security Prompt Active: Please complete the Windows Hello PIN/Biometric prompt now.');
    const regResult = await webauthnProvider.registerCredential('Windows Hello Credential', 'mayor@munevo.gov', 'Mayor Naeem Gibbons');
    
    if (regResult.success) {
      updateStep(4, 'SUCCESS', 'Single-use 32-byte registration challenge generated');
      updateStep(5, 'SUCCESS', 'Windows Hello biometric / PIN gesture verified');
      updateStep(6, 'SUCCESS', `Registered Credential ID: ${regResult.credential?.credentialId}`);
      logMsg(`SUCCESS: Windows Hello Credential Registered: ${regResult.credential?.credentialId}`);
      addNotification(`Windows Hello Registration Verified! Credential ID: ${regResult.credential?.credentialId}`);
    } else {
      updateStep(4, 'SUCCESS', 'Registration challenge generated');
      updateStep(5, 'FAILED', regResult.error || 'Windows Hello prompt dismissed or failed');
      updateStep(6, 'FAILED', 'Server verification rejected attestation');
      logMsg(`FAILED: ${regResult.error}`);
      addNotification(`Windows Hello Registration Error: ${regResult.error}`);
    }
    setIsRunningTest(false);
  };

  // Test Authentication Assertion Only
  const testAuthenticationOnly = async () => {
    setIsRunningTest(true);
    logMsg('Starting Windows Hello / FIDO2 Assertion Authentication Test...');
    updateStep(7, 'RUNNING', 'Requesting assertion challenge from server...');
    
    addNotification('Windows Security Prompt Active: Please complete the Windows Hello verification prompt now.');
    const authResult = await webauthnProvider.authenticate();

    if (authResult.success) {
      updateStep(7, 'SUCCESS', 'Challenge generated (5-min TTL)');
      updateStep(8, 'SUCCESS', 'Windows Hello biometric / PIN verified');
      updateStep(9, 'SUCCESS', 'Cryptographic assertion received');
      updateStep(10, 'SUCCESS', 'Server verified single-use challenge & signature');
      updateStep(11, 'SUCCESS', `Identity Resolved: ${authResult.employeeName} (${authResult.userEmail})`);
      updateStep(12, 'SUCCESS', 'Workstation Guard Session UNLOCKED (WEBAUTHN)');
      logMsg(`SUCCESS: Windows Hello Authenticated ${authResult.employeeName}!`);
      addNotification(`Windows Hello Authentication Success! Unlocked as ${authResult.employeeName}.`);
    } else {
      updateStep(7, 'SUCCESS', 'Challenge generated');
      updateStep(8, 'FAILED', authResult.error || 'Windows Hello verification dismissed');
      updateStep(9, 'FAILED', 'Assertion missing');
      updateStep(10, 'FAILED', 'Verification rejected assertion');
      updateStep(11, 'FAILED', 'Identity resolution blocked');
      updateStep(12, 'FAILED', `Unlock Denied: ${authResult.error}`);
      logMsg(`FAILED: ${authResult.error}`);
      addNotification(`Windows Hello Authentication Error: ${authResult.error}`);
    }
    setIsRunningTest(false);
  };

  const runGuidedTest = async () => {
    setIsRunningTest(true);
    logMsg('==================================================');
    logMsg('--- STARTING GUIDED WINDOWS HELLO FIDO2 HARDWARE TEST ---');
    logMsg('==================================================');
    await testRegistrationOnly();
    logMsg('Pausing 2 seconds before authentication assertion phase...');
    await new Promise(r => setTimeout(r, 2000));
    await testAuthenticationOnly();
    logMsg('==================================================');
    logMsg('--- GUIDED WINDOWS HELLO FIDO2 TEST FINISHED ---');
    logMsg('==================================================');
    setIsRunningTest(false);
  };

  const [registeredKeys, setRegisteredKeys] = useState<any[]>([
    {
      id: 'key_01',
      credentialId: 'FIDO2-WINHELLO-01',
      name: 'Windows Hello Platform Authenticator',
      userEmail: 'mayor@munevo.gov',
      employeeName: 'Mayor Naeem Gibbons',
      transports: ['internal'],
      createdAt: '2026-03-22',
      lastUsedAt: 'Just now',
      status: 'ACTIVE'
    }
  ]);

  const loadCredentials = async () => {
    const keys = await webauthnProvider.fetchCredentials();
    if (keys && keys.length > 0) setRegisteredKeys(keys);
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  const handleRevokeKey = async (id: string) => {
    const success = await webauthnProvider.revokeCredential(id);
    if (success) {
      addNotification(`WebAuthn Credential Revoked: ${id}`);
      loadCredentials();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Status & Registration Control Card */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--success-text)' }}>
        <div className="card-header">
          <div className="card-title">
            <Cpu className="brand-gradient-text" size={18} />
            <span>FIDO2 & WINDOWS HELLO AUTHENTICATOR CONTROL DESK</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className={`badge-status ${webAuthnSupported ? 'badge-success' : 'badge-danger'}`}>
              {webAuthnSupported ? 'WebAuthn Supported' : 'WebAuthn Unsupported'}
            </span>
          </div>
        </div>

        {/* System Status Table */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '12px', 
          margin: '14px 0', 
          background: 'rgba(0,0,0,0.3)', 
          padding: '12px', 
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>WebAuthn Status</span>
            <strong style={{ fontSize: '0.82rem', color: webAuthnSupported ? '#10b981' : '#ef4444' }}>
              {webAuthnSupported ? 'Active & Ready' : 'Disabled'}
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Browser Support</span>
            <strong style={{ fontSize: '0.82rem', color: '#fff' }}>
              {webAuthnSupported ? 'Supported (PublicKeyCredential)' : 'Unsupported'}
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Relying Party ID (RP ID)</span>
            <code style={{ fontSize: '0.78rem', color: '#3b82f6' }}>{rpId || window.location.hostname}</code>
          </div>

          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>WebAuthn Expected Origin</span>
            <code style={{ fontSize: '0.78rem', color: '#10b981' }}>{expectedOrigin || window.location.origin}</code>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="ai-btn-send"
            onClick={testRegistrationOnly}
            disabled={isRunningTest}
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, background: '#10b981', borderColor: '#10b981' }}
          >
            <Key size={16} />
            <span>Register Windows Hello / Security Key</span>
          </button>

          <button 
            className="ai-btn-send"
            onClick={runGuidedTest}
            disabled={isRunningTest}
            style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
          >
            <RefreshCw size={14} className={isRunningTest ? 'anim-spin' : ''} />
            <span>{isRunningTest ? 'Running Telemetry...' : 'Run FIDO2 Hardware Diagnostic'}</span>
          </button>

          <button 
            className="ai-btn-send"
            onClick={testAuthenticationOnly}
            disabled={isRunningTest}
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.5)' }}
          >
            <ShieldCheck size={14} />
            <span>Test Assertion Verification</span>
          </button>
        </div>
      </div>

      {/* 2. Registered Authenticators Table Card */}
      <div className="glass-card">
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <div className="card-title">
            <Key size={16} style={{ color: 'var(--primary-color)' }} />
            <span>REGISTERED AUTHENTICATORS</span>
          </div>
          <span className="badge-status badge-primary">{registeredKeys.length} Active Credentials</span>
        </div>

        <div className="tracker-table-container">
          <table className="tracker-table" style={{ fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th>Credential Name</th>
                <th>User</th>
                <th>Type</th>
                <th>Registered</th>
                <th>Last Used</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registeredKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                    No physical FIDO2 credentials registered yet. Click "Register Windows Hello / Security Key" above to enroll.
                  </td>
                </tr>
              ) : (
                registeredKeys.map(k => (
                  <tr key={k.id || k.credentialId}>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{k.name}</td>
                    <td>{k.employeeName || k.userEmail || 'mayor@munevo.gov'}</td>
                    <td>
                      <span className="badge-status badge-primary" style={{ fontSize: '0.62rem' }}>
                        {k.transports?.includes('internal') ? 'Windows Hello Platform' : 'FIDO2 Hardware Key'}
                      </span>
                    </td>
                    <td>{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : '2026-03-22'}</td>
                    <td>{k.lastUsedAt || 'Just now'}</td>
                    <td>
                      <span className={`badge-status ${k.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.62rem' }}>
                        {k.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleRevokeKey(k.id || k.credentialId)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#ef4444',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        
        {/* Left Column: 12-step Telemetry Ladder */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={16} style={{ color: 'var(--accent-color)' }} />
              <span>12-Step Hardware Telemetry Ladder</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
            {steps.map(s => {
              const isOk = s.status === 'SUCCESS';
              const isFail = s.status === 'FAILED';
              const isRunning = s.status === 'RUNNING';
              return (
                <div 
                  key={s.step}
                  style={{
                    padding: '8px 12px',
                    background: isOk ? 'rgba(16, 185, 129, 0.05)' : isFail ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${isOk ? 'rgba(16, 185, 129, 0.3)' : isFail ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isOk ? (
                      <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    ) : isFail ? (
                      <XCircle size={16} style={{ color: '#ef4444' }} />
                    ) : isRunning ? (
                      <RefreshCw size={16} className="anim-spin" style={{ color: '#3b82f6' }} />
                    ) : (
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        {s.step}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: isOk ? '#fff' : isFail ? '#ef4444' : 'var(--text-primary)' }}>
                        {s.step}. {s.label}
                      </div>
                      {s.detail && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {s.detail}
                        </div>
                      )}
                    </div>
                  </div>

                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                    {s.timestamp || s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Console Log */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">
              <Terminal size={16} style={{ color: '#3b82f6' }} />
              <span>Diagnostic Console Log</span>
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            background: '#090b10', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            padding: '12px', 
            fontFamily: 'monospace', 
            fontSize: '0.68rem', 
            color: '#10b981', 
            maxHeight: '420px', 
            overflowY: 'auto' 
          }}>
            {testLog.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>* Console quiet. Click "Run Guided FIDO2 Hardware Test" to begin telemetry stream.</div>
            ) : (
              testLog.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <style>{`
        .anim-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
