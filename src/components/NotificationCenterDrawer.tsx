import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  ShieldAlert, 
  Brain, 
  Pin, 
  Search, 
  Filter,
  CheckCheck,
  Trash2
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  category: 'task' | 'approval' | 'ai' | 'reminder' | 'council' | 'safety';
  priority: 'high' | 'medium' | 'low';
  time: string;
  read: boolean;
  pinned: boolean;
}

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  addNotification: (msg: string) => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  addNotification
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Structural Inspection Sign-Off Needed',
      desc: 'Inspector Reynolds uploaded structural photos for 42 Ferry St. Needs signature.',
      category: 'approval',
      priority: 'high',
      time: '10m ago',
      read: false,
      pinned: true
    },
    {
      id: 'n2',
      title: 'Sentinel AI Risk Alert: Zoning Violation Cluster',
      desc: 'AI identified 3 unpermitted commercial signage cases in East Ward.',
      category: 'ai',
      priority: 'high',
      time: '25m ago',
      read: false,
      pinned: true
    },
    {
      id: 'n3',
      title: 'Council Agenda Item RES-2026-88 Published',
      desc: 'Resolution regarding Newark Harbor Redevelopment posted for public comment.',
      category: 'council',
      priority: 'medium',
      time: '1h ago',
      read: true,
      pinned: false
    },
    {
      id: 'n4',
      title: '311 Water Main Repair Assigned',
      desc: 'Work order WO-9042 assigned to Public Works Team B.',
      category: 'task',
      priority: 'medium',
      time: '2h ago',
      read: false,
      pinned: false
    },
    {
      id: 'n5',
      title: 'Public Safety Weather Preparedness Notice',
      desc: 'Severe rain advisory for low-lying coastal zones.',
      category: 'safety',
      priority: 'low',
      time: '3h ago',
      read: true,
      pinned: false
    }
  ]);

  if (!isOpen) return null;

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const togglePin = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addNotification('Marked all notifications as read');
  };

  const clearRead = () => {
    setNotifications(prev => prev.filter(n => !n.read || n.pinned));
    addNotification('Cleared read notifications');
  };

  const filtered = notifications.filter(n => {
    if (activeTab !== 'all' && n.category !== activeTab) return false;
    if (searchTerm && !n.title.toLowerCase().includes(searchTerm.toLowerCase()) && !n.desc.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const categoryIcons: Record<string, any> = {
    approval: FileText,
    ai: Brain,
    council: Calendar,
    task: CheckCircle2,
    safety: ShieldAlert,
    reminder: AlertTriangle
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 99999,
      display: 'flex',
      justifyContent: 'flex-end'
    }} onClick={onClose}>
      <div 
        style={{
          width: '420px',
          maxWidth: '100%',
          height: '100%',
          background: '#11131c',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          animation: 'slideInRight 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Universal Notification Center</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '6px 10px'
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.78rem',
                flex: 1
              }}
            />
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'approval', label: 'Approvals' },
              { id: 'ai', label: 'AI Risk' },
              { id: 'task', label: 'Tasks' },
              { id: 'council', label: 'Council' },
              { id: 'safety', label: 'Safety' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: activeTab === t.id ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.06)',
                  background: activeTab === t.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{
          padding: '8px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          background: '#0d0f17'
        }}>
          <span>{filtered.length} Notifications</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={markAllRead} 
              style={{ background: 'transparent', border: 0, color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <CheckCheck size={13} />
              <span>Mark all read</span>
            </button>
            <button 
              onClick={clearRead} 
              style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={13} />
              <span>Clear read</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No notifications in this view.
            </div>
          ) : (
            filtered.map(n => {
              const IconComponent = categoryIcons[n.category] || Bell;
              return (
                <div 
                  key={n.id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: n.read ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.045)',
                    border: n.pinned ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: n.category === 'ai' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                        color: n.category === 'ai' ? '#8b5cf6' : 'var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={14} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: n.read ? 'var(--text-secondary)' : '#fff' }}>
                        {n.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        onClick={() => togglePin(n.id)}
                        style={{ background: 'transparent', border: 0, color: n.pinned ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer' }}
                        title="Pin notification"
                      >
                        <Pin size={12} />
                      </button>
                      <button 
                        onClick={() => toggleRead(n.id)}
                        style={{ background: 'transparent', border: 0, color: n.read ? 'var(--text-muted)' : 'var(--primary-color)', cursor: 'pointer' }}
                        title={n.read ? 'Mark unread' : 'Mark read'}
                      >
                        <CheckCircle2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    {n.desc}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span style={{ textTransform: 'uppercase', fontWeight: 700, color: n.priority === 'high' ? 'var(--danger-text)' : 'inherit' }}>
                      {n.priority} Priority
                    </span>
                    <span>{n.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
