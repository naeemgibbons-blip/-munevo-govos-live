import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Building2, 
  FileText, 
  ShieldAlert, 
  Wrench, 
  Scale, 
  Calendar, 
  Users, 
  Briefcase, 
  DollarSign, 
  Layers, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface UniversalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEntityType?: string;
  addNotification: (msg: string) => void;
}

export const UniversalCreateModal: React.FC<UniversalCreateModalProps> = ({
  isOpen,
  onClose,
  initialEntityType = 'permit',
  addNotification
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string>(initialEntityType);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('920 Broad St');
  const [category, setCategory] = useState('Standard');
  const [assignedTo, setAssignedTo] = useState('Inspectors Desk');

  if (!isOpen) return null;

  const entityTypes = [
    { id: 'permit', name: 'Building Permit Application', icon: FileText, workspace: 'Munevo Safe' },
    { id: 'workorder', name: '311 Operations Work Order', icon: Wrench, workspace: 'Munevo Operations' },
    { id: 'violation', name: 'Code Compliance Violation', icon: ShieldAlert, workspace: 'Munevo Safe' },
    { id: 'council', name: 'Council Agenda Resolution', icon: Calendar, workspace: 'Munevo Council' },
    { id: 'property', name: 'Municipal Property Parcel', icon: Building2, workspace: 'Munevo Core' },
    { id: 'business', name: 'Commercial Business Registration', icon: Briefcase, workspace: 'Munevo Civic' },
    { id: 'project', name: 'Capital Infrastructure Project', icon: Layers, workspace: 'Munevo Core' },
    { id: 'grant', name: 'Municipal Grant Application', icon: DollarSign, workspace: 'Munevo Finance' },
    { id: 'employee', name: 'Staff Personnel Record', icon: Users, workspace: 'Munevo HR' }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const entityObj = entityTypes.find(e => e.id === selectedEntity);
    addNotification(`Created new ${entityObj?.name || 'UDM Entity'}: "${title || 'Untitled Record'}" in ${entityObj?.workspace}`);
    onClose();
    setTitle('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 7, 13, 0.82)',
      backdropFilter: 'blur(12px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#11131c',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.7), 0 0 30px rgba(16, 185, 129, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-color)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Universal UDM Record Creator
              </h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Create canonical records across all Munevo platform workspaces
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Entity Type Selection Grid */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: '#0d0f17' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Select Canonical UDM Entity Type
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {entityTypes.map(e => {
              const EIcon = e.icon;
              const isSel = selectedEntity === e.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelectedEntity(e.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isSel ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: isSel ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                    color: isSel ? '#fff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.75rem',
                    fontWeight: isSel ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <EIcon size={14} style={{ color: isSel ? 'var(--primary-color)' : 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Record Title / Identifier
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. Commercial Renovation Project 2026..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Associated Parcel / Address
              </label>
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Assigned Desk / Team
              </label>
              <input 
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Sparkles size={12} style={{ color: 'var(--primary-color)' }} />
              <span>Entity will automatically sync to Knowledge Graph</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{
                  background: 'var(--primary-color)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                }}
              >
                Create UDM Record
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
