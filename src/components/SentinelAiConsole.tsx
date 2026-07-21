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
  Lock
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
  // Navigation Tabs: 'camera-wall' | 'triage-matrix' | 'social-intel' | 'digital-twin-gis' | 'briefings' | 'admin-governance'
  const [activeTab, setActiveTab] = useState<'camera-wall' | 'triage-matrix' | 'social-intel' | 'digital-twin-gis' | 'briefings' | 'admin-governance'>('camera-wall');

  // Camera Wall State
  const [gridMode, setGridMode] = useState<'2x2' | '3x3' | '4x4' | '6x6' | 'unlimited'>('3x3');
  const [cameraAgencyFilter, setCameraAgencyFilter] = useState('all');
  const [cameraRiskFilter, setCameraRiskFilter] = useState('all');
  const [pinnedCameraIds, setPinnedCameraIds] = useState<string[]>(['CAM-NWK-104', 'CAM-NWK-115']);
  const [selectedCameraForModal, setSelectedCameraForModal] = useState<any>(null);
  const [showOptInModal, setShowOptInModal] = useState(false);

  // Opt-in Business Registration Form
  const [optInBizName, setOptInBizName] = useState('');
  const [optInAddress, setOptInAddress] = useState('');
  const [optInConsent, setOptInConsent] = useState(true);

  // Camera Feeds Catalog
  const [cameras, setCameras] = useState([
    {
      id: 'CAM-NWK-101',
      name: 'Broad St & Market St - North',
      agency: 'NJ DOT 511 Feed',
      location: 'Broad St & Market St (Downtown Newark)',
      address: '920 Broad St, Newark, NJ',
      ward: 'Central Ward',
      health: 'ONLINE',
      fps: 30,
      aiStatus: 'ACTIVE_ALERT',
      aiDetection: 'Pedestrian Congestion & Vehicle Backup',
      confidence: 92,
      riskLevel: 'MEDIUM',
      streamUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&auto=format&fit=crop&q=80',
      weather: '68°F Clear',
      lastUpdated: '1s ago',
      udmPropertyId: 'prop_01'
    },
    {
      id: 'CAM-NWK-104',
      name: 'Ferry St & Raymond Blvd - East',
      agency: 'Newark Public Safety',
      location: 'Ferry St & Raymond Blvd (Ironbound)',
      address: '125 Ferry St, Newark, NJ',
      ward: 'Ward 1',
      health: 'ONLINE',
      fps: 30,
      aiStatus: 'ACTIVE_ALERT',
      aiDetection: 'Roadway Water Accumulation (Flooding)',
      confidence: 94,
      riskLevel: 'HIGH',
      streamUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80',
      weather: '68°F Light Rain',
      lastUpdated: 'Just now',
      udmPropertyId: 'prop_04'
    },
    {
      id: 'CAM-NWK-108',
      name: 'McCarter Hwy & Raymond Blvd',
      agency: 'NJ Transit Operations',
      location: 'McCarter Hwy & Raymond Blvd',
      address: '200 McCarter Hwy, Newark, NJ',
      ward: 'Ward 1',
      health: 'ONLINE',
      fps: 30,
      aiStatus: 'NORMAL',
      aiDetection: 'Traffic Flow Nominal (32 mph avg)',
      confidence: 98,
      riskLevel: 'LOW',
      streamUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
      weather: '68°F Clear',
      lastUpdated: '2s ago',
      udmPropertyId: 'prop_02'
    },
    {
      id: 'CAM-NWK-112',
      name: 'Prudential Center Plaza West',
      agency: 'Newark Municipal Security',
      location: 'Lafayette St & Mulberry St',
      address: '25 Lafayette St, Newark, NJ',
      ward: 'Central Ward',
      health: 'ONLINE',
      fps: 30,
      aiStatus: 'ACTIVE_ALERT',
      aiDetection: 'Unscheduled Event Gathering (150+ People)',
      confidence: 88,
      riskLevel: 'MEDIUM',
      streamUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      weather: '68°F Clear',
      lastUpdated: 'Just now',
      udmPropertyId: 'prop_02'
    },
    {
      id: 'CAM-NWK-115',
      name: 'Washington St & Central Ave',
      agency: 'Newark Code Enforcement',
      location: '129 Washington St',
      address: '129 Washington St, Newark, NJ',
      ward: 'Central Ward',
      health: 'ONLINE',
      fps: 30,
      aiStatus: 'CRITICAL_ALERT',
      aiDetection: 'Vacant Building Facade Masonry Decay',
      confidence: 96,
      riskLevel: 'CRITICAL',
      streamUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      weather: '68°F Clear',
      lastUpdated: 'Just now',
      udmPropertyId: 'prop_03'
    },
    {
      id: 'CAM-BIZ-042',
      name: 'Ironbound Bank Plaza (Opt-In Partner)',
      agency: 'Opt-In Business Partner',
      location: 'Ferry St Plaza Entrance',
      address: '85 Ferry St, Newark, NJ',
      ward: 'Ward 1',
      health: 'ONLINE',
      fps: 30,
      aiStatus: 'ACTIVE_ALERT',
      aiDetection: 'Illegal Dumping / Refuse Accumulation',
      confidence: 94,
      riskLevel: 'LOW',
      streamUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
      weather: '68°F Clear',
      lastUpdated: '3s ago',
      udmPropertyId: 'prop_01'
    }
  ]);

  // AI Triage Observations Queue State
  const [observations, setObservations] = useState([
    {
      id: 'OBS-2026-901',
      title: 'Illegal Dumping Detected in Alleyway',
      riskTier: 'LOW',
      category: 'Sanitation / Public Works',
      location: '85 Ferry St (Ironbound Ward 1)',
      cameraId: 'CAM-BIZ-042',
      confidence: 94,
      reasoning: 'Vehicle stopped for 12 mins. Objects unloaded into public alley. Debris left behind. Matches 311 refusal history.',
      status: 'AUTO_DRAFT_WORK_ORDER',
      autoRoutedDept: 'Public Works & Sanitation',
      timestamp: '4 mins ago',
      evidenceMedia: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: 'OBS-2026-894',
      title: 'Vehicle Collision Blocking Broad St Transit Corridor',
      riskTier: 'MEDIUM',
      category: 'Traffic & Public Safety',
      location: 'Broad St & Market St (Downtown)',
      cameraId: 'CAM-NWK-101',
      confidence: 91,
      reasoning: '2 passenger vehicles collided in center lane. Traffic backup extending 3 blocks. Corroborated by 2 DOT sensors.',
      status: 'NEEDS_VERIFICATION',
      autoRoutedDept: 'Traffic Management & Police Dispatch',
      timestamp: '8 mins ago',
      evidenceMedia: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: 'OBS-2026-888',
      title: 'Structural Facade Masonry Collapse Indicator',
      riskTier: 'CRITICAL',
      category: 'Building Safety & Emergency Management',
      location: '129 Washington St (Central Ward)',
      cameraId: 'CAM-NWK-115',
      confidence: 96,
      reasoning: 'Computer vision flagged brickwork displacement on 4th floor cornice. Pedestrian sidewalk hazard detected. Prior code violations exist.',
      status: 'CRITICAL_VERIFICATION_REQUIRED',
      autoRoutedDept: 'Code Enforcement & Fire Rescue EOC',
      timestamp: '12 mins ago',
      evidenceMedia: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60'
    }
  ]);

  // Social Media Intelligence Posts State
  const [socialPosts, setSocialPosts] = useState([
    {
      id: 'SOC-904',
      platform: 'Public Social Feed',
      user: '@NewarkCommuter_NJ',
      timestamp: '5 mins ago',
      text: 'Water is rising super fast under the Ferry St bridge near Raymond Blvd! Avoid the area if driving.',
      hashtags: '#NewarkNJ #Ironbound #Flooding',
      nlpLocation: 'Ferry St & Raymond Blvd',
      nlpSeverity: 'High',
      confidence: 95,
      matchedCameraId: 'CAM-NWK-104',
      corroborated: true
    },
    {
      id: 'SOC-899',
      platform: 'Public News Stream',
      user: '@NJTrafficAlerts_Public',
      timestamp: '14 mins ago',
      text: 'Major pothole opened up outside Broad St Station near the crosswalk. Multiple flat tires reported.',
      hashtags: '#NewarkNJ #BroadStreet #Pothole',
      nlpLocation: 'Broad St Station',
      nlpSeverity: 'Medium',
      confidence: 89,
      matchedCameraId: 'CAM-NWK-101',
      corroborated: true
    }
  ]);

  // Handlers
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedCameraIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    addNotification(`Updated camera pin layout in Sentinel EOC.`);
  };

  const handleRegisterOptInCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optInBizName || !optInAddress) return;
    const newCam = {
      id: `CAM-BIZ-${Math.floor(100 + Math.random() * 900)}`,
      name: `${optInBizName} (Opt-In Partner)`,
      agency: 'Opt-In Business Partner',
      location: optInAddress,
      address: optInAddress,
      ward: 'Ward 1',
      health: 'ONLINE',
      fps: 30,
      aiStatus: 'NORMAL',
      aiDetection: 'Camera Stream Authorized & Active',
      confidence: 99,
      riskLevel: 'LOW',
      streamUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
      weather: '68°F Clear',
      lastUpdated: 'Just now',
      udmPropertyId: 'prop_01'
    };
    setCameras(prev => [newCam, ...prev]);
    setShowOptInModal(false);
    setOptInBizName('');
    setOptInAddress('');
    addNotification(`Registered opt-in partner camera stream for ${optInBizName}. Consent logged.`);
  };

  const handleApproveObservation = (id: string, actionName: string) => {
    setObservations(prev => prev.map(obs => obs.id === id ? { ...obs, status: 'VERIFIED' } : obs));
    addNotification(`Approved Observation ${id}: ${actionName}. Work order / dispatch routed.`);
  };

  const handleRejectObservation = (id: string) => {
    setObservations(prev => prev.map(obs => obs.id === id ? { ...obs, status: 'REJECTED' } : obs));
    addNotification(`Observation ${id} rejected and archived.`);
  };

  const filteredCameras = cameras.filter(cam => {
    if (cameraAgencyFilter !== 'all' && !cam.agency.toLowerCase().includes(cameraAgencyFilter.toLowerCase())) return false;
    if (cameraRiskFilter !== 'all' && cam.riskLevel !== cameraRiskFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', height: '100%', overflowY: 'auto' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(17, 19, 30, 0.95) 100%)',
        borderColor: 'rgba(139, 92, 246, 0.35)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '14px', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
            <Brain size={32} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Munevo Sentinel AI • City Operations Intelligence Platform
              </h1>
              <span className="badge-status badge-primary" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                LIVE AI EOC ENGINE
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', margin: 0 }}>
              Autonomous computer-vision, multi-source correlation, public social intelligence, and human-verified triage.
            </p>
          </div>
        </div>

        {/* Sentinel Primary Navigation */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'camera-wall', label: '📹 EOC Camera Wall' },
            { id: 'triage-matrix', label: '🧠 AI Triage Matrix' },
            { id: 'social-intel', label: '🌐 Social Intelligence' },
            { id: 'digital-twin-gis', label: '🗺️ Digital Twin & GIS' },
            { id: 'briefings', label: '⚡ AI Briefings' },
            { id: 'admin-governance', label: '⚙️ Admin & Governance' }
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

      {/* Monitoring Hashtag Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 16px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radio size={14} className="animate-pulse" />
          <span>Active City Feeds:</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1 }}>
          {['#NewarkNJ', '#DowntownNewark', '#Ironbound', '#BroadStreet', '#PrudentialCenter', '#BranchBrookPark', '#NewarkPennStation', '#511NJ', '#NWSNewark'].map((tag, idx) => (
            <span key={idx} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600 }}>
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={() => setShowOptInModal(true)}
          style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={12} /> Opt-In Business Camera
        </button>
      </div>

      {/* TAB 1: EOC CAMERA WALL (FULL-SCREEN OPERATIONS CENTER) */}
      {activeTab === 'camera-wall' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Controls & Grid Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px' }}>
            
            {/* Grid Layout Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Grid Layout:</span>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px' }}>
                {(['2x2', '3x3', '4x4', '6x6', 'unlimited'] as const).map(mode => (
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

            {/* Agency & Risk Filters */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                value={cameraAgencyFilter}
                onChange={e => setCameraAgencyFilter(e.target.value)}
                style={{ background: '#12141c', border: '1px solid var(--border-color)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem' }}
              >
                <option value="all">All Camera Agencies</option>
                <option value="NJ DOT">NJ DOT 511</option>
                <option value="Public Safety">Newark Public Safety</option>
                <option value="Transit">NJ Transit</option>
                <option value="Opt-In">Opt-In Business Partners</option>
              </select>

              <select
                value={cameraRiskFilter}
                onChange={e => setCameraRiskFilter(e.target.value)}
                style={{ background: '#12141c', border: '1px solid var(--border-color)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem' }}
              >
                <option value="all">All Risk Levels</option>
                <option value="CRITICAL">Critical Alerts</option>
                <option value="HIGH">High Alerts</option>
                <option value="MEDIUM">Medium Alerts</option>
                <option value="LOW">Low Risk / Nominal</option>
              </select>
            </div>

          </div>

          {/* Camera Grid Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 
              gridMode === '2x2' ? 'repeat(2, 1fr)' : 
              gridMode === '3x3' ? 'repeat(3, 1fr)' : 
              gridMode === '4x4' ? 'repeat(4, 1fr)' : 
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
                  {/* Camera Tile Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{cam.name}</span>
                        {isPinned && <Pin size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {cam.agency} • {cam.ward}
                      </div>
                    </div>
                    <button
                      onClick={e => handleTogglePin(cam.id, e)}
                      style={{ background: 'transparent', border: 0, color: isPinned ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                    >
                      <Pin size={14} />
                    </button>
                  </div>

                  {/* Simulated Live Feed Window with AI Bounding Box */}
                  <div style={{ position: 'relative', height: '180px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img src={cam.streamUrl} alt={cam.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    {/* Live REC Indicator */}
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 800, color: '#10b981' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} className="animate-pulse" />
                      <span>LIVE 30 FPS</span>
                    </div>

                    {/* AI Bounding Box Overlay */}
                    {cam.aiStatus !== 'NORMAL' && (
                      <div style={{
                        position: 'absolute',
                        top: '25%',
                        left: '20%',
                        right: '20%',
                        bottom: '25%',
                        border: `2px dashed ${cam.riskLevel === 'CRITICAL' ? '#ef4444' : '#f97316'}`,
                        borderRadius: '6px',
                        boxShadow: '0 0 15px rgba(239,68,68,0.4)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '4px'
                      }}>
                        <span style={{ background: cam.riskLevel === 'CRITICAL' ? '#ef4444' : '#f97316', color: '#fff', fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                          🤖 AI DETECTED: {cam.aiDetection} ({cam.confidence}%)
                        </span>
                      </div>
                    )}

                    {/* Bottom Camera Info Banner */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      background: 'rgba(12, 14, 22, 0.9)',
                      padding: '6px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.68rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <span>📍 {cam.location}</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{cam.weather}</span>
                    </div>
                  </div>

                  {/* Tile Footer Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={() => setSelectedCameraForModal(cam)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                    >
                      <Maximize2 size={12} /> Expand
                    </button>
                    <button
                      onClick={() => onOpenChart && onOpenChart('property', cam.udmPropertyId)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#3b82f6', padding: '6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                    >
                      <MapPin size={12} /> UDM Parcel
                    </button>
                    <button
                      onClick={() => addNotification(`Showing nearby hydrants & assets for ${cam.name}`)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#10b981', padding: '6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                    >
                      <Layers size={12} /> Assets
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

      {/* TAB 2: AI TRIAGE MATRIX & WORKFLOWS */}
      {activeTab === 'triage-matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
            Sentinel AI Automated Triage & Human Verification Queue ({observations.length})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {observations.map(obs => (
              <div
                key={obs.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '18px',
                  border: obs.riskTier === 'CRITICAL' ? '1px solid #ef4444' : obs.riskTier === 'MEDIUM' ? '1px solid #f97316' : '1px solid var(--border-color)',
                  background: obs.riskTier === 'CRITICAL' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(17, 19, 30, 0.85)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6' }}>{obs.id}</span>
                  <span className={`badge-status ${obs.riskTier === 'CRITICAL' ? 'badge-danger' : obs.riskTier === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}>
                    {obs.riskTier} RISK TIER
                  </span>
                </div>

                {/* Evidence Image */}
                <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src={obs.evidenceMedia} alt={obs.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{obs.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {obs.location}</div>
                </div>

                {/* AI Reasoning Box */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} />
                    <span>AI Reasoning Engine ({obs.confidence}% Confidence)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {obs.reasoning}
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Auto-Routing: <strong style={{ color: '#fff' }}>{obs.autoRoutedDept}</strong>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => handleApproveObservation(obs.id, 'Work Order Dispatched')}
                    style={{ background: '#10b981', color: '#fff', border: 0, padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <CheckCircle2 size={14} /> Approve & Route
                  </button>

                  <button
                    onClick={() => handleRejectObservation(obs.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL MEDIA INTELLIGENCE */}
      {activeTab === 'social-intel' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Public Social Media Intelligence Stream
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Publicly accessible posts, news feeds, and hashtag monitors processed via Sentinel NLP.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {socialPosts.map(post => (
                <div key={post.id} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3b82f6' }}>{post.user} ({post.platform})</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{post.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#fff', lineHeight: 1.4 }}>"{post.text}"</div>
                  <div style={{ fontSize: '0.72rem', color: '#a78bfa' }}>{post.hashtags}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                    <span>Extracted Location: <strong>{post.nlpLocation}</strong></span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>Matched Camera: {post.matchedCameraId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Incident Chronology Timeline */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Chronological Incident Timeline Builder
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '10px', borderLeft: '2px solid rgba(139, 92, 246, 0.4)' }}>
              {[
                { time: '08:41 AM', title: 'Vehicle Stopped in Intersection', sub: 'CAM-NWK-101 flagged unusual 12-min vehicle dwell time.' },
                { time: '08:43 AM', title: 'Smoke / Vapor Dispersal Detected', sub: 'Computer vision flagged grey pixel density expansion.' },
                { time: '08:44 AM', title: 'Thermal / Flame Signature Visible', sub: 'Camera stream high-intensity heat reflection confirmed.' },
                { time: '08:45 AM', title: 'Public Social Media Reports', sub: '@NewarkCommuter_NJ posted location tag near Broad St.' },
                { time: '08:47 AM', title: 'CAD Dispatch Verified', sub: 'Newark Dispatcher confirmed Engine 3 en route.' },
                { time: '09:03 AM', title: 'Incident Resolved', sub: 'Fire extinguished. Road cleared by Public Works.' }
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a78bfa' }}>{step.time}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>{step.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{step.sub}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: DIGITAL TWIN & GIS SPATIAL INTEGRATION */}
      {activeTab === 'digital-twin-gis' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Newark Digital Twin & GIS Operational Spatial Layer
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Unified Data Model (UDM) spatial map correlating active cameras, parcels, hydrants, permits, 311s, and emergency units.
              </p>
            </div>
          </div>

          <div style={{ position: 'relative', height: '400px', background: '#090b10', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Compass size={48} style={{ color: '#3b82f6' }} className="animate-spin" />
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Interactive GIS Digital Twin Canvas</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>6 Active Cameras • 14 Hydrants • 2 Active CAD Incidents • 82 UDM Parcels Loaded</div>
              <button 
                onClick={() => addNotification('Opened full spatial GIS map layer.')}
                style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Launch Full GIS Canvas Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI EXECUTIVE BRIEFINGS */}
      {activeTab === 'briefings' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Sentinel AI Automated Municipal Risk Briefings
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Daily executive risk summaries generated for City Manager, Emergency Management, and Department Heads.
              </p>
            </div>
            <button 
              onClick={() => addNotification('Generated Fresh Morning Municipal Risk Briefing.')}
              style={{ background: '#8b5cf6', color: '#fff', border: 0, padding: '8px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              ⚡ Regenerate Briefing
            </button>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
              Morning Municipal Risk Brief • Newark, NJ (July 21, 2026)
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              • <strong>Infrastructure</strong>: 1 water main accumulation cluster identified in Ironbound (Ferry St). Public Works notified.<br/>
              • <strong>Traffic & Transit</strong>: Broad Street Station pothole hazard corroborated by 2 public sources. Pavement repair work order drafted.<br/>
              • <strong>Buildings</strong>: Vacant building facade decay flagged on Washington St. Code Enforcement inspection scheduled.
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ADMIN & CIVIL RIGHTS GOVERNANCE */}
      {activeTab === 'admin-governance' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Sentinel Admin & Civil Rights Governance
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Source credentials, API keys, AI thresholds, privacy safeguards, and strict legal compliance parameters.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Active Data Connectors</div>
              <div style={{ fontSize: '0.78rem', color: '#10b981' }}>✔ NJ DOT Public Traffic Feeds (Connected)</div>
              <div style={{ fontSize: '0.78rem', color: '#10b981' }}>✔ National Weather Service Alert Feeds (Connected)</div>
              <div style={{ fontSize: '0.78rem', color: '#10b981' }}>✔ Opt-In Business Partner API Gateway (Active)</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#8b5cf6' }}>Privacy & Governance Policy</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                • Public-source and authorized opt-in data collection only.<br/>
                • Facial recognition strictly DISABLED by default.<br/>
                • Zero automated enforcement (Human Analyst Review Required for High-Risk).<br/>
                • Audit log tracking every observation, verification, and dispatch action.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPT-IN BUSINESS CAMERA REGISTRATION MODAL */}
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
