import React, { useState } from 'react';
import { UserRole, USER_ROLES } from '../mockData';
import { 
  ShieldCheck, 
  RefreshCw, 
  Key, 
  Cpu, 
  Eye, 
  FileText, 
  UserX, 
  Plus, 
  Lock, 
  Smartphone, 
  UserCheck, 
  FolderLock,
  ListFilter
} from 'lucide-react';

interface IdentityConsoleProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  setActiveModule: (module: string) => void;
  setViewMode: (mode: 'module' | 'chart') => void;
  handleOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => void;
  addNotification: (message: string) => void;
}

interface BadgeRecord {
  id: string;
  name: string;
  department: string;
  uid: string;
  status: 'Active' | 'Revoked';
  lastTap: string;
}

export const IdentityConsole: React.FC<IdentityConsoleProps> = ({
  currentRole,
  setCurrentRole,
  setActiveModule,
  setViewMode,
  handleOpenChart,
  addNotification
}) => {
  // SSO Active provider config state
  const [activeSSO, setActiveSSO] = useState<'Clerk' | 'EntraID' | 'Okta' | 'Google'>('Clerk');
  const [mfaEnabled, setMfaEnabled] = useState(true);

  // Passkeys list
  const [passkeys, setPasskeys] = useState([
    { name: 'YubiKey 5C NFC (Primary)', added: '2026-01-15' },
    { name: 'Windows Hello Biometrics', added: '2026-03-22' }
  ]);
  const [isRegisteringKey, setIsRegisteringKey] = useState(false);

  // Badges list state
  const [badges, setBadges] = useState<BadgeRecord[]>([
    { id: '1', name: 'Mayor Gibbons', department: 'Executive Admin', uid: 'RFID-9832-NWK', status: 'Active', lastTap: '10 mins ago' },
    { id: '2', name: 'Elena Rostova', department: 'Zoning Board', uid: 'RFID-0812-NWK', status: 'Active', lastTap: '2 hours ago' },
    { id: '3', name: 'Marcus Miller', department: 'Inspections Div', uid: 'RFID-1102-NWK', status: 'Active', lastTap: 'Just now' },
    { id: '4', name: 'DCF Developers Partner', department: 'External Builder', uid: 'RFID-4412-NWK', status: 'Active', lastTap: '1 day ago' }
  ]);

  // Security Audit trails
  const [auditLogs, setAuditLogs] = useState([
    { time: '14:55:02', event: 'Clerk multi-tenant workspace isolation verified.', actor: 'System Core' },
    { time: '14:38:12', event: 'Workstation-4 workstation tap: Marcus Miller authenticated.', actor: 'RFID reader-2' },
    { time: '13:02:11', event: 'Active Directory SSO synchronization completed (14 users).', actor: 'EntraID Sync' }
  ]);

  // Handle Badge Tap Login (Epic style session recovery simulation)
  const handleBadgeTap = async (roleName: 'mayor' | 'inspector' | 'resident') => {
    const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');
    let badgeId = 'BADGE-EX-001'; // Matches mayor badgeId in seed.ts
    if (roleName === 'inspector') {
      badgeId = 'BADGE-IN-002'; // Matches inspector badgeId in seed.ts
    } else if (roleName === 'resident') {
      badgeId = 'BADGE-RES-NONE';
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/badge-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId })
      });

      if (res.ok) {
        const profile = await res.json();
        addNotification(`NFC Tap Verification: Verified credentials for ${profile.email}`);
      } else {
        addNotification('NFC Tap Status: Falling back to local offline profile sync.');
      }
    } catch (err) {
      console.error(err);
    }

    let targetRole = USER_ROLES.mayor;
    let welcomeMsg = '';
    let restoredTabsCount = 0;

    if (roleName === 'mayor') {
      targetRole = USER_ROLES.mayor;
      welcomeMsg = 'Welcome back Mayor Gibbons (Central Admin)!';
      restoredTabsCount = 1;
    } else if (roleName === 'inspector') {
      targetRole = USER_ROLES.inspector;
      welcomeMsg = 'Welcome back Inspector Miller (Inspections Div)!';
      restoredTabsCount = 3;
    } else {
      targetRole = USER_ROLES.resident;
      welcomeMsg = 'Welcome back Resident Gibbons (Citizen Portal)!';
      restoredTabsCount = 0;
    }

    // Authenticate and swap role
    setCurrentRole(targetRole);
    addNotification(`Munevo ID: ${welcomeMsg} Resumed Workspace.`);

    // Log event in audit trail
    const time = new Date().toTimeString().split(' ')[0];
    setAuditLogs(prev => [
      { time, event: `Badge Tap Login: ${targetRole.name} authenticated via NFC credentials.`, actor: 'Munevo ID HID Global' },
      ...prev
    ]);

    // Restore Epic Workspace state simulation
    if (roleName === 'inspector') {
      // Auto-open inspector relevant charts
      handleOpenChart('permit', 'perm_02'); // Facade restoration
      setViewMode('chart');
    } else if (roleName === 'mayor') {
      setActiveModule('command-center');
      setViewMode('module');
    }
  };

  // Revoke/Restore badge
  const toggleBadgeStatus = (id: string) => {
    setBadges(prev => prev.map(badge => {
      if (badge.id === id) {
        const nextStatus = badge.status === 'Active' ? 'Revoked' : 'Active';
        
        // Log event
        const time = new Date().toTimeString().split(' ')[0];
        setAuditLogs(audit => [
          { time, event: `Badge status changed to ${nextStatus} for user: ${badge.name}`, actor: 'Naeem Gibbons (Admin)' },
          ...audit
        ]);
        
        addNotification(`Badge ${badge.uid} has been ${nextStatus === 'Revoked' ? 'DISABLED' : 'RE-ACTIVATED'}.`);
        return { ...badge, status: nextStatus };
      }
      return badge;
    }));
  };

  // Register passkey simulation
  const handleRegisterPasskey = () => {
    setIsRegisteringKey(true);
    setTimeout(() => {
      const time = new Date().toTimeString().split(' ')[0];
      setPasskeys(prev => [...prev, { name: 'YubiKey 5 NFC (Backup)', added: 'Just now' }]);
      setAuditLogs(audit => [
        { time, event: 'Registered FIDO2 WebAuthn Passkey (YubiKey 5 NFC Backup)', actor: 'User Register Console' },
        ...audit
      ]);
      addNotification('FIDO2 Passkey Registered Successfully!');
      setIsRegisteringKey(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
      
      {/* Left Column: Badge login tapper & configuration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        
        {/* RFID/NFC Badge Tapper Simulator */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
          <div className="card-header" style={{ marginBottom: '8px' }}>
            <div className="card-title">
              <Cpu className="brand-gradient-text" size={16} />
              <span>HID Global Workstation Badge Reader Simulator</span>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Munevo ID Physical Tap</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
            Simulate tapping an employee RFID/NFC badge on this terminal. Munevo will instantly authenticate the user, map their department permissions, and restore their Epic Hyperspace-style active workspace tab configurations.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-action" 
              onClick={() => handleBadgeTap('mayor')}
              style={{ flex: 1, flexDirection: 'column', padding: '12px', fontSize: '0.75rem' }}
            >
              <UserCheck size={16} style={{ color: 'var(--accent-color)', marginBottom: '4px' }} />
              <strong>Tap Mayor\'s Badge</strong>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Exec Admin (NWK-9832)</span>
            </button>

            <button 
              className="btn-action" 
              onClick={() => handleBadgeTap('inspector')}
              style={{ flex: 1, flexDirection: 'column', padding: '12px', fontSize: '0.75rem' }}
            >
              <UserCheck size={16} style={{ color: 'var(--primary-color)', marginBottom: '4px' }} />
              <strong>Tap Inspector\'s Badge</strong>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Building Insp (NWK-1102)</span>
            </button>

            <button 
              className="btn-action" 
              onClick={() => handleBadgeTap('resident')}
              style={{ flex: 1, flexDirection: 'column', padding: '12px', fontSize: '0.75rem' }}
            >
              <UserCheck size={16} style={{ color: 'var(--text-muted)', marginBottom: '4px' }} />
              <strong>Tap Resident\'s Portal</strong>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Citizen Access</span>
            </button>
          </div>
        </div>

        {/* SSO Enterprise Identity Providers */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Lock size={14} style={{ color: 'var(--primary-color)' }} />
              <span>Federated SSO Identity Providers</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
            <div 
              onClick={() => setActiveSSO('Clerk')}
              style={{ 
                padding: '10px', 
                background: activeSSO === 'Clerk' ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.1)' : 'rgba(255,255,255,0.01)', 
                border: activeSSO === 'Clerk' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}
            >
              <div style={{ fontWeight: 'bold', color: activeSSO === 'Clerk' ? 'var(--primary-color)' : 'var(--text-primary)' }}>Clerk SSO (Primary)</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>Multi-tenancy & MFA isolate session.</div>
            </div>

            <div 
              onClick={() => setActiveSSO('EntraID')}
              style={{ 
                padding: '10px', 
                background: activeSSO === 'EntraID' ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.1)' : 'rgba(255,255,255,0.01)', 
                border: activeSSO === 'EntraID' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}
            >
              <div style={{ fontWeight: 'bold', color: activeSSO === 'EntraID' ? 'var(--primary-color)' : 'var(--text-primary)' }}>Microsoft Entra ID (Azure AD)</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>Gov identity synchronized groups.</div>
            </div>

            <div 
              onClick={() => setActiveSSO('Okta')}
              style={{ 
                padding: '10px', 
                background: activeSSO === 'Okta' ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.1)' : 'rgba(255,255,255,0.01)', 
                border: activeSSO === 'Okta' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}
            >
              <div style={{ fontWeight: 'bold' }}>Okta SSO (Standby)</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>Enterprise SSO fallback configuration.</div>
            </div>

            <div 
              onClick={() => setActiveSSO('Google')}
              style={{ 
                padding: '10px', 
                background: activeSSO === 'Google' ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.1)' : 'rgba(255,255,255,0.01)', 
                border: activeSSO === 'Google' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}
            >
              <div style={{ fontWeight: 'bold' }}>Google Workspace (Standby)</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>Employee G-Suite authorization.</div>
            </div>
          </div>
        </div>

        {/* Badge inventory table */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <FolderLock size={14} style={{ color: 'var(--primary-color)' }} />
              <span>RFID / NFC Badge Credentials Inventory</span>
            </div>
          </div>

          <div className="tracker-table-container">
            <table className="tracker-table" style={{ fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th>Employee / Holder</th>
                  <th>Department</th>
                  <th>RFID Card UID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {badges.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td>{b.department}</td>
                    <td style={{ fontFamily: 'monospace' }}>{b.uid}</td>
                    <td>
                      <span className={`badge-status ${b.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleBadgeStatus(b.id)}
                        style={{ 
                          background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid var(--border-color)', 
                          color: b.status === 'Active' ? 'var(--danger-text)' : 'var(--success-text)',
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          cursor: 'pointer'
                        }}
                      >
                        {b.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Right Column: MFA, Passkeys, YubiKey Register & Audit Logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        
        {/* Passkeys & WebAuthn Desk */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Key size={14} style={{ color: 'var(--primary-color)' }} />
              <span>FIDO2 / WebAuthn Passkeys Desk</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Conditional Access MFA Tokens:</span>
              <button 
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={`badge-status ${mfaEnabled ? 'badge-success' : 'badge-danger'}`}
                style={{ border: 'none', cursor: 'pointer', padding: '4px 8px' }}
              >
                {mfaEnabled ? 'MFA: ENFORCED' : 'MFA: DISABLED'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>REGISTERED SECURITY CREDENTIALS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {passkeys.map((k, idx) => (
                  <div key={idx} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{k.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Added: {k.added}</span>
                  </div>
                ))}
              </div>

              <button 
                className="ai-btn-send"
                style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={handleRegisterPasskey}
                disabled={isRegisteringKey}
              >
                <Plus size={12} />
                <span>{isRegisteringKey ? 'Waiting for YubiKey Metal Touch...' : 'Register YubiKey / FIDO2 Passkey'}</span>
              </button>

              {isRegisteringKey && (
                <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--accent-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-color)' }} className="anim-pulse">
                  * Insert your YubiKey security key into USB port and tap the flashing metal contact sensor now.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Access Audit Trails */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={14} style={{ color: 'var(--success-text)' }} />
              <span>Identity Access Audit Trails (HID Readers & SSO)</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {auditLogs.map((log, idx) => (
              <div key={idx} style={{ fontSize: '0.75rem', padding: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.65rem', marginBottom: '2px' }}>
                  <span>{log.actor}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{log.time}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>{log.event}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CSS Animations */}
      <style>{`
        .anim-pulse {
          animation: pulse 1s infinite alternate ease-in-out;
        }
        @keyframes pulse {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
      `}</style>

    </div>
  );
};
