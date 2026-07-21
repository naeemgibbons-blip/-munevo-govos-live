import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'verification-queue' | 'clusters' | 'briefings' | 'connectors'>('verification-queue');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sentinel Signals Queue State
  const [signals, setSignals] = useState([
    {
      id: 'SIG-2026-881',
      source: 'Public Weather & Traffic Camera Feed #NWK-CAM-42',
      account: 'Public DOT Feed',
      timestamp: '6 mins ago',
      text: 'Water accumulating rapidly at Ferry St & Raymond Blvd intersection. Cars slowing down.',
      hashtags: '#NewarkNJ #Ironbound #Flooding',
      category: 'Infrastructure',
      subcategory: 'Flooding & Water Main',
      location: 'Ferry St & Raymond Blvd (Ward 1)',
      gisCoords: [420, 410],
      aiObservation: 'Possible Roadway Flooding & Water Accumulation',
      confidence: 94,
      status: 'AWAITING_REVIEW',
      mediaType: 'Video Stream',
      mediaUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=60',
      corroborationsCount: 4
    },
    {
      id: 'SIG-2026-879',
      source: 'Public Social Post',
      account: '@NewarkCommuter_NJ',
      timestamp: '14 mins ago',
      text: 'Huge pothole open right outside Broad St Station near north crosswalk. Saw two tires get blown.',
      hashtags: '#NewarkNJ #BroadStreet #RoadHazard',
      category: 'Traffic & Transportation',
      subcategory: 'Pothole & Road Damage',
      location: 'Broad St & Atlantic St (Downtown)',
      gisCoords: [230, 150],
      aiObservation: 'Pothole & Roadway Pavement Structural Defect',
      confidence: 89,
      status: 'AWAITING_REVIEW',
      mediaType: 'Photo',
      mediaUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60',
      corroborationsCount: 2
    },
    {
      id: 'SIG-2026-874',
      source: 'Public Video Listing',
      account: '@NewarkArchitect_Public',
      timestamp: '28 mins ago',
      text: 'Bricks falling from upper facade of vacant commercial building on Washington St.',
      hashtags: '#NewarkNJ #CodeEnforcement #BuildingSafety',
      category: 'Buildings & Property',
      subcategory: 'Unsafe Structure Facade',
      location: '129 Washington St (Central Ward)',
      gisCoords: [250, 350],
      aiObservation: 'Exterior Building Facade Structural Decay',
      confidence: 91,
      status: 'VERIFIED',
      mediaType: 'Video Clip',
      mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60',
      corroborationsCount: 3
    }
  ]);

  const handleVerifySignal = (id: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, status: 'VERIFIED' } : s));
    addNotification(`Sentinel Signal ${id} verified. Added to City Pulse & Public Works routing.`);
  };

  const handleDiscardSignal = (id: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, status: 'DISCARDED' } : s));
    addNotification(`Sentinel Signal ${id} marked discarded.`);
  };

  const handleCreateDraft311 = (sig: any) => {
    addNotification(`Created Draft 311 Work Order for ${sig.location} (${sig.subcategory}). Routed to Operations.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', height: '100%', overflowY: 'auto' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(17, 19, 30, 0.95) 100%)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '14px', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
            <Brain size={32} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Munevo Sentinel AI • Situational Awareness & Risk Detection
              </h1>
              <span className="badge-status badge-primary" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                PUBLIC-SOURCE AI SIGNAL ENGINE
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', margin: 0 }}>
              Human-verified municipal intelligence, public-source signal corroboration, and City Pulse integration.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'verification-queue', label: '🔍 Verification Queue' },
            { id: 'clusters', label: '🌐 Signal Clusters' },
            { id: 'briefings', label: '⚡ AI Executive Briefs' },
            { id: 'connectors', label: '🔌 Connectors & Governance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? '#8b5cf6' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                border: 0,
                padding: '8px 14px',
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

      {/* Monitoring Bar Hashtag Ticker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 16px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radio size={14} className="animate-pulse" />
          <span>Active Tracking Hashtags:</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1 }}>
          {['#NewarkNJ', '#DowntownNewark', '#Ironbound', '#BroadStreet', '#PrudentialCenter', '#BranchBrookPark', '#NewarkPennStation'].map((tag, idx) => (
            <span key={idx} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* TAB 1: HUMAN VERIFICATION QUEUE */}
      {activeTab === 'verification-queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
              Pending Analyst Review Signals ({signals.filter(s => s.status === 'AWAITING_REVIEW').length})
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'Infrastructure', 'Traffic & Transportation', 'Buildings & Property'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {signals
              .filter(s => selectedCategory === 'all' || s.category === selectedCategory)
              .map(sig => (
                <div 
                  key={sig.id}
                  className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', border: sig.status === 'VERIFIED' ? '1px solid #10b981' : '1px solid var(--border-color)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b5cf6' }}>{sig.id}</span>
                    <span className={`badge-status ${sig.status === 'VERIFIED' ? 'badge-success' : sig.status === 'DISCARDED' ? 'badge-danger' : 'badge-warning'}`}>
                      {sig.status}
                    </span>
                  </div>

                  {/* Media Preview Box with Computer Vision Overlay */}
                  <div style={{ position: 'relative', height: '140px', borderRadius: '10px', overflow: 'hidden' }}>
                    <img src={sig.mediaUrl} alt="Public Media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      right: '8px',
                      background: 'rgba(18, 20, 28, 0.9)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#a78bfa' }}>🤖 AI Observation</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981' }}>{sig.confidence}% Confidence</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{sig.aiObservation}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {sig.location}</div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
                    "{sig.text}"
                  </p>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Source: {sig.source}</span>
                    <span>Corroborations: {sig.corroborationsCount}</span>
                  </div>

                  {/* Human Review Action Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => handleVerifySignal(sig.id)}
                      style={{ background: '#10b981', color: '#fff', border: 0, padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <CheckCircle2 size={14} /> Verify Signal
                    </button>

                    <button
                      onClick={() => handleDiscardSignal(sig.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <XCircle size={14} /> Discard
                    </button>

                    <button
                      onClick={() => handleCreateDraft311(sig)}
                      style={{ gridColumn: 'span 2', background: '#3b82f6', color: '#fff', border: 0, padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      + Create Draft 311 Work Order
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: CORROBORATION & SIGNAL CLUSTERS */}
      {activeTab === 'clusters' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Corroborated Municipal Signal Clusters
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Spatial and temporal clustering of independent public signals into single emerging municipal events.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                CLUSTER #CLS-NWK-09: Roadway Flooding at Ferry St & Raymond Blvd
              </span>
              <span className="badge-status badge-success">High Corroboration (96%)</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              4 independent public weather/traffic posts and sensor signals detected street flooding within 15 minutes in Ironbound Ward 1.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => addNotification('Created Public Works Work Order for Drainage Clearing.')}
                style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '8px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Dispatch Public Works Crew
              </button>
              <button 
                onClick={() => addNotification('Published verified alert to City Pulse.')}
                style={{ background: '#10b981', color: '#fff', border: 0, padding: '8px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Publish to City Pulse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI EXECUTIVE BRIEFINGS */}
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

      {/* TAB 4: CONNECTORS & GOVERNANCE */}
      {activeTab === 'connectors' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Sentinel Connectors & Civil Rights Governance
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Manage API credentials, source compliance, privacy safeguards, and strict legal boundaries.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Active Public Data Connectors</div>
              <div style={{ fontSize: '0.78rem', color: '#10b981' }}>✔ NJ DOT Public Traffic Feeds (Connected)</div>
              <div style={{ fontSize: '0.78rem', color: '#10b981' }}>✔ National Weather Service Alert Feeds (Connected)</div>
              <div style={{ fontSize: '0.78rem', color: '#10b981' }}>✔ Public Event API Connectors (Connected)</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#8b5cf6' }}>Privacy & Governance Policy</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                • Public-source data collection only.<br/>
                • Facial recognition strictly DISABLED by default.<br/>
                • Zero automated enforcement (Human Analyst Review Required).<br/>
                • Retain records in accordance with municipal retention policies.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
