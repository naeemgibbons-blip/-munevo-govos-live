import React, { useState } from 'react';
import { LegislativeItem } from '../mockData';
import { 
  Sparkles, 
  Calendar, 
  RefreshCw, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle, 
  ExternalLink,
  Gavel,
  Database,
  Link2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

interface LegislativeHubProps {
  legislativeItems: LegislativeItem[];
  setLegislativeItems: React.Dispatch<React.SetStateAction<LegislativeItem[]>>;
  onOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => void;
  addNotification: (message: string) => void;
}

export const LegislativeHub: React.FC<LegislativeHubProps> = ({
  legislativeItems,
  setLegislativeItems,
  onOpenChart,
  addNotification
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>('LEG-2026-004'); // Default to LEG-004
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState('');

  const selectedItem = legislativeItems.find(item => item.id === selectedItemId) || null;

  // Simulate Newark Legistar sync
  const handleForceSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStep('Connecting to newark.legistar.com/Calendar.aspx...');
    
    setTimeout(() => {
      setSyncStep('Downloading Agenda Packets (First Reading transcripts)...');
      
      setTimeout(() => {
        setSyncStep('AI NLP Engine extracting property addresses & corporate entities...');
        
        setTimeout(() => {
          // Check if already synced to avoid duplicate key errors
          const alreadySynced = legislativeItems.some(item => item.id === 'LEG-2026-006');
          if (alreadySynced) {
            addNotification('Synchronization complete. No new agenda items found.');
            setIsSyncing(false);
            setSyncStep('');
            return;
          }

          // New item representing 26-0355 (Silva Bakery setback clearance / 42 Ferry St)
          const newItem: LegislativeItem = {
            id: 'LEG-2026-006',
            meetingDate: '2026-07-09',
            agendaNumber: 'XI.C.3',
            title: 'Resolution 26-0355: Authorizing Setback Clearance and Redevelopment Rights for 42 Ferry St Commercial Expansion',
            description: 'Consideration of a resolution granting redevelopment authorization and Zoning Board setback approvals to Silva Bakery & Café for sidewalk dining structures and auxiliary rear extensions.',
            status: 'Draft',
            linkedEntities: [
              { type: 'Property', id: 'prop_03', label: '42 Ferry St' },
              { type: 'Permit', id: 'perm_05', label: 'PM-2026-0298' }
            ],
            parsedEntities: {
              resolutionNumber: 'RES-2026-0355',
              department: 'Economic & Housing Development',
              businesses: ['Silva Bakery & Café'],
              developers: ['Silva Bakery & Café'],
              contractors: ['Eastern Structural Builders Inc'],
              propertyAddresses: ['42 Ferry St, Newark, NJ'],
              parcelNumbers: ['Block 402, Lot 10'],
              projectNames: ['Ironbound Redevelopment Project'],
              permitNumbers: ['PM-2026-0298'],
              ordinanceNumbers: ['ORD-2026-0012'],
              boardCommittee: 'Zoning Board of Adjustment',
              meetingDate: '2026-07-09'
            },
            aiSummary: {
              plainSummary: 'Grants front setback variance clearance for sidewalk dining tables and re-allocates local redevelopment zoning allowances for the bakery commercial unit.',
              departmentsAffected: ['Economic & Housing Development', 'Public Works'],
              projectsAffected: ['Ironbound Redevelopment Zone'],
              businessesAffected: ['Silva Bakery & Café'],
              propertiesAffected: ['42 Ferry St (prop_03)'],
              suggestedUpdates: ['Approve zoning permit PM-2026-0298', 'Update water utility flow constraints if bakery expands kitchen'],
              followUpTasks: [
                'Verify spacing details relative to fire hydrants (Zoning Inspector)',
                'Collect sidewalk usage liability insurance bond files'
              ],
              riskFlags: ['Sidewalk clearance must preserve at least 5ft of pedestrian pathway corridor'],
              deadlines: ['Hearing Date on 2026-07-09', 'Insurance File Due: 2026-07-30']
            }
          };

          setLegislativeItems(prev => [...prev, newItem]);
          setSelectedItemId('LEG-2026-006');
          addNotification('Synchronized new Agenda Item 26-0355 from Newark Legistar!');
          setIsSyncing(false);
          setSyncStep('');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
      
      {/* Left Pane: Legistar Sync Console & Agenda List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        
        {/* Sync Console */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
          <div className="card-header" style={{ marginBottom: '10px' }}>
            <div className="card-title">
              <Database className="brand-gradient-text" size={16} />
              <span>Legistar Synchronization Sync Console</span>
            </div>
            <span className="badge-status badge-success" style={{ fontSize: '0.65rem' }}>Active Sync Engine</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
              <div><strong>API Target:</strong> https://newark.legistar.com/Calendar.aspx</div>
              <div><strong>Sync Frequency:</strong> Every 30 minutes (Automated cron)</div>
              <div><strong>Local DB Count:</strong> {legislativeItems.length} agenda items logged</div>
            </div>
            
            <button 
              className="ai-btn-send"
              onClick={handleForceSync}
              disabled={isSyncing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px' }}
            >
              <RefreshCw size={12} className={isSyncing ? 'anim-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Force Legistar Sync'}</span>
            </button>
          </div>

          {isSyncing && (
            <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-color)', borderRadius: '6px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
                <span className="anim-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }} />
                <span>{syncStep}</span>
              </div>
            </div>
          )}
        </div>

        {/* Agenda Item Queue */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Calendar size={14} style={{ color: 'var(--primary-color)' }} />
              <span>Council Meetings & Resolutions Agenda</span>
            </div>
          </div>
          
          <div className="list-queue">
            {legislativeItems.map(item => {
              const isSelected = selectedItemId === item.id;
              return (
                <div 
                  key={item.id} 
                  className="queue-item"
                  onClick={() => setSelectedItemId(item.id)}
                  style={{
                    background: isSelected ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.15)' : 'rgba(255,255,255,0.02)',
                    borderColor: isSelected ? 'var(--primary-color)' : 'var(--border-color)',
                    borderLeft: isSelected ? '3px solid var(--accent-color)' : '1px solid var(--border-color)'
                  }}
                >
                  <div className="queue-details">
                    <span className="queue-title">Agenda {item.agendaNumber} ({item.id})</span>
                    <span className="queue-sub" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                    <span className="queue-sub">Hearing Date: {item.meetingDate}</span>
                  </div>
                  <span className="badge-status badge-warn" style={{ fontSize: '0.65rem' }}>{item.status}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Pane: Legislative Intelligence Analyzer */}
      {selectedItem ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          
          {/* Header */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LEGISLATIVE INTELLIGENCE PARSED SUMMARY</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>{selectedItem.id}: Resolution Details</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic', lineHeight: 1.4 }}>
              "{selectedItem.description}"
            </p>
          </div>

          {/* AI NLP Parsed Entity Board */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '8px' }}>
              <FolderOpen size={12} />
              <span>Parsed Entities (Extracted from Agenda Packets)</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
              <div className="property-item">
                <span className="property-label">Resolution Number</span>
                <span className="property-value">{selectedItem.parsedEntities.resolutionNumber}</span>
              </div>
              <div className="property-item">
                <span className="property-label">Target Sponsor Department</span>
                <span className="property-value">{selectedItem.parsedEntities.department}</span>
              </div>
              <div className="property-item">
                <span className="property-label">Target Corporate Entities / Developers</span>
                <span className="property-value">{selectedItem.parsedEntities.developers.join(', ') || 'None identified'}</span>
              </div>
              <div className="property-item">
                <span className="property-label">Property Addresses Linkages</span>
                <span className="property-value">{selectedItem.parsedEntities.propertyAddresses.join(', ') || 'None identified'}</span>
              </div>
              <div className="property-item">
                <span className="property-label">Parcel Numbers</span>
                <span className="property-value">{selectedItem.parsedEntities.parcelNumbers.join(', ') || 'None identified'}</span>
              </div>
              <div className="property-item">
                <span className="property-label">Assigned Board or Committee</span>
                <span className="property-value">{selectedItem.parsedEntities.boardCommittee}</span>
              </div>
              <div className="property-item">
                <span className="property-label">Associated Permits</span>
                <span className="property-value">{selectedItem.parsedEntities.permitNumbers.join(', ') || 'None identified'}</span>
              </div>
              <div className="property-item">
                <span className="property-label">Ordinance Ref</span>
                <span className="property-value">{selectedItem.parsedEntities.ordinanceNumbers.join(', ') || 'None identified'}</span>
              </div>
            </div>
          </div>

          {/* NLP Universal Relationship Engine Visualizer */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '10px' }}>
              <Link2 size={12} />
              <span>Universal Relationship Graph Linkages</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '6px 10px', background: 'var(--primary-glow)', border: '1px solid var(--primary-color)', borderRadius: '4px', fontWeight: 'bold' }}>
                  {selectedItem.parsedEntities.resolutionNumber}
                </div>
                <ArrowRight size={10} style={{ color: 'var(--text-muted)' }} />
                
                {selectedItem.linkedEntities.map((ent, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ArrowRight size={10} style={{ color: 'var(--text-muted)' }} />}
                    <div 
                      onClick={() => {
                        if (ent.type === 'Property') onOpenChart('property', ent.id);
                        if (ent.type === 'Permit') onOpenChart('permit', ent.id);
                      }}
                      style={{ 
                        padding: '6px 10px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px dashed var(--border-color)', 
                        borderRadius: '4px', 
                        color: ent.type === 'Property' || ent.type === 'Permit' ? 'var(--primary-color)' : 'var(--text-primary)',
                        textDecoration: ent.type === 'Property' || ent.type === 'Permit' ? 'underline' : 'none',
                        cursor: ent.type === 'Property' || ent.type === 'Permit' ? 'pointer' : 'default'
                      }}
                    >
                      {ent.label} ({ent.type})
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                * Click on underlined nodes to open their respective charts directly within the workspace canvas.
              </span>
            </div>
          </div>

          {/* AI Intelligence Summary Panel */}
          <div style={{ background: 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.05)', border: '1px dashed var(--border-color-glow)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)' }}>
              <Sparkles size={12} />
              <span>NLP AI Intelligence Synthesizer</span>
            </div>

            <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.4 }}>
              <div>
                <strong>Plain-Language Summary:</strong> {selectedItem.aiSummary.plainSummary}
              </div>
              <div>
                <strong>Departments Affected:</strong> {selectedItem.aiSummary.departmentsAffected.join(', ')}
              </div>
              <div>
                <strong>Businesses Affected:</strong> {selectedItem.aiSummary.businessesAffected.join(', ') || 'None identified'}
              </div>
              <div>
                <strong>Suggested Modules to Update:</strong>
                <ul style={{ paddingLeft: '16px', margin: '2px 0' }}>
                  {selectedItem.aiSummary.suggestedUpdates.map((t, idx) => <li key={idx}>{t}</li>)}
                </ul>
              </div>
              <div>
                <strong>Potential Follow-up Tasks:</strong>
                <ul style={{ paddingLeft: '16px', margin: '2px 0' }}>
                  {selectedItem.aiSummary.followUpTasks.map((t, idx) => <li key={idx}>{t}</li>)}
                </ul>
              </div>
              
              {selectedItem.aiSummary.riskFlags.length > 0 && (
                <div style={{ color: 'var(--danger-text)', display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(239, 68, 68, 0.05)', padding: '6px', borderRadius: '4px', borderLeft: '3px solid var(--danger-text)' }}>
                  <strong>Risk Flags:</strong>
                  {selectedItem.aiSummary.riskFlags.map((risk, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={8} />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <strong>Important Deadlines:</strong> {selectedItem.aiSummary.deadlines.join(' | ')}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Select an agenda item to analyze its NLP extractions.
        </div>
      )}

      {/* Styled spins for sync icon */}
      <style>{`
        .anim-spin {
          animation: spin 1s infinite linear;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .anim-pulse {
          animation: pulse 1.5s infinite alternate ease-in-out;
        }
        @keyframes pulse {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
      `}</style>

    </div>
  );
};
