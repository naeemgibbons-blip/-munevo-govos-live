import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Award, 
  Clock, 
  Plus, 
  Check, 
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  credentialId: string;
  issuedDate: string;
  expiresAt: string;
}

interface Timesheet {
  id: string;
  date: string;
  hoursWorked: number;
  notes: string | null;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  hireDate: string;
  certifications: Certification[];
  timesheets: Timesheet[];
}

interface EmployeeRosterProps {
  currentProfile: any;
  addNotification: (message: string) => void;
  canEdit?: boolean;
}

export const EmployeeRoster: React.FC<EmployeeRosterProps> = ({
  currentProfile,
  addNotification,
  canEdit = true
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const orgId = currentProfile?.organizationId || '';

  // State Management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

  // New Employee Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Code Enforcement');
  const [hireDate, setHireDate] = useState('');

  // Timesheet Logger States
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState<Employee | null>(null);
  const [workDate, setWorkDate] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [workNotes, setWorkNotes] = useState('');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Load Employees Data
  const loadEmployees = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/employees`, {
        headers: { 'x-organization-id': orgId }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error('Failed to load employee directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [orgId]);

  // Form submission: Create Employee
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !orgId) return;

    try {
      const res = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-organization-id': orgId,
          'x-user-id': currentProfile?.id || '',
          'x-user-email': currentProfile?.email || ''
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          department,
          hireDate: hireDate || new Date().toISOString()
        })
      });

      if (res.ok) {
        const newEmp = await res.json();
        newEmp.certifications = [];
        newEmp.timesheets = [];
        setEmployees(prev => [newEmp, ...prev]);
        
        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setHireDate('');
        setShowAddModal(false);
        addNotification(`Registered staff member ${newEmp.firstName} ${newEmp.lastName}!`);
      }
    } catch (e) {
      addNotification('API Error: Failed to create employee.');
    }
  };

  // Form submission: Log Hours
  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoursWorked || !workDate || !targetEmployee) return;

    try {
      const res = await fetch(`${API_URL}/api/employees/${targetEmployee.id}/timesheets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-organization-id': orgId,
          'x-user-id': currentProfile?.id || '',
          'x-user-email': currentProfile?.email || ''
        },
        body: JSON.stringify({
          date: workDate,
          hoursWorked: parseFloat(hoursWorked),
          notes: workNotes
        })
      });

      if (res.ok) {
        const newTime = await res.json();
        
        // Update employee state locally
        setEmployees(prev => prev.map(emp => {
          if (emp.id === targetEmployee.id) {
            return {
              ...emp,
              timesheets: [newTime, ...emp.timesheets]
            };
          }
          return emp;
        }));

        // Reset
        setHoursWorked('');
        setWorkNotes('');
        setWorkDate('');
        setShowTimeModal(false);
        setTargetEmployee(null);
        addNotification('Hours logged successfully!');
      }
    } catch (e) {
      addNotification('API Error: Failed to log hours.');
    }
  };

  // Evaluates expiration dates for certs (Alert if expiring within 60 days)
  const checkExpiringSoon = (expiryDateStr: string) => {
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  };

  const filteredEmployees = employees.filter(emp => {
    const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-slate-400 p-24" style={{ height: '70vh' }}>
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="font-display font-medium text-lg">Retrieving Staff Directory...</p>
      </div>
    );
  }

  return (
    <div className="module-content-grid animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', height: '100%' }}>
      
      {/* Header Panel */}
      <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#10b981' }}>
              <Users size={24} />
            </div>
            <div>
              <h1 className="font-display" style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#fff' }}>
                Municipal Staff Roster & Certifications
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                Manage departmental personnel details, monitor active safety certifications, and track logged timesheet hours.
              </p>
            </div>
          </div>
          {canEdit && (
            <button 
              onClick={() => setShowAddModal(true)} 
              className="ai-btn-send"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <UserPlus size={14} />
              <span>Add Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search staff directory by name, email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px 8px 36px', borderRadius: '8px', fontSize: '13px' }}
          />
          <Clock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
        <select 
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', height: '36px' }}
        >
          <option value="All">All Departments</option>
          <option value="Code Enforcement">Code Enforcement</option>
          <option value="Public Works">Public Works</option>
          <option value="Legal & Compliance">Legal & Compliance</option>
          <option value="IT / Systems">IT / Systems</option>
        </select>
      </div>

      {/* Staff ledger grid */}
      <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tracker-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: '20px' }}>Staff Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>Hire Date</th>
                <th>Certifications</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                      <Users size={40} style={{ color: 'var(--primary-color)', opacity: 0.5 }} />
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: '#fff' }}>No Staff Registered</h3>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>There are no staff members on file matching these criteria.</p>
                      </div>
                      {canEdit && (
                        <button className="ai-btn-send" onClick={() => setShowAddModal(true)} style={{ padding: '6px 12px', fontSize: '11px', cursor: 'pointer', marginTop: '6px' }}>
                          Add Staff Member
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const isExpanded = expandedEmployeeId === emp.id;
                const soonExpiringCount = emp.certifications.filter(c => checkExpiringSoon(c.expiresAt)).length;
                return (
                  <React.Fragment key={emp.id}>
                    <tr 
                      onClick={() => setExpandedEmployeeId(isExpanded ? null : emp.id)}
                      style={{ cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                    >
                      <td style={{ paddingLeft: '20px', fontWeight: 600, color: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {emp.firstName} {emp.lastName}
                        </div>
                      </td>
                      <td>
                        <span className="badge-status badge-primary" style={{ fontSize: '0.65rem' }}>
                          {emp.department}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {new Date(emp.hireDate).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{emp.certifications.length} active</span>
                          {soonExpiringCount > 0 && (
                            <span className="badge-status badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.6rem', padding: '1px 6px' }}>
                              <AlertTriangle size={10} />
                              {soonExpiringCount} alert
                            </span>
                          )}
                        </div>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {canEdit && (
                          <button 
                            className="tab-button"
                            onClick={() => {
                              setTargetEmployee(emp);
                              setShowTimeModal(true);
                            }}
                            style={{ padding: '2px 8px', fontSize: '0.7rem', height: '24px' }}
                          >
                            Log Hours
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expandable certs & timesheets detail drawer */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
                            {/* Certs Segment */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '10px' }}>
                                <Award size={14} />
                                <span>Regulatory Certifications</span>
                              </div>
                              {emp.certifications.length === 0 ? (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No credentials registered.</div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {emp.certifications.map(c => {
                                    const warning = checkExpiringSoon(c.expiresAt);
                                    return (
                                      <div key={c.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: warning ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{c.name}</div>
                                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Cred ID: {c.credentialId}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                          <span style={{ fontSize: '10px', color: warning ? 'var(--danger-text)' : 'var(--text-muted)' }}>
                                            Expires: {new Date(c.expiresAt).toLocaleDateString()}
                                          </span>
                                          {warning && (
                                            <div style={{ fontSize: '8px', color: 'var(--danger-text)', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                              <AlertTriangle size={8} /> Expiring soon
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Timesheets Ledger Segment */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '10px' }}>
                                <Clock size={14} />
                                <span>Recent Timesheets Log</span>
                              </div>
                              {emp.timesheets.length === 0 ? (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No timesheets filed for this period.</div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                                  {emp.timesheets.map(t => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '11.5px' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleDateString()}</span>
                                      <span style={{ color: 'var(--text-secondary)', display: 'block', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {t.notes || 'Routine duties'}
                                      </span>
                                      <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{t.hoursWorked} hrs</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Register Staff Member */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <form onSubmit={handleCreateEmployee} className="glass-card animate-fade-in" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '14px', padding: '24px', background: '#11131c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Register New Staff</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Department</label>
              <select value={department} onChange={e => setDepartment(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', height: '34px' }}>
                <option value="Code Enforcement">Code Enforcement</option>
                <option value="Public Works">Public Works</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
                <option value="IT / Systems">IT / Systems</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Hire Date</label>
              <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }} />
            </div>
            <button type="submit" style={{ padding: '10px', borderRadius: '6px', border: 0, color: '#fff', background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '12px' }}>
              <Plus size={12} /> Register Employee
            </button>
          </form>
        </div>
      )}

      {/* Modal 2: Log Hours worked */}
      {showTimeModal && targetEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <form onSubmit={handleLogHours} className="glass-card animate-fade-in" style={{ width: '360px', display: 'flex', flexDirection: 'column', gap: '14px', padding: '24px', background: '#11131c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>Log Hours: {targetEmployee.firstName} {targetEmployee.lastName}</h3>
              <button type="button" onClick={() => {
                setShowTimeModal(false);
                setTargetEmployee(null);
              }} style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Work Date</label>
              <input type="date" value={workDate} onChange={e => setWorkDate(e.target.value)} required style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Hours Worked</label>
              <input type="number" step="0.5" min="0" max="24" value={hoursWorked} onChange={e => setHoursWorked(e.target.value)} placeholder="e.g. 8" required style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Activity Description Notes</label>
              <textarea placeholder="Specify duties completed..." value={workNotes} onChange={e => setWorkNotes(e.target.value)} style={{ width: '100%', minHeight: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px', borderRadius: '6px', fontSize: '12px' }} />
            </div>
            <button type="submit" style={{ padding: '10px', borderRadius: '6px', border: 0, color: '#fff', background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '12px' }}>
              <Check size={12} /> Log Timesheet hours
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
