import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserPlus, 
  Users, 
  Send, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  Globe,
  Loader2,
  Lock,
  X
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface Profile {
  id: string;
  email: string;
  role: string;
  organizationId: string | null;
  organization?: Organization | null;
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  organizationId: string | null;
  organization?: Organization | null;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

interface GlobalAdminConsoleProps {
  currentProfile: Profile | null;
  addNotification: (message: string) => void;
}

export const GlobalAdminConsole: React.FC<GlobalAdminConsoleProps> = ({
  currentProfile,
  addNotification
}) => {
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');

  // State Management
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'GLOBAL_ADMIN' | 'ORG_ADMIN' | 'STAFF'>('STAFF');
  const [inviteOrgId, setInviteOrgId] = useState('');

  // Setup Onboarding Wizard States
  const [wizardStep, setWizardStep] = useState(0); 
  const [wizardOrgName, setWizardOrgName] = useState('');
  const [wizardOrgSlug, setWizardOrgSlug] = useState('');
  const [wizardTemplate, setWizardTemplate] = useState<'STANDARD' | 'CORE' | 'BLANK'>('STANDARD');
  const [wizardAdminEmail, setWizardAdminEmail] = useState('');
  const [wizardModules, setWizardModules] = useState<string[]>([
    'command-center', 'tracker', 'gis', 'permits', 'code-enforcement', 'legislative', 'open-records'
  ]);

  // Lead and tab management states
  const [activeConsoleTab, setActiveConsoleTab] = useState<'directory' | 'leads'>('directory');
  const [demoRequests, setDemoRequests] = useState<any[]>([]);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resOrgs, resProfiles, resInvites, resRequests] = await Promise.all([
        fetch(`${API_URL}/api/organizations`),
        fetch(`${API_URL}/api/profiles`),
        fetch(`${API_URL}/api/invites`),
        fetch(`${API_URL}/api/demo/requests`).catch(() => null)
      ]);

      const orgsData = await resOrgs.json();
      const profilesData = await resProfiles.json();
      const invitesData = await resInvites.json();
      const requestsData = resRequests ? await resRequests.json() : [];

      setOrganizations(orgsData);
      setProfiles(profilesData);
      setInvites(invitesData);
      setDemoRequests(requestsData);
    } catch (err) {
      console.error('Failed to load global admin console records:', err);
      addNotification('Offline: Failed to load directory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !orgSlug) return;

    try {
      const res = await fetch(`${API_URL}/api/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, slug: orgSlug.toLowerCase().replace(/\s+/g, '-') })
      });

      if (res.ok) {
        const newOrg = await res.json();
        setOrganizations(prev => [...prev, newOrg]);
        setOrgName('');
        setOrgSlug('');
        addNotification(`Created municipality "${newOrg.name}" successfully!`);
      } else {
        const err = await res.json();
        addNotification(`Error: ${err.error || 'Failed to create organization'}`);
      }
    } catch (e) {
      addNotification('API error: Failed to submit organization request.');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      const res = await fetch(`${API_URL}/api/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          organizationId: inviteOrgId || null,
          invitedById: currentProfile?.id || 'simulated-admin-id'
        })
      });

      if (res.ok) {
        const newInvite = await res.json();
        // Resolve target org locally for list rendering
        const targetOrg = organizations.find(o => o.id === inviteOrgId);
        newInvite.organization = targetOrg || null;
        
        setInvites(prev => [newInvite, ...prev]);
        setInviteEmail('');
        addNotification(`Sent ${inviteRole} invite to ${inviteEmail}!`);
      } else {
        const err = await res.json();
        addNotification(`Error: ${err.error || 'Failed to send invite'}`);
      }
    } catch (e) {
      addNotification('API error: Failed to dispatch invite token.');
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardOrgName || !wizardOrgSlug || !wizardAdminEmail) return;

    try {
      const res = await fetch(`${API_URL}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wizardOrgName,
          slug: wizardOrgSlug.toLowerCase().replace(/\s+/g, '-'),
          templateType: wizardTemplate,
          adminEmail: wizardAdminEmail,
          invitedById: currentProfile?.id || 'simulated-user-global_admin',
          enabledModules: wizardModules.join(',')
        })
      });

      if (res.ok) {
        const data = await res.json();
        addNotification(`Onboarding complete! Organization "${data.org.name}" deployed. Role matrix configured.`);
        setWizardStep(0);
        setWizardOrgName('');
        setWizardOrgSlug('');
        setWizardAdminEmail('');
        fetchData();
      } else {
        const err = await res.json();
        addNotification(`Onboarding Error: ${err.error || 'Failed to initialize tenant'}`);
      }
    } catch (err) {
      console.error(err);
      addNotification('API Error during municipal onboarding.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-slate-400 p-24" style={{ height: '70vh' }}>
        <Loader2 className="animate-spin text-amber-500" size={48} />
        <p className="font-display font-medium text-lg">Initializing Global Identity & Tenant Contexts...</p>
      </div>
    );
  }

  return (
    <div className="module-content-grid animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto', height: '100%' }}>
      
      {/* Header Info Panel */}
      <div className="dashboard-card card-glow" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', color: '#f59e0b' }}>
            <Lock size={32} />
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#fff' }}>Global Control Panel</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Multi-Tenant Architecture Directory & Isolated Member Invites. Logged in as: <strong style={{ color: '#f59e0b' }}>{currentProfile?.email}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
        <button 
          onClick={() => setActiveConsoleTab('directory')}
          style={{
            border: 0,
            background: activeConsoleTab === 'directory' ? 'rgba(245,158,11,0.15)' : 'transparent',
            color: activeConsoleTab === 'directory' ? '#f59e0b' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Municipal Directory
        </button>
        <button 
          onClick={() => setActiveConsoleTab('leads')}
          style={{
            border: 0,
            background: activeConsoleTab === 'leads' ? 'rgba(245,158,11,0.15)' : 'transparent',
            color: activeConsoleTab === 'leads' ? '#f59e0b' : 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Demo Requests / Leads</span>
          {demoRequests.length > 0 && (
            <span style={{ background: '#f59e0b', color: '#000', borderRadius: '100px', padding: '2px 6px', fontSize: '9px', fontWeight: 800 }}>
              {demoRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeConsoleTab === 'directory' ? (
        <>
          {/* Grid of Forms */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Form 1: Create Municipality */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', alignItems: 'center', gap: '12px', minHeight: '220px', textAlign: 'center' }}>
          <Building2 className="text-amber-500" size={36} style={{ opacity: 0.8 }} />
          <div>
            <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>Guided Tenant Onboarding</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px', margin: 0 }}>
              Deploy a new municipality, configure its custom roles from municipal templates, and issue its primary administrator credentials in a single step.
            </p>
          </div>
          <button 
            onClick={() => setWizardStep(1)}
            className="accent-gradient-btn"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 0, color: '#000', background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}
          >
            <Globe size={16} />
            Launch Setup Wizard
          </button>
        </div>

        {/* Form 2: Send User Invite */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <UserPlus className="text-amber-500" size={20} />
            <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Invite Member to Tenant</h2>
          </div>
          <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="e.g. administrator@austin.gov" 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role Permission</label>
                <select 
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as any)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', height: '40px' }}
                >
                  <option value="STAFF">STAFF</option>
                  <option value="ORG_ADMIN">ORG ADMIN</option>
                  <option value="GLOBAL_ADMIN">GLOBAL ADMIN</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Municipality</label>
                <select 
                  value={inviteOrgId}
                  onChange={e => setInviteOrgId(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', height: '40px' }}
                  disabled={inviteRole === 'GLOBAL_ADMIN'}
                >
                  <option value="">-- Choose Org --</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button 
              type="submit" 
              style={{ padding: '12px', borderRadius: '8px', border: 0, color: '#000', background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}
            >
              <Send size={16} />
              Dispatch Invite Token
            </button>
          </form>
        </div>

      </div>

      {/* Directory Listings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* List 1: Organizations Slugs */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Building2 className="text-amber-500" size={18} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Organizations ({organizations.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
            {organizations.map(org => (
              <div key={org.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{org.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Slug: <span style={{ fontFamily: 'monospace', color: '#f59e0b' }}>{org.slug}</span></div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(org.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* List 2: Active User Accounts */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Users className="text-amber-500" size={18} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Active Members ({profiles.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
            {profiles.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No active user profiles.</div>
            ) : (
              profiles.map(prof => (
                <div key={prof.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{prof.email}</div>
                    <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px', fontWeight: 600 }}>{prof.role}</div>
                  </div>
                  <span style={{ fontSize: '10px', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                    {prof.organization?.name || 'Global'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* List 3: Outbound Invites */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Clock className="text-amber-500" size={18} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Pending Invites ({invites.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
            {invites.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No pending invites sent.</div>
            ) : (
              invites.map(inv => (
                <div key={inv.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{inv.email}</div>
                    <span style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={10} />
                      {inv.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>Role: <strong style={{ color: 'var(--text-secondary)' }}>{inv.role}</strong></span>
                    <span>Org: <strong style={{ color: 'var(--text-secondary)' }}>{inv.organization?.name || 'Global'}</strong></span>
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace', padding: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflowX: 'auto' }}>
                    Token: {inv.token}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      </>
      ) : (
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: '#fff' }}>Demo Requests Leads ({demoRequests.length})</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Prospect Name</th>
                  <th style={{ padding: '12px' }}>Work Email</th>
                  <th style={{ padding: '12px' }}>Municipality / Agency</th>
                  <th style={{ padding: '12px' }}>Objective / Notes</th>
                </tr>
              </thead>
              <tbody>
                {demoRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No demo requests received yet.
                    </td>
                  </tr>
                ) : (
                  demoRequests.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{req.name}</td>
                      <td style={{ padding: '12px', color: 'var(--primary-color)' }}>{req.email}</td>
                      <td style={{ padding: '12px' }}>{req.municipality}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.notes || ''}>
                        {req.notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Setup Onboarding Wizard Dialog */}
      {wizardStep > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '480px', padding: '28px', background: '#11131c', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>Municipal Onboarding Setup</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Step {wizardStep} of 3</span>
              </div>
              <button 
                onClick={() => setWizardStep(0)}
                style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Content */}
            <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Step 1: Org Details */}
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Organization Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. City of Austin" 
                      value={wizardOrgName}
                      onChange={e => {
                        setWizardOrgName(e.target.value);
                        setWizardOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tenant Slug Identifier</label>
                    <input 
                      type="text" 
                      placeholder="e.g. austin" 
                      value={wizardOrgSlug}
                      onChange={e => setWizardOrgSlug(e.target.value.toLowerCase())}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { if (wizardOrgName && wizardOrgSlug) setWizardStep(2); }}
                    className="accent-gradient-btn"
                    style={{ width: '100%', padding: '10px', marginTop: '8px', color: '#000', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 0, borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Next: Select Role Matrix Template
                  </button>
                </div>
              )}

              {/* Step 2: Role Template */}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Choose Seed Roles & Permissions Template</label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div 
                      onClick={() => setWizardTemplate('STANDARD')}
                      style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${wizardTemplate === 'STANDARD' ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)'}`, background: wizardTemplate === 'STANDARD' ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.1)' : 'rgba(255,255,255,0.01)', cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Standard Municipal Template</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Seeds 5 core roles: Mayor, City Clerk, Building Inspector, Code Officer, and Finance Director with module permissions.</div>
                    </div>

                    <div 
                      onClick={() => setWizardTemplate('CORE')}
                      style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${wizardTemplate === 'CORE' ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)'}`, background: wizardTemplate === 'CORE' ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.1)' : 'rgba(255,255,255,0.01)', cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Core Team Template</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Seeds 3 basic admin/clerk roles for rapid deployment.</div>
                    </div>

                    <div 
                      onClick={() => setWizardTemplate('BLANK')}
                      style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${wizardTemplate === 'BLANK' ? 'var(--primary-color)' : 'rgba(255,255,255,0.06)'}`, background: wizardTemplate === 'BLANK' ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.1)' : 'rgba(255,255,255,0.01)', cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Blank Slate</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Start with clean roles slate; configuration managed later in Org Console.</div>
                    </div>
                  </div>

                  {/* Enabled Modules Checklist */}
                  <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Client Modules to Enable</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { id: 'tracker', label: 'Universal Tracker' },
                        { id: 'permits', label: 'Permits & Licensing' },
                        { id: 'code-enforcement', label: 'Code Enforcement' },
                        { id: 'gis', label: 'GIS Mappings Map' },
                        { id: 'open-records', label: 'Open Records (FOIA)' },
                        { id: 'legislative', label: 'Legislative Hub' }
                      ].map(mod => {
                        const isEnabled = wizardModules.includes(mod.id);
                        return (
                          <label key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#fff', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={isEnabled} 
                              onChange={() => {
                                if (isEnabled) {
                                  setWizardModules(prev => prev.filter(m => m !== mod.id));
                                } else {
                                  setWizardModules(prev => [...prev, mod.id]);
                                }
                              }}
                            />
                            <span>{mod.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => setWizardStep(1)}
                      style={{ flex: 1, padding: '10px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setWizardStep(3)}
                      style={{ flex: 1, padding: '10px', color: '#000', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 0, borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Next: Primary Admin Invite
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Dispatch Admin Invite */}
              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>First Administrator Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. mayor@austin.gov" 
                      value={wizardAdminEmail}
                      onChange={e => setWizardAdminEmail(e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => setWizardStep(2)}
                      style={{ flex: 1, padding: '10px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      style={{ flex: 1, padding: '10px', color: '#000', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 0, borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Complete Onboarding
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
