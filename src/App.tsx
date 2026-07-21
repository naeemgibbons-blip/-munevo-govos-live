import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { WorkspaceHome } from './components/WorkspaceHome';
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
import { MobileFieldView } from './components/MobileFieldView';
import { MarketingLanding } from './components/MarketingLanding';
import { CityPulse } from './components/CityPulse';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { Marketplace } from './components/Marketplace';
import { UniversalSearchModal } from './components/UniversalSearchModal';
import { CommandPalette } from './components/CommandPalette';
import { NotificationCenterDrawer } from './components/NotificationCenterDrawer';
import { PlatformActivityFeed } from './components/PlatformActivityFeed';
import { UniversalCreateModal } from './components/UniversalCreateModal';
import { PlatformControlCenter } from './components/PlatformControlCenter';
import { FloatingDock } from './components/FloatingDock';
import { supabase, updateSupabaseConfig } from './supabaseClient';
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
import { Bell, Search, AlertCircle, Smartphone, Plus, ChevronRight, Sparkles, Layers, Shield, Wrench, Calendar, CheckSquare } from 'lucide-react';

interface ToastMessage {
  id: number;
  text: string;
}

function App() {
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');

  // Tenant & Role State
  const [tenant, setTenant] = useState('newark');
  const [currentRole, setCurrentRole] = useState(USER_ROLES.mayor);

  // Multi-Tenant Profile & Orgs Sync
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  // Layout Modules & Platform Shell State
  const [activeProduct, setActiveProduct] = useState('core');
  const [activeModule, setActiveModule] = useState('command-center');
  const [viewMode, setViewMode] = useState<'workspace-home' | 'module' | 'chart' | 'mobile-field' | 'marketing'>('marketing');
  const [isUniversalSearchOpen, setIsUniversalSearchOpen] = useState(false);
  const [isGlobalCreateOpen, setIsGlobalCreateOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalInitialType, setCreateModalInitialType] = useState('permit');

  // Workspace Memory: Preserves active module per workspace product
  const [workspaceMemory, setWorkspaceMemory] = useState<Record<string, string>>({});

  const handleSelectWorkspace = (productId: string, defaultModule?: string) => {
    setActiveProduct(productId);
    const rememberedModule = workspaceMemory[productId] || defaultModule || 'command-center';
    setActiveModule(rememberedModule);
    setViewMode('module');
  };

  const handleSetModuleWithMemory = (modId: string) => {
    setActiveModule(modId);
    setWorkspaceMemory(prev => ({ ...prev, [activeProduct]: modId }));
  };

  // Chart Workspace Tabs State
  const [chartTabs, setChartTabs] = useState<ChartTabItem[]>([]);
  const [activeChartTabId, setActiveChartTabId] = useState<string | null>(null);

  // Operations Data States
  const [properties, setProperties] = useState<Record<string, any>>(PROPERTIES);
  const [trackerItems, setTrackerItemsRaw] = useState<TrackerItem[]>(TRACKER_ITEMS);
  const [permits, setPermits] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  // Fetch Organizations & config on boot
  useEffect(() => {
    const initConfig = async () => {
      try {
        const configRes = await fetch(`${API_URL}/api/auth/config`);
        if (configRes.ok) {
          const config = await configRes.json();
          updateSupabaseConfig(config.supabaseUrl, config.supabaseAnonKey);
        }
      } catch (err) {
        console.error('Failed loading dynamic supabase credentials:', err);
      } finally {
        setSupabaseReady(true);
      }
    };

    initConfig();

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

  const resolveProfile = async (id: string, email: string) => {
    try {
      const res = await fetch(`${API_URL}/api/profiles/me`, {
        headers: {
          'x-user-id': id,
          'x-user-email': email
        }
      });
      if (res.ok) {
        const profile = await res.json();
        setCurrentProfile(profile);
        if (profile.organization?.slug) {
          setTenant(profile.organization.slug);
        }
        
        // Auto-route based on administrative role
        if (profile.isGlobalAdmin) {
          setActiveModule('global-admin');
        } else if (profile.isOrgAdmin) {
          setActiveModule('org-admin');
        } else {
          setActiveModule('command-center');
        }
        setViewMode('module');
      }
    } catch (err) {
      console.error('Failed to resolve profile registry context:', err);
    }
  };

  // Synchronize Supabase authentication state changes
  useEffect(() => {
    if (!supabaseReady) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        resolveProfile(session.user.id, session.user.email || '');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        resolveProfile(session.user.id, session.user.email || '');
      } else {
        setCurrentProfile(null);
        setViewMode('marketing');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseReady]);

  // Dynamically ensure body overflow allows scrolling
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [viewMode]);

  // Global Ctrl+K / Cmd+K Command Palette listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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
    .then(res => res.json())
    .then(data => setProperties(data))
    .catch(err => console.error(err));

    fetch(`${API_URL}/api/tracker`, {
      headers: { 'x-organization-id': currentOrgId }
    })
    .then(res => res.json())
    .then(data => setTrackerItemsRaw(data))
    .catch(err => console.error(err));

    fetch(`${API_URL}/api/permits`, {
      headers: { 'x-organization-id': currentOrgId }
    })
    .then(res => res.json())
    .then(data => setPermits(data))
    .catch(err => console.error(err));

    fetch(`${API_URL}/api/inspections`, {
      headers: { 'x-organization-id': currentOrgId }
    })
    .then(res => res.json())
    .then(data => setInspections(data))
    .catch(err => console.error(err));
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
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (searchVal.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(searchVal)}`, {
          headers: { 'x-organization-id': currentOrgId }
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchVal, currentOrgId]);

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

  const handleOpenChart = (type: 'property' | 'permit' | 'legislative' | 'business' | 'project', id: string) => {
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
  const isDemoSandbox = currentProfile?.organization?.slug?.startsWith('demo-') || !currentProfile;

  const activeProfile = currentProfile || {
    id: 'simulated-user-mayor',
    email: 'mayor@munevo.gov',
    isGlobalAdmin: false,
    isOrgAdmin: true,
    organization: { slug: tenant || 'newark', name: tenant === 'austin' ? 'City of Austin' : 'City of Newark' }
  };

  let content;
  if (viewMode === 'marketing') {
    content = (
      <MarketingLanding 
        onLoginDemo={(demoProfile) => {
          setCurrentProfile(demoProfile);
          setTenant(demoProfile.organization.slug);
          setViewMode('workspace-home');
        }}
        onEnterApp={() => {
          if (!currentProfile) {
            setCurrentProfile(activeProfile);
          }
          setViewMode('workspace-home');
        }}
        addNotification={addNotification}
      />
    );
  } else if (viewMode === 'workspace-home') {
    content = (
      <WorkspaceHome
        currentRole={currentRole}
        currentProfile={activeProfile}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onOpenRecord={handleOpenChart}
        addNotification={addNotification}
      />
    );
  } else if (viewMode === 'mobile-field') {
    content = (
      <MobileFieldView 
        currentProfile={currentProfile}
        addNotification={addNotification}
        onExit={() => setViewMode('module')}
      />
    );
  } else {
    content = (
      <div className="app-container" style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <main className="main-panel" role="main" aria-label="Munevo Government OS Platform Workspace" style={{ flex: 1, width: '100%', overflowY: 'auto' }}>
        {['resident', 'business', 'contractor'].includes(currentRole.id) ? (
          <header className="dashboard-header" style={{
            background: '#16181d',
            borderBottom: '1px solid #2a2e37',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '14px 24px',
            height: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <Logo size={28} variant={currentRole.id as any} wordmarkSize="1.25rem" />
            </div>
            <span style={{ 
              fontSize: '0.8rem', 
              color: '#9aa3b2', 
              borderLeft: '1px solid #2a2e37', 
              paddingLeft: '14px',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 600
            }}>
              {currentRole.id.charAt(0).toUpperCase() + currentRole.id.slice(1)} · City of {tenant === 'newark' ? 'Newark' : tenant === 'austin' ? 'Austin' : 'Seattle'}
            </span>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
              {isDemoSandbox && (
                <div className="role-switcher-container" style={{ margin: 0 }}>
                  <span className="role-switcher-label">GovOS Session:</span>
                  <select className="role-select" value={currentRole.id} onChange={handleRoleChange}>
                    <option value="mayor">Mayor / City Manager</option>
                    <option value="inspector">Building Inspector</option>
                    <option value="resident">Resident (MyMunevo Resident)</option>
                    <option value="business">Business Owner (MyMunevo Business)</option>
                    <option value="contractor">Contractor (MyMunevo Contractor)</option>
                    <option value="global_admin">Global Administrator</option>
                  </select>
                </div>
              )}

              <span style={{ fontSize: '0.82rem', color: '#9aa3b2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {currentRole.id === 'business' ? 'Maple Street Deli' : currentRole.id === 'contractor' ? 'BuildCorp Inc' : 'John Doe'}
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  background: '#1e2128', 
                  border: '1px solid #2a2e37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {currentRole.id === 'business' ? 'M' : currentRole.id === 'contractor' ? 'B' : 'J'}
                </div>
              </span>

              <button 
                onClick={async () => {
                  if (isDemoSandbox) {
                    setCurrentProfile(null);
                    setViewMode('marketing');
                  } else {
                    await supabase.auth.signOut();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: 'var(--danger-text)',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Exit
              </button>
            </div>
          </header>
        ) : (
          <header className="dashboard-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              {/* Left Header: Brand Logo & Universal Search Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '680px' }}>
                <div 
                  onClick={() => setViewMode('workspace-home')}
                  title="Munevo Government Cloud - Return to Workspace Launcher"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Logo size={26} />
                </div>
                <div 
                  className="header-search" 
                  onClick={() => setIsCommandPaletteOpen(true)}
                  style={{ 
                    flex: 1, 
                    position: 'relative', 
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Search size={15} style={{ color: 'var(--primary-color)' }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', flex: 1 }}>
                    Search 54 Market St, PERM-2026-081, Ironbound Cafe (Cmd+K)...
                  </span>
                  <kbd style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    fontWeight: 700
                  }}>
                    Ctrl+K
                  </kbd>
                </div>
              </div>

              {/* Right Header Actions */}
              <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Global Create Button */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--primary-color)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <Plus size={14} />
                  <span>Global Create</span>
                </button>

                {isGlobalCreateOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '6px',
                    width: '210px',
                    background: '#161824',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase' }}>
                      Create UDM Record
                    </div>
                    {[
                      { label: '+ Permit Application', type: 'permit', action: () => { handleOpenChart('permit', 'PM-2026-99'); addNotification('Initiated new Permit record context'); } },
                      { label: '+ 311 Work Order', type: 'workorder', action: () => { setActiveModule('tracker'); addNotification('Initiated new 311 Ticket record context'); } },
                      { label: '+ Code Violation Case', type: 'violation', action: () => { setActiveModule('code-enforcement'); addNotification('Initiated Code Violation case'); } },
                      { label: '+ Council Resolution', type: 'council', action: () => { setActiveModule('legislative'); addNotification('Drafted Legislative Council Agenda item'); } }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          item.action();
                          setIsGlobalCreateOpen(false);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          textAlign: 'left',
                          padding: '8px 10px',
                          fontSize: '0.78rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                    Workspace View
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
                    Record Tabs ({chartTabs.length})
                  </button>
                </div>
              )}

              {/* Mobile Field View Switcher */}
              <button 
                onClick={() => setViewMode('mobile-field')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Smartphone size={12} style={{ color: 'var(--accent-color)' }} />
                <span>Field Ops</span>
              </button>

              {isDemoSandbox && (
                <div className="role-switcher-container">
                  <span className="role-switcher-label">Session:</span>
                  <select className="role-select" value={currentRole.id} onChange={handleRoleChange}>
                    <option value="mayor">Mayor / City Manager</option>
                    <option value="inspector">Building Inspector</option>
                    <option value="resident">Resident (MyMunevo Resident)</option>
                    <option value="business">Business Owner (MyMunevo Business)</option>
                    <option value="contractor">Contractor (MyMunevo Contractor)</option>
                    <option value="global_admin">Global Administrator</option>
                  </select>
                </div>
              )}

              <div className="notification-bell" onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)} title="Universal Notification Center">
                <Bell size={18} />
                <div className="notification-badge" />
              </div>
            </div>

            {/* Persistent Record Tab Strip (Epic Hyperspace / Salesforce Lightning style) */}
            <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', overflowX: 'auto', width: '100%' }}>
              {/* Workspace Launcher (Home) Tab */}
              <button
                onClick={() => setViewMode('workspace-home')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px 6px 0 0',
                  background: (viewMode as string) === 'workspace-home' ? '#1a1d28' : 'transparent',
                  border: '1px solid var(--border-color)',
                  borderBottom: (viewMode as string) === 'workspace-home' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  color: (viewMode as string) === 'workspace-home' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  fontWeight: (viewMode as string) === 'workspace-home' ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Sparkles size={13} style={{ color: '#3b82f6' }} />
                <span>Workspace Home</span>
              </button>

              {/* Command Center Operational Tab */}
              <button
                onClick={() => {
                  handleSelectWorkspace('core', 'command-center');
                  setViewMode('module');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px 6px 0 0',
                  background: viewMode === 'module' && activeModule === 'command-center' ? '#1a1d28' : 'transparent',
                  border: '1px solid var(--border-color)',
                  borderBottom: viewMode === 'module' && activeModule === 'command-center' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  color: viewMode === 'module' && activeModule === 'command-center' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  fontWeight: viewMode === 'module' && activeModule === 'command-center' ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Layers size={13} style={{ color: 'var(--primary-color)' }} />
                <span>Command Center (Operations)</span>
              </button>

              {/* Open Record Tabs */}
              {chartTabs.map(tab => {
                const isActive = viewMode === 'chart' && activeChartTabId === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => {
                      setActiveChartTabId(tab.id);
                      setViewMode('chart');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '6px 6px 0 0',
                      background: isActive ? '#1a1d28' : 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderBottom: isActive ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.76rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{tab.type === 'property' ? '📍' : tab.type === 'permit' ? '📄' : tab.type === 'legislative' ? '🏛️' : '💼'} {tab.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(tab.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 0,
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '1px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </header>
        )}

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
                    currentProfile={activeProfile}
                    onOpenChart={handleOpenChart}
                    trackerItems={trackerItems}
                    setTrackerItems={setTrackerItems}
                    addNotification={addNotification}
                    onUpdatePermit={handleUpdatePermit}
                    onUpdateInspection={handleUpdateInspection}
                    canEdit={canEditModule('command-center')}
                    properties={Object.values(properties)}
                    permits={permits}
                    inspections={inspections}
                    onSelectWorkspace={handleSelectWorkspace}
                    onOpenSearch={() => setIsCommandPaletteOpen(true)}
                  />
                )}

                {activeModule === 'city-pulse' && (
                  <CityPulse 
                    currentRole={currentRole}
                    currentProfile={currentProfile}
                    trackerItems={trackerItems}
                    inspections={inspections}
                    permits={permits}
                  />
                )}

                {activeModule === 'knowledge-graph' && (
                  <KnowledgeGraph />
                )}

                {activeModule === 'marketplace' && (
                  <Marketplace />
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

                {activeModule === 'platform-control' && (
                  <PlatformControlCenter 
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
                currentProfile={currentProfile}
                addNotification={addNotification}
              />
            )}
          </div>

          <AiPanel 
            currentRole={currentRole}
            activeChartTab={activeChartTab}
            addNotification={addNotification}
            activeProduct={activeProduct}
          />
        </div>
      </main>
    </div>
    );
  }

  return (
    <>
      {content}
      <UniversalSearchModal 
        isOpen={isUniversalSearchOpen}
        onClose={() => setIsUniversalSearchOpen(false)}
        onOpenRecord={(type, id, targetWorkspace) => {
          if (targetWorkspace) {
            handleSelectWorkspace(targetWorkspace);
          }
          handleOpenChart(type, id);
        }}
        addNotification={addNotification}
      />
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenRecord={(type, id, targetWorkspace) => {
          if (targetWorkspace) {
            handleSelectWorkspace(targetWorkspace);
          }
          handleOpenChart(type, id);
        }}
        onOpenCreateModal={(type) => {
          if (type) setCreateModalInitialType(type);
          setIsCreateModalOpen(true);
        }}
        addNotification={addNotification}
      />
      <NotificationCenterDrawer 
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        addNotification={addNotification}
      />
      <UniversalCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialEntityType={createModalInitialType}
        addNotification={addNotification}
      />

      {/* Munevo Canvas OS Floating Dynamic Dock */}
      {viewMode !== 'marketing' && viewMode !== 'mobile-field' && (
        <FloatingDock 
          onGoHome={() => setViewMode('workspace-home')}
          onGoCommandCenter={() => {
            handleSelectWorkspace('core', 'command-center');
            setViewMode('module');
          }}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onOpenAI={() => addNotification('Sentinel AI Assistant ready. Ask any query via Cmd+K or chat.')}
          onOpenGIS={() => {
            handleSelectWorkspace('gis', 'gis');
            setViewMode('module');
          }}
          onOpenCreate={() => setIsCreateModalOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
          onOpenControlCenter={() => {
            handleSelectWorkspace('core', 'platform-control');
            setViewMode('module');
          }}
          activeModule={activeModule}
          viewMode={viewMode}
        />
      )}

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
    </>
  );
}

export default App;
