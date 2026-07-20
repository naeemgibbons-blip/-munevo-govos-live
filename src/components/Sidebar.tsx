import React, { useState } from 'react';
import { Logo } from './Logo';
import { 
  Building2, 
  Map, 
  ClipboardList, 
  FileText, 
  ShieldAlert, 
  Calendar, 
  Layers, 
  TrendingUp, 
  Database,
  ArrowRightLeft,
  ShieldCheck,
  Shield,
  Users,
  LayoutGrid,
  Brain,
  DollarSign,
  BarChart3,
  ShoppingBag,
  Scale,
  Briefcase,
  FileCheck2,
  Wrench,
  Network
} from 'lucide-react';
import { UserRole } from '../mockData';

export const PRODUCTS = [
  {
    id: 'core',
    name: 'Munevo Core',
    desc: 'Identity, command workspace & settings.',
    color: '#10b981',
    hue: 142,
    icon: Building2,
    modules: [
      { id: 'command-center', name: 'Munevo Command', icon: ClipboardList, group: 'Workspace' },
      { id: 'identity-security', name: 'Identity & Security', icon: ShieldCheck, group: 'Security' }
    ]
  },
  {
    id: 'civic',
    name: 'Munevo Civic',
    desc: 'Constituent portals & public records.',
    color: '#06b6d4',
    hue: 188,
    icon: Scale,
    modules: [
      { id: 'open-records', name: 'Open Records Hub', icon: FileText, group: 'Constituent Desk' },
      { id: 'legislative', name: 'Legislative Hub', icon: Calendar, group: 'Legislative' }
    ]
  },
  {
    id: 'safe',
    name: 'Munevo Safe',
    desc: 'Permits, licensing & code compliance.',
    color: '#f59e0b',
    hue: 38,
    icon: Shield,
    modules: [
      { id: 'permits', name: 'Permits & Licensing', icon: FileText, group: 'Safety Desk' },
      { id: 'code-enforcement', name: 'Code Enforcement', icon: ShieldAlert, group: 'Safety Desk' }
    ]
  },
  {
    id: 'sentinel',
    name: 'Munevo Sentinel AI',
    desc: 'AI briefings, audit logging & system security.',
    color: '#8b5cf6',
    hue: 258,
    icon: Brain,
    modules: [
      { id: 'system-audit', name: 'System Audit Trail', icon: Database, group: 'Audit & Log' },
      { id: 'knowledge-graph', name: 'Knowledge Graph', icon: Network, group: 'Cognitive Engine' }
    ]
  },
  {
    id: 'gis',
    name: 'Munevo GIS',
    desc: 'Spatial maps & parcel intelligence layers.',
    color: '#3b82f6',
    hue: 221,
    icon: Map,
    modules: [
      { id: 'gis', name: 'GIS Intelligence Map', icon: Map, group: 'Geospatial Desk' }
    ]
  },
  {
    id: 'operations',
    name: 'Munevo Operations',
    desc: '311 requests, maintenance & field logs.',
    color: '#eab308',
    hue: 48,
    icon: Wrench,
    modules: [
      { id: 'tracker', name: 'Universal Tracker', icon: Layers, group: 'Operations' }
    ]
  },
  {
    id: 'finance',
    name: 'Munevo Finance',
    desc: 'Municipal ledgers, budgets & tax abatements.',
    color: '#ef4444',
    hue: 0,
    icon: DollarSign,
    modules: [
      { id: 'finance', name: 'Municipal Ledger', icon: TrendingUp, group: 'Finance Desk' }
    ]
  },
  {
    id: 'council',
    name: 'Munevo Council',
    desc: 'Meetings agenda, minutes & resolution tracker.',
    color: '#f43f5e',
    hue: 346,
    icon: FileCheck2,
    modules: [
      { id: 'legislative', name: 'Legislative Console', icon: Calendar, group: 'Council Desk' }
    ]
  },
  {
    id: 'hr',
    name: 'Munevo HR',
    desc: 'Employee directory & staff management.',
    color: '#34d399',
    hue: 158,
    icon: Briefcase,
    modules: [
      { id: 'employee-roster', name: 'Staff Directory', icon: Users, group: 'HR Management' }
    ]
  },
  {
    id: 'insight',
    name: 'Munevo Insight',
    desc: 'City Pulse & executive telemetry KPIs.',
    color: '#ec4899',
    hue: 327,
    icon: BarChart3,
    modules: [
      { id: 'city-pulse', name: 'City Pulse Dashboard', icon: BarChart3, group: 'Executive Desk' }
    ]
  },
  {
    id: 'marketplace',
    name: 'Munevo Marketplace',
    desc: 'Add-on widgets, workflows & GIS layers.',
    color: '#a855f7',
    hue: 270,
    icon: ShoppingBag,
    modules: [
      { id: 'marketplace', name: 'App Directory', icon: ShoppingBag, group: 'Extensions' }
    ]
  }
];

import { 
  Star,
  Clock,
  Home,
  Compass,
  Bookmark,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  activeProduct: string;
  setActiveProduct: (prod: string) => void;
  currentRole: UserRole;
  tenant: string;
  setTenant: (tenant: string) => void;
  currentProfile: any;
  onOpenRecord?: (type: 'property' | 'permit' | 'legislative' | 'business' | 'project', id: string, targetWorkspace?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  setActiveModule, 
  activeProduct,
  setActiveProduct,
  currentRole, 
  tenant, 
  setTenant,
  currentProfile,
  onOpenRecord
}) => {
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  const tenants = [
    { id: 'newark', name: 'Newark, NJ', sub: 'Newark Gov Cloud' },
    { id: 'austin', name: 'Austin, TX', sub: 'Austin Gov Cloud' }
  ];

  const toggleTenant = () => {
    if (currentProfile?.isGlobalAdmin) {
      const currentIndex = tenants.findIndex(t => t.id === tenant);
      const nextIndex = (currentIndex + 1) % tenants.length;
      const nextTenant = tenants[nextIndex];
      setTenant(nextTenant.id);
      document.documentElement.setAttribute('data-theme', nextTenant.id);
    }
  };

  const getTenantLogo = () => {
    if (tenant === 'newark') return 'NW';
    if (tenant === 'austin') return 'AT';
    return 'SE';
  };

  const activeProductData = PRODUCTS.find(p => p.id === activeProduct) || PRODUCTS[0];

  // Pinned Favorites list
  const pinnedFavorites = [
    { id: 'prop_01', type: 'property' as const, label: '920 Broad St (City Hall)', sub: 'Parcel #prop_01 • Newark' },
    { id: 'prop_02', type: 'property' as const, label: '42 Ferry St (East Ward)', sub: 'Parcel #prop_02 • Newark' },
    { id: 'PERM-2026-081', type: 'permit' as const, label: 'PERM-2026-081 (Façade)', sub: 'Issued Building Permit' }
  ];

  // Recent Work list
  const recentRecords = [
    { id: 'leg_01', type: 'legislative' as const, label: 'RES-2026-88 Redevelopment', sub: 'Passed Council Item' },
    { id: 'CASE-2026-12', type: 'property' as const, label: 'CASE-2026-12 (Façade Risk)', sub: 'Active Violation Case' }
  ];

  // Filter Menu items based on active Product & User permissions
  const menuItems = activeProductData.modules.filter(item => {
    // 1. Check if module is disabled on organization level
    const enabledModulesStr = currentProfile?.organization?.enabledModules || 'all';
    if (enabledModulesStr !== 'all') {
      const enabledSet = new Set(enabledModulesStr.split(','));
      const isSystemModule = [
        'command-center', 
        'employee-roster', 
        'system-audit', 
        'identity-security', 
        'global-admin', 
        'org-admin', 
        'city-pulse', 
        'marketplace'
      ].includes(item.id);
      if (!isSystemModule && !enabledSet.has(item.id)) {
        return false;
      }
    }

    // 2. Filter by user role permissions
    if (currentProfile?.isGlobalAdmin || currentProfile?.isOrgAdmin) {
      return true;
    }
    // Resident portal
    if (currentProfile && !currentProfile.roleId) {
      return ['command-center', 'tracker', 'gis', 'legislative', 'identity-security', 'city-pulse', 'marketplace'].includes(item.id);
    }
    // Staff user filtered by role permissions
    if (currentProfile?.role?.permissions) {
      const perm = currentProfile.role.permissions.find((p: any) => p.module === item.id);
      return perm?.canView ?? false;
    }
    return true;
  });

  // Append Admin consoles dynamically only under Munevo Core
  if (activeProduct === 'core') {
    if (currentProfile?.isGlobalAdmin) {
      menuItems.push({ id: 'platform-control', name: 'Platform Control Center', icon: LayoutGrid, group: 'Administration' });
      menuItems.push({ id: 'global-admin', name: 'Global Admin Console', icon: Database, group: 'Administration' });
    } else if (currentProfile?.isOrgAdmin) {
      menuItems.push({ id: 'org-admin', name: 'Org Admin Console', icon: Shield, group: 'Administration' });
    }
  }

  // Group menu items
  const groups = Array.from(new Set(menuItems.map(item => item.group)));

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo 
          variant={
            currentProfile?.isGlobalAdmin ? 'master' : 
            ['resident', 'business', 'contractor'].includes(currentRole.id) ? (currentRole.id as any) : 'master'
          } 
          size={24} 
          wordmarkSize="1.05rem" 
        />
        <button 
          className="app-launcher-btn" 
          onClick={() => setIsLauncherOpen(!isLauncherOpen)}
          title="Munevo Workspace Launcher"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LayoutGrid size={16} />
        </button>
      </div>

      {isLauncherOpen && (
        <div className="app-launcher-popover">
          <div className="launcher-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="launcher-title" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Munevo Workspace Launcher</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Switch Workspaces • Preserves Session, Map & Tabs</span>
            </div>
            <button 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}
              onClick={() => setIsLauncherOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="launcher-grid">
            {PRODUCTS.map(p => {
              const PIcon = p.icon;
              const isCurrent = activeProduct === p.id;
              return (
                <div 
                  key={p.id} 
                  className={`launcher-item ${isCurrent ? 'active-workspace' : ''}`}
                  style={{ 
                    '--launcher-item-color': p.color,
                    '--launcher-item-hue': `${p.hue}`,
                    border: isCurrent ? `1px solid ${p.color}` : '1px solid var(--border-color)'
                  } as React.CSSProperties}
                  onClick={() => {
                    setActiveProduct(p.id);
                    setActiveModule(p.modules[0].id);
                    setIsLauncherOpen(false);
                  }}
                >
                  <div className="launcher-item-icon" style={{ background: p.color }}>
                    <PIcon size={14} />
                  </div>
                  <div className="launcher-item-name">{p.name}</div>
                  <div className="launcher-item-desc">{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Product Title Header */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: `linear-gradient(90deg, hsla(${activeProductData.hue}, 80%, 20%, 0.15), transparent)`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: activeProductData.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.createElement(activeProductData.icon, { size: 12 })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
              {activeProductData.name}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
              One Platform. Every Government Operation.
            </span>
          </div>
        </div>
      </div>

      <div className="tenant-selector">
        <div 
          className="tenant-pill" 
          onClick={toggleTenant} 
          title={currentProfile?.isGlobalAdmin ? "Click to switch Multi-Tenant branding" : "Branding locked to tenant"}
          style={{ cursor: currentProfile?.isGlobalAdmin ? 'pointer' : 'default' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px', 
              height: '24px', 
              borderRadius: '4px', 
              background: 'var(--primary-color)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getTenantLogo()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                {tenants.find(t => t.id === tenant)?.name || 'Austin, TX'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {tenants.find(t => t.id === tenant)?.sub || 'Austin Gov Cloud'}
              </span>
            </div>
          </div>
          {currentProfile?.isGlobalAdmin && <ArrowRightLeft size={12} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      <div className="sidebar-menu" style={{ gap: '16px' }}>
        {/* Quick Platform Entry Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="menu-group-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Home size={12} />
            <span>Platform Home</span>
          </div>
          <div
            className={`menu-item ${activeModule === 'command-center' ? 'active' : ''}`}
            onClick={() => {
              setActiveProduct('core');
              setActiveModule('command-center');
            }}
          >
            <ClipboardList size={16} />
            <span>Command Center</span>
          </div>
          <div
            className={`menu-item ${activeModule === 'knowledge-graph' ? 'active' : ''}`}
            onClick={() => {
              setActiveProduct('sentinel');
              setActiveModule('knowledge-graph');
            }}
          >
            <Network size={16} />
            <span>Knowledge Graph</span>
          </div>
          <div
            className={`menu-item ${activeModule === 'gis' ? 'active' : ''}`}
            onClick={() => {
              setActiveProduct('gis');
              setActiveModule('gis');
            }}
          >
            <Map size={16} />
            <span>GIS Map Explorer</span>
          </div>
        </div>

        {/* Pinned Records & Favorites */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="menu-group-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
            <Star size={12} />
            <span>Pinned Records & Favorites</span>
          </div>
          {pinnedFavorites.map(fav => (
            <div
              key={fav.id}
              onClick={() => onOpenRecord && onOpenRecord(fav.type, fav.id, 'safe')}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>{fav.label}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{fav.sub}</span>
            </div>
          ))}
        </div>

        {/* Recent Work History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="menu-group-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6' }}>
            <Clock size={12} />
            <span>Recent Work History</span>
          </div>
          {recentRecords.map(rec => (
            <div
              key={rec.id}
              onClick={() => onOpenRecord && onOpenRecord(rec.type, rec.id, 'safe')}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>{rec.label}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{rec.sub}</span>
            </div>
          ))}
        </div>

        {/* Platform Control Center */}
        {currentProfile?.isGlobalAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: 'auto' }}>
            <div className="menu-group-label">Administration</div>
            <div
              className={`menu-item ${activeModule === 'platform-control' ? 'active' : ''}`}
              onClick={() => {
                setActiveProduct('core');
                setActiveModule('platform-control');
              }}
            >
              <LayoutGrid size={16} />
              <span>Platform Control Center</span>
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar" style={{ background: activeProductData.color }}>
            {currentRole.name[0]}
          </div>
          <div className="user-info">
            <div className="user-name">Naeem Gibbons</div>
            <div className="user-role">{currentRole.name}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

