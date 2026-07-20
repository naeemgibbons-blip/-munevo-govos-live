import React, { useState } from 'react';
import { Logo } from './Logo';
import { 
  Building2, 
  Scale, 
  ShieldAlert, 
  Brain, 
  Map, 
  Wrench, 
  DollarSign, 
  Users, 
  Landmark, 
  BarChart3, 
  ShoppingBag, 
  Sliders, 
  Search, 
  Star, 
  Clock, 
  Sparkles, 
  Pin, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Building,
  Gavel
} from 'lucide-react';
import { UserRole } from '../mockData';

export interface WorkspaceItem {
  id: string;
  name: string;
  tagline: string;
  color: string;
  icon: React.ElementType;
  desc: string;
  defaultModule: string;
  alertsCount?: number;
  category: 'Core' | 'Civic & Safety' | 'Operations & Finance' | 'Intelligence';
  isAdminOnly?: boolean;
}

export const WORKSPACE_CATALOG: WorkspaceItem[] = [
  {
    id: 'core',
    name: 'MUNEVO CORE',
    tagline: 'GOVERNMENT OS',
    color: '#3b82f6',
    icon: Building2,
    desc: 'The foundational operating system that powers every government operation.',
    defaultModule: 'command-center',
    category: 'Core'
  },
  {
    id: 'civic',
    name: 'MUNEVO CIVIC',
    tagline: 'CITIZEN EXPERIENCE',
    color: '#06b6d4',
    icon: Scale,
    desc: 'Deliver connected digital services that strengthen community engagement and trust.',
    defaultModule: 'open-records',
    category: 'Civic & Safety'
  },
  {
    id: 'safe',
    name: 'MUNEVO SAFE',
    tagline: 'PUBLIC SAFETY',
    color: '#ef4444',
    icon: ShieldAlert,
    desc: 'Empower first responders and agencies with real-time tools for safer communities.',
    defaultModule: 'permits',
    alertsCount: 3,
    category: 'Civic & Safety'
  },
  {
    id: 'sentinel',
    name: 'MUNEVO SENTINEL AI',
    tagline: 'SITUATIONAL AWARENESS',
    color: '#8b5cf6',
    icon: Brain,
    desc: 'AI-powered intelligence and early warning for a safer, more resilient community.',
    defaultModule: 'system-audit',
    alertsCount: 1,
    category: 'Intelligence'
  },
  {
    id: 'gis',
    name: 'MUNEVO GIS',
    tagline: 'MAPS & PLANNING',
    color: '#22c55e',
    icon: Map,
    desc: 'Maps, data, and spatial intelligence for planning today and building tomorrow.',
    defaultModule: 'gis',
    category: 'Intelligence'
  },
  {
    id: 'operations',
    name: 'MUNEVO OPERATIONS',
    tagline: 'CITY OPERATIONS',
    color: '#f97316',
    icon: Wrench,
    desc: 'Streamline public works, assets, and operations to keep your city running efficiently.',
    defaultModule: 'tracker',
    alertsCount: 5,
    category: 'Operations & Finance'
  },
  {
    id: 'finance',
    name: 'MUNEVO FINANCE',
    tagline: 'FINANCIAL MANAGEMENT',
    color: '#eab308',
    icon: DollarSign,
    desc: 'Modern financial tools for transparency, accountability, and strategic decisions.',
    defaultModule: 'command-center',
    category: 'Operations & Finance'
  },
  {
    id: 'hr',
    name: 'MUNEVO HR',
    tagline: 'WORKFORCE MANAGEMENT',
    color: '#14b8a6',
    icon: Users,
    desc: 'Empower your workforce and manage talent with confidence and clarity.',
    defaultModule: 'employee-roster',
    category: 'Operations & Finance'
  },
  {
    id: 'council',
    name: 'MUNEVO COUNCIL',
    tagline: 'LEGISLATIVE MANAGEMENT',
    color: '#94a3b8',
    icon: Landmark,
    desc: 'Manage meetings, agendas, legislation, and governance with ease and transparency.',
    defaultModule: 'legislative',
    alertsCount: 2,
    category: 'Civic & Safety'
  },
  {
    id: 'insight',
    name: 'MUNEVO INSIGHT',
    tagline: 'ANALYTICS',
    color: '#6366f1',
    icon: BarChart3,
    desc: 'Transform data into actionable insights for smarter government decisions.',
    defaultModule: 'city-pulse',
    category: 'Intelligence'
  },
  {
    id: 'marketplace',
    name: 'MARKETPLACE',
    tagline: 'EXTENSIONS & APPS',
    color: '#ec4899',
    icon: ShoppingBag,
    desc: 'Discover pre-built government workflows, integrations, and third-party tools.',
    defaultModule: 'marketplace',
    category: 'Core'
  },
  {
    id: 'control',
    name: 'PLATFORM CONTROL',
    tagline: 'SYSTEM ADMINISTRATION',
    color: '#64748b',
    icon: Sliders,
    desc: 'Configure multi-tenant settings, identity sync, security compliance, and system roles.',
    defaultModule: 'platform-control',
    category: 'Core',
    isAdminOnly: true
  }
];

interface WorkspaceHomeProps {
  currentRole: UserRole;
  currentProfile: any;
  onSelectWorkspace: (productId: string, defaultModule?: string) => void;
  onOpenSearch: () => void;
  onOpenRecord: (type: 'property' | 'permit' | 'legislative' | 'business' | 'project', id: string) => void;
  addNotification: (msg: string) => void;
}

export const WorkspaceHome: React.FC<WorkspaceHomeProps> = ({
  currentRole,
  currentProfile,
  onSelectWorkspace,
  onOpenSearch,
  onOpenRecord,
  addNotification
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedIds, setPinnedIds] = useState<string[]>(['core', 'safe', 'operations', 'gis', 'sentinel']);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds(prev => {
      if (prev.includes(id)) {
        addNotification(`Unpinned workspace from Home Launcher.`);
        return prev.filter(item => item !== id);
      } else {
        addNotification(`Pinned workspace to Home Launcher.`);
        return [...prev, id];
      }
    });
  };

  const isGlobalAdmin = currentProfile?.isGlobalAdmin || currentRole.id === 'global_admin';
  const isOrgAdmin = currentProfile?.isOrgAdmin || currentRole.id === 'mayor';

  const filteredCatalog = WORKSPACE_CATALOG.filter(item => {
    if (item.isAdminOnly && !isGlobalAdmin && !isOrgAdmin) return false;
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.tagline.toLowerCase().includes(term) ||
        item.desc.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const pinnedWorkspaces = WORKSPACE_CATALOG.filter(w => pinnedIds.includes(w.id));

  // Mock Recent Records
  const recentRecords = [
    { type: 'property', id: 'prop_01', title: '920 Broad St', sub: 'City Hall Parcel • Commercial' },
    { type: 'permit', id: 'perm_02', title: 'PM-2026-0182', sub: 'Building Permit • 15 Washington St' },
    { type: 'legislative', id: 'LEG-2026-004', title: 'RES-2026-094', sub: 'Redevelopment Grant Resolution' }
  ];

  return (
    <div className="workspace-home-container" style={{
      width: '100%',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #161b2a 0%, #0b0d14 70%)',
      color: '#fff',
      padding: '28px 36px 100px 36px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      {/* Top Welcome Header & Search Launcher */}
      <header style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Logo size={34} wordmarkSize="1.5rem" />
              <span style={{
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}>
                GOVERNMENT CLOUD WORKSPACE LAUNCHER
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '12px 0 4px 0', letterSpacing: '-0.02em' }}>
              Welcome, {currentProfile?.email?.split('@')[0] || currentRole.name}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              City of Newark • Enterprise Government OS Launcher
            </p>
          </div>

          {/* Quick AI Assist Card */}
          <div 
            onClick={onOpenSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 18px',
              borderRadius: '14px',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.12)'}
          >
            <Brain size={20} style={{ color: '#a78bfa' }} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>Sentinel AI Assistant</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>Press Ctrl+K or click to query city database</div>
            </div>
          </div>
        </div>

        {/* Global Workspace Search Input (M365 style) */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search all Munevo workspaces, UDM parcels, permits, resolutions, and apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '14px 16px 14px 48px',
              fontSize: '0.9rem',
              color: '#fff',
              outline: 'none',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          />
          <kbd 
            onClick={onOpenSearch}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Ctrl + K
          </kbd>
        </div>

        {/* Category Filters Pill Strip */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['All', 'Core', 'Civic & Safety', 'Operations & Finance', 'Intelligence'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                border: 'none',
                background: activeCategory === cat ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Workspace Content Grid */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        
        {/* Pinned Workspaces Bar (if any pinned and no search active) */}
        {!searchTerm && pinnedWorkspaces.length > 0 && activeCategory === 'All' && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Pin size={16} style={{ color: 'var(--primary-color)' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>Pinned Workspaces</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({pinnedWorkspaces.length})</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              {pinnedWorkspaces.map(w => {
                const IconComp = w.icon;
                return (
                  <div
                    key={`pinned-${w.id}`}
                    onClick={() => onSelectWorkspace(w.id, w.defaultModule)}
                    style={{
                      position: 'relative',
                      background: '#121520',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderBottom: `3px solid ${w.color}`,
                      borderRadius: '16px',
                      padding: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.5), 0 0 15px ${w.color}33`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Logo size={24} />
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: `${w.color}20`,
                          border: `1px solid ${w.color}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: w.color
                        }}>
                          <IconComp size={15} />
                        </div>
                      </div>
                      <button 
                        onClick={(e) => togglePin(w.id, e)}
                        title="Unpin workspace"
                        style={{ background: 'transparent', border: 0, color: 'var(--primary-color)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Star size={16} fill="var(--primary-color)" />
                      </button>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
                        {w.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: w.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {w.tagline}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* All Workspaces Grid (Official Munevo Brand System - Image 2 Inspired) */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} style={{ color: 'var(--primary-color)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {activeCategory === 'All' ? 'All Munevo Cloud Workspaces' : `${activeCategory} Workspaces`}
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Showing {filteredCatalog.length} enterprise applications
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {filteredCatalog.map(w => {
              const IconComp = w.icon;
              const isPinned = pinnedIds.includes(w.id);
              return (
                <div
                  key={w.id}
                  onClick={() => onSelectWorkspace(w.id, w.defaultModule)}
                  style={{
                    position: 'relative',
                    background: '#121520',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderBottom: `4px solid ${w.color}`,
                    borderRadius: '18px',
                    padding: '22px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.6), 0 0 20px ${w.color}44`;
                    e.currentTarget.style.borderColor = `${w.color}66`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  {/* Top Brand Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Logo size={28} />
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: `${w.color}18`,
                        border: `1px solid ${w.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: w.color,
                        boxShadow: `0 0 10px ${w.color}20`
                      }}>
                        <IconComp size={18} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {w.alertsCount && (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.18)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.65rem',
                          fontWeight: 800
                        }}>
                          {w.alertsCount} Alerts
                        </span>
                      )}
                      <button 
                        onClick={(e) => togglePin(w.id, e)}
                        title={isPinned ? 'Unpin' : 'Pin to top'}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: isPinned ? 'var(--primary-color)' : 'rgba(255,255,255,0.3)',
                          cursor: 'pointer',
                          padding: '4px',
                          transition: 'color 0.15s ease'
                        }}
                      >
                        <Star size={16} fill={isPinned ? 'var(--primary-color)' : 'transparent'} />
                      </button>
                    </div>
                  </div>

                  {/* Product Title & Tagline */}
                  <div>
                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#fff',
                      margin: '0 0 2px 0',
                      letterSpacing: '0.03em'
                    }}>
                      {w.name}
                    </h3>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: w.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '8px'
                    }}>
                      {w.tagline}
                    </div>
                    <p style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      margin: 0
                    }}>
                      {w.desc}
                    </p>
                  </div>

                  {/* Footer Launch Action */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: w.color
                  }}>
                    <span>Open Workspace</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Lower Row: Recent Records, Continue Working & AI Recommendations */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* Recent Records Card */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Clock size={16} style={{ color: '#06b6d4' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>Recent Records</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentRecords.map(rec => (
                <div 
                  key={rec.id}
                  onClick={() => onOpenRecord(rec.type as any, rec.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{rec.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rec.sub}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Continue Working Card */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CheckCircle2 size={16} style={{ color: '#10b981' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>Continue Working</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                onClick={() => onSelectWorkspace('operations', 'tracker')}
                style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>311 Ticket TRK-9831: Water Drop</div>
                <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>In Progress • Public Works Water Div</div>
              </div>
              <div 
                onClick={() => onSelectWorkspace('safe', 'permits')}
                style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Building Permit PM-2026-0182</div>
                <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Inspections step pending • 15 Washington St</div>
              </div>
            </div>
          </div>

          {/* Recommended by Munevo AI */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(18, 21, 32, 0.6) 100%)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={16} style={{ color: '#a78bfa' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>Recommended by Munevo AI</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
              Based on your role, 4 pending historic facade grants require mayoral sign-off before the next council meeting.
            </p>
            <button 
              onClick={() => onSelectWorkspace('council', 'legislative')}
              style={{
                background: '#8b5cf6',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Review Council Resolutions →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
