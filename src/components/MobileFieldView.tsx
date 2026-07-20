import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  Plus, 
  ArrowLeft,
  X,
  FileText
} from 'lucide-react';

interface MobileFieldViewProps {
  currentProfile: any;
  addNotification: (message: string) => void;
  onExit: () => void;
}

export const MobileFieldView: React.FC<MobileFieldViewProps> = ({
  currentProfile,
  addNotification,
  onExit
}) => {
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');
  const orgId = currentProfile?.organizationId || '';
  
  // List of simulated field inspections assigned to logged-in user
  const [inspections, setInspections] = useState([
    { id: 'insp_06', type: 'Safety Inspection', address: '125 Market St', status: 'Pending', notes: '' },
    { id: 'insp_02', type: 'Structural Review', address: '162 Washington St', status: 'Pending', notes: '' },
    { id: 'insp_03', type: 'Electrical Permit Signoff', address: '252 Leon Avenue', status: 'Pending', notes: '' }
  ]);

  // Selected assignment for edit modal
  const [selectedInsp, setSelectedInsp] = useState<any | null>(null);
  const [inspNotes, setInspNotes] = useState('');
  const [photoCaptured, setPhotoCaptured] = useState(false);

  // New Code Violation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newViolationAddress, setNewViolationAddress] = useState('125 Market St');
  const [newViolationType, setNewViolationType] = useState('Trash accumulation');
  const [newViolationNotes, setNewViolationNotes] = useState('');

  // RLS/Permission verification
  const isInspector = currentProfile?.role?.name?.toLowerCase().includes('inspector') || 
                      currentProfile?.role?.name?.toLowerCase().includes('officer') ||
                      currentProfile?.isOrgAdmin || currentProfile?.isGlobalAdmin;

  if (!isInspector) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: '#0b0c10', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
        <AlertTriangle size={48} style={{ color: 'var(--danger-text)' }} />
        <div>
          <h3 style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Access Denied</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '280px' }}>
            Your custom role permissions do not permit access to mobile field dispatch modules.
          </p>
        </div>
        <button className="ai-btn-send" onClick={onExit} style={{ background: '#333' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleUpdateStatus = (status: 'Passed' | 'Failed') => {
    if (!selectedInsp) return;
    setInspections(prev => prev.map(insp => {
      if (insp.id === selectedInsp.id) {
        return { ...insp, status, notes: inspNotes };
      }
      return insp;
    }));
    addNotification(`Field Inspection ${selectedInsp.id} signed off as: ${status}`);
    setSelectedInsp(null);
    setInspNotes('');
    setPhotoCaptured(false);
  };

  const handleCreateViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/tracker`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          module: 'Code Enforcement',
          title: `Field Violation: ${newViolationType}`,
          status: 'Open',
          priority: 'High',
          assignedTo: currentProfile.email,
          propertyAddress: newViolationAddress,
          slaDays: 7
        })
      });

      if (res.ok) {
        addNotification(`Created new code violation at ${newViolationAddress}!`);
        setShowCreateForm(false);
        setNewViolationNotes('');
      } else {
        addNotification('Error logging field ticket.');
      }
    } catch (err) {
      console.error(err);
      addNotification('API error logging field ticket.');
    }
  };

  return (
    <div style={{ background: '#0b0c10', minHeight: '100vh', color: '#fff', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Mobile Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={onExit} style={{ background: 'transparent', border: 0, color: 'var(--primary-color)', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>Munevo Field Ops Mobile</h4>
              <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>
                ONLINE
              </span>
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Logged in: {currentProfile?.email || 'field-user'}</span>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          style={{ background: 'var(--primary-color)', border: 0, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Offline & Route Status Banner */}
      <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 'bold', textTransform: 'uppercase' }}>Field Schedule Today</span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2px 0 0 0' }}>Newark Operational Route</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Offline Queue</span>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>0 Pending Sync</span>
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {inspections.map(insp => (
          <div 
            key={insp.id}
            onClick={() => {
              setSelectedInsp(insp);
              setInspNotes(insp.notes);
            }}
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: `1px solid ${insp.status === 'Pending' ? 'rgba(255,255,255,0.06)' : 'var(--primary-color)'}`, 
              borderRadius: '8px', 
              padding: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{insp.type}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={10} /> {insp.address}
              </div>
            </div>
            <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: insp.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: insp.status === 'Pending' ? '#f59e0b' : '#10b981' }}>
              {insp.status}
            </span>
          </div>
        ))}
      </div>

      {/* Edit Details Drawer Overlay */}
      {selectedInsp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: '#11131c', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 800 }}>Field Sign-Off: {selectedInsp.id}</h4>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{selectedInsp.address}</span>
              </div>
              <button onClick={() => setSelectedInsp(null)} style={{ background: 'transparent', border: 0, color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Field Observations Notes</label>
              <textarea 
                className="ai-input" 
                style={{ width: '100%', minHeight: '80px' }}
                value={inspNotes}
                onChange={e => setInspNotes(e.target.value)}
                placeholder="Log structural flaws, electrical parameters, zoning conformance..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => {
                  setPhotoCaptured(true);
                  addNotification('NFC Camera: Logged high-resolution geotagged image.');
                }}
                style={{ flex: 1, height: '40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Camera size={16} />
                {photoCaptured ? 'Photo Attached ✓' : 'Attach Photo'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button 
                onClick={() => handleUpdateStatus('Failed')}
                style={{ flex: 1, height: '40px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger-text)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Fail Inspection
              </button>
              <button 
                onClick={() => handleUpdateStatus('Passed')}
                style={{ flex: 1, height: '40px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success-text)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Pass & Sign Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Violation Form Drawer Overlay */}
      {showCreateForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <form onSubmit={handleCreateViolation} style={{ background: '#11131c', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 800 }}>Report New Code Violation</h4>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>On-site active intake</span>
              </div>
              <button type="button" onClick={() => setShowCreateForm(false)} style={{ background: 'transparent', border: 0, color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Address / Parcel Coordinates</label>
              <select className="select-filter" style={{ width: '100%' }} value={newViolationAddress} onChange={e => setNewViolationAddress(e.target.value)}>
                <option value="125 Market St">125 Market St</option>
                <option value="162 Washington St">162 Washington St</option>
                <option value="252 Leon Avenue">252 Leon Avenue</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Violation Classification</label>
              <input 
                type="text" 
                className="ai-input" 
                style={{ width: '100%' }}
                value={newViolationType}
                onChange={e => setNewViolationType(e.target.value)}
                placeholder="e.g. Unlicensed construction, sidewalk hazard"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Incident Description</label>
              <textarea 
                className="ai-input" 
                style={{ width: '100%', minHeight: '60px' }}
                value={newViolationNotes}
                onChange={e => setNewViolationNotes(e.target.value)}
                placeholder="Details of the violation observed in the field..."
              />
            </div>

            <button 
              type="submit" 
              style={{ height: '40px', width: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 0, color: '#000', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '6px' }}
            >
              Issue Citation & Dispatch 311 Ticket
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
