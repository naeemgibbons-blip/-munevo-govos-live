import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  User, 
  Mail, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  X, 
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface OpenRecordsRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  description: string;
  dateRange: string | null;
  status: string;
  assignedTo: string | null;
  createdAt: string;
}

interface OpenRecordsProps {
  currentProfile: any;
  addNotification: (message: string) => void;
  canEdit?: boolean;
}

export const OpenRecords: React.FC<OpenRecordsProps> = ({
  currentProfile,
  addNotification,
  canEdit = true
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const orgId = currentProfile?.organizationId || '';

  // State Management
  const [requests, setRequests] = useState<OpenRecordsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Form States
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [description, setDescription] = useState('');
  const [dateRange, setDateRange] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Load Requests
  const fetchRequests = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/open-records`, {
        headers: { 'x-organization-id': orgId }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to load FOIA requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [orgId]);

  // Form Handler
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName.trim() || !requesterEmail.trim() || !description.trim() || !orgId) return;

    try {
      const res = await fetch(`${API_URL}/api/open-records`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          requesterName,
          requesterEmail,
          description,
          dateRange: dateRange || null,
          status: 'Received',
          assignedTo: 'City Clerk'
        })
      });

      if (res.ok) {
        const newReq = await res.json();
        setRequests(prev => [newReq, ...prev]);
        setRequesterName('');
        setRequesterEmail('');
        setDescription('');
        setDateRange('');
        addNotification('Records request submitted successfully!');
      } else {
        const err = await res.json();
        addNotification(`Error: ${err.error || 'Failed to submit request'}`);
      }
    } catch (e) {
      addNotification('API error: Failed to submit records request.');
    }
  };

  // Status Update Handler
  const handleUpdateStatus = async (id: string, updatedStatus: string) => {
    if (!canEdit) {
      addNotification('Access Denied: Read-only profile constraint prevents modifying records requests.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/open-records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updatedStatus
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setRequests(prev => prev.map(r => r.id === id ? updated : r));
        addNotification(`Request ${id.slice(0, 8)} status updated to ${updatedStatus}!`);
      }
    } catch (e) {
      addNotification('API error: Failed to update status.');
    }
  };

  // Assignee Update Handler
  const handleUpdateAssignee = async (id: string, updatedAssignee: string) => {
    if (!canEdit) {
      addNotification('Access Denied: Read-only profile constraint prevents modifying records requests.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/open-records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: updatedAssignee
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setRequests(prev => prev.map(r => r.id === id ? updated : r));
        addNotification(`Assigned request to ${updatedAssignee}!`);
      }
    } catch (e) {
      addNotification('API error: Failed to assign request.');
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requesterEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedRequest = requests.find(r => r.id === selectedRequestId) || null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-slate-400 p-24" style={{ height: '70vh' }}>
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="font-display font-medium text-lg">Loading Open Records Ledger...</p>
      </div>
    );
  }

  return (
    <div className="module-content-grid animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', height: '100%' }}>
      
      {/* Header Panel */}
      <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#10b981' }}>
            <FileText size={24} />
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#fff' }}>
              Open Records & FOIA Administration
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              Track, review, and process public records requests securely under municipal compliance rules.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        
        {/* Left Side: Records Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                placeholder="Search requests by requester, details..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px 8px 36px', borderRadius: '8px', fontSize: '13px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', height: '36px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Received">Received</option>
              <option value="Under Review">Under Review</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Denied">Denied</option>
            </select>
          </div>

          {/* Requests Queue */}
          <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
            <div className="list-queue" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: '450px' }}>
              {filteredRequests.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px', textAlign: 'center' }}>
                  <FileText size={40} style={{ color: 'var(--primary-color)', opacity: 0.5 }} />
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px 0', color: '#fff' }}>No Records Requests Logged</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>This municipality has no public record request records on file.</p>
                  </div>
                </div>
              ) : (
                filteredRequests.map(req => {
                  const isSelected = selectedRequestId === req.id;
                  return (
                    <div 
                      key={req.id} 
                      className={`queue-item ${isSelected ? 'active-row' : ''}`}
                      onClick={() => setSelectedRequestId(req.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{req.requesterName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.description}
                        </span>
                      </div>
                      <span className={`badge-status ${
                        req.status === 'Fulfilled' 
                          ? 'badge-success' 
                          : req.status === 'Denied' 
                          ? 'badge-danger' 
                          : req.status === 'Under Review' 
                          ? 'badge-primary' 
                          : 'badge-warn'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {req.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Details View OR Intake Form */}
        <div>
          {selectedRequest ? (
            /* Selected Request Detail Dashboard */
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    REQ-{selectedRequest.id.slice(0, 8).toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>Request Workspace</h3>
                </div>
                <button 
                  onClick={() => setSelectedRequestId(null)}
                  style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>REQUESTER DETAILS</label>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500, marginTop: '2px' }}>
                    {selectedRequest.requesterName} ({selectedRequest.requesterEmail})
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RECORDS DESCRIPTION</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '4px 0 0 0' }}>
                    {selectedRequest.description}
                  </p>
                </div>

                {selectedRequest.dateRange && (
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TARGET DATE RANGE</label>
                    <div style={{ fontSize: '12px', color: '#fff', marginTop: '2px' }}>
                      {selectedRequest.dateRange}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  {/* Status update selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WORKFLOW STATUS</label>
                    <select 
                      value={selectedRequest.status}
                      onChange={e => handleUpdateStatus(selectedRequest.id, e.target.value)}
                      disabled={!canEdit}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}
                    >
                      <option value="Received">Received</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Fulfilled">Fulfilled</option>
                      <option value="Denied">Denied</option>
                    </select>
                  </div>

                  {/* Assignee selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ASSIGNED COMPLIANCE OFFICER</label>
                    <select 
                      value={selectedRequest.assignedTo || 'City Clerk'}
                      onChange={e => handleUpdateAssignee(selectedRequest.id, e.target.value)}
                      disabled={!canEdit}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}
                    >
                      <option value="City Clerk">City Clerk</option>
                      <option value="City Attorney">City Attorney</option>
                      <option value="Compliance Officer">Compliance Officer</option>
                    </select>
                  </div>
                </div>

                {!canEdit && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', color: 'var(--danger-text)', fontSize: '11px', marginTop: '6px' }}>
                    <ShieldAlert size={12} />
                    <span>Read-Only: Your current role is not authorized to edit records requests.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Records Request Intake Form */
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>Intake Public Records Request</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>Register new requests under public disclosure protocols.</p>
              </div>

              <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Requester Name</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={requesterName}
                      onChange={e => setRequesterName(e.target.value)}
                      required
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px 8px 32px', borderRadius: '6px', fontSize: '12px' }}
                    />
                    <User size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Requester Email</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email" 
                      placeholder="e.g. john@records.org"
                      value={requesterEmail}
                      onChange={e => setRequesterEmail(e.target.value)}
                      required
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px 8px 32px', borderRadius: '6px', fontSize: '12px' }}
                    />
                    <Mail size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Target Date Range</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Jan 2026 - Mar 2026"
                      value={dateRange}
                      onChange={e => setDateRange(e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px 8px 32px', borderRadius: '6px', fontSize: '12px' }}
                    />
                    <Calendar size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Records Requested Details</label>
                  <textarea 
                    placeholder="Describe files, resolutions, or property transactions requested..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    style={{ width: '100%', minHeight: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', lineHeight: '1.4' }}
                  />
                </div>

                <button 
                  type="submit" 
                  style={{ padding: '10px', borderRadius: '6px', border: 0, color: '#fff', background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '12px' }}
                >
                  <Send size={12} />
                  Intake Record Request
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
