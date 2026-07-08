import React from 'react';
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
  Shield
} from 'lucide-react';
import { UserRole } from '../mockData';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  currentRole: UserRole;
  tenant: string;
  setTenant: (tenant: string) => void;
  currentProfile: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  setActiveModule, 
  currentRole, 
  tenant, 
  setTenant,
  currentProfile
}) => {
  const tenants = [
    { id: 'newark', name: 'Newark, NJ', sub: 'Newark Gov Cloud' },
    { id: 'austin', name: 'Austin, TX', sub: 'Austin Gov Cloud' }
  ];

  const toggleTenant = () => {
    // If Global Admin session, allow switching municipalities
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

  // Base Menu items definition
  const baseMenuItems = [
    { id: 'command-center', name: 'Command Center', icon: ClipboardList, group: 'Personal Workspace' },
    { id: 'tracker', name: 'Universal Tracker', icon: Layers, group: 'Operations' },
    { id: 'gis', name: 'GIS Intelligence', icon: Map, group: 'Operations' },
    { id: 'permits', name: 'Permits & Licensing', icon: FileText, group: 'Departments' },
    { id: 'code-enforcement', name: 'Code Enforcement', icon: ShieldAlert, group: 'Departments' },
    { id: 'legislative', name: 'Legislative Hub', icon: Calendar, group: 'Departments' },
    { id: 'identity-security', name: 'Identity & Security', icon: ShieldCheck, group: 'Administration' }
  ];

  // Filter Menu items based on active User Profile Permissions
  const menuItems = baseMenuItems.filter(item => {
    // Admins have access to everything
    if (currentProfile?.isGlobalAdmin || currentProfile?.isOrgAdmin) {
      return true;
    }
    // Resident portal has access to limited public modules (e.g. Command Center, Tracker, Legislative, GIS)
    if (currentProfile && !currentProfile.roleId) {
      return ['command-center', 'tracker', 'gis', 'legislative', 'identity-security'].includes(item.id);
    }
    // Staff users filtered by role permissions
    if (currentProfile?.role?.permissions) {
      const perm = currentProfile.role.permissions.find((p: any) => p.module === item.id);
      return perm?.canView ?? false;
    }
    return true;
  });

  // Append Admin consoles dynamically
  if (currentProfile?.isGlobalAdmin) {
    menuItems.push({ id: 'global-admin', name: 'Global Admin Console', icon: Database, group: 'Administration' });
  } else if (currentProfile?.isOrgAdmin) {
    menuItems.push({ id: 'org-admin', name: 'Org Admin Console', icon: Shield, group: 'Administration' });
  }

  // Group menu items
  const groups = Array.from(new Set(menuItems.map(item => item.group)));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">M</div>
        <div className="brand-name">Munevo</div>
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

      <div className="sidebar-menu">
        {groups.map(group => (
          <div key={group} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="menu-group-label">{group}</div>
            {menuItems
              .filter(item => item.group === group)
              .map(item => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <div
                    key={item.id}
                    className={`menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveModule(item.id)}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
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
