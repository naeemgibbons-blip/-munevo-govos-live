import React, { useState, useEffect } from 'react';
import { 
  PROPERTIES, 
  PERMITS, 
  VIOLATIONS, 
  INSPECTIONS, 
  LEGISLATIVE_ITEMS, 
  TRACKER_ITEMS,
  PropertyRecord, 
  PermitRecord, 
  CodeViolation, 
  InspectionRecord, 
  LegislativeItem,
  TrackerItem
} from '../mockData';
import { 
  X, 
  FileText, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  Activity, 
  CheckCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Sparkles,
  Camera,
  Layers,
  Gavel,
  FileCheck
} from 'lucide-react';

export interface ChartTabItem {
  id: string;
  type: 'property' | 'permit' | 'legislative' | 'business';
  label: string;
}

interface ChartingSystemProps {
  tabs: ChartTabItem[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => void;
  currentProfile: any;
  addNotification: (message: string) => void;
}

export const ChartingSystem: React.FC<ChartingSystemProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onOpenChart,
  currentProfile,
  addNotification
}) => {
  if (tabs.length === 0 || !activeTabId) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.05)',
        color: 'var(--text-muted)',
        gap: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '2px dashed var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FileText size={28} />
        </div>
        <div>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Chart Workspace Empty</h3>
          <p style={{ fontSize: '0.8rem', marginTop: '4px', maxWidth: '320px' }}>
            Select a property from the GIS Map, click a ticket in the tracker, or open a record in the Command Center to open a persistent workspace chart.
          </p>
        </div>
      </div>
    );
  }

  const activeTab = tabs.find(t => t.id === activeTabId);

  // Render Property Chart content
  const renderPropertyChart = (id: string) => {
    const prop = PROPERTIES[id];
    if (!prop) return <p>Property not found.</p>;

    // Find related records
    const propPermits = Object.values(PERMITS).filter(p => p.propertyId === id);
    const activePermits = propPermits.filter(p => p.status !== 'Completed');
    const previousPermits = propPermits.filter(p => p.status === 'Completed');

    const propViolations = Object.values(VIOLATIONS).filter(v => v.propertyId === id);
    const propInspections = Object.values(INSPECTIONS).filter(i => i.propertyId === id);
    const prop311 = TRACKER_ITEMS.filter(item => item.address === prop.address && item.module === '311');

    const propLegs = LEGISLATIVE_ITEMS.filter(item => 
      item.linkedEntities.some(ent => ent.type === 'Property' && ent.id === id)
    );

    // Mock payment records
    const paymentsList = [
      { id: 'PAY-1002', date: '2026-07-07', type: 'Utility Bill (Water)', amount: 84.50, status: 'Success' },
      { id: 'PAY-0982', date: '2026-06-15', type: 'Property Tax Installment', amount: 3250.00, status: 'Success' },
      { id: 'PAY-0841', date: '2026-05-02', type: 'Permit Fee (PM-2026-0182)', amount: 6200.00, status: 'Success' }
    ];

    // Mock redevelopment agreement details
    const redevelopmentAgreement = id === 'prop_02' ? {
      agreementNumber: 'RA-2025-0012',
      title: 'Historic Restoration & Energy Retrofit Grant Agreement',
      parties: 'City of Newark & Washington Street Development Partners LLC',
      date: '2025-11-12',
      status: 'Active (Under Compliance Review)'
    } : null;

    // Mock planning zoning board cases
    const planningCases = [
      { caseNumber: 'PL-2026-0043', board: 'Zoning Board of Adjustment', title: 'Setback Variance Approval for Auxiliary Mechanical Facade Netting Enclosure', date: '2026-05-10', status: 'Approved with Conditions' }
    ].filter(() => id === 'prop_02'); // Only show for prop_02 to make it realistic

    // Mock document lists
    const documentFiles = [
      { name: 'Approved_Site_Plan_Drawings.pdf', size: '14.2 MB', category: 'Permits', icon: FileText },
      { name: 'Structural_Tuckpointing_Methodology.pdf', size: '2.8 MB', category: 'Inspections', icon: FileText },
      { name: 'Water_Service_Backflow_Certificate.pdf', size: '840 KB', category: 'Utilities', icon: FileCheck }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-status badge-success">Active Parcel</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zoning: {prop.zoningDistrict}</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>{prop.address}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Zip Code: {prop.zipCode}</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assessed Land Value</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '2px' }}>
              ${prop.assessedValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* AI Chart Summary */}
        <div style={{
          background: 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.08)',
          border: '1px dashed rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.25)',
          borderRadius: '8px',
          padding: '14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <Sparkles className="brand-gradient-text" size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
            <strong style={{ color: 'var(--accent-color)' }}>Munevo AI Property Synthesis:</strong> This parcel holds {propPermits.length} building/electrical permits ({activePermits.length} active, {previousPermits.length} completed) and has {propViolations.length} active violations. The water account balance is ${prop.utilities.balance.toFixed(2)}. Legislative resolution <strong>LEG-2026-004</strong> is pending action relative to redevelopment grants here. 311 request queue has {prop311.length} entries.
          </div>
        </div>

        <div className="property-grid">
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Property information & Owner information */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Property Info & Owner Details</div>
              </div>
              <div className="property-details-list">
                <div className="property-item">
                  <span className="property-label">Registered Owner</span>
                  <span className="property-value">{prop.ownerName}</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Owner Mailing Address</span>
                  <span className="property-value">{prop.ownerAddress}</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Tax Account Status</span>
                  <span className="property-value" style={{ color: prop.taxStatus === 'Paid' ? 'var(--success-text)' : 'var(--danger-text)' }}>
                    {prop.taxStatus}
                  </span>
                </div>
                <div className="property-item">
                  <span className="property-label">Water Meter Acc #</span>
                  <span className="property-value">{prop.utilities.waterAccountNumber} (Balance: ${prop.utilities.balance.toFixed(2)})</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                <strong>Officer Notes:</strong> {prop.notes}
              </p>
            </div>

            {/* Active & Previous Permits Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="glass-card">
                <div className="card-header">
                  <div className="card-title">Active Permits ({activePermits.length})</div>
                </div>
                <div className="list-queue">
                  {activePermits.map(perm => (
                    <div 
                      key={perm.id} 
                      className="queue-item"
                      onClick={() => onOpenChart('permit', perm.id)}
                      style={{ padding: '8px 12px' }}
                    >
                      <div className="queue-details">
                        <span className="queue-title" style={{ fontSize: '0.8rem' }}>{perm.permitNumber} ({perm.type})</span>
                        <span className="queue-sub" style={{ fontSize: '0.7rem' }}>Est: ${perm.estimatedCost.toLocaleString()}</span>
                      </div>
                      <span className="badge-status badge-primary" style={{ fontSize: '0.65rem' }}>
                        {perm.status}
                      </span>
                    </div>
                  ))}
                  {activePermits.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '8px' }}>No active permits</span>
                  )}
                </div>
              </div>

              <div className="glass-card">
                <div className="card-header">
                  <div className="card-title">Previous Permits ({previousPermits.length})</div>
                </div>
                <div className="list-queue">
                  {previousPermits.map(perm => (
                    <div 
                      key={perm.id} 
                      className="queue-item"
                      onClick={() => onOpenChart('permit', perm.id)}
                      style={{ padding: '8px 12px' }}
                    >
                      <div className="queue-details">
                        <span className="queue-title" style={{ fontSize: '0.8rem' }}>{perm.permitNumber} ({perm.type})</span>
                        <span className="queue-sub" style={{ fontSize: '0.7rem' }}>Completed: {perm.issuedDate || '2026'}</span>
                      </div>
                      <span className="badge-status badge-success" style={{ fontSize: '0.65rem' }}>
                        Completed
                      </span>
                    </div>
                  ))}
                  {previousPermits.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '8px' }}>No previous permits registered</span>
                  )}
                </div>
              </div>
            </div>

            {/* 311 Requests Grid */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">
                  <Layers size={14} style={{ color: 'var(--warning-text)' }} />
                  <span>311 Service Requests ({prop311.length})</span>
                </div>
              </div>
              <div className="list-queue">
                {prop311.map(item => (
                  <div key={item.id} className="queue-item" style={{ padding: '10px 14px' }}>
                    <div className="queue-details">
                      <span className="queue-title">{item.id}: {item.title}</span>
                      <span className="queue-sub">Reporter: Resident • Date: {item.reportedDate}</span>
                    </div>
                    <span className={`badge-status ${item.status === 'In Progress' ? 'badge-warn' : 'badge-primary'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
                {prop311.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '8px' }}>✓ No active 311 requests for this address</span>
                )}
              </div>
            </div>

            {/* Inspections & Violations Registries */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
              <div className="glass-card">
                <div className="card-header">
                  <div className="card-title">Inspections Log</div>
                </div>
                <div className="tracker-table-container">
                  <table className="tracker-table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Inspector</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propInspections.map(insp => (
                        <tr key={insp.id}>
                          <td style={{ fontWeight: 'bold' }}>{insp.id}</td>
                          <td>{insp.type}</td>
                          <td>{insp.inspectorName}</td>
                          <td>
                            <span className={`badge-status ${insp.status === 'Passed' ? 'badge-success' : insp.status === 'Failed' ? 'badge-danger' : 'badge-warn'}`} style={{ fontSize: '0.6rem' }}>
                              {insp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card">
                <div className="card-header">
                  <div className="card-title">Code Violations ({propViolations.length})</div>
                </div>
                <div className="list-queue">
                  {propViolations.map(viol => (
                    <div key={viol.id} className="queue-item" style={{ padding: '8px 12px', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                      <div className="queue-details">
                        <span className="queue-title" style={{ fontSize: '0.8rem', color: 'var(--danger-text)' }}>{viol.caseNumber}</span>
                        <span className="queue-sub" style={{ fontSize: '0.7rem' }}>{viol.violationType} • Fine: ${viol.fineAmount}</span>
                      </div>
                      <span className="badge-status badge-danger" style={{ fontSize: '0.65rem' }}>
                        {viol.status}
                      </span>
                    </div>
                  ))}
                  {propViolations.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '8px' }}>✓ No outstanding code violations</span>
                  )}
                </div>
              </div>
            </div>

            {/* Utility Accounts & Payments */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Utility Billing & Payments History</div>
              </div>
              <div className="tracker-table-container">
                <table className="tracker-table" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>Type / Reference</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsList.map(pay => (
                      <tr key={pay.id}>
                        <td style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>{pay.id}</td>
                        <td>{pay.date}</td>
                        <td>{pay.type}</td>
                        <td style={{ fontWeight: 'bold' }}>${pay.amount.toFixed(2)}</td>
                        <td>
                          <span className="badge-status badge-success" style={{ fontSize: '0.6rem' }}>{pay.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legislative actions, Redevelopment agreements & Planning cases */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Legislative & Planning Actions</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Legislative Actions */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '6px' }}>
                    <Gavel size={14} />
                    <span>Linked Council Agendas ({propLegs.length})</span>
                  </div>
                  {propLegs.map(leg => (
                    <div 
                      key={leg.id}
                      onClick={() => onOpenChart('legislative', leg.id)}
                      style={{ fontSize: '0.75rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', margin: '4px 0' }}
                    >
                      <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>{leg.id} (Agenda {leg.agendaNumber})</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{leg.title.substring(0, 45)}...</span>
                    </div>
                  ))}
                  {propLegs.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No pending legislative items associated.</span>
                  )}
                </div>

                {/* Redevelopment Agreements */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', display: 'block', marginBottom: '6px' }}>
                    Redevelopment Agreements (RDA)
                  </span>
                  {redevelopmentAgreement ? (
                    <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>Agreement ID:</strong> {redevelopmentAgreement.agreementNumber}</div>
                      <div><strong>Agreement Name:</strong> {redevelopmentAgreement.title}</div>
                      <div><strong>Signing Parties:</strong> {redevelopmentAgreement.parties}</div>
                      <div><strong>Approval Date:</strong> {redevelopmentAgreement.date} • <span style={{ color: 'var(--success-text)' }}>{redevelopmentAgreement.status}</span></div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No redevelopment agreements active for this parcel.</span>
                  )}
                </div>

                {/* Planning Cases */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', display: 'block', marginBottom: '6px' }}>
                    Planning & Zoning Board Cases
                  </span>
                  {planningCases.map(planCase => (
                    <div key={planCase.caseNumber} style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>Zoning Case #:</strong> {planCase.caseNumber} • {planCase.board}</div>
                      <div><strong>Title:</strong> {planCase.title}</div>
                      <div><strong>Decision Date:</strong> {planCase.date} • <span style={{ color: 'var(--success-text)' }}>{planCase.status}</span></div>
                    </div>
                  ))}
                  {planningCases.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No active or previous planning cases.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Documents & Photos */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Documents Vault & Photo Gallery</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '16px' }}>
                {/* Documents list */}
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MIME-Verified Attachments</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {documentFiles.map((doc, idx) => {
                      const Icon = doc.icon;
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            <Icon size={12} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={doc.name}>{doc.name}</span>
                          </div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{doc.size}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Building Photos Section (Rich SVG drawing representing the facade photos) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Latest Photo Site Inspection</span>
                  <div style={{ 
                    height: '110px', 
                    background: 'radial-gradient(circle at center, #1b2640 0%, #0d1326 100%)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* SVG representation of the building */}
                    <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px' }}>
                      {/* Sky */}
                      <rect width="100" height="100" fill="transparent"/>
                      {/* Sun */}
                      <circle cx="80" cy="20" r="8" fill="var(--warning-text)" opacity="0.3"/>
                      {/* Ground */}
                      <rect x="0" y="80" width="100" height="20" fill="var(--border-color)"/>
                      {/* Building Facade */}
                      <rect x="25" y="30" width="50" height="50" fill="rgba(var(--tenant-hue), var(--tenant-sat), 30%, 0.5)" stroke="var(--primary-color)" strokeWidth="1.5"/>
                      {/* Roof */}
                      <polygon points="20,30 50,10 80,30" fill="rgba(var(--accent-hue), var(--accent-sat), 30%, 0.6)" stroke="var(--accent-color)" strokeWidth="1.5"/>
                      {/* Windows */}
                      <rect x="35" y="40" width="10" height="10" fill="rgba(255,255,255,0.15)" stroke="var(--primary-color)" strokeWidth="0.8"/>
                      <rect x="55" y="40" width="10" height="10" fill="rgba(255,255,255,0.15)" stroke="var(--primary-color)" strokeWidth="0.8"/>
                      <rect x="35" y="60" width="10" height="10" fill="rgba(255,255,255,0.15)" stroke="var(--primary-color)" strokeWidth="0.8"/>
                      <rect x="55" y="60" width="10" height="10" fill="rgba(255,255,255,0.15)" stroke="var(--primary-color)" strokeWidth="0.8"/>
                      {/* Door */}
                      <rect x="46" y="65" width="8" height="15" fill="var(--accent-color)" opacity="0.8"/>
                    </svg>
                    <div style={{ position: 'absolute', bottom: '4px', right: '4px', fontSize: '0.55rem', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '2px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Camera size={8} />
                      <span>Facade_View_July_2026.jpg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: GIS Map & Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* GIS Map segment */}
            <div className="glass-card" style={{ padding: '16px' }}>
              <div className="card-header" style={{ marginBottom: '10px' }}>
                <div className="card-title">
                  <MapPin className="brand-gradient-text" size={14} />
                  <span>GIS Micro Parcel Map</span>
                </div>
              </div>
              <div style={{ 
                height: '180px', 
                background: 'radial-gradient(circle at center, #0f182c 0%, #060a14 100%)', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                  {/* Street grids */}
                  <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="12" />
                  <line x1="0" y1="120" x2="200" y2="120" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="10" />
                  
                  {/* Surrounding parcels */}
                  <rect x="20" y="30" width="30" height="35" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" />
                  <rect x="55" y="30" width="30" height="35" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" />
                  <rect x="115" y="30" width="30" height="35" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" />
                  <rect x="150" y="30" width="30" height="35" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" />

                  {/* Target property parcel highlighted */}
                  <rect 
                    x="115" 
                    y="135" 
                    width="45" 
                    height="45" 
                    fill="rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.3)" 
                    stroke="var(--accent-color)" 
                    strokeWidth="1.5" 
                    style={{ filter: 'drop-shadow(0 0 6px var(--primary-glow))' }}
                  />
                  
                  {/* Neighbouring parcel */}
                  <rect x="55" y="135" width="35" height="45" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" />
                  <rect x="20" y="135" width="30" height="45" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" />
                  
                  {/* Labels */}
                  <text x="137" y="160" fill="#fff" fontSize="6px" fontWeight="bold" textAnchor="middle">TARGET</text>
                  <text x="137" y="168" fill="var(--text-secondary)" fontSize="5px" textAnchor="middle">PARCEL</text>
                  <text x="104" y="60" fill="var(--text-muted)" fontSize="4.5px" transform="rotate(90, 104, 60)">BROAD STREET</text>
                  <text x="35" y="117" fill="var(--text-muted)" fontSize="4.5px">MARKET STREET</text>
                </svg>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="glass-card" style={{ height: 'fit-content' }}>
              <div className="card-header">
                <div className="card-title">Development Timeline</div>
              </div>
              <div className="timeline">
                {propInspections.map(insp => (
                  <div key={insp.id} className="timeline-item">
                    <div className={`timeline-node ${insp.status === 'Passed' ? 'success' : insp.status === 'Failed' ? 'danger' : 'warn'}`} />
                    <div className="timeline-info">
                      <span className="timeline-date">{insp.scheduledDate} • {insp.inspectorName}</span>
                      <span className="timeline-title">{insp.type} Inspection ({insp.status})</span>
                      <span className="timeline-desc">{insp.notes}</span>
                    </div>
                  </div>
                ))}
                {propPermits.map(perm => (
                  <div key={perm.id} className="timeline-item">
                    <div className="timeline-node success" />
                    <div className="timeline-info">
                      <span className="timeline-date">{perm.submittedDate}</span>
                      <span className="timeline-title">Permit Filed: {perm.permitNumber}</span>
                      <span className="timeline-desc">{perm.description}</span>
                    </div>
                  </div>
                ))}
                {prop311.map(item => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-node warn" />
                    <div className="timeline-info">
                      <span className="timeline-date">{item.reportedDate}</span>
                      <span className="timeline-title">311 Incident: {item.id}</span>
                      <span className="timeline-desc">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // Render Permit Chart content
  const renderPermitChart = (id: string) => {
    const perm = PERMITS[id];
    if (!perm) return <p>Permit not found.</p>;

    const prop = PROPERTIES[perm.propertyId];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-status badge-primary">{perm.type} Permit</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {perm.id}</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>{perm.permitNumber}</h3>
            {prop && (
              <div 
                onClick={() => onOpenChart('property', prop.id)}
                style={{ fontSize: '0.85rem', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
              >
                <span>{prop.address}</span>
                <ExternalLink size={10} />
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Cost & Fees</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              Val: ${perm.estimatedCost.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--success-text)' }}>Fee Paid: ${perm.feePaid}</span>
          </div>
        </div>

        {/* Workflow Progress */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">Workflow Progress Tracker</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', position: 'relative' }}>
            {/* Horizontal Line backdrop */}
            <div style={{
              position: 'absolute',
              left: '10%',
              right: '10%',
              top: '15px',
              height: '2px',
              background: 'var(--border-color)',
              zIndex: 1
            }} />

            {perm.workflowSteps.map((step, index) => {
              const isCompleted = step.status === 'Completed';
              const isInProgress = step.status === 'In Progress';
              const color = isCompleted 
                ? 'var(--success-text)' 
                : isInProgress 
                ? 'var(--warning-text)' 
                : 'var(--text-muted)';

              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--success)' : isInProgress ? 'var(--warning-glow)' : 'var(--bg-card)',
                    border: `2px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    boxShadow: isInProgress ? '0 0 10px var(--warning)' : 'none'
                  }}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', color }}>{step.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{step.assignedTo}</span>
                    {step.completedDate && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--success-text)', display: 'block' }}>{step.completedDate}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Permit Scope & Specs</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="property-item">
                <span className="property-label">Description of Scope</span>
                <span className="property-value" style={{ fontWeight: 'normal', lineHeight: 1.5 }}>{perm.description}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="property-item">
                  <span className="property-label">File Intake Date</span>
                  <span className="property-value">{perm.submittedDate}</span>
                </div>
                <div className="property-item">
                  <span className="property-label">Issuance Date</span>
                  <span className="property-value">{perm.issuedDate || 'Pending review'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">Audit Logs & History</div>
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-node success" />
                <div className="timeline-info">
                  <span className="timeline-date">{perm.submittedDate}</span>
                  <span className="timeline-title">Intake Verified</span>
                  <span className="timeline-desc">Assigned checklist validated. Fee calculated.</span>
                </div>
              </div>
              {perm.issuedDate && (
                <div className="timeline-item">
                  <div className="timeline-node success" />
                  <div className="timeline-info">
                    <span className="timeline-date">{perm.issuedDate}</span>
                    <span className="timeline-title">Permit Certificate Issued</span>
                    <span className="timeline-desc">Authorized code work allowed.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Legislative Meeting Agenda Chart
  const renderLegislativeChart = (id: string) => {
    const leg = LEGISLATIVE_ITEMS.find(item => item.id === id);
    if (!leg) return <p>Legislative item not found.</p>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-status badge-warn">Agenda Item {leg.agendaNumber}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Meeting Date: {leg.meetingDate}</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '6px' }}>{leg.title}</h3>
          </div>
          <span className="badge-status badge-primary">{leg.status}</span>
        </div>

        {/* Linked Entities (Legislative Intelligence!) */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
          <div className="card-header">
            <div className="card-title">
              <Sparkles className="brand-gradient-text" size={16} />
              <span>Legislative Intelligence Linkages</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Munevo automatically parses council agenda transcripts and links them to records, developers, and properties:
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {leg.linkedEntities.map((ent, i) => (
              <div 
                key={i} 
                className="queue-item"
                onClick={() => {
                  if (ent.type === 'Property') onOpenChart('property', ent.id);
                }}
                style={{ padding: '10px 14px', flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: ent.type === 'Property' ? 'pointer' : 'default' }}
              >
                <div style={{
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '4px', 
                  background: 'var(--primary-glow)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {ent.type === 'Property' ? <MapPin size={12} /> : <User size={12} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ent.label}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Type: {ent.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">Official Item Transcript</div>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            {leg.description}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Department Action:</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>Executive Administration / Redevelopment Agency</span>
          </div>
        </div>
      </div>
    );
  };

  // Render Business Chart content (for DCF Developers, LLC etc.)
  const renderBusinessChart = (id: string) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-status badge-success">Registered Developer</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sector: Real Estate & Construction</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>{id}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Corporate ID: CORP-2024-8931</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corporate Compliance Rating</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-text)', marginTop: '2px' }}>
              Grade A (Passed)
            </div>
          </div>
        </div>

        {/* AI Briefing */}
        <div style={{
          background: 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.08)',
          border: '1px dashed rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.25)',
          borderRadius: '8px',
          padding: '14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <Sparkles className="brand-gradient-text" size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
            <strong style={{ color: 'var(--accent-color)' }}>Munevo AI Developer Synthesis:</strong> **DCF Developers, LLC** is active in the **West Ward Redevelopment Project**. They currently own properties at **125 Market St** and **129 Market St**. Active building permit **BP-2026-0145** is logged. Initial Site Inspection passed successfully on 2026-06-01. Resolution **26-0356** is pending action for redevelopment contract approvals.
          </div>
        </div>

        {/* 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Properties & Projects Checklist */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Interconnected Related Records</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                {/* Properties */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>PROPERTIES OWNED</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => onOpenChart('property', 'prop_05')}
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', textDecoration: 'underline', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      125 Market Street
                    </button>
                    <button 
                      onClick={() => onOpenChart('property', 'prop_06')}
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', textDecoration: 'underline', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      129 Market Street
                    </button>
                  </div>
                </div>

                {/* Project */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE PROJECT ASSOCIATION</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>✓ West Ward Redevelopment Project</span>
                </div>

                {/* Department */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>SPONSORING DEPARTMENT</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>✓ Economic & Housing Development</span>
                </div>

                {/* Planning */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>PLANNING DECISIONS</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>✓ Site Plan Approval (Zoning Case PL-2026-0043) - Approved</span>
                </div>
              </div>
            </div>

            {/* Permits & Inspections Table */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Permits & Inspections Checklist</div>
              </div>
              <div className="tracker-table-container">
                <table className="tracker-table" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th>Record Type</th>
                      <th>Ref Number</th>
                      <th>Task / Purpose</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr onClick={() => onOpenChart('permit', 'perm_06')} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-color)', textDecoration: 'underline' }}>Building Permit</td>
                      <td>BP-2026-0145</td>
                      <td>Foundation construction (125 Market St)</td>
                      <td>
                        <span className="badge-status badge-primary" style={{ fontSize: '0.65rem' }}>Issued</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>Safety Inspection</td>
                      <td>insp_06</td>
                      <td>Initial Site Inspection (Passed on 2026-06-01)</td>
                      <td>
                        <span className="badge-status badge-success" style={{ fontSize: '0.65rem' }}>Passed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Documents Vault */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-title">Legislative Documents Vault</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✓ Redevelopment Agreement</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--success-text)' }}>RDA-2025-0012</span>
                </div>
                <div 
                  onClick={() => onOpenChart('legislative', 'LEG-2026-007')}
                  style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>✓ Council Resolution</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>RES-2026-0356</span>
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✓ Meeting Minutes</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Agenda IX.B.2</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="chart-workspace-container">
      {/* Workspace Tabs Header */}
      <div className="chart-tabs-header">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div 
              key={tab.id} 
              className={`chart-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <span>{tab.label}</span>
              <div 
                className="tab-close" 
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
              >
                <X size={10} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Content Area with Side-by-Side message thread */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="chart-content" style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab?.type === 'property' && renderPropertyChart(activeTab.id)}
          {activeTab?.type === 'permit' && renderPermitChart(activeTab.id)}
          {activeTab?.type === 'legislative' && renderLegislativeChart(activeTab.id)}
          {activeTab?.type === 'business' && renderBusinessChart(activeTab.id)}
        </div>
        
        {activeTab && (
          <CaseNotesSidebar 
            recordType={activeTab.type}
            recordId={activeTab.id}
            currentProfile={currentProfile}
            addNotification={addNotification}
          />
        )}
      </div>
    </div>
  );
};

const CaseNotesSidebar: React.FC<{
  recordType: string;
  recordId: string;
  currentProfile: any;
  addNotification: (message: string) => void;
}> = ({ recordType, recordId, currentProfile, addNotification }) => {
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');
  const orgId = currentProfile?.organizationId || '';
  
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/case-comments/${recordType}/${recordId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [recordType, recordId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentProfile) return;
    try {
      const res = await fetch(`${API_URL}/api/case-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': orgId
        },
        body: JSON.stringify({
          authorId: currentProfile.id,
          authorName: currentProfile.email.split('@')[0],
          authorEmail: currentProfile.email,
          authorOfficeId: currentProfile.districtOfficeId || null,
          recordType,
          recordId,
          message: newComment
        })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ width: '300px', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: '#0b0c10', height: '100%' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
        <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>
          Record Discussion Thread
        </h4>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
          In-context staff notes attached to this {recordType}
        </span>
      </div>

      {/* Message List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center' }}>Syncing thread...</div>
        ) : comments.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
            No comments logged. Type a note to start.
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
                  {c.authorName.replace('.', ' ')}
                </span>
                {c.authorOffice?.name && (
                  <span style={{ fontSize: '8px', padding: '1px 4px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '3px', color: '#60a5fa' }}>
                    {c.authorOffice.name.split(' ')[0]}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                {c.message}
              </p>
              <span style={{ fontSize: '8px', color: 'var(--text-muted)', alignSelf: 'flex-end', marginTop: '2px' }}>
                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendComment} style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.2)' }}>
        <input 
          type="text" 
          className="ai-input" 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)} 
          placeholder="Type note..." 
          style={{ flex: 1, fontSize: '11px', height: '28px', padding: '0 8px' }}
        />
        <button type="submit" className="ai-btn-send" style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}>
          Post
        </button>
      </form>
    </div>
  );
};
