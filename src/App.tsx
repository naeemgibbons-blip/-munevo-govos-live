import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CommandCenter } from './components/CommandCenter';
import { ChartingSystem, ChartTabItem } from './components/ChartingSystem';
import { GisMap } from './components/GisMap';
import { UniversalTracker } from './components/UniversalTracker';
import { AiPanel } from './components/AiPanel';
import { LegislativeHub } from './components/LegislativeHub';
import { IdentityConsole } from './components/IdentityConsole';
import { GlobalAdminConsole } from './components/GlobalAdminConsole';
import { OrgAdminConsole } from './components/OrgAdminConsole';
import { OpenRecords } from './components/OpenRecords';
import { EmployeeRoster } from './components/EmployeeRoster';
import { AuditTrail } from './components/AuditTrail';
import { 
  USER_ROLES, 
  PROPERTIES, 
  PERMITS, 
  VIOLATIONS, 
  INSPECTIONS, 
  TRACKER_ITEMS, 
  LEGISLATIVE_ITEMS,
  TrackerItem,
  PermitRecord,
  InspectionRecord,
  LegislativeItem
} from './mockData';
import { Bell, Search, AlertCircle } from 'lucide-react';

interface ToastMessage {
  id: number;
  text: string;
}

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Tenant & Role State
  const [tenant, setTenant] = useState('newark');
  const [currentRole, setCurrentRole] = useState(USER_ROLES.mayor);

  // Multi-Tenant Profile & Orgs Sync
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  // Layout Modules
  const [activeModule, setActiveModule] = useState('command-center');
  const [viewMode, setViewMode] = useState<'module' | 'chart'>('module');

  // Chart Workspace Tabs State
  const [chartTabs, setChartTabs] = useState<ChartTabItem[]>([]);
  const [activeChartTabId, setActiveChartTabId] = useState<string | null>(null);

  // Operations Data States
  const [properties, setProperties] = useState<Record<string, any>>(PROPERTIES);
  const [trackerItems, setTrackerItemsRaw] = useState<TrackerItem[]>(TRACKER_ITEMS);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Fetch Organizations on boot
  useEffect(() => {
    fetch(`${API_URL}/api/organizations`)
      .then(res => {
        if (!res.ok) throw new Error('API server returned error status');
        return res.json();
      })
      .then(data => {
        setOrganizations(data);
        setConnectionError(null);
      })
      .catch(err => {
        console.error('Failed to load organizations directory:', err);
        setConnectionError('Munevo DB API Server is currently offline. Please run "npm run dev" or check port 3001.');
      });
  }, []);

  const currentOrg = organizations.find(o => o.slug === tenant);
  const currentOrgId = currentOrg?.id || '';

  // Fetch Tenant custom roles list on tenant switch
  useEffect(() => {
    if (!currentOrgId) return;
    fetch(`${API_URL}/api/custom-roles`, {
      headers: { 'x-organization-id': currentOrgId }
    })
    .then(res => res.json())
    .then(data => setCustomRoles(data))
    .catch(err => console.error('Failed to load custom roles context:', err));
  }, [currentOrgId]);

  // Synchronize simulated user profile to Database on Role/Tenant Switch
  useEffect(() => {
    if (!currentOrgId && currentRole.id !== 'global_admin') return;

    const simulatedUserId = `simulated-user-${currentRole.id}`;
    const simulatedUserEmail = `${currentRole.id}@munevo.gov`;
    
    let isGlobalAdmin = false;
    let isOrgAdmin = false;
    let roleId = null;

    if (currentRole.id === 'global_admin') {
      isGlobalAdmin = true;
    } else if (currentRole.id === 'mayor') {
      isOrgAdmin = true;
    } else if (currentRole.id === 'inspector') {
      // Find Newark Custom Inspector role from DB context
      const inspectorRole = customRoles.find(r => r.name === 'Building Inspector' || r.name === 'Code Enforcement Officer');
      roleId = inspectorRole?.id || null;
    }

    fetch(`${API_URL}/api/profiles/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: simulatedUserId,
        email: simulatedUserEmail,
        isGlobalAdmin,
        isOrgAdmin,
        organizationId: isGlobalAdmin ? null : currentOrgId,
        roleId
      })
    })
    .then(res => res.json())
    .then(profile => {
      setCurrentProfile(profile);
    })
    .catch(err => console.error('Failed to sync simulated profile context:', err));
  }, [currentRole.id, currentOrgId, customRoles]);

  // Fetch Isolated Tenant Data on Org Change
  useEffect(() => {
    if (!currentOrgId) return;

    fetch(`${API_URL}/api/properties`, {
      headers: { 'x-organization-id': currentOrgId }
    })
    .then(res => {
      if (!res.ok) throw new Error('API server returned error status');
      return res.json();
    })
    .then(data => {
      setProperties(data);
      setConnectionError(null);
    })
    .catch(err => {
      console.error('Failed to load isolated property records:', err);
      setConnectionError('Munevo DB API Server is currently offline. Please run "npm run dev" or check port 3001.');
    });

    fetch(`${API_URL}/api/tracker`, {
      headers: { 'x-organization-id': currentOrgId }
    })
    .then(res => {
      if (!res.ok) throw new Error('API server returned error status');
      return res.json();
    })
    .then(data => {
      setTrackerItemsRaw(data);
      setConnectionError(null);
    })
    .catch(err => {
      console.error('Failed to load isolated tracker records:', err);
      setConnectionError('Munevo DB API Server is currently offline. Please run "npm run dev" or check port 3001.');
    });
  }, [currentOrgId]);

  // Evaluate module write permission dynamically
  const canEditModule = (moduleName: string) => {
    if (currentProfile?.isGlobalAdmin || currentProfile?.isOrgAdmin) return true;
    if (currentProfile?.role?.permissions) {
      const perm = currentProfile.role.permissions.find((p: any) => p.module === moduleName);
      return perm?.canEdit ?? false;
    }
    // Resident can edit 311 (Command Center) to submit, but not others
    if (currentProfile && !currentProfile.roleId) {
      return moduleName === 'command-center';
    }
    return false;
  };

  const setTrackerItems: React.Dispatch<React.SetStateAction<TrackerItem[]>> = (value) => {
    // Check permission before accepting write operation
    if (!canEditModule('tracker') && activeModule === 'tracker') {
      addNotification('Access Denied: Read-only profile constraint prevents modifying ticket status.');
      return;
    }

    setTrackerItemsRaw(prev => {
      const next = typeof value === 'function' ? (value as any)(prev) : value;

      if (next.length > prev.length) {
        const newItem = next[0];
        fetch(`${API_URL}/api/tracker`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-organization-id': currentOrgId,
            'x-user-id': currentProfile?.id || '',
            'x-user-email': currentProfile?.email || ''
          },
          body: JSON.stringify({
            module: newItem.module,
            title: newItem.title,
            status: newItem.status,
            priority: newItem.priority,
            assignedTo: newItem.assignedTo,
            slaDays: newItem.slaDays,
            address: newItem.address
          })
        })
        .then(res => res.json())
        .then(syncedItem => {
          setTrackerItemsRaw(current => current.map(item => item.id === newItem.id ? syncedItem : item));
          addNotification(`Saved ticket ${syncedItem.id} to Supabase!`);
        })
        .catch(err => console.error('Failed to sync new ticket to Supabase', err));
      } else if (next.length === prev.length) {
        next.forEach((newItem: any) => {
          const oldItem = prev.find(p => p.id === newItem.id);
          if (oldItem) {
            if (
              oldItem.status !== newItem.status || 
              oldItem.priority !== newItem.priority || 
              oldItem.assignedTo !== newItem.assignedTo
            ) {
              fetch(`${API_URL}/api/tracker/${newItem.id}`, {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'x-organization-id': currentOrgId,
                  'x-user-id': currentProfile?.id || '',
                  'x-user-email': currentProfile?.email || ''
                },
                body: JSON.stringify({
                  status: newItem.status,
                  priority: newItem.priority,
                  assignedTo: newItem.assignedTo
                })
              })
              .then(res => res.json())
              .then(() => {
                addNotification(`Synced ticket ${newItem.id} status update to Supabase!`);
              })
              .catch(err => console.error('Failed to sync ticket update to Supabase', err));
            }
          }
        });
      }

      return next;
    });
  };

  const [legislativeItems, setLegislativeItems] = useState<LegislativeItem[]>(LEGISLATIVE_ITEMS);
  const [activePropertyId, setActivePropertyId] = useState<string | null>('prop_01');
  const [searchVal, setSearchVal] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addNotification = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    const selectedRole = USER_ROLES[roleId];
    if (selectedRole) {
      setCurrentRole(selectedRole);
      addNotification(`Switched role session to ${selectedRole.name}`);
    }
  };

  const handleOpenChart = (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => {
    let label = id;
    if (type === 'property') {
      label = properties[id]?.address.split(',')[0] || id;
    } else if (type === 'permit') {
      label = PERMITS[id]?.permitNumber || id;
    }

    setChartTabs(prev => {
      const exists = prev.some(tab => tab.id === id);
      if (exists) return prev;
      return [...prev, { id, type, label }];
    });

    setActiveChartTabId(id);
    setViewMode('chart');
    if (type === 'property') {
      setActivePropertyId(id);
    }
    addNotification(`Opened Workspace Chart: ${label}`);
  };

  const handleCloseTab = (id: string) => {
    setChartTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== id);
      if (activeChartTabId === id) {
        if (filtered.length > 0) {
          setActiveChartTabId(filtered[filtered.length - 1].id);
        } else {
          setActiveChartTabId(null);
          setViewMode('module');
        }
      }
      return filtered;
    });
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;

    const term = searchVal.toLowerCase();

    const matchedProp = Object.values(properties).find(p => 
      p.address.toLowerCase().includes(term) || p.ownerName.toLowerCase().includes(term)
    );
    if (matchedProp) {
      handleOpenChart('property', matchedProp.id);
      setSearchVal('');
      return;
    }

    const matchedPerm = Object.values(PERMITS).find(p => 
      p.permitNumber.toLowerCase().includes(term)
    );
    if (matchedPerm) {
      handleOpenChart('permit', matchedPerm.id);
      setSearchVal('');
      return;
    }

    addNotification(`Universal search: no exact record matches found for "${searchVal}"`);
  };

  const handleOpenPropertyByAddress = (address: string) => {
    const matched = Object.values(properties).find(p => p.address === address);
    if (matched) {
      handleOpenChart('property', matched.id);
    } else {
      addNotification(`Location "${address}" is not a registered municipal parcel.`);
    }
  };

  const handleUpdatePermit = (id: string, updated: Partial<PermitRecord>) => {
    if (!canEditModule('permits')) {
      addNotification('Access Denied: Read-only profile constraint prevents modifying permits.');
      return;
    }
    addNotification(`Permit ${id} workflow updated: ${updated.status}`);
  };

  const handleUpdateInspection = (id: string, updated: Partial<InspectionRecord>) => {
    if (!canEditModule('code-enforcement')) {
      addNotification('Access Denied: Read-only profile constraint prevents modifying inspections.');
      return;
    }
    if (INSPECTIONS[id]) {
      INSPECTIONS[id] = { ...INSPECTIONS[id], ...updated } as any;
      addNotification(`Inspection ${id} successfully signed off!`);
    }
  };

  const getMapPins = () => {
    const pins: { id: string; label: string; coords: [number, number]; type: 'permit' | 'violation' | 'request' }[] = [];
    
    Object.values(VIOLATIONS).forEach(v => {
      const prop = properties[v.propertyId];
      if (prop && v.status !== 'Abated') {
        pins.push({
          id: v.caseNumber,
          label: `${v.violationType} - ${v.description}`,
          coords: prop.gisCoords,
          type: 'violation'
        });
      }
    });

    trackerItems.filter(item => item.module === '311' && item.status !== 'Resolved').forEach(item => {
      const prop = Object.values(properties).find(p => p.address === item.address);
      if (prop) {
        pins.push({
          id: item.id,
          label: item.title,
          coords: prop.gisCoords,
          type: 'request'
        });
      }
    });

    return pins;
  };

  const activeChartTab = chartTabs.find(t => t.id === activeChartTabId) || null;

  return (
    <div className="app-container">
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={(mod) => {
          setActiveModule(mod);
          setViewMode('module');
        }}
        currentRole={currentRole}
        tenant={tenant}
        setTenant={setTenant}
        currentProfile={currentProfile}
      />

      <main className="main-panel">
        <header className="dashboard-header">
          <form onSubmit={handleGlobalSearch} className="header-search">
            <input 
              type="text" 
              placeholder="Search properties, permits, cases (e.g. 'Ferry St', 'PM-2026')..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <Search className="header-search-icon" size={14} />
          </form>

          <div className="header-actions">
            {chartTabs.length > 0 && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setViewMode('module')}
                  style={{
                    border: 'none',
                    background: viewMode === 'module' ? 'var(--primary-glow)' : 'transparent',
                    color: viewMode === 'module' ? '#fff' : 'var(--text-secondary)',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Dashboard View
                </button>
                <button 
                  onClick={() => setViewMode('chart')}
                  style={{
                    border: 'none',
                    background: viewMode === 'chart' ? 'var(--primary-glow)' : 'transparent',
                    color: viewMode === 'chart' ? '#fff' : 'var(--text-secondary)',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Chart Workspace ({chartTabs.length})
                </button>
              </div>
            )}

            <div className="role-switcher-container">
              <span className="role-switcher-label">GovOS Session:</span>
              <select className="role-select" value={currentRole.id} onChange={handleRoleChange}>
                <option value="mayor">Mayor / City Manager</option>
                <option value="inspector">Building Inspector</option>
                <option value="resident">Resident (MyMunevo)</option>
                <option value="global_admin">Global Administrator</option>
              </select>
            </div>

            <div className="notification-bell" onClick={() => addNotification('System audit logs are fully synced.')}>
              <Bell size={18} />
              <div className="notification-badge" />
            </div>
          </div>
        </header>

        <div className="workspace-canvas">
          <div className="pane-left">
            {connectionError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', color: 'var(--danger-text)', margin: '16px 24px 8px 24px' }}>
                <AlertCircle size={16} />
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: '#fff' }}>API Server Connection Loss</strong>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{connectionError}</span>
                </div>
              </div>
            )}
            {viewMode === 'module' ? (
              <>
                {activeModule === 'command-center' && (
                  <CommandCenter 
                    currentRole={currentRole}
                    onOpenChart={handleOpenChart}
                    trackerItems={trackerItems}
                    setTrackerItems={setTrackerItems}
                    addNotification={addNotification}
                    onUpdatePermit={handleUpdatePermit}
                    onUpdateInspection={handleUpdateInspection}
                    canEdit={canEditModule('command-center')}
                  />
                )}

                {activeModule === 'tracker' && (
                  <UniversalTracker 
                    trackerItems={trackerItems}
                    setTrackerItems={setTrackerItems}
                    onOpenChart={handleOpenChart}
                    onOpenPropertyByAddress={handleOpenPropertyByAddress}
                    canEdit={canEditModule('tracker')}
                    properties={properties}
                    currentOrgId={currentOrgId}
                  />
                )}

                {activeModule === 'gis' && (
                  <GisMap 
                    activePropertyId={activePropertyId}
                    onSelectProperty={(id) => {
                      setActivePropertyId(id);
                      handleOpenChart('property', id);
                    }}
                    pins={getMapPins()}
                    onOpenChart={handleOpenChart}
                    addNotification={addNotification}
                  />
                )}

                {activeModule === 'permits' && (
                  <div className="glass-card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="card-title">Permits & Licensing Desk</div>
                      {!canEditModule('permits') && (
                        <span style={{ fontSize: '11px', color: 'var(--warning-text)', padding: '2px 8px', background: 'rgba(245,158,11,0.1)', borderRadius: '4px' }}>
                          Read-Only Access
                        </span>
                      )}
                    </div>
                    <div className="list-queue">
                      {Object.values(properties).flatMap((p: any) => 
                        Object.values(PERMITS).filter((perm: any) => perm.propertyId === p.id).map(pPerm => (
                          <div key={pPerm.id} className="queue-item" onClick={() => handleOpenChart('permit', pPerm.id)}>
                            <div className="queue-details">
                              <span className="queue-title">{pPerm.permitNumber} ({pPerm.type})</span>
                              <span className="queue-sub">{p.address} • Cost: ${pPerm.estimatedCost.toLocaleString()}</span>
                            </div>
                            <span className={`badge-status ${pPerm.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>
                              {pPerm.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeModule === 'code-enforcement' && (
                  <div className="glass-card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="card-title">Code Enforcement Case Files</div>
                      {!canEditModule('code-enforcement') && (
                        <span style={{ fontSize: '11px', color: 'var(--warning-text)', padding: '2px 8px', background: 'rgba(245,158,11,0.1)', borderRadius: '4px' }}>
                          Read-Only Access
                        </span>
                      )}
                    </div>
                    <div className="list-queue">
                      {Object.values(properties).flatMap((p: any) => 
                        Object.values(VIOLATIONS).filter((v: any) => v.propertyId === p.id).map(pViol => (
                          <div key={pViol.id} className="queue-item" onClick={() => handleOpenChart('property', pViol.propertyId)}>
                            <div className="queue-details">
                              <span className="queue-title" style={{ color: 'var(--danger-text)' }}>{pViol.caseNumber} • {pViol.violationType}</span>
                              <span className="queue-sub">{p.address} • Fines: ${pViol.fineAmount}</span>
                            </div>
                            <span className="badge-status badge-danger">
                              {pViol.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeModule === 'legislative' && (
                  <LegislativeHub 
                    legislativeItems={legislativeItems}
                    setLegislativeItems={setLegislativeItems}
                    onOpenChart={handleOpenChart}
                    addNotification={addNotification}
                  />
                )}

                {activeModule === 'identity-security' && (
                  <IdentityConsole 
                    currentRole={currentRole}
                    setCurrentRole={setCurrentRole}
                    setActiveModule={setActiveModule}
                    setViewMode={setViewMode}
                    handleOpenChart={handleOpenChart}
                    addNotification={addNotification}
                  />
                )}

                {activeModule === 'global-admin' && (
                  <GlobalAdminConsole 
                    currentProfile={currentProfile}
                    addNotification={addNotification}
                  />
                )}

                {activeModule === 'org-admin' && (
                  <OrgAdminConsole 
                    currentProfile={currentProfile}
                    addNotification={addNotification}
                  />
                )}

                {activeModule === 'open-records' && (
                  <OpenRecords 
                    currentProfile={currentProfile}
                    addNotification={addNotification}
                    canEdit={canEditModule('open-records')}
                  />
                )}

                {activeModule === 'employee-roster' && (
                  <EmployeeRoster 
                    currentProfile={currentProfile}
                    addNotification={addNotification}
                    canEdit={canEditModule('employee-roster')}
                  />
                )}

                {activeModule === 'system-audit' && (
                  <AuditTrail 
                    currentProfile={currentProfile}
                    addNotification={addNotification}
                  />
                )}
              </>
            ) : (
              <ChartingSystem 
                tabs={chartTabs}
                activeTabId={activeChartTabId}
                onSelectTab={setActiveChartTabId}
                onCloseTab={handleCloseTab}
                onOpenChart={handleOpenChart}
              />
            )}
          </div>

          <AiPanel 
            currentRole={currentRole}
            activeChartTab={activeChartTab}
            addNotification={addNotification}
          />
        </div>
      </main>

      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <AlertCircle size={16} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {toast.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
