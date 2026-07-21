import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Radio, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  Filter, 
  Layers, 
  RefreshCw, 
  ExternalLink,
  Activity,
  Sliders,
  Send,
  Building,
  Car,
  CloudRain,
  Share2,
  Video,
  Grid,
  Maximize2,
  Pin,
  Flame,
  Wrench,
  ShieldAlert,
  Clock,
  Search,
  Plus,
  Compass,
  Zap,
  Check,
  X,
  Lock,
  Camera,
  Download,
  Share,
  TrendingUp,
  Award,
  DollarSign,
  AlertCircle,
  Truck,
  Droplet,
  Globe,
  RadioTower,
  Cpu
} from 'lucide-react';
import { ensureArray } from '../utils/arrayUtils';

interface SentinelAiConsoleProps {
  currentProfile: any;
  addNotification: (message: string) => void;
  onOpenChart?: (type: any, id: string) => void;
}

export const SentinelAiConsole: React.FC<SentinelAiConsoleProps> = ({
  currentProfile,
  addNotification,
  onOpenChart
}) => {
  // Primary Tabs: 'eoc-home' | 'camera-workspace' | 'observation-engine' | 'social-intelligence' | 'gis-twin' | 'connectors-admin'
  const [activeTab, setActiveTab] = useState<'eoc-home' | 'camera-workspace' | 'observation-engine' | 'social-intelligence' | 'gis-twin' | 'connectors-admin'>('eoc-home');

  // Camera Workspace Grid Mode State
  const [gridMode, setGridMode] = useState<'2x2' | '3x3' | '4x4' | '5x5' | '6x6' | 'unlimited'>('3x3');
  const [cameraAgencyFilter, setCameraAgencyFilter] = useState('all');
  const [cameraRiskFilter, setCameraRiskFilter] = useState('all');
  const [pinnedCameraIds, setPinnedCameraIds] = useState<string[]>(['CAM-NWK-104', 'CAM-NWK-115']);
  const [selectedCameraForModal, setSelectedCameraForModal] = useState<any>(null);
  const [showOptInModal, setShowOptInModal] = useState(false);

  // Opt-in Business Form State
  const [optInBizName, setOptInBizName] = useState('');
  const [optInAddress, setOptInAddress] = useState('');
  const [optInConsent, setOptInConsent] = useState(true);

  // Camera Feeds Catalog State (Fetched from /api/cameras)
  const [cameras, setCameras] = useState<any[]>([
    {
      id: 'NYCDOT-301002c0-fe39-4fad-998a-fdc66e531b1d',
      sourceSystem: 'NYCDOT',
      sourceAgency: 'NYC DOT / NYCTMC',
      name: 'Lincoln Tunnel Approach (31st St @ 9th/10th Ave)',
      roadway: 'Lincoln Tunnel Approach',
      direction: 'Westbound',
      municipality: 'Manhattan',
      state: 'NY',
      mediaType: 'REFRESHED_IMAGE',
      imageUrl: 'https://webcams.nyctmc.org/api/cameras/301002c0-fe39-4fad-998a-fdc66e531b1d/image',
      officialPageUrl: 'https://webcams.nyctmc.org/map',
      refreshIntervalSeconds: 15,
      status: 'AVAILABLE',
      lastSuccessfulFetch: 'Just now',
      attribution: { agency: 'NYC DOT', text: 'Traffic camera feed provided by NYC DOT / NYCTMC Webcams.', url: 'https://webcams.nyctmc.org/map' }
    },
    {
      id: 'NJ511-101',
      sourceSystem: 'NJ511',
      sourceAgency: 'NJ511 / NJDOT',
      name: 'Broad St & Market St - Northbound Corridor',
      roadway: 'Broad Street',
      direction: 'Northbound',
      municipality: 'Newark',
      state: 'NJ',
      mediaType: 'REFRESHED_IMAGE',
      imageUrl: 'https://webcams.nyctmc.org/api/cameras/23bcc0dd-d395-45fe-8106-676ba7293208/image',
      officialPageUrl: 'https://511nj.org/camera',
      refreshIntervalSeconds: 15,
      status: 'AVAILABLE',
      lastSuccessfulFetch: '2s ago',
      attribution: { agency: 'NJDOT', text: 'Camera feed provided by 511NJ Official Network.', url: 'https://511nj.org/camera' }
    },
    {
      id: 'NJTA-EXIT14',
      sourceSystem: 'NJTA',
      sourceAgency: 'New Jersey Turnpike Authority',
      name: 'NJ Turnpike Exit 14 / Newark Airport Interchange',
      roadway: 'NJ Turnpike (I-95)',
      direction: 'Northbound',
      municipality: 'Newark',
      state: 'NJ',
      mediaType: 'REFRESHED_IMAGE',
      imageUrl: 'https://webcams.nyctmc.org/api/cameras/07f88e60-2b93-4bba-9784-8cac3c9b7f52/image',
      officialPageUrl: 'https://www.njta.gov/travel-resources/camera-list/',
      refreshIntervalSeconds: 15,
      status: 'AVAILABLE',
      lastSuccessfulFetch: 'Just now',
      attribution: { agency: 'NJTA', text: 'Official camera feed provided by the New Jersey Turnpike Authority.', url: 'https://www.njta.gov/travel-resources/camera-list/' }
    }
  ]);

  // Connectors Status List State
  const [connectorsStatus, setConnectorsStatus] = useState<any[]>([
    { id: 'NYCDOT', name: 'NYC DOT Traffic Cameras', agency: 'NYC DOT', status: 'CONNECTED', mediaType: 'REFRESHED_IMAGE' },
    { id: 'NJ511', name: 'NJ511 Regional Travel Feeds', agency: 'NJDOT', status: 'CONNECTED', mediaType: 'REFRESHED_IMAGE' },
    { id: 'NJTA', name: 'NJ Turnpike Authority', agency: 'NJTA', status: 'CONNECTED', mediaType: 'REFRESHED_IMAGE' },
    { id: 'SHOTSPOTTER', name: 'ShotSpotter Acoustic Sensors', agency: 'Newark Police', status: 'FUTURE_INTEGRATION', mediaType: 'UNAVAILABLE' },
    { id: 'OPTIN_BIZ', name: 'Opt-In Business CCTV', agency: 'Partner Program', status: 'NOT_CONNECTED', mediaType: 'UNAVAILABLE' }
  ]);

  // Fetch real cameras and connectors on mount
  useEffect(() => {
    fetch('/api/cameras')
      .then(res => res.json())
      .then(data => {
        const arr = ensureArray(data);
        if (arr.length > 0) setCameras(arr);
      })
      .catch(() => {});

    fetch('/api/camera-sources')
      .then(res => res.json())
      .then(data => {
        const arr = ensureArray(data);
        if (arr.length > 0) {
          setConnectorsStatus(prev => [
            ...arr,
            { id: 'SHOTSPOTTER', name: 'ShotSpotter Acoustic Sensors', agency: 'Newark Police', status: 'FUTURE_INTEGRATION', mediaType: 'UNAVAILABLE' },
            { id: 'OPTIN_BIZ', name: 'Opt-In Business CCTV', agency: 'Partner Program', status: 'NOT_CONNECTED', mediaType: 'UNAVAILABLE' }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  // AI Observations Queue State (Stored in UDM Format)
  const [observations, setObservations] = useState([
    {
      id: 'OBS-2026-901',
      title: 'Illegal Dumping Detected in Alleyway',
      riskTier: 'LOW',
      category: 'Sanitation / Public Works',
      location: '85 Ferry St (Ironbound Ward 1)',
      cameraId: 'CAM-BIZ-042',
      confidence: 94,
      evidenceMedia: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=60',
      suggestedDept: 'Public Works & Sanitation',
      suggestedPriority: 'Medium (48hr SLA)',
      suggestedResponse: 'Dispatch Sanitation Refuse Crew for Debris Removal & Issue Code Violation Citation',
      status: 'AUTO_DRAFT_WORK_ORDER',
      udmEntity: 'WorkOrder',
      timestamp: '4 mins ago'
    },
    {
      id: 'OBS-2026-894',
      title: 'Vehicle Collision Blocking Broad St Transit Corridor',
      riskTier: 'HIGH',
      category: 'Traffic & Public Safety',
      location: 'Broad St & Market St (Downtown)',
      cameraId: 'CAM-NWK-101',
      confidence: 91,
      evidenceMedia: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=600&auto=format&fit=crop&q=60',
      suggestedDept: 'Traffic Management & Newark Police Dept',
      suggestedPriority: 'P1 - High (Immediate)',
      suggestedResponse: 'Dispatch Police Patrol Unit 104 and Tow Unit for Road Clearing & Signal Re-timing',
      status: 'HUMAN_CONFIRMATION_REQUIRED',
      udmEntity: 'EmergencyIncident',
      timestamp: '8 mins ago'
    },
    {
      id: 'OBS-2026-888',
      title: 'Structural Facade Masonry Collapse Indicator',
      riskTier: 'HIGH',
      category: 'Building Safety & Emergency Management',
      location: '129 Washington St (Central Ward)',
      cameraId: 'CAM-NWK-115',
      confidence: 97,
      evidenceMedia: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60',
      suggestedDept: 'Code Enforcement & Fire Rescue EOC',
      suggestedPriority: 'P1 - CRITICAL EMERGENCY',
      suggestedResponse: 'Dispatch Building Inspector & Fire Ladder 1 to Erect Pedestrian Sidewalk Safety Canopy',
      status: 'HUMAN_CONFIRMATION_REQUIRED',
      udmEntity: 'CodeCase',
      timestamp: '12 mins ago'
    }
  ]);

  // Social Intelligence Posts Stream State
  const [socialPosts, setSocialPosts] = useState([
    {
      id: 'SOC-904',
      platform: 'Public Social Stream',
      user: '@NewarkCommuter_NJ',
      timestamp: '5 mins ago',
      text: 'Water is rising super fast under the Ferry St bridge near Raymond Blvd! Avoid the area if driving.',
      hashtags: '#Newark #Ironbound #Flood',
      nlpLocation: 'Ferry St & Raymond Blvd',
      nlpSeverity: 'High',
      confidence: 95,
      matchedCameraId: 'CAM-NWK-104',
      gisParcel: '125 Ferry St (prop_04)'
    },
    {
      id: 'SOC-899',
      platform: 'Public News Feed',
      user: '@NJTrafficAlerts_Public',
      timestamp: '14 mins ago',
      text: 'Major pothole opened up outside Broad St Station near the crosswalk. Multiple flat tires reported.',
      hashtags: '#NewarkNJ #BroadStreet #Pothole',
      nlpLocation: 'Broad St Station',
      nlpSeverity: 'Medium',
      confidence: 89,
      matchedCameraId: 'CAM-NWK-101',
      gisParcel: '920 Broad St (prop_01)'
    }
  ]);

  // Handlers
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedCameraIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    addNotification(`Updated pinned camera feeds in Sentinel EOC.`);
  };

  const handleRegisterOptInCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optInBizName || !optInAddress) return;
    const newCam = {
      id: `CAM-BIZ-${Math.floor(100 + Math.random() * 900)}`,
      name: `${optInBizName} (Opt-In Partner)`,
      agency: 'Business Camera Partnership Program',
      sourceUrl: 'https://munevo.gov/partner-cctv',
      location: optInAddress,
      address: optInAddress,
      ward: 'Ward 1',
      health: 'ONLINE',
      fps: 30,
      aiStatus: 'NORMAL',
      aiDetection: 'Opt-In Feed Authorized & Active',
      confidence: 99,
      riskLevel: 'LOW',
      incidentCount: 0,
      streamUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
      weather: '68°F Clear',
      lastUpdated: 'Just now',
      udmPropertyId: 'prop_01'
    };
    setCameras(prev => [newCam, ...prev]);
    setShowOptInModal(false);
    setOptInBizName('');
    setOptInAddress('');
    addNotification(`Registered opt-in partner camera stream for ${optInBizName}. Consent logged in UDM.`);
  };

  const handleConvertObservation = (obs: any, targetUDMType: string) => {
    setObservations(prev => prev.map(o => o.id === obs.id ? { ...o, status: `CONVERTED_TO_${targetUDMType.toUpperCase()}` } : o));
    addNotification(`Observation ${obs.id} converted into UDM ${targetUDMType}! Assigned to ${obs.suggestedDept}.`);
  };

  const handleDismissObservation = (id: string) => {
    setObservations(prev => prev.map(o => o.id === id ? { ...o, status: 'DISMISSED' } : o));
    addNotification(`Observation ${id} dismissed.`);
  };

  const filteredCameras = cameras.filter(cam => {
    if (cameraAgencyFilter !== 'all' && !cam.agency.toLowerCase().includes(cameraAgencyFilter.toLowerCase())) return false;
    if (cameraRiskFilter !== 'all' && cam.riskLevel !== cameraRiskFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', height: '100%', overflowY: 'auto' }}>
      
      {/* Sentinel AI Master EOC Header Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(17, 19, 30, 0.96) 100%)',
        borderColor: 'rgba(139, 92, 246, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', background: 'rgba(139, 92, 246, 0.25)', borderRadius: '14px', border: '1px solid rgba(139, 92, 246, 0.5)' }}>
            <Cpu size={32} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Munevo Sentinel AI • Municipal Operations Intelligence Center
              </h1>
              <span className="badge-status badge-primary" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                PALANTIR & COMMAND-CENTRAL CLASS EOC
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', margin: 0 }}>
              Real-time municipal AI correlation, computer-vision camera feeds, social intelligence, and automated UDM triage.
            </p>
          </div>
        </div>

        {/* EOC Navigation Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'eoc-home', label: '🖥️ EOC Operations Home' },
            { id: 'camera-workspace', label: '📹 Camera Operations' },
            { id: 'observation-engine', label: '🤖 AI Observation Engine' },
            { id: 'social-intelligence', label: '🌐 Social Intelligence' },
            { id: 'gis-twin', label: '🗺️ GIS Digital Twin' },
            { id: 'connectors-admin', label: '🔌 Modular Connectors' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? '#8b5cf6' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                border: 0,
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* regional feeds status ticker bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 16px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RadioTower size={14} className="animate-pulse" />
          <span>Active Feed Connectors:</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1 }}>
          {connectorsStatus.map((item, idx) => {
            const isConnected = item.status === 'CONNECTED';
            const isFuture = item.status === 'FUTURE_INTEGRATION';
            const badgeColor = isConnected ? '#10b981' : isFuture ? '#a78bfa' : '#ef4444';
            const badgeBg = isConnected ? 'rgba(16, 185, 129, 0.1)' : isFuture ? 'rgba(167, 139, 250, 0.1)' : 'rgba(239, 68, 68, 0.1)';
            const borderCol = isConnected ? 'rgba(16, 185, 129, 0.3)' : isFuture ? 'rgba(167, 139, 250, 0.3)' : 'rgba(239, 68, 68, 0.3)';

            return (
              <span key={idx} style={{ background: badgeBg, color: badgeColor, border: `1px solid ${borderCol}`, padding: '2px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: badgeColor }} />
                {item.name}: <strong>{item.status.replace('_', ' ')}</strong>
              </span>
            );
          })}
        </div>
        <button
          onClick={() => setShowOptInModal(true)}
          style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={12} /> Opt-In Partner
        </button>
      </div>

      {/* TAB 1: EOC OPERATIONS CENTER HOME */}
      {activeTab === 'eoc-home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Executive AI Briefing & City Health Score Widgets Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
            
            {/* Executive AI Briefing */}
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(17, 19, 30, 0.9) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} style={{ color: '#a78bfa' }} />
                  <span>Executive AI Municipal Briefing</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Updated 2 mins ago</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                • <strong>Flooding Alert</strong>: Computer vision on CAM-NWK-104 detected 3 inches water accumulation at Ferry St & Raymond Blvd. DPW work order auto-drafted.<br/>
                • <strong>Structural Risk</strong>: Facade decay at 129 Washington St (CAM-NWK-115) reaches 97% confidence. Code Enforcement & Fire Rescue notified.<br/>
                • <strong>Traffic Corridor</strong>: Broad St collision clearing. Average traffic speed returning to 28 mph.
              </p>
            </div>

            {/* City Health Score Widget */}
            <div className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>City Operational Health Index</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981', margin: 0, lineHeight: 1 }}>
                94<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>NOMINAL OPERATIONAL STATE</div>
            </div>

            {/* Live Weather & Traffic Status Widget */}
            <div className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CloudRain size={14} style={{ color: '#3b82f6' }} />
                <span>Newark Weather & Transit</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>68°F • Light Rain</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Wind: 8 mph NW • Traffic: <strong>88% Normal Flow</strong>
              </div>
            </div>

          </div>

          {/* EOC Main Panels Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Active AI Detected Risks & Critical Alerts */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="card-header">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Active AI Detected Risks & Critical Alerts ({observations.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {observations.map(obs => (
                  <div key={obs.id} style={{ background: 'rgba(0,0,0,0.25)', border: obs.riskTier === 'HIGH' ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{obs.title}</span>
                      <span className={`badge-status ${obs.riskTier === 'HIGH' ? 'badge-danger' : 'badge-success'}`}>
                        {obs.riskTier} RISK
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {obs.location} • AI Confidence: <strong>{obs.confidence}%</strong></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px' }}>
                      Suggested Response: <strong>{obs.suggestedResponse}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button 
                        onClick={() => handleConvertObservation(obs, 'WorkOrder')}
                        style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '6px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Create UDM Work Order
                      </button>
                      <button 
                        onClick={() => handleConvertObservation(obs, 'EmergencyIncident')}
                        style={{ background: '#ef4444', color: '#fff', border: 0, padding: '6px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Dispatch Emergency CAD
                      </button>
                      <button 
                        onClick={() => handleDismissObservation(obs.id)}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Incident Timeline & Chronology */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="card-header">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Real-Time Incident Chronology Timeline
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px', borderLeft: '2px solid rgba(139, 92, 246, 0.4)' }}>
                {[
                  { time: '08:41 AM', title: 'Vehicle Dwell Disruption Flagged', sub: 'CAM-NWK-101 detected stopped vehicle in center transit lane.' },
                  { time: '08:43 AM', title: 'Vapor / Smoke Density Expansion', sub: 'Computer vision flagged grey pixel density increase.' },
                  { time: '08:45 AM', title: 'Public Social Media Post Corroborated', sub: '@NewarkCommuter_NJ posted broad street flooding alert.' },
                  { time: '08:47 AM', title: 'CAD Dispatch Verified', sub: 'Newark Dispatcher confirmed Engine 3 assigned.' },
                  { time: '09:03 AM', title: 'Incident Resolved & Archived', sub: 'Public Works crew cleared street drainage.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a78bfa' }}>{item.time}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>{item.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: CAMERA OPERATIONS WORKSPACE */}
      {activeTab === 'camera-workspace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Controls & Grid Layout Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Layout Grid:</span>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px' }}>
                {(['2x2', '3x3', '4x4', '5x5', '6x6', 'unlimited'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setGridMode(mode)}
                    style={{
                      background: gridMode === mode ? '#3b82f6' : 'transparent',
                      color: gridMode === mode ? '#fff' : 'var(--text-muted)',
                      border: 0,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                value={cameraAgencyFilter}
                onChange={e => setCameraAgencyFilter(e.target.value)}
                style={{ background: '#12141c', border: '1px solid var(--border-color)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem' }}
              >
                <option value="all">All Regional Agencies</option>
                <option value="NJ511">NJ511 Regional</option>
                <option value="Turnpike">NJ Turnpike Authority</option>
                <option value="NYC DOT">NYC DOT</option>
                <option value="Public Safety">Newark Public Safety</option>
                <option value="Opt-In">Opt-In Business Partners</option>
              </select>

              <select
                value={cameraRiskFilter}
                onChange={e => setCameraRiskFilter(e.target.value)}
                style={{ background: '#12141c', border: '1px solid var(--border-color)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem' }}
              >
                <option value="all">All Risk Tiers</option>
                <option value="CRITICAL">Critical Alerts</option>
                <option value="HIGH">High Alerts</option>
                <option value="MEDIUM">Medium Alerts</option>
                <option value="LOW">Low Risk / Nominal</option>
              </select>
            </div>
          </div>

          {/* Camera Grid View */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 
              gridMode === '2x2' ? 'repeat(2, 1fr)' : 
              gridMode === '3x3' ? 'repeat(3, 1fr)' : 
              gridMode === '4x4' ? 'repeat(4, 1fr)' : 
              gridMode === '5x5' ? 'repeat(5, 1fr)' : 
              gridMode === '6x6' ? 'repeat(6, 1fr)' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {filteredCameras.map(cam => {
              const isPinned = pinnedCameraIds.includes(cam.id);
              return (
                <div
                  key={cam.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '12px',
                    gap: '10px',
                    border: cam.riskLevel === 'CRITICAL' ? '2px solid #ef4444' : cam.riskLevel === 'HIGH' ? '1px solid #f97316' : '1px solid var(--border-color)',
                    background: cam.riskLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(17, 19, 30, 0.85)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{cam.name}</span>
                        {isPinned && <Pin size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {cam.sourceAgency || cam.agency} • {cam.roadway || cam.location || 'Regional Corridor'} ({cam.state || 'NJ'})
                      </div>
                    </div>
                    <button
                      onClick={e => handleTogglePin(cam.id, e)}
                      style={{ background: 'transparent', border: 0, color: isPinned ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                    >
                      <Pin size={14} />
                    </button>
                  </div>

                  {/* Feed Window */}
                  <div style={{ position: 'relative', height: '180px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: '#090b10' }}>
                    {cam.imageUrl || cam.streamUrl ? (
                      <img src={cam.imageUrl || cam.streamUrl} alt={cam.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--text-muted)' }}>
                        <Video size={28} />
                        <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>EXTERNAL OFFICIAL VIEW</span>
                        <a href={cam.officialPageUrl} target="_blank" rel="noreferrer" style={{ background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.68rem', textDecoration: 'none', fontWeight: 700 }}>
                          Open Official View
                        </a>
                      </div>
                    )}
                    
                    {/* Media Type Badge */}
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 800, color: cam.mediaType === 'LIVE_VIDEO' ? '#10b981' : '#3b82f6' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cam.mediaType === 'LIVE_VIDEO' ? '#10b981' : '#3b82f6' }} className="animate-pulse" />
                      <span>{cam.mediaType === 'LIVE_VIDEO' ? 'LIVE VIDEO' : cam.mediaType === 'REFRESHED_IMAGE' ? `REFRESHED IMAGE (${cam.refreshIntervalSeconds || 15}s)` : 'OFFICIAL VIEW'}</span>
                    </div>

                    {/* Source Attribution Overlay */}
                    {cam.attribution && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(10, 12, 18, 0.88)', padding: '4px 8px', fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Source: {cam.attribution.agency}</span>
                        <a href={cam.officialPageUrl} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          Official Page <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Buttons Action Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={() => setSelectedCameraForModal(cam)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                    >
                      <Maximize2 size={12} /> Expand
                    </button>
                    <button
                      onClick={() => onOpenChart && onOpenChart('property', 'prop_01')}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#3b82f6', padding: '6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                    >
                      <MapPin size={12} /> UDM Parcel
                    </button>
                    <button
                      onClick={() => addNotification(`Captured snapshot frame from ${cam.name}`)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#10b981', padding: '6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                    >
                      <Camera size={12} /> Snapshot
                    </button>
                    <button
                      onClick={() => addNotification(`Logged manual observation for ${cam.name}`)}
                      style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid #8b5cf6', color: '#8b5cf6', padding: '6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                    >
                      <Plus size={12} /> Observation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AI OBSERVATION ENGINE & UDM TRIAGE */}
      {activeTab === 'observation-engine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
            Universal Data Model AI Observation Engine ({observations.length})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {observations.map(obs => (
              <div key={obs.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6' }}>{obs.id}</span>
                  <span className={`badge-status ${obs.riskTier === 'HIGH' ? 'badge-danger' : 'badge-success'}`}>
                    {obs.riskTier} RISK TIER
                  </span>
                </div>

                <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden' }}>
                  <img src={obs.evidenceMedia} alt={obs.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{obs.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {obs.location}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', padding: '10px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Suggested Dept: <strong>{obs.suggestedDept}</strong><br/>
                  Priority: <strong>{obs.suggestedPriority}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    onClick={() => handleConvertObservation(obs, '311Request')}
                    style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + 311 Request
                  </button>
                  <button 
                    onClick={() => handleConvertObservation(obs, 'WorkOrder')}
                    style={{ background: '#10b981', color: '#fff', border: 0, padding: '8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Work Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SOCIAL INTELLIGENCE */}
      {activeTab === 'social-intelligence' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Public Social Media & News Intelligence</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {socialPosts.map(post => (
                <div key={post.id} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3b82f6' }}>{post.user} ({post.platform})</div>
                  <div style={{ fontSize: '0.8rem', color: '#fff' }}>"{post.text}"</div>
                  <div style={{ fontSize: '0.72rem', color: '#a78bfa' }}>{post.hashtags}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GIS Link: <strong>{post.gisParcel}</strong></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GIS DIGITAL TWIN */}
      {activeTab === 'gis-twin' && (
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>GIS Spatial Digital Twin Canvas</h3>
          <div style={{ height: '400px', background: '#090b10', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <Compass size={48} style={{ color: '#3b82f6' }} className="animate-spin" />
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '12px' }}>UDM Digital Twin Map Connected</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Showing nearby hydrants, cameras, permits, and work orders.</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MODULAR CONNECTORS & ADMIN */}
      {activeTab === 'connectors-admin' && (
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Modular Connector Architecture & Admin</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { title: 'ShotSpotter Gunshot API', status: 'CONNECTED', type: 'Sensor' },
              { title: 'NJ Turnpike Authority (NJTA)', status: 'CONNECTED', type: 'Camera' },
              { title: 'NJ511 Travel API', status: 'CONNECTED', type: 'Camera' },
              { title: 'Drone Feeds Gateway', status: 'READY', type: 'Aerial' },
              { title: 'License Plate Readers (LPR)', status: 'CONNECTED', type: 'ALPR' },
              { title: 'Environmental Flood Sensors', status: 'CONNECTED', type: 'IoT' }
            ].map((conn, idx) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{conn.title}</div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Status: {conn.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OPT-IN MODAL */}
      {showOptInModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 11000 }}>
          <div className="glass-card" style={{ width: '480px', padding: '24px', background: '#12141c', border: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Register Business Opt-In Camera Feed</div>
              <button onClick={() => setShowOptInModal(false)} style={{ background: 'none', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleRegisterOptInCamera} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Business / Entity Name</label>
                <input 
                  type="text" 
                  className="ai-input" 
                  placeholder="e.g. Ironbound National Bank"
                  value={optInBizName} 
                  onChange={e => setOptInBizName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Camera Location Address</label>
                <input 
                  type="text" 
                  className="ai-input" 
                  placeholder="e.g. 85 Ferry St, Newark, NJ"
                  value={optInAddress} 
                  onChange={e => setOptInAddress(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={optInConsent} 
                  onChange={e => setOptInConsent(e.target.checked)}
                  style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#fff' }}>I explicitly authorize sharing this exterior camera stream with Newark Municipal EOC.</span>
              </div>

              <button 
                type="submit" 
                style={{ background: '#10b981', color: '#fff', border: 0, padding: '10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}
              >
                Authorize & Connect Stream
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EXPANDED CAMERA MODAL */}
      {selectedCameraForModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 11000 }}>
          <div className="glass-card" style={{ width: '800px', padding: '24px', background: '#0e1017', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{selectedCameraForModal.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedCameraForModal.agency} • {selectedCameraForModal.address}</div>
              </div>
              <button onClick={() => setSelectedCameraForModal(null)} style={{ background: 'none', border: 0, color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ height: '420px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src={selectedCameraForModal.streamUrl} alt={selectedCameraForModal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              🤖 AI Live Detection: <strong>{selectedCameraForModal.aiDetection}</strong> ({selectedCameraForModal.confidence}% confidence)
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
