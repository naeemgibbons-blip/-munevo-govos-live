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
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Send, 
  DollarSign, 
  Building,
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
  X
} from 'lucide-react';

interface CommandCenterProps {
  currentRole: UserRole;
  currentProfile: any;
  onOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => void;
  trackerItems: TrackerItem[];
  setTrackerItems: React.Dispatch<React.SetStateAction<TrackerItem[]>>;
  addNotification: (message: string) => void;
  onUpdatePermit: (id: string, updated: Partial<PermitRecord>) => void;
  onUpdateInspection: (id: string, updated: Partial<InspectionRecord>) => void;
  canEdit?: boolean;
  properties: any[];
  permits: any[];
  inspections: any[];
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
  inspections
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const orgId = currentProfile?.organizationId || '';

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

  // Verification Claim form states
  const [claimAddress, setClaimAddress] = useState('12 Ferry St, Newark, NJ');
  const [claimType, setClaimType] = useState('RESIDENT_PROPERTY');
  const [claimNotes, setClaimNotes] = useState('');
  const [claimStatusText, setClaimStatusText] = useState('');

  // Appointment Booking states
  const [apptDept, setApptDept] = useState("Mayor's Office");
  const [apptDate, setApptDate] = useState('2026-07-15T10:00');
  const [apptPurpose, setApptPurpose] = useState('');

  // Staff Walk-In logging states
  const [walkinName, setWalkinName] = useState('');
  const [walkinEmail, setWalkinEmail] = useState('');
  const [walkinPurpose, setWalkinPurpose] = useState('');
  const [walkinDept, setWalkinDept] = useState("Mayor's Office");
  const [escalateTo311, setEscalateTo311] = useState(false);

  // Open Records State for Clerk landing
  const [openRecords, setOpenRecords] = useState<any[]>([]);

  useEffect(() => {
    if (orgId && (currentRole.id === 'clerk' || currentProfile?.role?.name === 'City Clerk' || currentProfile?.role?.name === 'Compliance Officer')) {
      fetch(`${API_URL}/api/open-records`, {
        headers: { 'x-organization-id': orgId }
      })
      .then(res => res.json())
      .then(data => setOpenRecords(data))
      .catch(err => console.error('Failed to load open records in CommandCenter:', err));
    }
  }, [orgId, currentRole.id]);

  // Handle submitting 311 request
  const handleSubmit311 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestDesc.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/tracker`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          module: '311',
          title: `${newRequestType}: ${newRequestDesc}`,
          status: 'Open',
          priority: newRequestType === 'Structural Hazard' ? 'High' : 'Medium',
          assignedTo: 'Public Works Operations',
          slaDays: newRequestType === 'Structural Hazard' ? 2 : 7,
          address: newRequestAddress
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTrackerItems(prev => [data, ...prev]);
        addNotification(`Live database record registered: 311 Case ${data.id}!`);
        setNewRequestDesc('');
      } else {
        addNotification('Database Error: Failed to register 311 ticket.');
      }
    } catch (err) {
      console.error(err);
      addNotification('API connection error.');
    }
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

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile?.id) return;
    try {
      const res = await fetch(`${API_URL}/api/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          profileId: currentProfile.id,
          type: claimType,
          targetId: 'prop_02', // Default link to Ferry St property
          targetAddress: claimAddress,
          notes: claimNotes
        })
      });
      if (res.ok) {
        addNotification('Verification claim submitted. Awaiting clerk manual audit.');
        setClaimNotes('');
        setClaimStatusText('PENDING VERIFICATION');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          requesterName: getUserDisplayName(),
          requesterEmail: currentProfile?.email || 'resident@munevo.gov',
          department: apptDept,
          scheduledAt: apptDate,
          purpose: apptPurpose,
          type: 'APPOINTMENT'
        })
      });
      if (res.ok) {
        addNotification(`Meeting with ${apptDept} scheduled successfully!`);
        setApptPurpose('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) return;
    try {
      const resAppt = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          requesterName: walkinName,
          requesterEmail: walkinEmail || 'walkin@constituent.local',
          department: walkinDept,
          scheduledAt: new Date().toISOString(),
          purpose: walkinPurpose,
          type: 'WALK_IN'
        })
      });

      if (escalateTo311 && resAppt.ok) {
        const res311 = await fetch(`${API_URL}/api/tracker`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-organization-id': orgId,
            'x-user-id': currentProfile?.id || '',
            'x-user-email': currentProfile?.email || ''
          },
          body: JSON.stringify({
            module: '311',
            title: `Constituent Walk-in: ${walkinPurpose}`,
            status: 'Open',
            priority: 'Medium',
            assignedTo: 'Public Works Operations',
            address: '42 Ferry St, Newark, NJ'
          })
        });
        if (res311.ok) {
          const trackerItem = await res311.json();
          setTrackerItems(prev => [trackerItem, ...prev]);
        }
      }

      addNotification(`Constituent walk-in logged: ${walkinName}`);
      setWalkinName('');
      setWalkinEmail('');
      setWalkinPurpose('');
      setEscalateTo311(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to determine staff user's name
  const getUserDisplayName = () => {
    if (currentProfile?.email) {
      return currentProfile.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    }
    return 'Naeem';
  };

  // Dynamic Workspace Filters (Epic Hyperspace Landing)
  const myAssignedTickets = trackerItems.filter(item => {
    const userEmail = currentProfile?.email || '';
    const userRoleName = currentProfile?.role?.name || currentRole.name;
    return (
      item.assignedTo.toLowerCase().includes(userEmail.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(userRoleName.toLowerCase()) ||
      (currentRole.id === 'inspector' && (item.assignedTo === 'Marcus Miller' || item.assignedTo === 'Elena Rostova')) ||
      (currentRole.id === 'public_works' && item.assignedTo.includes('Public Works'))
    );
  });

  const myScheduledInspections = inspections.filter(insp => {
    return currentRole.id === 'inspector' || insp.inspectorName.toLowerCase().includes(getUserDisplayName().toLowerCase());
  });

  const pendingPermits = permits.filter(p => p.status === 'Issued' || p.status === 'In Review');

  const pendingRecords = openRecords.filter(r => r.status === 'Received' || r.status === 'Under Review');

  // Render tailormade Epic Hyperspace layout
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            Welcome to Munevo Workspace, <span className="brand-gradient-text">{getUserDisplayName()}</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Role Context: <strong>{currentProfile?.role?.name || currentRole.name}</strong> • Department: {currentRole.department}
          </p>
        </div>
        <div style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px', fontSize: '11px', color: 'var(--primary-color)', fontWeight: 600 }}>
          System Online & Encrypted
        </div>
      </div>

      {/* Epic Style Metrics Banner */}
      <div className="grid-metrics">
        {currentRole.id === 'mayor' ? (
          <>
            <div className="metric-card metric-status-normal">
              <span className="metric-label">Avg Ticket SLA Time</span>
              <span className="metric-value">18.4 hrs</span>
            </div>
            <div className="metric-card metric-status-warn">
              <span className="metric-label">Pending Council Votes</span>
              <span className="metric-value">3 Resolutions</span>
            </div>
            <div className="metric-card metric-status-normal">
              <span className="metric-label">Municipal Budget Health</span>
              <span className="metric-value">On Track</span>
            </div>
            <div className="metric-card metric-status-normal">
              <span className="metric-label">Revenue Collections</span>
              <span className="metric-value">98.2%</span>
            </div>
          </>
        ) : (
          <>
            <div className="metric-card metric-status-normal">
              <span className="metric-label">My Assigned Tickets</span>
              <span className="metric-value">{myAssignedTickets.length} cases</span>
            </div>
            <div className="metric-card metric-status-normal">
              <span className="metric-label">My Scheduled Visits</span>
              <span className="metric-value">{myScheduledInspections.length} today</span>
            </div>
            <div className="metric-card metric-status-warn">
              <span className="metric-label">Pending Reviews</span>
              <span className="metric-value">
                {currentRole.id === 'clerk' ? pendingRecords.length : pendingPermits.length} items
              </span>
            </div>
            <div className="metric-card metric-status-normal">
              <span className="metric-label">Shift Duration logged</span>
              <span className="metric-value">8.0 hrs</span>
            </div>
          </>
        )}
      </div>

      {/* Main Epic Work Board */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        
        {/* Left Column: My Active Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section A: Assigned Tickets */}
          {currentRole.id !== 'mayor' && currentRole.id !== 'resident' && (
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title">
                  <Clock size={14} style={{ color: 'var(--primary-color)' }} />
                  <span>My Active Work Queue (Assigned to Me)</span>
                </div>
                <span className="badge-status badge-primary" style={{ fontSize: '0.65rem' }}>{myAssignedTickets.length} Open</span>
              </div>
              
              <div className="list-queue">
                {myAssignedTickets.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No operations tickets are currently assigned to you.
                  </div>
                ) : (
                  myAssignedTickets.map(item => (
                    <div key={item.id} className="queue-item" onClick={() => onOpenChart('property', 'prop_01')}>
                      <div className="queue-details">
                        <span className="queue-title">{item.title}</span>
                        <span className="queue-sub">{item.address} • SLA Limit: {item.slaDays} days</span>
                      </div>
                      <span className={`badge-status ${item.priority === 'Critical' ? 'badge-danger' : 'badge-warn'}`}>
                        {item.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Mayor AI Daily Executive Briefing */}
          {currentRole.id === 'mayor' && (
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <div className="card-header">
                <div className="card-title">
                  <Sparkles className="brand-gradient-text" size={16} />
                  <span>AI Daily Executive Briefing</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Updated 10m ago</span>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-primary)', margin: 0 }}>
                Good afternoon Mayor. Newark SLA compliance rates remain strong at <strong>94%</strong>. Building Inspector Elena Rostova is completing structural case reviews at <strong>12 Ferry St</strong>.
                Additionally, council resolution <strong>LEG-2026-004</strong> (Facade restoration grant funding) is slated for vote certification at tomorrow's public hearing.
              </p>
            </div>
          )}

          {/* Clerk Meeting docket */}
          {currentRole.id === 'clerk' && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <Calendar size={14} style={{ color: 'var(--primary-color)' }} />
                  <span>Upcoming Council Meetings Agenda Packets</span>
                </div>
              </div>
              <div className="list-queue">
                <div className="queue-item" onClick={() => onOpenChart('legislative', 'LEG-2026-004')}>
                  <div className="queue-details">
                    <span className="queue-title">Resolution IX.B.1 (15 Washington St Facade Grant)</span>
                    <span className="queue-sub">Hearing: 2026-07-09 • Zoning Committee</span>
                  </div>
                  <span className="badge-status badge-warn">Pending Hearing</span>
                </div>
                <div className="queue-item" onClick={() => onOpenChart('legislative', 'LEG-2026-007')}>
                  <div className="queue-details">
                    <span className="queue-title">Resolution IX.B.2 (West Ward Redevelopment Agreement)</span>
                    <span className="queue-sub">Hearing: 2026-07-09 • Econ Development</span>
                  </div>
                  <span className="badge-status badge-warn">Pending Hearing</span>
                </div>
              </div>
            </div>
          )}

          {/* Finance Abatement ledger */}
          {currentRole.id === 'finance' && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <DollarSign size={14} style={{ color: 'var(--success-text)' }} />
                  <span>Active Opportunity Zone Abatements</span>
                </div>
              </div>
              <div className="list-queue">
                <div className="queue-item" onClick={() => onOpenChart('business', 'DCF Developers, LLC')}>
                  <div className="queue-details">
                    <span className="queue-title">West Ward PILOT Agreement: DCF Developers, LLC</span>
                    <span className="queue-sub">125 & 129 Market St • Code Grade A</span>
                  </div>
                  <span className="badge-status badge-success">Enrolled</span>
                </div>
                <div className="queue-item" onClick={() => onOpenChart('property', 'prop_04')}>
                  <div className="queue-details">
                    <span className="queue-title">Opportunity Zone Abatement: 105 Market St</span>
                    <span className="queue-sub">Market Street Realty • Tax Delinquent</span>
                  </div>
                  <span className="badge-status badge-danger">Lien Eligible</span>
                </div>
              </div>
            </div>
          )}

          {/* Planner Variance board */}
          {currentRole.id === 'planner' && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <Briefcase size={14} style={{ color: 'var(--primary-color)' }} />
                  <span>Zoning Variance Approvals Queue</span>
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
              </div>
            </div>
          )}

          {/* Public Works Work Orders */}
          {currentRole.id === 'public_works' && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <Compass size={14} style={{ color: 'var(--accent-color)' }} />
                  <span>Active Fleet Work Orders</span>
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
              </div>
            </div>
          )}

          {/* Resident Form */}
          {currentRole.id === 'resident' && (
            <>
              <div className="glass-card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="card-title">
                    <Plus size={16} />
                    <span>Submit a 311 Service Request</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit311} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location Address</label>
                    <select className="select-filter" value={newRequestAddress} onChange={e => setNewRequestAddress(e.target.value)}>
                      {Object.values(PROPERTIES).map(p => (
                        <option key={p.id} value={p.address}>{p.address}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Request Type</label>
                    <select className="select-filter" value={newRequestType} onChange={e => setNewRequestType(e.target.value)}>
                      <option value="Trash & Debris">Trash & Debris</option>
                      <option value="Water Pressure / Leak">Water Pressure & Leak</option>
                      <option value="Illegal Parking">Illegal Parking</option>
                      <option value="Structural Hazard">Structural Hazard</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incident Details</label>
                    <textarea className="ai-input" style={{ minHeight: '70px', width: '100%' }} placeholder="Describe the issue you noticed..." value={newRequestDesc} onChange={e => setNewRequestDesc(e.target.value)} required />
                  </div>
                  <button type="submit" className="ai-btn-send" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={12} />
                    <span>Submit 311 Ticket</span>
                  </button>
                </form>
              </div>

              {/* Self-Service Property Claim */}
              <div className="glass-card" style={{ marginTop: '20px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <Building size={16} />
                    <span>Claim a Property / Project (Self-Service)</span>
                  </div>
                </div>
                <form onSubmit={handleCreateClaim} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Claim Type</label>
                    <select className="select-filter" value={claimType} onChange={e => setClaimType(e.target.value)}>
                      <option value="RESIDENT_PROPERTY">Resident Property Owner / Tenant</option>
                      <option value="CONTRACTOR_PROJECT">Contractor Project Association</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address / Location</label>
                    <select className="select-filter" value={claimAddress} onChange={e => setClaimAddress(e.target.value)}>
                      {Object.values(PROPERTIES).map(p => (
                        <option key={p.id} value={p.address}>{p.address}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verification Notes / Proof</label>
                    <textarea 
                      className="ai-input" 
                      style={{ minHeight: '60px', width: '100%' }} 
                      placeholder="Enter utility account details or lease verification info..." 
                      value={claimNotes} 
                      onChange={e => setClaimNotes(e.target.value)} 
                      required 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="submit" className="ai-btn-send">
                      Submit Association Claim
                    </button>
                    {claimStatusText && (
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--warning-text)' }}>
                        {claimStatusText}
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}

        </div>

        {/* Right Column: Schedule & Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Inspector schedule and log notes */}
          {currentRole.id === 'inspector' && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <Calendar size={14} style={{ color: 'var(--warning-text)' }} />
                  <span>My Scheduled Inspections Today</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myScheduledInspections.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                    No field audits scheduled for today.
                  </div>
                ) : (
                  myScheduledInspections.map(insp => {
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
                          padding: '10px 14px',
                          background: isSelected ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.12)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{insp.type} Inspection ({insp.id})</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{prop?.address}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {activeInspectionId && (
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-color)', margin: 0 }}>
                    File Field Notes: {activeInspectionId}
                  </h4>
                  <textarea
                    className="ai-input"
                    style={{ minHeight: '60px', width: '100%' }}
                    placeholder="Enter inspection observations..."
                    value={inspectorNotes}
                    onChange={e => setInspectorNotes(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="ai-btn-send" style={{ backgroundColor: 'var(--danger)', border: 0 }} onClick={() => handleInspectionSubmit('Failed')}>Fail</button>
                    <button className="ai-btn-send" onClick={() => handleInspectionSubmit('Passed')}>Pass</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clerk Records Requests queue */}
          {currentRole.id === 'clerk' && (
            <>
              <div className="glass-card">
                <div className="card-header">
                  <div className="card-title">
                    <FileText size={14} style={{ color: 'var(--warning-text)' }} />
                    <span>Pending FOIA / Record Requests</span>
                  </div>
                </div>
                <div className="list-queue">
                  {pendingRecords.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                      No record requests require review.
                    </div>
                  ) : (
                    pendingRecords.map(req => (
                      <div key={req.id} className="queue-item" onClick={() => onOpenChart('property', 'prop_01')}>
                        <div className="queue-details">
                          <span className="queue-title">{req.requesterName}</span>
                          <span className="queue-sub" style={{ display: 'block', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.description}
                          </span>
                        </div>
                        <span className="badge-status badge-warn">{req.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Clerk Walk-In Log Form */}
              <div className="glass-card" style={{ marginTop: '20px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <UserPlus size={14} style={{ color: 'var(--accent-color)' }} />
                    <span>Constituent Walk-In Intake Registry</span>
                  </div>
                </div>
                <form onSubmit={handleCreateWalkin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Constituent Name</label>
                      <input type="text" className="ai-input" style={{ width: '100%' }} value={walkinName} onChange={e => setWalkinName(e.target.value)} placeholder="e.g. John Miller" required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Constituent Email</label>
                      <input type="email" className="ai-input" style={{ width: '100%' }} value={walkinEmail} onChange={e => setWalkinEmail(e.target.value)} placeholder="e.g. john@mail.com" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Destination Office</label>
                    <select className="select-filter" value={walkinDept} onChange={e => setWalkinDept(e.target.value)}>
                      <option value="Mayor's Office">Mayor's Office</option>
                      <option value="Ward 1 Council Office">Ward 1 Council Office</option>
                      <option value="Ward 2 Council Office">Ward 2 Council Office</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visit Description</label>
                    <textarea className="ai-input" style={{ minHeight: '60px', width: '100%' }} placeholder="What does the constituent need assistance with?" value={walkinPurpose} onChange={e => setWalkinPurpose(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                      <input type="checkbox" checked={escalateTo311} onChange={e => setEscalateTo311(e.target.checked)} />
                      Escalate & dispatch 311 operations ticket
                    </label>
                    <button type="submit" className="ai-btn-send">
                      Log Intake Visit
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* Finance approvals list */}
          {currentRole.id === 'finance' && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Pending Requisition Approvals</div>
              </div>
              <div className="list-queue">
                <div className="queue-item" onClick={() => onOpenChart('permit', 'perm_03')}>
                  <div className="queue-details">
                    <span className="queue-title">Water Pump Booster ($35,000)</span>
                    <span className="queue-sub">Capital Projects Allocation</span>
                  </div>
                  <button 
                    className="ai-btn-send"
                    style={{ height: '24px', fontSize: '0.65rem', padding: '0 8px' }}
                    onClick={e => {
                      e.stopPropagation();
                      addNotification('Requisition approved!');
                    }}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mayor shortcuts list */}
          {currentRole.id === 'mayor' && (
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Executive Council Actions</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn-action" onClick={() => onOpenChart('legislative', 'LEG-2026-004')} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>
                  <Gavel size={14} />
                  <span>Review Facade Grant resolution</span>
                </button>
                <button className="btn-action" onClick={() => onOpenChart('property', 'prop_04')} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>
                  <AlertTriangle size={14} style={{ color: 'var(--danger-text)' }} />
                  <span>Review Delinquent Conservation Case</span>
                </button>
              </div>
            </div>
          )}

          {/* Resident utility bills */}
          {currentRole.id === 'resident' && (
            <>
              <div className="glass-card">
                <div className="card-header">
                  <div className="card-title">My Utilities & Tax Statements</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Water Service Account</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--warning-text)' }}>$84.50 Due</span>
                    </div>
                    <button className="ai-btn-send" style={{ height: '32px' }} onClick={() => addNotification('Utility payment processed!')}>Pay Bill</button>
                  </div>
                </div>
              </div>

              {/* Book Appointment Card */}
              <div className="glass-card" style={{ marginTop: '20px' }}>
                <div className="card-header">
                  <div className="card-title">
                    <Calendar size={14} style={{ color: 'var(--primary-color)' }} />
                    <span>Book Department Appointment</span>
                  </div>
                </div>
                <form onSubmit={handleCreateAppt} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department / Office</label>
                    <select className="select-filter" value={apptDept} onChange={e => setApptDept(e.target.value)}>
                      <option value="Mayor's Office">Mayor's Office</option>
                      <option value="Ward 1 Council Office">Ward 1 Council Office</option>
                      <option value="Zoning Board Office">Zoning Board Office</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requested Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="select-filter" 
                      value={apptDate} 
                      onChange={e => setApptDate(e.target.value)} 
                      style={{ color: '#fff', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meeting Purpose</label>
                    <textarea 
                      className="ai-input" 
                      style={{ minHeight: '60px', width: '100%' }} 
                      placeholder="Enter meeting agenda..." 
                      value={apptPurpose} 
                      onChange={e => setApptPurpose(e.target.value)} 
                      required 
                    />
                  </div>
                  <button type="submit" className="ai-btn-send">
                    Schedule Meeting
                  </button>
                </form>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
};
