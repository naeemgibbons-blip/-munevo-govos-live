import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Building2, 
  FileText, 
  ShieldAlert, 
  Wrench, 
  Scale, 
  Calendar, 
  Users, 
  MapPin, 
  Network,
  ArrowRight,
  Sparkles,
  Layers,
  Briefcase,
  Sliders,
  Database,
  Brain,
  DollarSign,
  BarChart3,
  ShoppingBag,
  Plus,
  Zap,
  CheckSquare,
  FileCheck
} from 'lucide-react';
import { 
  PROPERTIES, 
  PERMITS, 
  VIOLATIONS, 
  TRACKER_ITEMS, 
  LEGISLATIVE_ITEMS 
} from '../mockData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (workspaceId: string, moduleId?: string) => void;
  onOpenRecord: (type: 'property' | 'permit' | 'legislative' | 'business' | 'project', id: string, targetWorkspace?: string) => void;
  onOpenCreateModal: (entityType?: string) => void;
  addNotification: (msg: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectWorkspace,
  onOpenRecord,
  onOpenCreateModal,
  addNotification
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Workspaces list
  const workspaces = [
    { id: 'core', name: 'Munevo Core', module: 'command-center', icon: Building2, desc: 'Command Workspace & Identity' },
    { id: 'civic', name: 'Munevo Civic', module: 'open-records', icon: Scale, desc: 'Constituent Desk & Open Records' },
    { id: 'safe', name: 'Munevo Safe', module: 'permits', icon: ShieldAlert, desc: 'Permits, Inspections & Code Enforcement' },
    { id: 'sentinel', name: 'Munevo Sentinel AI', module: 'knowledge-graph', icon: Brain, desc: 'Cognitive Knowledge Graph & Security' },
    { id: 'gis', name: 'Munevo GIS', module: 'gis', icon: MapPin, desc: 'Geospatial Intelligence & Parcel Layers' },
    { id: 'operations', name: 'Munevo Operations', module: 'tracker', icon: Wrench, desc: '311 Work Orders & Maintenance' },
    { id: 'finance', name: 'Munevo Finance', module: 'finance', icon: DollarSign, desc: 'Municipal Ledger & Tax Abatements' },
    { id: 'council', name: 'Munevo Council', module: 'legislative', icon: FileCheck, desc: 'Agendas, Minutes & Resolutions' },
    { id: 'hr', name: 'Munevo HR', module: 'employee-roster', icon: Users, desc: 'Staff Directory & Personnel' },
    { id: 'insight', name: 'Munevo Insight', module: 'city-pulse', icon: BarChart3, desc: 'City Pulse & Executive KPIs' },
    { id: 'marketplace', name: 'Munevo Marketplace', module: 'marketplace', icon: ShoppingBag, desc: 'Platform Extensions & GIS Layers' },
    { id: 'platform-control', name: 'Platform Control Center', module: 'platform-control', icon: Sliders, desc: 'OS Admin, UDM Studio & API Gateway' }
  ].filter(w => !q || w.name.toLowerCase().includes(q) || w.desc.toLowerCase().includes(q));

  // Quick Action Commands
  const commands = [
    { label: 'Create Building Permit Application', icon: Plus, action: () => { onOpenCreateModal('permit'); onClose(); } },
    { label: 'Submit 311 Operations Work Order', icon: Plus, action: () => { onOpenCreateModal('workorder'); onClose(); } },
    { label: 'File Code Compliance Violation Case', icon: Plus, action: () => { onOpenCreateModal('violation'); onClose(); } },
    { label: 'Draft Legislative Council Item', icon: Plus, action: () => { onOpenCreateModal('council'); onClose(); } },
    { label: 'Register New Municipal Business', icon: Plus, action: () => { onOpenCreateModal('business'); onClose(); } },
    { label: 'Schedule Property Safety Inspection', icon: CheckSquare, action: () => { onOpenRecord('property', 'prop_01', 'safe'); onClose(); addNotification('Initiated inspection scheduling'); } },
    { label: 'Launch Government Knowledge Graph', icon: Network, action: () => { onSelectWorkspace('sentinel', 'knowledge-graph'); onClose(); } },
    { label: 'Ask Sentinel AI Briefing', icon: Brain, action: () => { addNotification('Sentinel AI briefing generated for current context'); onClose(); } }
  ].filter(c => !q || c.label.toLowerCase().includes(q));

  // UDM Entities matches
  const matchingProperties = Object.values(PROPERTIES).filter(p => !q || p.address.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q));
  const matchingPermits = Object.values(PERMITS).filter(p => !q || p.permitNumber.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
  const matchingWorkOrders = TRACKER_ITEMS.filter(t => !q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 13, 0.85)',
        backdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '90px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '92%',
          maxWidth: '750px',
          background: '#11131e',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Input Box */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <Zap size={22} style={{ color: 'var(--primary-color)' }} />
          <input 
            type="text"
            placeholder="Type a command, search UDM record, or launch workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 500,
              fontFamily: 'inherit'
            }}
          />
          <kbd style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '3px 8px',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontWeight: 700
          }}>
            ESC
          </kbd>
        </div>

        {/* Results Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Quick Commands */}
          {commands.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Platform Commands
              </div>
              {commands.map((cmd, idx) => {
                const CIcon = cmd.icon;
                return (
                  <div
                    key={idx}
                    onClick={cmd.action}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.83rem',
                      fontWeight: 600,
                      color: '#fff'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CIcon size={16} style={{ color: 'var(--primary-color)' }} />
                      <span>{cmd.label}</span>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Workspaces Switcher */}
          {workspaces.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Workspaces (Launch & Preserve Context)
              </div>
              {workspaces.map(w => {
                const WIcon = w.icon;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      onSelectWorkspace(w.id, w.module);
                      onClose();
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-color)'
                      }}>
                        <WIcon size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#fff' }}>{w.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{w.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px' }}>
                      Switch Workspace
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* UDM Record Matches */}
          {(matchingProperties.length > 0 || matchingPermits.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                UDM Records
              </div>
              {matchingProperties.slice(0, 3).map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    onOpenRecord('property', p.id, 'safe');
                    onClose();
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building2 size={16} style={{ color: '#3b82f6' }} />
                    <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>{p.address}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Parcel #{p.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border-color)',
          background: '#0d0f17',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} style={{ color: 'var(--primary-color)' }} />
            <span>Munevo Universal Command Palette • Preserves Session Context</span>
          </div>
          <span>Navigation: ↑↓ Enter</span>
        </div>
      </div>
    </div>
  );
};
