import React, { useState } from 'react';
import { 
  Activity, 
  Filter, 
  Search, 
  Building2, 
  FileText, 
  ShieldAlert, 
  Wrench, 
  Calendar, 
  Brain, 
  DollarSign, 
  User,
  ArrowUpRight,
  Clock
} from 'lucide-react';

export interface ActivityEvent {
  id: string;
  type: 'permit' | 'inspection' | '311' | 'violation' | 'council' | 'ai' | 'finance' | 'hr';
  title: string;
  description: string;
  actor: string;
  workspace: string;
  timestamp: string;
  entityId?: string;
}

interface PlatformActivityFeedProps {
  onOpenRecord?: (type: 'property' | 'permit' | 'legislative' | 'business' | 'project', id: string, targetWorkspace?: string) => void;
}

export const PlatformActivityFeed: React.FC<PlatformActivityFeedProps> = ({ onOpenRecord }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const activities: ActivityEvent[] = [
    {
      id: 'act_1',
      type: 'permit',
      title: 'Permit Approved: Commercial Façade Renovation',
      description: 'Permit PERM-2026-081 approved for 920 Broad St.',
      actor: 'Sarah Jenkins (Chief Plan Examiner)',
      workspace: 'Munevo Safe',
      timestamp: '5 mins ago',
      entityId: 'PERM-2026-081'
    },
    {
      id: 'act_2',
      type: 'inspection',
      title: 'Safety Inspection Scheduled: Electrical Upgrade',
      description: 'Inspection scheduled for 42 Ferry St parcel #prop_02.',
      actor: 'David Miller (Inspector)',
      workspace: 'Munevo Safe',
      timestamp: '18 mins ago',
      entityId: 'prop_02'
    },
    {
      id: 'act_3',
      type: '311',
      title: '311 Service Ticket Submitted: Water Leak',
      description: 'Ticket #311-9021 logged for Ferry St intersection.',
      actor: 'Constituent Portal (John Doe)',
      workspace: 'Munevo Operations',
      timestamp: '32 mins ago',
      entityId: 'prop_02'
    },
    {
      id: 'act_4',
      type: 'ai',
      title: 'Sentinel AI Alert: Zoning Boundary Overlap',
      description: 'AI cognitive engine identified parcel variance conflict in East Ward.',
      actor: 'Munevo Sentinel AI',
      workspace: 'Munevo Sentinel AI',
      timestamp: '1 hour ago'
    },
    {
      id: 'act_5',
      type: 'council',
      title: 'Council Agenda Item Passed: RES-2026-14',
      description: 'Resolution approving municipal infrastructure bond approved 8-1.',
      actor: 'City Clerk Desk',
      workspace: 'Munevo Council',
      timestamp: '2 hours ago',
      entityId: 'leg_01'
    },
    {
      id: 'act_6',
      type: 'violation',
      title: 'Code Violation Notice Issued: Façade Netting',
      description: 'Case CASE-2026-12 issued with $500 initial fine notice.',
      actor: 'Code Enforcement Desk',
      workspace: 'Munevo Safe',
      timestamp: '3 hours ago',
      entityId: 'prop_01'
    }
  ];

  const filtered = activities.filter(a => {
    if (activeFilter !== 'all' && a.type !== activeFilter) return false;
    if (searchTerm && !a.title.toLowerCase().includes(searchTerm.toLowerCase()) && !a.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'permit': return FileText;
      case 'inspection': return ShieldAlert;
      case '311': return Wrench;
      case 'ai': return Brain;
      case 'council': return Calendar;
      case 'violation': return ShieldAlert;
      default: return Activity;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'permit': return '#3b82f6';
      case 'inspection': return '#f59e0b';
      case '311': return '#eab308';
      case 'ai': return '#8b5cf6';
      case 'council': return '#f43f5e';
      case 'violation': return '#ef4444';
      default: return '#10b981';
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={18} style={{ color: 'var(--primary-color)' }} />
          <div>
            <div className="card-title" style={{ margin: 0 }}>Platform Real-Time Activity Feed</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Unified event stream across all Munevo workspaces
            </span>
          </div>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: 'All Events' },
            { id: 'permit', label: 'Permits' },
            { id: '311', label: '311 Ops' },
            { id: 'ai', label: 'AI Alerts' },
            { id: 'council', label: 'Council' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                background: activeFilter === f.id ? 'var(--primary-glow)' : 'transparent',
                border: activeFilter === f.id ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                color: activeFilter === f.id ? '#fff' : 'var(--text-muted)',
                padding: '3px 8px',
                fontSize: '0.68rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(act => {
          const IconComp = getEventIcon(act.type);
          const iconColor = getEventColor(act.type);
          return (
            <div 
              key={act.id}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${iconColor}20`,
                  color: iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <IconComp size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{act.title}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{act.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    <span>By {act.actor}</span>
                    <span>•</span>
                    <span style={{ color: iconColor, fontWeight: 600 }}>{act.workspace}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} />
                  {act.timestamp}
                </span>
                {act.entityId && onOpenRecord && (
                  <button 
                    onClick={() => onOpenRecord(act.type === 'permit' ? 'permit' : act.type === 'council' ? 'legislative' : 'property', act.entityId!)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      color: 'var(--primary-color)',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span>View</span>
                    <ArrowUpRight size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
