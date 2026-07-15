import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  UserPlus, 
  Users, 
  Send, 
  CheckCircle, 
  Clock, 
  Plus, 
  Check, 
  X, 
  Lock, 
  Unlock,
  Loader2,
  Building
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface CustomRole {
  id: string;
  name: string;
  permissions: {
    module: string;
    canView: boolean;
    canEdit: boolean;
  }[];
}

interface Profile {
  id: string;
  email: string;
  role: CustomRole | null;
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: CustomRole | null;
  status: string;
  token: string;
  createdAt: string;
}

interface OrgAdminConsoleProps {
  currentProfile: {
    id: string;
    email: string;
    isOrgAdmin: boolean;
    organizationId: string | null;
    organization: Organization | null;
  } | null;
  addNotification: (message: string) => void;
}

export const OrgAdminConsole: React.FC<OrgAdminConsoleProps> = ({
  currentProfile,
  addNotification
}) => {
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');
  const orgId = currentProfile?.organizationId || '';

  // State Management
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom Role Form States
  const [newRoleName, setNewRoleName] = useState('');
  const [modulesList] = useState([
    { id: 'command-center', name: 'Command Center' },
    { id: 'tracker', name: 'Universal Tracker' },
    { id: 'gis', name: 'GIS Intelligence' },
    { id: 'permits', name: 'Permits & Licensing' },
    { id: 'code-enforcement', name: 'Code Enforcement' },
    { id: 'legislative', name: 'Legislative Hub' }
  ]);
  
  const [rolePermissions, setRolePermissions] = useState<Record<string, { canView: boolean; canEdit: boolean }>>(
    modulesList.reduce((acc, m) => {
      acc[m.id] = { canView: true, canEdit: false };
      return acc;
    }, {} as Record<string, { canView: boolean; canEdit: boolean }>)
  );

  // Invite Form States
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // Fetch Tenant Records
  const fetchTenantData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const [resRoles, resProfiles, resInvites, resClaims] = await Promise.all([
        fetch(`${API_URL}/api/custom-roles`, { headers: { 'x-organization-id': orgId } }),
        fetch(`${API_URL}/api/profiles?orgId=${orgId}`),
        fetch(`${API_URL}/api/invites?orgId=${orgId}`),
        fetch(`${API_URL}/api/claims`, { headers: { 'x-organization-id': orgId } })
      ]);

      const rolesData = await resRoles.json();
      const profilesData = await resProfiles.json();
      const invitesData = await resInvites.json();
      const claimsData = await resClaims.json();

      setCustomRoles(rolesData);
      setProfiles(profilesData);
      setInvites(invitesData);
      setClaims(claimsData);
    } catch (err) {
      console.error('Failed to load org admin board:', err);
      addNotification('API Error: Offline context.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, [orgId]);

  const handleReviewClaim = async (claimId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_URL}/api/claims/${claimId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({ status, reviewedBy: currentProfile?.id })
      });
      if (res.ok) {
        addNotification(`Claim successfully ${status.toLowerCase()}!`);
        fetchTenantData();
      } else {
        addNotification('Failed to update claim status.');
      }
    } catch (err) {
      console.error(err);
      addNotification('API Error updating claim.');
    }
  };

  // Handlers
  const handleTogglePermission = (moduleId: string, type: 'canView' | 'canEdit') => {
    setRolePermissions(prev => {
      const current = prev[moduleId];
      const next = { ...current };
      next[type] = !current[type];
      
      // If canEdit becomes true, force canView to true as well
      if (type === 'canEdit' && next.canEdit) {
        next.canView = true;
      }
      // If canView becomes false, force canEdit to false
      if (type === 'canView' && !next.canView) {
        next.canEdit = false;
      }

      return { ...prev, [moduleId]: next };
    });
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !orgId) return;

    // Build permissions list for DB schema request
    const permissionsArray = Object.entries(rolePermissions).map(([module, val]) => ({
      module,
      canView: val.canView,
      canEdit: val.canEdit
    }));

    try {
      const res = await fetch(`${API_URL}/api/custom-roles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          name: newRoleName,
          permissions: permissionsArray
        })
      });

      if (res.ok) {
        const newRole = await res.json();
        setCustomRoles(prev => [...prev, newRole]);
        setNewRoleName('');
        // Reset permissions checkboxes
        setRolePermissions(
          modulesList.reduce((acc, m) => {
            acc[m.id] = { canView: true, canEdit: false };
            return acc;
          }, {} as Record<string, { canView: boolean; canEdit: boolean }>)
        );
        addNotification(`Custom role "${newRole.name}" created successfully!`);
      } else {
        const err = await res.json();
        addNotification(`Error: ${err.error || 'Failed to create custom role'}`);
      }
    } catch (e) {
      addNotification('API error: Failed to register custom role.');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !selectedRoleId || !orgId) return;

    try {
      const res = await fetch(`${API_URL}/api/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          isOrgAdmin: false,
          roleId: selectedRoleId,
          organizationId: orgId,
          invitedById: currentProfile?.id || 'simulated-admin-id'
        })
      });

      if (res.ok) {
        const newInvite = await res.json();
        // Bind role locally for rendering
        const targetRole = customRoles.find(r => r.id === selectedRoleId);
        newInvite.role = targetRole || null;

        setInvites(prev => [newInvite, ...prev]);
        setInviteEmail('');
        addNotification(`Sent staff invite link to ${inviteEmail}!`);
      } else {
        const err = await res.json();
        addNotification(`Error: ${err.error || 'Failed to create invite'}`);
      }
    } catch (e) {
      addNotification('API error: Failed to dispatch invitation.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-slate-400 p-24" style={{ height: '70vh' }}>
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="font-display font-medium text-lg">Initializing Municipality Role Framework...</p>
      </div>
    );
  }

  return (
    <div className="module-content-grid animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto', height: '100%' }}>
      
      {/* Header card panel */}
      <div className="dashboard-card card-glow" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#10b981' }}>
            <Building size={32} />
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#fff' }}>
              {currentProfile?.organization?.name} Admin Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Define custom job functions, toggle view/edit access constraints, and invite municipal staff.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Form 1: Role Architect Board */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Shield className="text-emerald-500" size={20} />
            <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Create Custom Role & Permissions</h2>
          </div>
          <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role Title Name</label>
              <input 
                type="text" 
                placeholder="e.g. Code Officer, Water Dept Lead" 
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                required
              />
            </div>

            {/* Matrix selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Module Permissions Map</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {modulesList.map(mod => {
                  const perm = rolePermissions[mod.id];
                  return (
                    <div key={mod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{mod.name}</span>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                          <input 
                            type="checkbox" 
                            checked={perm.canView} 
                            onChange={() => handleTogglePermission(mod.id, 'canView')}
                            style={{ accentColor: '#10b981' }}
                          />
                          View
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                          <input 
                            type="checkbox" 
                            checked={perm.canEdit} 
                            onChange={() => handleTogglePermission(mod.id, 'canEdit')}
                            style={{ accentColor: '#10b981' }}
                          />
                          Edit
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              type="submit" 
              style={{ padding: '12px', borderRadius: '8px', border: 0, color: '#fff', background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              Register Custom Role
            </button>
          </form>
        </div>

        {/* Form 2: Invite Staff Member */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <UserPlus className="text-emerald-500" size={20} />
            <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Invite Municipality Staff</h2>
          </div>
          <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Staff Email Address</label>
              <input 
                type="email" 
                placeholder="e.g. officer.smith@newark.gov" 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Assign Job Role</label>
              <select 
                value={selectedRoleId}
                onChange={e => setSelectedRoleId(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', height: '42px' }}
                required
              >
                <option value="">-- Choose Role --</option>
                {customRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              style={{ padding: '12px', borderRadius: '8px', border: 0, color: '#fff', background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}
            >
              <Send size={16} />
              Dispatch Invite Link
            </button>
          </form>
        </div>

      </div>

      {/* Lists Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* List 1: Role Framework Config */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Shield className="text-emerald-500" size={18} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Custom Roles ({customRoles.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
            {customRoles.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No custom roles registered.</div>
            ) : (
              customRoles.map(role => (
                <div key={role.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{role.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {role.permissions.filter(p => p.canView).map(p => (
                      <span key={p.module} style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {p.module.replace('-', ' ')}: {p.canEdit ? 'Edit' : 'View'}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* List 2: Active Profiles */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Users className="text-emerald-500" size={18} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Municipal Staff ({profiles.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
            {profiles.map(prof => (
              <div key={prof.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{prof.email}</div>
                  <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>
                    {prof.role?.name || 'Org Admin'}
                  </div>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {new Date(prof.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* List 3: Pending Invites */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Clock className="text-emerald-500" size={18} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Pending Invites ({invites.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
            {invites.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No pending invites.</div>
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
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Assigned Role: <strong style={{ color: '#10b981' }}>{inv.role?.name || 'Org Admin'}</strong>
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace', padding: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflowX: 'auto' }}>
                    Token: {inv.token}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* List 4: Property/Project Verification Claims Queue */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Building className="text-emerald-500" size={18} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Verification Claims Queue ({claims.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
            {claims.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No verification claims submitted.</div>
            ) : (
              claims.map(claim => (
                <div key={claim.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{claim.targetAddress}</span>
                    <span className={`badge-status ${claim.status === 'VERIFIED' ? 'badge-success' : claim.status === 'REJECTED' ? 'badge-danger' : 'badge-warn'}`} style={{ fontSize: '9px' }}>
                      {claim.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Claimant: <strong>{claim.profile?.email || 'Resident'}</strong> ({claim.type.replace('_', ' ')})
                  </div>
                  {claim.notes && (
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', padding: '6px', background: 'rgba(0,0,0,0.15)', borderRadius: '4px', fontStyle: 'italic' }}>
                      "{claim.notes}"
                    </div>
                  )}
                  {claim.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleReviewClaim(claim.id, 'REJECTED')}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--danger-text)', cursor: 'pointer' }}
                      >
                        <X size={10} /> Reject
                      </button>
                      <button 
                        onClick={() => handleReviewClaim(claim.id, 'VERIFIED')}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', color: 'var(--success-text)', cursor: 'pointer' }}
                      >
                        <Check size={10} /> Verify & Link
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
