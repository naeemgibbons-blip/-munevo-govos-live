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
  ExternalLink
} from 'lucide-react';
import { 
  PROPERTIES, 
  PERMITS, 
  VIOLATIONS, 
  INSPECTIONS, 
  TRACKER_ITEMS, 
  LEGISLATIVE_ITEMS 
} from '../mockData';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecord: (type: 'property' | 'permit' | 'legislative' | 'business' | 'project', id: string, targetWorkspace?: string) => void;
  addNotification: (msg: string) => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  onOpenRecord,
  addNotification
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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

  const term = searchTerm.toLowerCase().trim();

  // Search UDM entities
  const matchingProperties = Object.values(PROPERTIES).filter(p => 
    p.address.toLowerCase().includes(term) || 
    p.ownerName.toLowerCase().includes(term) ||
    p.id.toLowerCase().includes(term) ||
    p.zoningDistrict.toLowerCase().includes(term)
  );

  const matchingPermits = Object.values(PERMITS).filter(p => 
    p.permitNumber.toLowerCase().includes(term) || 
    p.type.toLowerCase().includes(term) ||
    p.description.toLowerCase().includes(term)
  );

  const matchingViolations = Object.values(VIOLATIONS).filter(v => 
    v.caseNumber.toLowerCase().includes(term) ||
    v.violationType.toLowerCase().includes(term) ||
    v.description.toLowerCase().includes(term)
  );

  const matchingWorkOrders = TRACKER_ITEMS.filter(t => 
    t.title.toLowerCase().includes(term) ||
    t.id.toLowerCase().includes(term) ||
    t.address.toLowerCase().includes(term) ||
    t.assignedTo.toLowerCase().includes(term)
  );

  const matchingCouncil = LEGISLATIVE_ITEMS.filter(l => 
    l.title.toLowerCase().includes(term) ||
    l.agendaNumber.toLowerCase().includes(term) ||
    (l.parsedEntities?.resolutionNumber && l.parsedEntities.resolutionNumber.toLowerCase().includes(term)) ||
    (l.aiSummary?.plainSummary && l.aiSummary.plainSummary.toLowerCase().includes(term)) ||
    l.description.toLowerCase().includes(term)
  );

  const totalResults = 
    (activeFilter === 'all' || activeFilter === 'properties' ? matchingProperties.length : 0) +
    (activeFilter === 'all' || activeFilter === 'permits' ? matchingPermits.length : 0) +
    (activeFilter === 'all' || activeFilter === 'violations' ? matchingViolations.length : 0) +
    (activeFilter === 'all' || activeFilter === 'workorders' ? matchingWorkOrders.length : 0) +
    (activeFilter === 'all' || activeFilter === 'council' ? matchingCouncil.length : 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 13, 0.82)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '80px',
      animation: 'fadeIn 0.15s ease-out'
    }} onClick={onClose}>
      <div 
        style={{
          width: '92%',
          maxWidth: '820px',
          background: '#11131c',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <Search size={22} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
          <input 
            type="text"
            placeholder="Search across all Government UDM entities (Properties, Permits, Incidents, Work Orders, Council Items)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 500,
              fontFamily: 'inherit'
            }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          )}
          <kbd style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontWeight: 600
          }}>
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          background: '#0d0f17'
        }}>
          {[
            { id: 'all', label: 'All Entities', icon: Layers },
            { id: 'properties', label: 'Properties & Parcels', icon: Building2 },
            { id: 'permits', label: 'Permits', icon: FileText },
            { id: 'violations', label: 'Violations', icon: ShieldAlert },
            { id: 'workorders', label: '311 & Work Orders', icon: Wrench },
            { id: 'council', label: 'Council & Legislative', icon: Calendar }
          ].map(f => {
            const FIcon = f.icon;
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.06)',
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <FIcon size={13} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results List Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {term.length < 2 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Network size={36} style={{ color: 'var(--primary-color)', opacity: 0.6 }} />
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                  Government Knowledge Graph Universal Search
                </h4>
                <p style={{ fontSize: '0.8rem', marginTop: '4px', maxWidth: '440px', lineHeight: 1.5 }}>
                  Type a property address (e.g. "Ferry St"), permit number ("PM-2026"), violation code, or work order to search all connected records across Munevo.
                </p>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matching government records found for "{searchTerm}".
            </div>
          ) : (
            <>
              {/* Properties Section */}
              {(activeFilter === 'all' || activeFilter === 'properties') && matchingProperties.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={13} />
                    <span>Properties & Municipal Parcels ({matchingProperties.length})</span>
                  </div>
                  {matchingProperties.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        onOpenRecord('property', p.id, 'safe');
                        onClose();
                      }}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{p.address}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Owner: {p.ownerName} • Zoning: {p.zoningDistrict} • Parcel #{p.id}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge-status badge-primary" style={{ fontSize: '0.65rem' }}>
                          UDM Property
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Permits Section */}
              {(activeFilter === 'all' || activeFilter === 'permits') && matchingPermits.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={13} />
                    <span>Permits & Licensing ({matchingPermits.length})</span>
                  </div>
                  {matchingPermits.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        onOpenRecord('permit', p.id, 'safe');
                        onClose();
                      }}
                      style={{
                        padding: '12px 16px',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                            {p.permitNumber} ({p.type})
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Desc: {p.description} • Est. Cost: ${p.estimatedCost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge-status ${p.status === 'Completed' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>
                          {p.status}
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Work Orders Section */}
              {(activeFilter === 'all' || activeFilter === 'workorders') && matchingWorkOrders.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wrench size={13} />
                    <span>311 & Operations Work Orders ({matchingWorkOrders.length})</span>
                  </div>
                  {matchingWorkOrders.map(w => (
                    <div 
                      key={w.id}
                      onClick={() => {
                        onOpenRecord('property', w.id, 'operations');
                        onClose();
                      }}
                      style={{
                        padding: '12px 16px',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'rgba(234, 179, 8, 0.15)',
                          color: '#eab308',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Wrench size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                            {w.title} ({w.id})
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Location: {w.address} • Assigned: {w.assignedTo}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge-status badge-primary" style={{ fontSize: '0.65rem' }}>
                          {w.status}
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Council Items Section */}
              {(activeFilter === 'all' || activeFilter === 'council') && matchingCouncil.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} />
                    <span>Council Agenda & Resolutions ({matchingCouncil.length})</span>
                  </div>
                  {matchingCouncil.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        onOpenRecord('legislative', c.id, 'council');
                        onClose();
                      }}
                      style={{
                        padding: '12px 16px',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'rgba(244, 63, 94, 0.15)',
                          color: '#f43f5e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Calendar size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                            {c.agendaNumber}: {c.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Dept: {c.parsedEntities?.department || 'City Council'} • Status: {c.status}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge-status badge-success" style={{ fontSize: '0.65rem' }}>
                          {c.status}
                        </span>
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border-color)',
          background: '#0d0f17',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} style={{ color: 'var(--primary-color)' }} />
            <span>Munevo Unified Data Model & Government Knowledge Graph Active</span>
          </div>
          <span>Tip: Click any record to launch inside the Unified Workspace</span>
        </div>
      </div>
    </div>
  );
};
