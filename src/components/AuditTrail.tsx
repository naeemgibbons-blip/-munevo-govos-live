import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  User,
  ShieldCheck
} from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
}

interface AuditTrailProps {
  currentProfile: any;
  addNotification: (message: string) => void;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  currentProfile,
  addNotification
}) => {
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');
  const orgId = currentProfile?.organizationId || '';

  // State Management
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  // Load Audit Trail Logs
  const loadAuditTrail = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/audit-logs`, {
        headers: { 'x-organization-id': orgId }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to load system audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditTrail();
  }, [orgId]);

  const getActionBadgeClass = (action: string) => {
    if (action === 'CREATE') return 'badge-success';
    if (action === 'UPDATE') return 'badge-primary';
    if (action === 'APPROVE') return 'badge-warn';
    return 'badge-danger';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-slate-400 p-24" style={{ height: '70vh' }}>
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="font-display font-medium text-lg">Loading System Audit Ledger...</p>
      </div>
    );
  }

  return (
    <div className="module-content-grid animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', height: '100%' }}>
      
      {/* Header Panel */}
      <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#10b981' }}>
            <Database size={24} />
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#fff' }}>
              System Transaction Audit Ledger
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              Trace platform modifications, including permit approvals, ticket creation, and roles modifications, in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search logs by operator email, database table name, or target ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px 8px 36px', borderRadius: '8px', fontSize: '13px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
        <select 
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', height: '36px' }}
        >
          <option value="All">All Operations</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="APPROVE">APPROVE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tracker-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: '20px' }}>Timestamp</th>
                <th>Operation</th>
                <th>Source Table</th>
                <th>Record Target ID</th>
                <th>Operator Session</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No audit records logged.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        style={{ cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                      >
                        <td style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status ${getActionBadgeClass(log.action)}`} style={{ fontSize: '0.65rem' }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{log.tableName}</td>
                        <td style={{ color: 'var(--primary-color)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {log.recordId.slice(0, 18)}...
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={12} style={{ color: 'var(--text-muted)' }} />
                            {log.userEmail}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable old values vs new values payload drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                                <ShieldCheck size={14} />
                                <span>Modification Payload Transaction Log</span>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {/* Old Values JSON */}
                                <div>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>OLD TRANSACTION DATA</span>
                                  <pre style={{ margin: 0, padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)', overflowX: 'auto', maxBlockSize: '150px' }}>
                                    {log.oldValues ? JSON.stringify(log.oldValues, null, 2) : 'null'}
                                  </pre>
                                </div>
                                {/* New Values JSON */}
                                <div>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>NEW TRANSACTION DATA</span>
                                  <pre style={{ margin: 0, padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)', overflowX: 'auto', maxBlockSize: '150px' }}>
                                    {log.newValues ? JSON.stringify(log.newValues, null, 2) : 'null'}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
