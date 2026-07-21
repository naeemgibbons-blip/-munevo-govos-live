import React, { useState } from 'react';
import { 
  Sliders, 
  Database, 
  Network, 
  Workflow, 
  Key, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Layers, 
  Terminal, 
  CheckCircle,
  Clock,
  Sparkles,
  Server
} from 'lucide-react';

interface PlatformControlCenterProps {
  currentProfile: any;
  addNotification: (msg: string) => void;
}

export const PlatformControlCenter: React.FC<PlatformControlCenterProps> = ({
  currentProfile,
  addNotification
}) => {
  const [activeTab, setActiveTab] = useState<string>('health');

  const navItems = [
    { id: 'health', label: 'Platform Health', icon: Cpu },
    { id: 'udm-studio', label: 'UDM Studio', icon: Database },
    { id: 'kg-inspector', label: 'Knowledge Graph', icon: Network },
    { id: 'workflow', label: 'Workflow Engine Studio', icon: Workflow },
    { id: 'api-gateway', label: 'API Gateway & Integration', icon: Key },
    { id: 'security', label: 'Security & Audit Center', icon: ShieldCheck },
    { id: 'auth-settings', label: 'Authentication & Identity', icon: Key },
    { id: 'badge-management', label: 'Badge Credentials (NFC/PIV)', icon: ShieldCheck },
    { id: 'session-policies', label: 'Session Lock & Inactivity Policies', icon: Clock }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(17, 19, 30, 0.9) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--primary-color)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sliders size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-status badge-success">Munevo GovOS Control Center</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Platform Admin & System Telemetry</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                Operating System Control Center
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="ai-btn-send"
              onClick={() => addNotification('Triggered complete UDM schema sync across microservices')}
              style={{ fontSize: '0.75rem', padding: '8px 14px' }}
            >
              Sync UDM Schema
            </button>
          </div>
        </div>
      </div>

      {/* Subtabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
        {navItems.map(item => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--primary-color)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              <IconComp size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'health' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={16} style={{ color: 'var(--primary-color)' }} />
                <span>API Gateway Health</span>
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>99.98%</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Latency: 12ms • 1,420 req/sec • Supabase Auth active
            </p>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={16} style={{ color: '#3b82f6' }} />
                <span>UDM Synced Records</span>
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>148,920</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Canonical Entities: Property, Business, Permit, Inspection, Incident
            </p>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Network size={16} style={{ color: '#8b5cf6' }} />
                <span>Knowledge Graph Edges</span>
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6' }}>412,040</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Real-time relationship connections active
            </p>
          </div>
        </div>
      )}

      {activeTab === 'udm-studio' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-title">Canonical UDM Entity Schemas</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { entity: 'PropertyParcel', fields: 'id, address, zoning, blockLot, ownerId, assessedValue, gisCoords', status: 'Canonical Shared' },
              { entity: 'BuildingPermit', fields: 'id, permitNumber, propertyId, type, status, estimatedCost, applicant', status: 'Canonical Shared' },
              { entity: 'CodeViolation', fields: 'id, caseNumber, propertyId, violationType, status, fineAmount', status: 'Canonical Shared' },
              { entity: 'OperationsWorkOrder', fields: 'id, title, status, priority, assignedTo, address, module', status: 'Canonical Shared' }
            ].map((schema, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{schema.entity}</span>
                  <span className="badge-status badge-primary">{schema.status}</span>
                </div>
                <code style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '4px' }}>
                  {schema.fields}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'auth-settings' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Enterprise Authentication & Identity Management
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Configure identity providers, Microsoft Entra SSO, enrollment policies, and password requirements.
              </p>
            </div>
            <span className="badge-status badge-success">Supabase Auth Authoritative</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {/* Identity Providers Configuration */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={16} style={{ color: '#3b82f6' }} />
                <span>Identity Providers & SSO</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Work Email & Password</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Standard password authentication with min 12-char policy</div>
                </div>
                <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>
                    Microsoft Entra ID (Single Sign-On)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OIDC / OAuth 2.0 PKCE with Microsoft Work accounts</div>
                </div>
                <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Microsoft Entra Tenant ID</label>
                <input type="text" className="ai-input" style={{ width: '100%', fontSize: '0.78rem' }} defaultValue="common" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Microsoft Client Secret (Encrypted Server Variable)</label>
                <input type="password" className="ai-input" style={{ width: '100%', fontSize: '0.78rem' }} value="••••••••••••••••••••••••" readOnly />
              </div>
            </div>

            {/* Enrollment & Tenant Domain Policies */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: '#10b981' }} />
                <span>Enrollment & Security Policy</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>New User Enrollment Mode</label>
                <select className="role-select" style={{ width: '100%', background: '#161824', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <option value="INVITATION_REQUIRED">Option A: Invitation Required (Default Safe)</option>
                  <option value="AUTO_ENROLL">Option B: Approved Domain Auto-Enrollment</option>
                  <option value="ADMIN_QUEUE">Option C: Administrator Approval Queue</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Approved Municipal Email Domains</label>
                <input type="text" className="ai-input" style={{ width: '100%', fontSize: '0.78rem' }} defaultValue="munevo.gov, newarknj.gov, austintexas.gov, seattle.gov" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Default Role for Enrolled Users</label>
                <input type="text" className="ai-input" style={{ width: '100%', fontSize: '0.78rem' }} defaultValue="Building Inspector" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Require 12+ Char Password & Audit Logging</span>
                <button 
                  onClick={() => addNotification('Authentication & Identity Security Policy updated successfully!')}
                  style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Identity Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: Badge Credentials Management (NFC/PIV Smart Badges) */}
      {activeTab === 'badge-management' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Municipal Employee Badge Credentials Roster
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Manage physical NFC / PIV smart card badges, workstation readers, and tap-to-unlock permissions.
              </p>
            </div>
            <button 
              onClick={() => addNotification('Opened Administrator Badge Assignment Wizard')}
              style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '8px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              + Enroll New Smart Badge
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Employee</th>
                  <th style={{ padding: '10px' }}>Badge UID</th>
                  <th style={{ padding: '10px' }}>Role / Dept</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Last Tapped</th>
                  <th style={{ padding: '10px' }}>PIN Policy</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { badgeId: 'BDG-NWK-0092', name: 'Mayor Naeem Gibbons', role: 'Mayor / City Manager', dept: 'Executive Office', status: 'ACTIVE', lastTapped: '2 mins ago', pin: 'PIN Required' },
                  { badgeId: 'BDG-NWK-0412', name: 'Elena Rostova', role: 'Building Inspector', dept: 'Code Enforcement', status: 'ACTIVE', lastTapped: '18 mins ago', pin: 'Tap Only' },
                  { badgeId: 'BDG-NWK-0881', name: 'David Chen', role: 'Public Works Lead', dept: 'City Operations', status: 'ACTIVE', lastTapped: '1 hour ago', pin: 'PIN Required' },
                  { badgeId: 'BDG-NWK-0994', name: 'Officer Sarah Jenkins', role: 'Police Chief', dept: 'Public Safety', status: 'ACTIVE', lastTapped: '2 hours ago', pin: 'PIN Required' }
                ].map((b, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 10px', color: '#fff', fontWeight: 700 }}>{b.name}</td>
                    <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: '#3b82f6' }}>{b.badgeId}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{b.role} ({b.dept})</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className="badge-status badge-success">{b.status}</span>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{b.lastTapped}</td>
                    <td style={{ padding: '12px 10px', color: '#fff' }}>{b.pin}</td>
                    <td style={{ padding: '12px 10px', display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => addNotification(`Suspended badge ${b.badgeId}`)}
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        Suspend
                      </button>
                      <button 
                        onClick={() => addNotification(`Initiated badge replacement workflow for ${b.name}`)}
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        Replace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: Session Lock & Inactivity Policies */}
      {activeTab === 'session-policies' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Hospital-Style Workstation Session Lock & Timeout Policies
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Configure automatic inactivity warnings, opaque lock screens, and full session termination limits per security tier.
              </p>
            </div>
          </div>

          {/* Preset Tiers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { title: 'Standard Office', warn: '13 min', lock: '15 min', signout: '30 min', desc: 'Low sensitivity municipal desks' },
              { title: 'Sensitive Government', warn: '2 min', lock: '3 min', signout: '15 min', desc: 'Recommended default for staff', active: true },
              { title: 'Shared Workstation', warn: '1 min', lock: '2 min', signout: '10 min', desc: 'Public counters & inspection hubs' },
              { title: 'Emergency Operations', warn: '30 sec', lock: '1 min', signout: '5 min', desc: 'Dispatch & EOC high security' }
            ].map((preset, idx) => (
              <div 
                key={idx}
                style={{
                  background: preset.active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.02)',
                  border: preset.active ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: preset.active ? '#3b82f6' : '#fff' }}>{preset.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{preset.desc}</div>
                <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600, marginTop: '4px' }}>
                  Warn: {preset.warn} • Lock: {preset.lock}
                </div>
                <button
                  onClick={() => addNotification(`Applied session policy preset: ${preset.title}`)}
                  style={{
                    marginTop: '6px',
                    background: preset.active ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    border: 0,
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {preset.active ? 'Active Policy' : 'Apply Preset'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Inactivity Timeout Controls</div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Warning Notice Lead Time (Seconds)</label>
                <input type="number" className="ai-input" style={{ width: '100%' }} defaultValue={60} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Inactivity Lock Time (Minutes)</label>
                <input type="number" className="ai-input" style={{ width: '100%' }} defaultValue={3} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Session Sign-Out Limit (Minutes)</label>
                <input type="number" className="ai-input" style={{ width: '100%' }} defaultValue={15} />
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Reauthentication & Multi-Tab Sync</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Shared Workstation Mode</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fast 2-min lock, clear temp cache, prohibit password auto-fill</div>
                </div>
                <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Multi-Tab Broadcast Sync</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Locking or signing out in one tab locks all open browser tabs</div>
                </div>
                <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
              </div>

              <button
                onClick={() => addNotification('Workstation Session Lock Policy saved successfully!')}
                style={{ background: '#10b981', color: '#fff', border: 0, padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}
              >
                Save Session Lock Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
