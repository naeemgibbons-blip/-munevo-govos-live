import React, { useState, useEffect } from 'react';
import { 
  USER_ROLES, 
  PROPERTIES, 
  PERMITS, 
  VIOLATIONS, 
  INSPECTIONS, 
  TRACKER_ITEMS, 
  UserRole,
  PropertyRecord,
  PermitRecord,
  InspectionRecord,
  TrackerItem
} from '../mockData';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Send, 
  DollarSign, 
  Building2,
  User,
  UserPlus,
  Plus,
  Gavel,
  Briefcase,
  Calendar,
  Compass,
  FileText,
  Users,
  ShieldCheck,
  Check,
  X,
  MapPin,
  Activity,
  Brain,
  ShieldAlert,
  Wrench,
  ChevronRight,
  Layers,
  Map as MapIcon,
  Sun,
  AlertCircle,
  FileCheck,
  Flame,
  PieChart,
  BarChart3,
  HardHat,
  Scale,
  Pin
} from 'lucide-react';
import { WORKSPACE_CATALOG } from './WorkspaceHome';

interface CommandCenterProps {
  currentRole: UserRole;
  currentProfile: any;
  onOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business' | 'project', id: string) => void;
  trackerItems: TrackerItem[];
  setTrackerItems: React.Dispatch<React.SetStateAction<TrackerItem[]>>;
  addNotification: (message: string) => void;
  onUpdatePermit: (id: string, updated: Partial<PermitRecord>) => void;
  onUpdateInspection: (id: string, updated: Partial<InspectionRecord>) => void;
  canEdit?: boolean;
  properties: any[];
  permits: any[];
  inspections: any[];
  onSelectWorkspace?: (productId: string, defaultModule?: string) => void;
  onOpenSearch?: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  currentRole,
  currentProfile,
  onOpenChart,
  trackerItems,
  setTrackerItems,
  addNotification,
  onUpdatePermit,
  onUpdateInspection,
  canEdit = true,
  properties,
  permits,
  inspections,
  onSelectWorkspace,
  onOpenSearch
}) => {
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');
  const orgId = currentProfile?.organizationId || '';
  const roleId = currentRole?.id || 'mayor';

  // Offline sync toggle for field roles
  const [isOfflineSyncEnabled, setIsOfflineSyncEnabled] = useState(true);

  // Inspector Route Checks state
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>('insp_03');
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [inspectorChecks, setInspectorChecks] = useState({
    masonry: false,
    netting: false,
    clearance: false
  });

  // Citizen 311 state
  const [newRequestAddress, setNewRequestAddress] = useState('42 Ferry St, Newark, NJ');
  const [newRequestType, setNewRequestType] = useState('Trash & Debris');
  const [newRequestDesc, setNewRequestDesc] = useState('');

  const handleSignOffInspection = (status: 'Passed' | 'Failed') => {
    if (!activeInspectionId) return;
    onUpdateInspection(activeInspectionId, {
      status,
      notes: inspectorNotes || `Field inspection completed: ${status}`
    });
    addNotification(`Signed off inspection ${activeInspectionId} as ${status}`);
  };

  const handleSubmit311 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestDesc.trim()) return;

    const newItem: TrackerItem = {
      id: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
      module: '311',
      title: `${newRequestType}: ${newRequestDesc}`,
      status: 'Open',
      priority: newRequestType === 'Structural Hazard' ? 'Critical' : 'Medium',
      assignedTo: 'Public Works Operations',
      slaDays: 3,
      slaProgress: 100,
      reportedDate: new Date().toISOString().split('T')[0],
      address: newRequestAddress,
      comments: [],
      history: [{ action: 'Created 311 Request', user: currentProfile?.email || 'Resident', date: new Date().toISOString() }],
      attachments: [],
      relatedRecords: [],
      customFields: {}
    };

    setTrackerItems(prev => [newItem, ...prev]);
    addNotification(`311 Ticket ${newItem.id} submitted successfully!`);
    setNewRequestDesc('');
  };

  // User details
  const userName = currentProfile?.email?.split('@')[0] || (roleId === 'mayor' ? 'Mayor Naeem Gibbons' : currentRole.name);
  const userOrg = currentProfile?.organization?.name || 'City of Newark';

  // Role helper checks
  const isExecutive = roleId === 'mayor' || roleId === 'finance' || roleId === 'global_admin';
  const isInspector = roleId === 'inspector';
  const isPublicWorks = roleId === 'public_works';
  const isClerk = roleId === 'clerk';
  const isCitizen = ['resident', 'business', 'contractor'].includes(roleId);

  return (
    <div className="command-center-dense" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
      width: '100%',
      boxSizing: 'border-box',
      background: 'var(--main-bg)'
    }}>

      {/* 1. TOP HERO AREA */}
      <div className="glass-card" style={{
        padding: '24px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(22, 27, 42, 0.95) 0%, rgba(13, 16, 26, 0.98) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge-status badge-success" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} className="pulse-emerald" />
                SYSTEM OPERATIONAL
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {userOrg} • Monday, July 20, 2026 • 72°F Clear
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '8px 0 2px 0', letterSpacing: '-0.02em' }}>
              Good Evening, {userName}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {currentRole.description}
            </p>
          </div>

          {/* Quick AI & Create Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={onOpenSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(139, 92, 246, 0.18)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#a78bfa',
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)'
              }}
            >
              <Brain size={16} />
              <span>Ask Munevo AI</span>
            </button>
          </div>
        </div>

        {/* AI Executive Briefing Banner */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <Sparkles size={20} style={{ color: '#60a5fa', flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.45 }}>
            <strong style={{ color: '#60a5fa', display: 'inline-block', marginRight: '6px' }}>Sentinel AI Executive Briefing:</strong>
            {isExecutive ? (
              "311 SLA response averages improved by 14% this week across Newark West Ward. 4 pending council resolutions require mayoral signature prior to Thursday meeting."
            ) : isInspector ? (
              "8 field inspections scheduled today. Route map optimized for 15 Washington St tuckpointing re-inspection. Scaffolding safety compliance pending."
            ) : isPublicWorks ? (
              "Water main pressure drop ticket TRK-9831 on Ferry St requires emergency crew dispatch. Equipment inventory logged 95% ready."
            ) : (
              "Welcome to MyMunevo Public Portal. Your water bill is up to date and 1 open 311 request is in progress."
            )}
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '14px'
      }}>
        {[
          { label: '311 Response SLA', val: '18.4 hrs', trend: '-2.1 hrs', status: 'normal', color: '#10b981', icon: Clock },
          { label: 'Pending Approvals', val: '4 Cases', trend: '+1 Today', status: 'warn', color: '#f59e0b', icon: AlertTriangle },
          { label: 'Budget Health', val: '$14.2M', trend: '+$1.2M Under', status: 'normal', color: '#3b82f6', icon: DollarSign },
          { label: 'Revenue Collections', val: '$2.8M YTD', trend: '+98.2%', status: 'normal', color: '#8b5cf6', icon: TrendingUp },
          { label: 'Active Emergencies', val: '0 Active', trend: 'Optimal', status: 'normal', color: '#10b981', icon: ShieldCheck },
          { label: 'Capital Projects', val: '92% On Track', trend: '+4%', status: 'normal', color: '#06b6d4', icon: Building2 },
          { label: 'Workforce Ready', val: '94% Active', trend: '48 Staff', status: 'normal', color: '#ec4899', icon: Users }
        ].map((kpi, idx) => {
          const IconC = kpi.icon;
          return (
            <div 
              key={idx}
              className="glass-card"
              style={{
                padding: '16px',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'rgba(18, 21, 32, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{kpi.label}</span>
                <IconC size={15} style={{ color: kpi.color }} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{kpi.val}</div>
              <div style={{ fontSize: '0.68rem', color: kpi.color, fontWeight: 700 }}>{kpi.trend}</div>
            </div>
          );
        })}
      </div>

      {/* 3. MAIN DENSE 3-COLUMN WORKSPACE LAYOUT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
        gap: '24px'
      }}>

        {/* LEFT COLUMN: Priority Actions, City Pulse & Today's Work */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Priority Action Queue */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} style={{ color: '#ef4444' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Priority Executive Actions</h2>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>4 Items Requiring Sign-off</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                    Grant Resolution RES-2026-094: 15 Washington St Historic Facade
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Authorizes $450k municipal co-funding • Requires Mayoral signature before Council meeting
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => onOpenChart('legislative', 'LEG-2026-004')}
                    style={{ background: 'var(--primary-color)', color: '#fff', border: 0, padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Review & Sign
                  </button>
                </div>
              </div>

              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                    Code Violation CE-2026-0122: Scaffolding Stop Work Sign-off
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Building official sign-off pending re-inspection of tuckpointing masonry
                  </div>
                </div>
                <button 
                  onClick={() => onOpenChart('property', 'prop_02')}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  View Case
                </button>
              </div>
            </div>
          </div>

          {/* City Pulse & Live Operational Map Preview */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapIcon size={18} style={{ color: '#3b82f6' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>City Pulse Spatial Intelligence</h2>
              </div>
              <button 
                onClick={() => onSelectWorkspace && onSelectWorkspace('gis', 'gis')}
                style={{ background: 'transparent', border: 0, color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Open Full GIS Map →
              </button>
            </div>

            {/* Map Preview Canvas */}
            <div style={{
              height: '220px',
              borderRadius: '12px',
              background: '#0e111a',
              border: '1px solid var(--border-color)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="100%" height="100%" style={{ background: '#090b11' }}>
                <line x1="0" y1="50" x2="600" y2="50" stroke="#1b2030" strokeWidth="2" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#1b2030" strokeWidth="2" />
                <line x1="0" y1="180" x2="600" y2="180" stroke="#1b2030" strokeWidth="2" />
                <line x1="100" y1="0" x2="100" y2="250" stroke="#1b2030" strokeWidth="2" />
                <line x1="300" y1="0" x2="300" y2="250" stroke="#1b2030" strokeWidth="2" />
                <line x1="450" y1="0" x2="450" y2="250" stroke="#1b2030" strokeWidth="2" />

                {/* Hotspot Pins */}
                <circle cx="300" cy="120" r="10" fill="rgba(239, 68, 68, 0.2)" />
                <circle cx="300" cy="120" r="4" fill="#ef4444" />
                <text x="312" y="124" fill="#fff" fontSize="10" fontWeight="700">105 Market St (Awning Rot)</text>

                <circle cx="100" cy="50" r="10" fill="rgba(245, 158, 11, 0.2)" />
                <circle cx="100" cy="50" r="4" fill="#f59e0b" />
                <text x="112" y="54" fill="#fff" fontSize="10" fontWeight="700">15 Washington St (Scaffolding)</text>

                <circle cx="450" cy="180" r="10" fill="rgba(16, 185, 129, 0.2)" />
                <circle cx="450" cy="180" r="4" fill="#10b981" />
                <text x="462" y="184" fill="#fff" fontSize="10" fontWeight="700">42 Ferry St (Water Service)</text>
              </svg>

              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.75)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', color: '#9aa3b2' }}>
                Newark GIS Layers Active • 3 Incident Hotspots
              </div>
            </div>
          </div>

          {/* Today's Work & Schedule Calendar */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: '#10b981' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Today's Operational Schedule</h2>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Monday, July 20, 2026</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { time: '09:00 AM', title: 'Executive Cabinet Briefing', dept: 'Executive Hall', type: 'Meeting' },
                { time: '11:30 AM', title: 'Site Inspection: 15 Washington St Masonry Netting', dept: 'Code Enforcement', type: 'Inspection' },
                { time: '02:00 PM', title: 'City Council Agenda Review & Voting Prep', dept: 'Clerk Vault', type: 'Legislative' },
                { time: '04:30 PM', title: 'Ironbound Water Main Repair Progress Call', dept: 'Public Works', type: 'Work Order' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-color)', minWidth: '70px' }}>{item.time}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{item.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.dept}</div>
                  </div>
                  <span className="badge-status badge-primary" style={{ fontSize: '0.65rem' }}>{item.type}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Insights, Recent Activity & Pinned Workspaces */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Pinned Workspaces Grid Card */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Pin size={16} style={{ color: 'var(--primary-color)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>Pinned Workspaces</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {WORKSPACE_CATALOG.slice(0, 6).map(w => {
                const IconC = w.icon;
                return (
                  <div 
                    key={`cmd-pinned-${w.id}`}
                    onClick={() => onSelectWorkspace && onSelectWorkspace(w.id, w.defaultModule)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      borderLeft: `3px solid ${w.color}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <IconC size={16} style={{ color: w.color }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{w.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{w.tagline}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Risk Insights */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(18, 21, 32, 0.7) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Brain size={18} style={{ color: '#8b5cf6' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>Sentinel AI Anomalies</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                <strong style={{ color: '#f59e0b', display: 'block' }}>Unusual 311 Volume:</strong>
                Ferry St water pressure tickets elevated by 32% since 08:00 AM. Cross-referenced with hydrants ledger.
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                <strong style={{ color: '#10b981', display: 'block' }}>Revenue Optimization:</strong>
                Commercial mercantile renewals pacing 8% ahead of projections for Q3.
              </div>
            </div>
          </div>

          {/* Recent Real-Time Activity Feed */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: '#06b6d4' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>Live Activity Feed</h3>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Real-time Audit</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { text: 'Permit BP-2026-0145 approved for 125 Market St', time: '12m ago', user: 'Building Official' },
                { text: 'Field inspection passed for 920 Broad St', time: '45m ago', user: 'Jenkins S.' },
                { text: 'Resolution RES-2026-094 attached to Council agenda', time: '1h ago', user: 'Clerk Office' },
                { text: '311 Case TRK-9831 updated to In Progress', time: '2h ago', user: 'Water Crew' }
              ].map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>•</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{act.text}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{act.user} • {act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
