import React, { useState, useEffect } from 'react';
import { 
  PROPERTIES, 
  PERMITS, 
  VIOLATIONS, 
  INSPECTIONS, 
  LEGISLATIVE_ITEMS, 
  TRACKER_ITEMS,
  PropertyRecord, 
  PermitRecord, 
  CodeViolation, 
  InspectionRecord, 
  LegislativeItem,
  TrackerItem
} from '../mockData';
import { 
  X, 
  FileText, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  Activity, 
  CheckCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Sparkles,
  Camera,
  Layers,
  Gavel,
  FileCheck,
  Building,
  Wrench,
  Droplet,
  Users,
  Briefcase,
  FileDown
} from 'lucide-react';

export interface ChartTabItem {
  id: string;
  type: 'property' | 'permit' | 'legislative' | 'business' | 'project';
  label: string;
}

interface ChartingSystemProps {
  tabs: ChartTabItem[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business' | 'project', id: string) => void;
  currentProfile: any;
  addNotification: (message: string) => void;
}

export const ChartingSystem: React.FC<ChartingSystemProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onOpenChart,
  currentProfile,
  addNotification
}) => {
  // Store sub-tab active selections per open record ID to maintain workspace context
  const [subTabs, setSubTabs] = useState<Record<string, string>>({});

  if (tabs.length === 0 || !activeTabId) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.05)',
        color: 'var(--text-muted)',
        gap: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '2px dashed var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FileText size={28} />
        </div>
        <div>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Workspace Empty</h3>
          <p style={{ fontSize: '0.8rem', marginTop: '4px', maxWidth: '320px' }}>
            Open a record from search, the GIS map, or Munevo Command to view it in the unified workspace.
          </p>
        </div>
      </div>
    );
  }

  const activeTab = tabs.find(t => t.id === activeTabId);

  const getSubTab = (id: string, defaultTab = 'summary') => {
    return subTabs[id] || defaultTab;
  };

  const setSubTab = (id: string, value: string) => {
    setSubTabs(prev => ({ ...prev, [id]: value }));
  };

  // Render Property Chart content
  const renderPropertyChart = (id: string) => {
    const prop = PROPERTIES[id];
    if (!prop) return <p style={{ padding: '20px' }}>Property not found.</p>;

    const propPermits = Object.values(PERMITS).filter(p => p.propertyId === id);
    const propViolations = Object.values(VIOLATIONS).filter(v => v.propertyId === id);
    const propInspections = Object.values(INSPECTIONS).filter(i => i.propertyId === id);
    const prop311 = TRACKER_ITEMS.filter(item => item.address === prop.address && item.module === '311');

    const activeSub = getSubTab(id, 'summary');

    const propertySubTabs = [
      { id: 'summary', label: 'Summary' },
      { id: 'parcel', label: 'Parcel & Ownership' },
      { id: 'permits', label: 'Permits & Inspections' },
      { id: 'violations', label: 'Violations & Code' },
      { id: 'operations', label: '311 & Work Orders' },
      { id: 'utilities', label: 'Utilities & Bills' },
      { id: 'planning', label: 'Planning & Zoning' },
      { id: 'documents', label: 'Documents & GIS' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header banner with Digital Twin Badge & Timeline Scrubber */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '14px 18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-status badge-success pulse-emerald">🏢 Digital Twin Property</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>UUID: {prop.id} • Newark Ward 2</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '4px' }}>{prop.address}</h3>
          </div>

          {/* Interactive Historical Timeline Scrubber (2020 - 2026) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '220px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              <span>HISTORICAL SCRUBBER</span>
              <span style={{ color: 'var(--primary-color)' }}>JULY 2026 (PRESENT)</span>
            </div>
            <input 
              type="range" 
              min="2020" 
              max="2026" 
              defaultValue="2026" 
              className="timeline-scrubber"
              onChange={(e) => addNotification(`Scrubbed Digital Twin state to year ${e.target.value}.`)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
              <span>2020</span>
              <span>2022</span>
              <span>2024</span>
              <span>2026</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assessed Valuation</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '2px' }}>
              $425,000
            </div>
          </div>
        </div>

        {/* Horizontal Sub-tabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', overflowX: 'auto' }}>
          {propertySubTabs.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSubTab(id, sub.id)}
              style={{
                background: 'transparent',
                border: 0,
                borderBottom: activeSub === sub.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: activeSub === sub.id ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: activeSub === sub.id ? 700 : 500,
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ marginTop: '4px' }}>
          {activeSub === 'summary' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="card-title">Property Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                  <div className="property-item">
                    <span className="property-label">Primary Owner</span>
                    <span className="property-value">{prop.ownerName}</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Occupancy Status</span>
                    <span className="property-value" style={{ color: '#10b981' }}>Occupied (Verified)</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Total Permits Logged</span>
                    <span className="property-value">{propPermits.length}</span>
                  </div>
                  <div className="property-item">
                    <span className="property-label">Code Enforcement Violations</span>
                    <span className="property-value" style={{ color: propViolations.length > 0 ? 'var(--danger-text)' : 'inherit' }}>
                      {propViolations.length} Active
                    </span>
                  </div>
                </div>
              </div>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="card-title">Quick Actions</div>
                <button 
                  className="ai-btn-send" 
                  style={{ width: '100%', height: '32px', fontSize: '0.75rem' }}
                  onClick={() => addNotification('Triggered structural re-inspection request.')}
                >
                  Schedule Safety Re-Inspection
                </button>
                <button 
                  className="tab-btn" 
                  style={{ width: '100%', height: '32px', fontSize: '0.75rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                  onClick={() => onOpenChart('business', 'DCF Developers, LLC')}
                >
                  View Associated Business Profile
                </button>
              </div>
            </div>
          )}

          {activeSub === 'parcel' && (
            <div className="glass-card">
              <div className="card-title">Tax Assessment & Parcel Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '0.8rem', marginTop: '10px' }}>
                <div className="property-item">
                  <span className="property-label">Block Number</span>
                  <span className="property-value">102</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Lot Number</span>
                  <span className="property-value">14</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Zoning Code</span>
                  <span className="property-value">R-4 Multi-Family Residential</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Ward Region</span>
                  <span className="property-value">Central Ward</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Tax District</span>
                  <span className="property-value">Council District 2</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Address Normalization</span>
                  <span className="property-value">{prop.address}</span>
                </div>
              </div>
            </div>
          )}

          {activeSub === 'permits' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass-card">
                <div className="card-title">Building Permits ({propPermits.length})</div>
                <div className="list-queue">
                  {propPermits.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '10px' }}>No permits logged.</div>
                  ) : (
                    propPermits.map(p => (
                      <div key={p.id} className="queue-item" onClick={() => onOpenChart('permit', p.id)}>
                        <div className="queue-details">
                          <span className="queue-title">{p.permitNumber} ({p.type})</span>
                          <span className="queue-sub">Submitted: {p.submittedDate} • Value: ${p.estimatedCost.toLocaleString()}</span>
                        </div>
                        <span className={`badge-status ${p.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>
                          {p.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="glass-card">
                <div className="card-title">Field Inspection Logs ({propInspections.length})</div>
                <div className="list-queue">
                  {propInspections.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '10px' }}>No inspections logged.</div>
                  ) : (
                    propInspections.map(i => (
                      <div key={i.id} className="queue-item">
                        <div className="queue-details">
                          <span className="queue-title">{i.type}</span>
                          <span className="queue-sub">Inspector: {i.inspectorName} • Date: {i.scheduledDate}</span>
                        </div>
                        <span className={`badge-status ${i.status === 'Passed' ? 'badge-success' : 'badge-danger'}`}>
                          {i.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSub === 'violations' && (
            <div className="glass-card">
              <div className="card-title">Code Enforcement Violations ({propViolations.length})</div>
              <div className="list-queue">
                {propViolations.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '10px' }}>No active violations.</div>
                ) : (
                  propViolations.map(v => (
                    <div key={v.id} className="queue-item">
                      <div className="queue-details">
                        <span className="queue-title" style={{ color: 'var(--danger-text)' }}>{v.caseNumber} • {v.violationType}</span>
                        <span className="queue-sub">{v.description} • Fines Outstanding: ${v.fineAmount}</span>
                      </div>
                      <span className={`badge-status ${v.status === 'Abated' ? 'badge-success' : 'badge-danger'}`}>
                        {v.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSub === 'operations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass-card">
                <div className="card-title">Constituent 311 Reports ({prop311.length})</div>
                <div className="list-queue">
                  {prop311.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '10px' }}>No active 311 cases.</div>
                  ) : (
                    prop311.map(item => (
                      <div key={item.id} className="queue-item" onClick={() => onOpenChart('permit', 'perm_03')}>
                        <div className="queue-details">
                          <span className="queue-title">{item.title}</span>
                          <span className="queue-sub">Reported: {item.reportedDate} • Assigned to: {item.assignedTo}</span>
                        </div>
                        <span className="badge-status badge-primary">{item.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSub === 'utilities' && (
            <div className="glass-card">
              <div className="card-title">Water & Sewer Utility Accounts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', marginTop: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#fff', display: 'block' }}>Account W-90234 (Municipal Water Service)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Status: Active • Current Meter Reading: 3,420 CF</span>
                  </div>
                  <span style={{ color: 'var(--warning-text)', fontWeight: 700 }}>$84.50 Outstanding</span>
                </div>
              </div>
            </div>
          )}

          {activeSub === 'planning' && (
            <div className="glass-card">
              <div className="card-title">Planning & Zoning Board Decisions</div>
              <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#fff' }}>
                  <span>Zoning Setback Variance Case PL-2026-0043</span>
                  <span style={{ color: '#10b981' }}>Approved</span>
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>Scope: Setback Variance Approval for Auxiliary Mechanical Facade Netting Enclosure. Signed off: 2026-05-10.</span>
              </div>
            </div>
          )}

          {activeSub === 'documents' && (
            <div className="glass-card">
              <div className="card-title">Property Documents Vault</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
                {[
                  { name: 'Approved_Site_Plan_Drawings.pdf', size: '14.2 MB' },
                  { name: 'Structural_Tuckpointing_Methodology.pdf', size: '2.8 MB' },
                  { name: 'Water_Service_Backflow_Certificate.pdf', size: '840 KB' }
                ].map((doc, idx) => (
                  <div key={idx} style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} style={{ color: 'var(--primary-color)' }} />
                      <span style={{ fontWeight: 600, color: '#fff' }}>{doc.name}</span>
                    </div>
                    <button style={{ background: 'transparent', border: 0, padding: 0, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <FileDown size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Permit Chart content
  const renderPermitChart = (id: string) => {
    const perm = PERMITS[id];
    if (!perm) return <p style={{ padding: '20px' }}>Permit not found.</p>;

    const prop = PROPERTIES[perm.propertyId];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-status badge-primary">{perm.type} Permit</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {perm.id}</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>{perm.permitNumber}</h3>
            {prop && (
              <div 
                onClick={() => onOpenChart('property', prop.id)}
                style={{ fontSize: '0.85rem', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
              >
                <span>{prop.address}</span>
                <ExternalLink size={10} />
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Cost & Fees</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              Val: ${perm.estimatedCost.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--success-text)' }}>Fee Paid: ${perm.feePaid}</span>
          </div>
        </div>

        {/* Workflow Progress */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">Workflow Progress Tracker</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', position: 'relative' }}>
            {/* Horizontal Line backdrop */}
            <div style={{
              position: 'absolute',
              left: '10%',
              right: '10%',
              top: '15px',
              height: '2px',
              background: 'var(--border-color)',
              zIndex: 1
            }} />

            {perm.workflowSteps.map((step, index) => {
              const isCompleted = step.status === 'Completed';
              const isInProgress = step.status === 'In Progress';
              const color = isCompleted 
                ? 'var(--success-text)' 
                : isInProgress 
                ? 'var(--warning-text)' 
                : 'var(--text-muted)';

              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--success)' : isInProgress ? 'var(--warning-glow)' : 'var(--bg-card)',
                    border: `2px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    boxShadow: isInProgress ? '0 0 10px var(--warning)' : 'none'
                  }}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', color }}>{step.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{step.assignedTo}</span>
                    {step.completedDate && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--success-text)', display: 'block' }}>{step.completedDate}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scope and audit info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Permit Scope & Specs</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="property-item">
                <span className="property-label">Description of Scope</span>
                <span className="property-value" style={{ fontWeight: 'normal', lineHeight: 1.5 }}>{perm.description}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="property-item">
                  <span className="property-label">File Intake Date</span>
                  <span className="property-value">{perm.submittedDate}</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Issuance Date</span>
                  <span className="property-value">{perm.issuedDate || 'Pending review'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Audit Logs & History</div>
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-node success" />
                <div className="timeline-info">
                  <span className="timeline-date">{perm.submittedDate}</span>
                  <span className="timeline-title">Intake Verified</span>
                  <span className="timeline-desc">Assigned checklist validated. Fee calculated.</span>
                </div>
              </div>
              {perm.issuedDate && (
                <div className="timeline-item">
                  <div className="timeline-node success" />
                  <div className="timeline-info">
                    <span className="timeline-date">{perm.issuedDate}</span>
                    <span className="timeline-title">Permit Certificate Issued</span>
                    <span className="timeline-desc">Authorized code work allowed.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Legislative Meeting Agenda Chart
  const renderLegislativeChart = (id: string) => {
    const leg = LEGISLATIVE_ITEMS.find(item => item.id === id);
    if (!leg) return <p style={{ padding: '20px' }}>Legislative item not found.</p>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-status badge-warn">Agenda Item {leg.agendaNumber}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Meeting Date: {leg.meetingDate}</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '6px' }}>{leg.title}</h3>
          </div>
          <span className="badge-status badge-primary">{leg.status}</span>
        </div>

        {/* Linked Entities (Legislative Intelligence!) */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
          <div className="card-header">
            <div className="card-title">
              <Sparkles className="brand-gradient-text" size={16} />
              <span>Legislative Intelligence Linkages</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Munevo automatically parses council agenda transcripts and links them to records, developers, and properties:
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {leg.linkedEntities.map((ent, i) => (
              <div 
                key={i} 
                className="queue-item"
                onClick={() => {
                  if (ent.type === 'Property') onOpenChart('property', ent.id);
                }}
                style={{ padding: '10px 14px', flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: ent.type === 'Property' ? 'pointer' : 'default' }}
              >
                <div style={{
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '4px', 
                  background: 'var(--primary-glow)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {ent.type === 'Property' ? <MapPin size={12} /> : <User size={12} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ent.label}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Type: {ent.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">Official Item Transcript</div>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            {leg.description}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Department Action:</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>Executive Administration / Redevelopment Agency</span>
          </div>
        </div>
      </div>
    );
  };

  // Render Business Chart content (for DCF Developers, LLC etc.)
  const renderBusinessChart = (id: string) => {
    const activeSub = getSubTab(id, 'summary');

    const businessSubTabs = [
      { id: 'summary', label: 'Summary' },
      { id: 'locations', label: 'Locations' },
      { id: 'permits', label: 'Licenses & Permits' },
      { id: 'inspections', label: 'Inspections & Compliance' },
      { id: 'contracts', label: 'Contracts & Documents' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-status badge-success">Registered Business UDM</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sector: Real Estate & Construction</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '6px' }}>{id}</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compliance Rating</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-text)', marginTop: '2px' }}>
              Grade A
            </div>
          </div>
        </div>

        {/* Subtabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', overflowX: 'auto' }}>
          {businessSubTabs.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSubTab(id, sub.id)}
              style={{
                background: 'transparent',
                border: 0,
                borderBottom: activeSub === sub.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: activeSub === sub.id ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: activeSub === sub.id ? 700 : 500,
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {sub.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '4px' }}>
          {activeSub === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.08)',
                border: '1px dashed rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.25)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <Sparkles className="brand-gradient-text" size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                  <strong style={{ color: 'var(--accent-color)' }}>Munevo AI Developer Synthesis:</strong> **DCF Developers, LLC** is active in the **West Ward Redevelopment Project**. They currently own properties at **125 Market St** and **129 Market St**. Active building permit **BP-2026-0145** is logged. Initial Site Inspection passed successfully on 2026-06-01. Resolution **26-0356** is pending action for redevelopment contract approvals.
                </div>
              </div>
              <div className="glass-card" style={{ fontSize: '0.8rem' }}>
                <div className="card-title">Registration Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div className="property-item">
                    <span className="property-label">Entity Status</span>
                    <span className="property-value" style={{ color: '#10b981' }}>Active / Compliant</span>
                  </div>
                  <span className="property-item">
                    <span className="property-label">Business Registration #</span>
                    <span className="property-value">CORP-2024-8931</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSub === 'locations' && (
            <div className="glass-card">
              <div className="card-title">Properties Owned / Storefronts</div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => onOpenChart('property', 'prop_05')}
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', textDecoration: 'underline', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  125 Market Street
                </button>
                <button 
                  onClick={() => onOpenChart('property', 'prop_06')}
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', textDecoration: 'underline', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  129 Market Street
                </button>
              </div>
            </div>
          )}

          {activeSub === 'permits' && (
            <div className="glass-card">
              <div className="card-title">Associated Permits & Licenses</div>
              <div className="tracker-table-container">
                <table className="tracker-table" style={{ fontSize: '0.75rem', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Record Type</th>
                      <th>Ref Number</th>
                      <th>Purpose</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr onClick={() => onOpenChart('permit', 'perm_06')} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-color)', textDecoration: 'underline' }}>Building Permit</td>
                      <td>BP-2026-0145</td>
                      <td>Foundation construction (125 Market St)</td>
                      <td>
                        <span className="badge-status badge-primary" style={{ fontSize: '0.65rem' }}>Issued</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSub === 'inspections' && (
            <div className="glass-card">
              <div className="card-title">Safety Inspections History</div>
              <div className="tracker-table-container">
                <table className="tracker-table" style={{ fontSize: '0.75rem', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Purpose</th>
                      <th>Inspector</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>insp_06</td>
                      <td>Initial Site Inspection (Passed on 2026-06-01)</td>
                      <td>Elena Rostova</td>
                      <td>
                        <span className="badge-status badge-success" style={{ fontSize: '0.65rem' }}>Passed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSub === 'contracts' && (
            <div className="glass-card">
              <div className="card-title">Developer Contracts Vault</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', marginTop: '10px' }}>
                <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✓ Redevelopment Agreement</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--success-text)' }}>RDA-2025-0012</span>
                </div>
                <div 
                  onClick={() => onOpenChart('legislative', 'LEG-2026-007')}
                  style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>✓ Council Resolution</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>RES-2026-0356</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Project Workspace (Munevo Capital Projects)
  const renderProjectChart = (id: string) => {
    const activeSub = getSubTab(id, 'summary');
    const isFacade = id === 'proj_02';

    const projectSubTabs = [
      { id: 'summary', label: 'Summary' },
      { id: 'properties', label: 'Properties Linked' },
      { id: 'funding', label: 'Funding & Contracts' },
      { id: 'milestones', label: 'Milestones & Tasks' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-status badge-primary">Capital Infra Project</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {isFacade ? 'PROJ-FAC-01' : 'PROJ-WAT-02'}</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>
              {isFacade ? 'Washington St Facade Grants Program' : 'Ferry Street Water Line Relining'}
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overall Progress</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '2px' }}>
              {isFacade ? '35% Active' : '75% Complete'}
            </div>
          </div>
        </div>

        {/* Subtabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', overflowX: 'auto' }}>
          {projectSubTabs.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSubTab(id, sub.id)}
              style={{
                background: 'transparent',
                border: 0,
                borderBottom: activeSub === sub.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: activeSub === sub.id ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: activeSub === sub.id ? 700 : 500,
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {sub.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '4px' }}>
          {activeSub === 'summary' && (
            <div className="glass-card" style={{ fontSize: '0.8rem' }}>
              <div className="card-title">Project Scope Description</div>
              <p style={{ marginTop: '8px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {isFacade 
                  ? 'Providing structural improvements, exterior facades remediation, and energy retrofit grants to properties along the Washington Street corridor.'
                  : 'Upgrading the municipal water booster pumps and relining the major sewer mains along the Ferry Street corridor to guarantee PSI pressure compliance.'
                }
              </p>
            </div>
          )}

          {activeSub === 'properties' && (
            <div className="glass-card">
              <div className="card-title">Properties Linked to Project</div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => onOpenChart('property', isFacade ? 'prop_02' : 'prop_03')}
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', textDecoration: 'underline', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  {isFacade ? '15 Washington St' : '42 Ferry St'}
                </button>
              </div>
            </div>
          )}

          {activeSub === 'funding' && (
            <div className="glass-card">
              <div className="card-title">Funding Allocations & Contracts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', marginTop: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#fff', display: 'block' }}>Resolution Allocation RES-2026-004</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Sponsor: Redevelopment Agency</span>
                  </div>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>$35,000 Allocated</span>
                </div>
              </div>
            </div>
          )}

          {activeSub === 'milestones' && (
            <div className="glass-card">
              <div className="card-title">Project Milestones & Task Checklist</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span>Task 1: Civil engineering site survey checklist</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Completed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span>Task 2: Procurement of structural materials</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Completed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span>Task 3: Phase 1 onsite masonry excavation</span>
                  <span style={{ color: 'var(--warning-text)', fontWeight: 700 }}>In Progress</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chart-workspace-container" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Chart Content Area with Side-by-Side message thread */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
        <div className="chart-content" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeTab?.type === 'property' && renderPropertyChart(activeTab.id)}
          {activeTab?.type === 'permit' && renderPermitChart(activeTab.id)}
          {activeTab?.type === 'legislative' && renderLegislativeChart(activeTab.id)}
          {activeTab?.type === 'business' && renderBusinessChart(activeTab.id)}
          {activeTab?.type === 'project' && renderProjectChart(activeTab.id)}
        </div>
        
        {activeTab && (
          <CaseNotesSidebar 
            recordType={activeTab.type}
            recordId={activeTab.id}
            currentProfile={currentProfile}
            addNotification={addNotification}
          />
        )}
      </div>
    </div>
  );
};

const CaseNotesSidebar: React.FC<{
  recordType: string;
  recordId: string;
  currentProfile: any;
  addNotification: (message: string) => void;
}> = ({ recordType, recordId, currentProfile, addNotification }) => {
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');
  const orgId = currentProfile?.organizationId || '';
  
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/case-comments/${recordType}/${recordId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [recordType, recordId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentProfile) return;
    try {
      const res = await fetch(`${API_URL}/api/case-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          authorId: currentProfile.id,
          authorName: currentProfile.email.split('@')[0],
          authorEmail: currentProfile.email,
          authorOfficeId: currentProfile.districtOfficeId || null,
          recordType,
          recordId,
          message: newComment
        })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ width: '300px', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: '#0b0c10', height: '100%' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
        <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>
          Record Discussion Thread
        </h4>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
          In-context staff notes attached to this {recordType}
        </span>
      </div>

      {/* Message List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center' }}>Syncing thread...</div>
        ) : comments.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
            No comments logged. Type a note to start.
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
                  {c.authorName.replace('.', ' ')}
                </span>
                {c.authorOffice?.name && (
                  <span style={{ fontSize: '8px', padding: '1px 4px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '3px', color: '#60a5fa' }}>
                    {c.authorOffice.name.split(' ')[0]}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                {c.message}
              </p>
              <span style={{ fontSize: '8px', color: 'var(--text-muted)', alignSelf: 'flex-end', marginTop: '2px' }}>
                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendComment} style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.2)' }}>
        <input 
          type="text" 
          className="ai-input" 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)} 
          placeholder="Type note..." 
          style={{ flex: 1, fontSize: '11px', height: '28px', padding: '0 8px' }}
        />
        <button type="submit" className="ai-btn-send" style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}>
          Post
        </button>
      </form>
    </div>
  );
};
