import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  Flame, 
  Cross, 
  AlertTriangle, 
  VolumeX, 
  Car, 
  HelpCircle, 
  UserX, 
  Clock, 
  MapPin, 
  Camera, 
  Video, 
  Mic, 
  MessageSquare, 
  CheckCircle2, 
  Radio, 
  Send, 
  UserCheck, 
  Layers, 
  FileText, 
  Activity, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Eye,
  Plus,
  Compass,
  AlertCircle,
  Truck,
  Building,
  Droplet
} from 'lucide-react';

interface MunevoSafeConsoleProps {
  currentProfile: any;
  addNotification: (message: string) => void;
  onOpenChart?: (type: any, id: string) => void;
}

export const MunevoSafeConsole: React.FC<MunevoSafeConsoleProps> = ({
  currentProfile,
  addNotification,
  onOpenChart
}) => {
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');

  // Sub-view switcher: 'citizen-app' | 'dispatcher' | 'responder-police' | 'responder-fire' | 'responder-ems' | 'incident-record'
  const [activeSubView, setActiveSubView] = useState<'citizen-app' | 'dispatcher' | 'responder-police' | 'responder-fire' | 'responder-ems' | 'incident-record'>('dispatcher');

  // Citizen App Emergency Form State
  const [selectedEmergencyCategory, setSelectedEmergencyCategory] = useState('police');
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [isAnonymousTip, setIsAnonymousTip] = useState(false);
  const [citizenAddress, setCitizenAddress] = useState('125 Broad Street, Apt 4B, Newark, NJ 07104');
  const [citizenNotes, setCitizenNotes] = useState('');
  const [activeReportStatus, setActiveReportStatus] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'DISPATCH', text: 'Newark 911/Public Safety Command received your report. Units are being assigned.', time: '10:14 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Personal Safety Timer State
  const [safetySessionActive, setSafetySessionActive] = useState(false);
  const [safetyTimerSeconds, setSafetyTimerSeconds] = useState(900); // 15 mins

  // Dispatcher Queue State
  const [incidents, setIncidents] = useState([
    {
      id: 'INC-2026-9041',
      category: 'Fire & Rescue',
      priority: 'P1 - CRITICAL',
      location: '125 Broad St, Apt 4B (Ward 1)',
      reporter: 'Resident (Silent SOS)',
      status: 'DISPATCHED',
      assignedUnits: ['Engine 3', 'Ladder 1', 'Medic 12'],
      time: '2 mins ago',
      mediaCount: 2,
      udmPropertyId: 'prop_01',
      details: 'Heavy smoke reported on 4th floor residential hallway. Alarm active.'
    },
    {
      id: 'INC-2026-9038',
      category: 'Police SOS',
      priority: 'P1 - HIGH',
      location: 'Ferry St & Raymond Blvd',
      reporter: '911 Transfer / Citizen App',
      status: 'EN ROUTE',
      assignedUnits: ['Unit 104', 'Unit 108'],
      time: '6 mins ago',
      mediaCount: 1,
      udmPropertyId: 'prop_04',
      details: '2-vehicle collision at intersection. Traffic blocked eastbound.'
    },
    {
      id: 'INC-2026-9035',
      category: 'EMS Medical',
      priority: 'P2 - MEDIUM',
      location: 'Prudential Center Plaza',
      reporter: 'Anonymous Tip #TIP-8819',
      status: 'NEW',
      assignedUnits: [],
      time: '14 mins ago',
      mediaCount: 0,
      udmPropertyId: 'prop_02',
      details: 'Elderly citizen experiencing shortness of breath near north entrance.'
    }
  ]);
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-2026-9041');

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  // Citizen Submit Emergency Handler
  const handleSubmitCitizenReport = (category: string) => {
    setSelectedEmergencyCategory(category);
    setActiveReportStatus('Report Received');
    const newId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInc = {
      id: newId,
      category: category.toUpperCase(),
      priority: 'P1 - HIGH',
      location: citizenAddress,
      reporter: isAnonymousTip ? 'Anonymous Tip' : 'Citizen App User',
      status: 'VERIFYING',
      assignedUnits: [],
      time: 'Just now',
      mediaCount: 1,
      udmPropertyId: 'prop_01',
      details: citizenNotes || `Citizen emergency report submitted (${category}).`
    };
    setIncidents(prev => [newInc, ...prev]);
    setSelectedIncidentId(newId);
    addNotification(`Public Safety Alert Dispatched: Incident ${newId} logged for Newark Command Center.`);

    // Progress report status sequence
    setTimeout(() => setActiveReportStatus('Location Verified'), 2000);
    setTimeout(() => setActiveReportStatus('Dispatcher Reviewing'), 4000);
    setTimeout(() => setActiveReportStatus('Responders Assigned (Engine 3, Medic 12)'), 6500);
  };

  const handleSendCitizenMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = { sender: 'CITIZEN', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'DISPATCH', text: 'Acknowledged. Responders are on scene. Stay in a safe position.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', height: '100%', overflowY: 'auto' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(17, 19, 30, 0.95) 100%)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <ShieldAlert size={32} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Munevo Safe • Public Safety Command Center
              </h1>
              <span className="badge-status badge-danger" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                LIVE CAD CAD-NET CONNECTED
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', margin: 0 }}>
              Integrated Citizen Safety, CAD Dispatch, Field Responders & Emergency Operations.
            </p>
          </div>
        </div>

        {/* Sub-View Navigation Switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'citizen-app', label: '📱 Citizen Mobile App' },
            { id: 'dispatcher', label: '🎧 Dispatcher CAD Console' },
            { id: 'responder-police', label: '🚔 Police Mobile' },
            { id: 'responder-fire', label: '🚒 Fire / Hazmat' },
            { id: 'responder-ems', label: '🚑 EMS Triage' },
            { id: 'incident-record', label: '📁 UDM Incident File' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubView(tab.id as any)}
              style={{
                background: activeSubView === tab.id ? '#ef4444' : 'transparent',
                color: activeSubView === tab.id ? '#fff' : 'var(--text-secondary)',
                border: 0,
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: activeSubView === tab.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: CITIZEN SAFETY APP (Mobile-First Interface) */}
      {activeSubView === 'citizen-app' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
          
          {/* Simulated Mobile Phone Frame */}
          <div style={{
            background: '#090b10',
            border: '4px solid #2A2E37',
            borderRadius: '36px',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            position: 'relative'
          }}>
            {/* Phone Notch */}
            <div style={{ width: '120px', height: '18px', background: '#12141c', borderRadius: '10px', margin: '0 auto 8px auto' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>Munevo Citizen Safe</div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Radio size={12} className="animate-pulse" />
                <span>GPS Active (4m)</span>
              </div>
            </div>

            {/* Big 1-Touch Emergency Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => handleSubmitCitizenReport('police')}
                style={{
                  gridColumn: 'span 2',
                  height: '70px',
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  border: 0,
                  borderRadius: '16px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
                }}
              >
                <ShieldAlert size={28} />
                <span>EMERGENCY SOS (911)</span>
              </button>

              <button
                onClick={() => handleSubmitCitizenReport('fire')}
                style={{ background: 'rgba(249, 115, 22, 0.15)', border: '1px solid #f97316', color: '#f97316', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Flame size={20} />
                <span>Fire & Rescue</span>
              </button>

              <button
                onClick={() => handleSubmitCitizenReport('ems')}
                style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#3b82f6', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Cross size={20} />
                <span>EMS / Medical</span>
              </button>

              <button
                onClick={() => {
                  setIsSilentMode(true);
                  handleSubmitCitizenReport('silent_sos');
                }}
                style={{ background: isSilentMode ? '#10b981' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <VolumeX size={16} />
                <span>Silent SOS Mode</span>
              </button>

              <button
                onClick={() => handleSubmitCitizenReport('traffic')}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Car size={16} />
                <span>Traffic Crash</span>
              </button>
            </div>

            {/* Quick Anonymous Tip Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>Anonymous Tip Mode</span>
              <input 
                type="checkbox" 
                checked={isAnonymousTip} 
                onChange={e => setIsAnonymousTip(e.target.checked)}
                style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
              />
            </div>

            {/* Active Incident Status Tracker widget */}
            {activeReportStatus && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} className="animate-spin" />
                  <span>ACTIVE REPORT TRACKER</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{activeReportStatus}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned Units: Engine 3, Medic 12 • ETA: 3 mins</div>
              </div>
            )}

            {/* Personal Safety Session Timer */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>Walking / Lone Worker Guard</span>
                <button 
                  onClick={() => {
                    setSafetySessionActive(!safetySessionActive);
                    addNotification(safetySessionActive ? 'Ended safety session' : 'Started 15-min Personal Safety Session with auto-escalation.');
                  }}
                  style={{ background: safetySessionActive ? '#ef4444' : '#10b981', color: '#fff', border: 0, padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {safetySessionActive ? 'Stop' : 'Start Session'}
                </button>
              </div>
              {safetySessionActive && (
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
                  14:52 remaining (Auto-Check-In)
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Live Location Verification & Citizen-Dispatcher Chat */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Live Location, GIS & Dispatcher Two-Way Communication
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Verified location coordinates, media evidence uploads, and direct line to Newark Public Safety Command.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} style={{ color: '#ef4444' }} />
                  <span>Verified Location Context</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Street Address & Unit</label>
                  <input 
                    type="text" 
                    className="ai-input" 
                    value={citizenAddress} 
                    onChange={e => setCitizenAddress(e.target.value)}
                    style={{ width: '100%', fontSize: '0.8rem', marginTop: '4px' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>GPS: <strong>40.7357° N, 74.1724° W</strong> (Accuracy: 4.2m)</div>
                  <div>Jurisdiction: <strong>Newark Police Dept • Precinct 1</strong></div>
                  <div>Landmark: <strong>Prudential Center North Quad</strong></div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={16} style={{ color: '#3b82f6' }} />
                  <span>Media Uploads & Stream</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => addNotification('Captured emergency photo for dispatch file.')}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Camera size={14} /> Photo
                  </button>
                  <button 
                    onClick={() => addNotification('Started live 10-sec emergency video stream to CAD.')}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Video size={14} /> Video Stream
                  </button>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Low-bandwidth recovery active • Stream encrypted end-to-end.
                </div>
              </div>
            </div>

            {/* Chat Box */}
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', height: '260px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={16} style={{ color: '#10b981' }} />
                <span>Secure Citizen-Dispatcher Messaging</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '8px' }}>
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    style={{
                      alignSelf: msg.sender === 'CITIZEN' ? 'flex-end' : 'flex-start',
                      background: msg.sender === 'CITIZEN' ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      maxWidth: '75%',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', opacity: 0.7, marginBottom: '2px' }}>{msg.sender} • {msg.time}</div>
                    <div>{msg.text}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendCitizenMessage} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input 
                  type="text" 
                  className="ai-input"
                  placeholder="Type safety update or emergency notes..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '0 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: DISPATCHER CAD WORKSPACE */}
      {activeSubView === 'dispatcher' && (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
          
          {/* Incident Queue List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Live CAD Incident Queue ({incidents.length})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '550px' }}>
              {incidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  style={{
                    background: selectedIncidentId === inc.id ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255,255,255,0.02)',
                    border: selectedIncidentId === inc.id ? '1px solid #ef4444' : '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{inc.id}</span>
                    <span className={`badge-status ${inc.priority.includes('P1') ? 'badge-danger' : 'badge-warning'}`}>
                      {inc.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>{inc.category}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {inc.location}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>{inc.time}</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{inc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Dispatch Console */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {selectedIncident.id} • {selectedIncident.category}
                  </h2>
                  <span className="badge-status badge-danger">{selectedIncident.priority}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                  Reporter: {selectedIncident.reporter} • Location: {selectedIncident.location}
                </p>
              </div>
              <button
                onClick={() => addNotification(`Merged incident ${selectedIncident.id} into master CAD record.`)}
                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Merge Duplicate Reports
              </button>
            </div>

            {/* Quick Action Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <button 
                onClick={() => addNotification(`Assigned Engine 3 and Medic 12 to ${selectedIncident.id}`)}
                style={{ background: '#ef4444', color: '#fff', border: 0, padding: '10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Assign Units
              </button>
              <button 
                onClick={() => addNotification(`Transferred jurisdiction to Essex County Regional Dispatch`)}
                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Transfer Jurisdiction
              </button>
              <button 
                onClick={() => addNotification(`Created emergency work order for Public Works`)}
                style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Create Work Order
              </button>
              <button 
                onClick={() => addNotification(`Closed incident ${selectedIncident.id}. Record archived.`)}
                style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Close CAD Incident
              </button>
            </div>

            {/* Incident Summary & Premise Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Premises Hazards & Knox Box</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Knox Box: <strong>Main Lobby Entrance (East Wall)</strong></div>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>⚠️ Hazmat Alert: Class 3 Flammable Solvent Storage in Sub-Basement B2</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nearest Hydrant: <strong>HYD-NWK-0941 (120ft East)</strong></div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Related UDM Records</div>
                <button 
                  onClick={() => onOpenChart && onOpenChart('property', 'prop_01')}
                  style={{ background: 'none', border: 0, color: '#3b82f6', textDecoration: 'underline', fontSize: '0.78rem', textAlign: 'left', cursor: 'pointer', padding: 0 }}
                >
                  📍 Parcel Record: 125 Broad Street (Newark Ward 1)
                </button>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Permit: <strong>PM-2026-99 (Structural Retrofit)</strong></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code Case: <strong>VIOL-2026-041 (Stairwell Clearance)</strong></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: POLICE RESPONDER WORKSPACE */}
      {activeSubView === 'responder-police' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Police Field Responder Operations Console
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Safe approach information, BOLO alerts, field notes, evidence capture, and crash workflows.
              </p>
            </div>
            <span className="badge-status badge-primary">UNIT 104 • EN ROUTE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3b82f6' }}>Active BOLO Alerts</div>
              <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700 }}>Blue 2024 Buick Sedan</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NJ Lic Plate: <strong>782-XYZ</strong> • Last seen heading West on Raymond Blvd.</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>Safe Approach Tactical Note</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Building has rear alley access via Atlantic St. Use West entrance for perimeter control.
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>Evidence & Crash Log</div>
              <button 
                onClick={() => addNotification('Initiated Police Crash Report Wizard (NJTR-1 Format).')}
                style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + New Crash Report (NJTR-1)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: FIRE RESPONDER WORKSPACE */}
      {activeSubView === 'responder-fire' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Fire & Rescue Tactical Operations Console
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Hydrant spatial layer, building occupancy, hazmat storage, standpipe locations, and evacuation plans.
              </p>
            </div>
            <span className="badge-status badge-danger">ENGINE 3 • ON SCENE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Droplet size={18} />
                <span>Hydrant Water Supply</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary: <strong>HYD-NWK-0941</strong> (1,250 GPM • 65 PSI)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secondary: <strong>HYD-NWK-0944</strong> (1,100 GPM • 58 PSI)</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={18} />
                <span>Building Floorplan & Standpipe</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standpipe Connection: <strong>Stairwell A (Ground Floor)</strong></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupancy: <strong>Residential High-Density (120 Units)</strong></div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={18} />
                <span>Engine Tactical Status</span>
              </div>
              <button 
                onClick={() => addNotification('Engine 3 declared Primary Search Complete (All Clear).')}
                style={{ background: '#10b981', color: '#fff', border: 0, padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Declare Primary Search Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: EMS RESPONDER WORKSPACE */}
      {activeSubView === 'responder-ems' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                EMS & Medical Triage Operations Console
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Medical dispatch info, trauma center hospital status, AED locations, CPR protocols, and overdose resources.
              </p>
            </div>
            <span className="badge-status badge-success">MEDIC 12 • ON SCENE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3b82f6' }}>Hospital Diversion Status</div>
              <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700 }}>Newark Beth Israel Medical Center</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Status: OPEN • Trauma Level 1 (4 Beds Available)</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>Public AED Registry</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location: <strong>125 Broad St Lobby (Wall Cabinet #2)</strong></div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>Transport Logging</div>
              <button 
                onClick={() => addNotification('Medic 12 initiated hospital transport to Newark Beth Israel Trauma Center.')}
                style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Initiate Patient Transport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: UDM CANONICAL INCIDENT FILE */}
      {activeSubView === 'incident-record' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Canonical UDM Incident Record: INC-2026-9041
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Unified Data Model record linking Incident, Location, Responders, Evidence Media, UDM Parcel, and Audit Trail.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incident ID</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>INC-2026-9041</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UDM Property Link</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#3b82f6' }}>125 Broad Street (prop_01)</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit Trail Ledger</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>14 Security Events Recorded</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
