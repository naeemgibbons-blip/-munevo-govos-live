import React from 'react';
import { 
  Home, 
  Search, 
  Brain, 
  Map, 
  Plus, 
  Bell, 
  Sliders, 
  ClipboardList,
  LayoutGrid
} from 'lucide-react';

interface FloatingDockProps {
  onGoHome: () => void;
  onGoCommandCenter: () => void;
  onOpenSearch: () => void;
  onOpenAI: () => void;
  onOpenGIS: () => void;
  onOpenCreate: () => void;
  onOpenNotifications: () => void;
  onOpenControlCenter: () => void;
  activeModule: string;
  viewMode: string;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  onGoHome,
  onGoCommandCenter,
  onOpenSearch,
  onOpenAI,
  onOpenGIS,
  onOpenCreate,
  onOpenNotifications,
  onOpenControlCenter,
  activeModule,
  viewMode
}) => {
  const dockItems = [
    { id: 'home', label: 'Workspace Launcher (Home)', icon: LayoutGrid, action: onGoHome, isActive: viewMode === 'workspace-home' },
    { id: 'command', label: 'Command Center (Operations)', icon: ClipboardList, action: onGoCommandCenter, isActive: viewMode === 'module' && activeModule === 'command-center' },
    { id: 'search', label: 'Universal Search (Ctrl+K)', icon: Search, action: onOpenSearch, isActive: false },
    { id: 'ai', label: 'Sentinel AI Assistant', icon: Brain, action: onOpenAI, isActive: false, isAccent: true },
    { id: 'gis', label: 'GIS Spatial Map', icon: Map, action: onOpenGIS, isActive: viewMode === 'module' && activeModule === 'gis' },
    { id: 'create', label: 'Global Create Record', icon: Plus, action: onOpenCreate, isActive: false, isPrimary: true },
    { id: 'notifications', label: 'Notifications Drawer', icon: Bell, action: onOpenNotifications, isActive: false },
    { id: 'control', label: 'Control Center', icon: Sliders, action: onOpenControlCenter, isActive: viewMode === 'module' && activeModule === 'platform-control' }
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(15, 18, 28, 0.88)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.15)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Munevo Live Presence Badge */}
      <div 
        title="Live System Presence: Newark Gov Cloud"
        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', marginRight: '4px' }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} className="pulse-emerald" />
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981' }}>MUNEVO OS</span>
      </div>
      {dockItems.map(item => {
        const IconComp = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.action}
            title={item.label}
            style={{
              width: item.isPrimary ? '42px' : '38px',
              height: item.isPrimary ? '42px' : '38px',
              borderRadius: item.isPrimary ? '12px' : '10px',
              background: item.isPrimary 
                ? 'var(--primary-color)' 
                : item.isAccent 
                ? 'rgba(139, 92, 246, 0.2)' 
                : item.isActive 
                ? 'rgba(255, 255, 255, 0.18)' 
                : 'transparent',
              border: item.isPrimary 
                ? 'none' 
                : item.isAccent 
                ? '1px solid #8b5cf6' 
                : item.isActive 
                ? '1px solid var(--primary-color)' 
                : '1px solid transparent',
              color: item.isPrimary ? '#fff' : item.isAccent ? '#8b5cf6' : item.isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.15) translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
            }}
          >
            <IconComp size={item.isPrimary ? 20 : 17} />
          </button>
        );
      })}
    </div>
  );
};
