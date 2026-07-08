import React, { useState } from 'react';
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
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Send, 
  DollarSign, 
  Building,
  User,
  Plus,
  Gavel,
  Briefcase,
  Calendar,
  Compass
} from 'lucide-react';

interface CommandCenterProps {
  currentRole: UserRole;
  onOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => void;
  // Tracker items list managed at parent level to support additions
  trackerItems: TrackerItem[];
  setTrackerItems: React.Dispatch<React.SetStateAction<TrackerItem[]>>;
  addNotification: (message: string) => void;
  // Callback when a permit/violation is updated
  onUpdatePermit: (id: string, updated: Partial<PermitRecord>) => void;
  onUpdateInspection: (id: string, updated: Partial<InspectionRecord>) => void;
  canEdit?: boolean;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  currentRole,
  onOpenChart,
  trackerItems,
  setTrackerItems,
  addNotification,
  onUpdatePermit,
  onUpdateInspection,
  canEdit = true
}) => {
  // Local states for forms
  const [newRequestAddress, setNewRequestAddress] = useState('42 Ferry St, Newark, NJ');
  const [newRequestType, setNewRequestType] = useState('Trash & Debris');
  const [newRequestDesc, setNewRequestDesc] = useState('');

  const [activeInspectionId, setActiveInspectionId] = useState<string | null>('insp_03'); // Default to structural inspection
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [inspectorChecks, setInspectorChecks] = useState({
    masonry: false,
    netting: false,
    clearance: false
  });

  // Handle submitting 311 request
  const handleSubmit311 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestDesc.trim()) return;

    const newId = `TRK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: TrackerItem = {
      id: newId,
      module: '311',
      title: `${newRequestType} reported.`,
      status: 'Open',
      priority: newRequestType === 'Structural Hazard' ? 'High' : 'Medium',
      assignedTo: 'Public Works Operations',
      slaDays: newRequestType === 'Structural Hazard' ? 1 : 4,
      slaProgress: 0,
      reportedDate: new Date().toISOString().split('T')[0],
      address: newRequestAddress,
      comments: [
        { user: 'Resident (MyMunevo)', text: newRequestDesc, date: 'Just now' }
      ],
      history: [
        { action: 'Ticket Created via MyMunevo', user: 'Resident', date: 'Just now' },
        { action: 'Assigned to Public Works Operations', user: 'Auto-Routing AI', date: 'Just now' }
      ],
      attachments: [],
      relatedRecords: [],
      customFields: {
        'SLA Category': 'Resident 311 Intake',
        'Incident Type': newRequestType
      }
    };

    setTrackerItems(prev => [newItem, ...prev]);
    addNotification(`Successfully submitted 311 request ${newId}!`);
    setNewRequestDesc('');
  };

  // Handle Inspector submitting report
  const handleInspectionSubmit = (status: 'Passed' | 'Failed') => {
    if (!activeInspectionId) return;

    onUpdateInspection(activeInspectionId, {
      status,
      notes: inspectorNotes || `Inspection completed. Result: ${status}. Checks: ${JSON.stringify(inspectorChecks)}`
    });

    // If inspection is linked to a permit, progress the permit workflow
    const inspection = INSPECTIONS[activeInspectionId];
    if (inspection?.permitId) {
      const permit = PERMITS[inspection.permitId];
      if (permit) {
        const updatedSteps = permit.workflowSteps.map(step => {
          if (step.name === 'Inspections') {
            return { ...step, status: status === 'Passed' ? 'Completed' as const : 'In Progress' as const, completedDate: status === 'Passed' ? new Date().toISOString().split('T')[0] : undefined };
          }
          if (step.name === 'Final Sign-off' && status === 'Passed') {
            return { ...step, status: 'In Progress' as const };
          }
          return step;
        });

        onUpdatePermit(inspection.permitId, {
          status: status === 'Passed' ? 'Approved' : 'Issued',
          workflowSteps: updatedSteps
        });
      }
    }

    addNotification(`Inspection ${activeInspectionId} logged as ${status}`);
    setInspectorNotes('');
    setActiveInspectionId(null);
  };

  // Render role-specific dashboards
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          Welcome back, <span className="brand-gradient-text">Naeem</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {currentRole.description}
        </p>
      </div>

      {/* Stats Cards (Role specific) */}
      <div className="grid-metrics">
        {currentRole.commandCenter.metrics.map((metric, i) => (
          <div key={i} className={`metric-card metric-status-${metric.status || 'normal'}`}>
            <span className="metric-label">{metric.label}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="metric-value">{metric.value}</span>
              {metric.trend && <span className="metric-trend">{metric.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Role Dashboard Layouts */}
      {currentRole.id === 'mayor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Executive briefing */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
            <div className="card-header">
              <div className="card-title">
                <Sparkles className="brand-gradient-text" size={16} />
                <span>AI Daily Executive Briefing</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Updated 10m ago</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              Good afternoon Mayor. The City of Newark SLA health is at <strong>94%</strong>. One critical incident remains unresolved: a deteriorating entry awning at <strong>105 Market St</strong>. Building Inspector Marcus Miller is scheduled for an emergency site inspection at 2:00 PM today.
              Additionally, <strong>LEG-2026-004</strong> (Redevelopment Grant for 15 Washington St) has been added to the July 9th council agenda. No budget overruns detected.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Critical Approvals */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Pending Executive Approvals</div>
              </div>
              <div className="list-queue">
                <div className="queue-item" onClick={() => onOpenChart('permit', 'perm_03')}>
                  <div className="queue-details">
                    <span className="queue-title">Water Booster Pump Installation</span>
                    <span className="queue-sub">15 Washington St • Est. Cost: $35,000</span>
                  </div>
                  <span className="badge-status badge-warn">In Review</span>
                </div>
                <div className="queue-item" onClick={() => onOpenChart('permit', 'perm_04')}>
                  <div className="queue-details">
                    <span className="queue-title">Stained Glass Restoration (City Hall)</span>
                    <span className="queue-sub">920 Broad St • Est. Cost: $85,000</span>
                  </div>
                  <span className="badge-status badge-primary">Applied</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Executive Shortcuts</div>
              </div>
              <div className="quick-actions-grid">
                <button className="btn-action" onClick={() => onOpenChart('legislative', 'LEG-2026-004')}>
                  <Building size={16} />
                  <span>Review 15 Wash. Resolution</span>
                </button>
                <button className="btn-action" onClick={() => onOpenChart('property', 'prop_04')}>
                  <AlertTriangle size={16} style={{ color: 'var(--danger-text)' }} />
                  <span>Examine 105 Market Case</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentRole.id === 'inspector' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          {/* Scheduled list and execution form */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Today's Inspection Routing Schedule</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.values(INSPECTIONS)
                  .filter(insp => insp.scheduledDate === '2026-07-07')
                  .map(insp => {
                    const isSelected = activeInspectionId === insp.id;
                    const prop = PROPERTIES[insp.propertyId];
                    return (
                      <div 
                        key={insp.id} 
                        onClick={() => {
                          setActiveInspectionId(insp.id);
                          setInspectorNotes(insp.notes);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: isSelected ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.15)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{insp.type} Inspection ({insp.id})</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{prop?.address}</span>
                        </div>
                        <span className={`badge-status ${insp.status === 'Passed' ? 'badge-success' : insp.status === 'Failed' ? 'badge-danger' : 'badge-warn'}`}>
                          {insp.status}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {activeInspectionId && (
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                    File Field Notes: {activeInspectionId}
                  </h4>
                  
                  {activeInspectionId === 'insp_03' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                        <input 
                          type="checkbox" 
                          checked={inspectorChecks.masonry} 
                          onChange={(e) => setInspectorChecks(c => ({ ...c, masonry: e.target.checked }))} 
                        />
                        Brick tuckpointing checks complete and compliant
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                        <input 
                          type="checkbox" 
                          checked={inspectorChecks.netting} 
                          onChange={(e) => setInspectorChecks(c => ({ ...c, netting: e.target.checked }))} 
                        />
                        Scaffolding debris safety mesh fully anchored
                      </label>
                    </div>
                  )}

                  {activeInspectionId === 'insp_05' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                        <input 
                          type="checkbox" 
                          checked={inspectorChecks.clearance} 
                          onChange={(e) => setInspectorChecks(c => ({ ...c, clearance: e.target.checked }))} 
                        />
                        Sidewalk right-of-way secured under hazard area
                      </label>
                    </div>
                  )}

                  <textarea
                    className="ai-input"
                    style={{ minHeight: '80px', width: '100%' }}
                    placeholder="Enter inspection field observations..."
                    value={inspectorNotes}
                    onChange={(e) => setInspectorNotes(e.target.value)}
                  />

                  <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                    <button 
                      className="ai-btn-send" 
                      style={{ backgroundColor: 'var(--danger)', border: '1px solid var(--danger)' }}
                      onClick={() => handleInspectionSubmit('Failed')}
                    >
                      Fail & Log Violation
                    </button>
                    <button 
                      className="ai-btn-send"
                      onClick={() => handleInspectionSubmit('Passed')}
                    >
                      Pass & Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Open Permits */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Assigned Permits</div>
            </div>
            <div className="list-queue">
              {Object.values(PERMITS)
                .filter(perm => perm.status === 'Issued' || perm.status === 'In Review')
                .map(perm => (
                  <div key={perm.id} className="queue-item" onClick={() => onOpenChart('permit', perm.id)}>
                    <div className="queue-details">
                      <span className="queue-title">{perm.permitNumber}</span>
                      <span className="queue-sub">{perm.type} • {PROPERTIES[perm.propertyId]?.address}</span>
                    </div>
                    <span className="badge-status badge-primary">{perm.status}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {currentRole.id === 'resident' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Submit 311 Request */}
          <div className="glass-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">
                <Plus size={16} />
                <span>Submit a 311 Service Request</span>
              </div>
              {!canEdit && (
                <span style={{ fontSize: '10px', color: 'var(--warning-text)', padding: '2px 8px', background: 'rgba(245,158,11,0.1)', borderRadius: '4px' }}>
                  Locked
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit311} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location Address</label>
                <select 
                  className="select-filter" 
                  value={newRequestAddress} 
                  onChange={(e) => setNewRequestAddress(e.target.value)}
                  disabled={!canEdit}
                >
                  {Object.values(PROPERTIES).map(p => (
                    <option key={p.id} value={p.address}>{p.address}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Request Type</label>
                <select 
                  className="select-filter" 
                  value={newRequestType} 
                  onChange={(e) => setNewRequestType(e.target.value)}
                  disabled={!canEdit}
                >
                  <option value="Trash & Debris">Trash & Debris</option>
                  <option value="Water Pressure / Leak">Water Pressure & Leak</option>
                  <option value="Illegal Parking">Illegal Parking</option>
                  <option value="Structural Hazard">Structural Hazard</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incident Details</label>
                <textarea
                  className="ai-input"
                  style={{ minHeight: '70px', width: '100%' }}
                  placeholder={canEdit ? "Describe the issue you noticed..." : "Submissions are currently locked."}
                  value={newRequestDesc}
                  onChange={(e) => setNewRequestDesc(e.target.value)}
                  required
                  disabled={!canEdit}
                />
              </div>

              <button type="submit" className="ai-btn-send" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={!canEdit}>
                <Send size={12} />
                <span>Submit 311 Ticket</span>
              </button>
            </form>
          </div>

          {/* Resident Accounts & Bills */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">MyMunevo Bills & Documents</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Water Utility (W-042-302)</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning-text)' }}>$84.50 Due</span>
                </div>
                <button 
                  className="ai-btn-send"
                  style={{ height: '36px' }}
                  onClick={() => {
                    addNotification('Water utility payment of $84.50 processed successfully!');
                  }}
                >
                  Pay Now
                </button>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Property Tax (Account #23908)</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-text)' }}>$0.00 Due</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Paid • July 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Municipal Clerk Command Center */}
      {currentRole.id === 'clerk' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">
                <Calendar size={14} style={{ color: 'var(--primary-color)' }} />
                <span>Upcoming Council Meetings Docket</span>
              </div>
            </div>
            <div className="list-queue">
              <div className="queue-item" onClick={() => onOpenChart('legislative', 'LEG-2026-004')}>
                <div className="queue-details">
                  <span className="queue-title">Resolution IX.B.1 (15 Washington St Facade Grant)</span>
                  <span className="queue-sub">Hearing Date: 2026-07-09 • Zoning & Landmarks</span>
                </div>
                <span className="badge-status badge-warn">Pending Hearing</span>
              </div>
              <div className="queue-item" onClick={() => onOpenChart('legislative', 'LEG-2026-007')}>
                <div className="queue-details">
                  <span className="queue-title">Resolution IX.B.2 (DCF Developers West Ward Redevelopment)</span>
                  <span className="queue-sub">Hearing Date: 2026-07-09 • Economic Development</span>
                </div>
                <span className="badge-status badge-warn">Pending Hearing</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Legislative Quick Actions</div>
              </div>
              <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <button className="btn-action" onClick={() => addNotification('Public Hearing notice posted to city board.')}>
                  <Send size={12} />
                  <span>Publish Public notices</span>
                </button>
                <button className="btn-action" onClick={() => addNotification('Ordinance vote certification ledger exported.')}>
                  <CheckCircle size={12} style={{ color: 'var(--success-text)' }} />
                  <span>Certify Ordinance Vote</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finance Director Command Center */}
      {currentRole.id === 'finance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">
                <DollarSign size={14} style={{ color: 'var(--success-text)' }} />
                <span>PILOT & Redevelopment Abatements Ledger</span>
              </div>
            </div>
            <div className="list-queue">
              <div className="queue-item" onClick={() => onOpenChart('business', 'DCF Developers, LLC')}>
                <div className="queue-details">
                  <span className="queue-title">West Ward PILOT Agreement: DCF Developers, LLC</span>
                  <span className="queue-sub">125 & 129 Market St • Code Compliance Grade A</span>
                </div>
                <span className="badge-status badge-success">Enrolled</span>
              </div>
              <div className="queue-item" onClick={() => onOpenChart('property', 'prop_04')}>
                <div className="queue-details">
                  <span className="queue-title">Opportunity Zone Abatement: 105 Market St</span>
                  <span className="queue-sub">Market Street Realty • Tax Status: Delinquent</span>
                </div>
                <span className="badge-status badge-danger">Lien Eligible</span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Financial Approval Queue</div>
            </div>
            <div className="list-queue">
              <div className="queue-item" onClick={() => onOpenChart('permit', 'perm_03')}>
                <div className="queue-details">
                  <span className="queue-title">Requisition: Water Pump Booster ($35,000)</span>
                  <span className="queue-sub">Economic Development Grant Allocation</span>
                </div>
                <button 
                  className="ai-btn-send"
                  style={{ height: '24px', fontSize: '0.65rem', padding: '0 8px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addNotification('Authorized water pump requisition of $35,000.');
                  }}
                >
                  Authorize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Planner & Zoning Command Center */}
      {currentRole.id === 'planner' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">
                <Briefcase size={14} style={{ color: 'var(--primary-color)' }} />
                <span>Zoning Variance & Site Plan Queue</span>
              </div>
            </div>
            <div className="list-queue">
              <div className="queue-item" onClick={() => onOpenChart('permit', 'perm_05')}>
                <div className="queue-details">
                  <span className="queue-title">Sidewalk Dining Table Variance (PM-2026-0298)</span>
                  <span className="queue-sub">42 Ferry St • Silva Bakery & Café</span>
                </div>
                <span className="badge-status badge-success">Approved</span>
              </div>
              <div className="queue-item" onClick={() => onOpenChart('business', 'DCF Developers, LLC')}>
                <div className="queue-details">
                  <span className="queue-title">West Ward Site Plan Clearance (Zoning Case PL-2026-0043)</span>
                  <span className="queue-sub">125 Market St • Three-family residential block</span>
                </div>
                <span className="badge-status badge-success">Approved</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <div className="card-header">
                <div className="card-title">
                  <Sparkles className="brand-gradient-text" size={14} />
                  <span>AI Master Plan Matcher</span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
                Zoning check for **Silva Bakery sidewalk dining variance (PM-2026-0298)** is compliant with the **Ironbound Special District Master Plan Guideline Section 12-A** (requires at least 5ft pedestrian walkway buffer).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Public Works Command Center */}
      {currentRole.id === 'public_works' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">
                <Compass size={14} style={{ color: 'var(--accent-color)' }} />
                <span>Today\'s Public Works Work Orders</span>
              </div>
            </div>
            <div className="list-queue">
              <div className="queue-item" onClick={() => onOpenChart('property', 'prop_03')}>
                <div className="queue-details">
                  <span className="queue-title">WO-8832: Repair main water booster connection</span>
                  <span className="queue-sub">42 Ferry St • Ironbound District • Priority: High</span>
                </div>
                <span className="badge-status badge-warn">Dispatched</span>
              </div>
              <div className="queue-item" onClick={() => onOpenChart('property', 'prop_04')}>
                <div className="queue-details">
                  <span className="queue-title">WO-9811: Secure exterior wooden entry hazards</span>
                  <span className="queue-sub">105 Market St • Downtown Center • Priority: High</span>
                </div>
                <span className="badge-status badge-primary">Assigned</span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Municipal Fleet & Utility GPS</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                <span>Water Repair Truck #2</span>
                <span style={{ color: 'var(--success-text)', fontWeight: 'bold' }}>Active on site (Ferry St)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                <span>Heavy Duty Crew Cab #4</span>
                <span style={{ color: 'var(--text-muted)' }}>Standby in depot</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
