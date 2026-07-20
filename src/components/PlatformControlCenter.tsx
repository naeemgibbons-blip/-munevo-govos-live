import React, { useState } from 'react';
import { 
  Sliders, 
  Database, 
  Network, 
  Workflow, 
  Key, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Layers, 
  Terminal, 
  CheckCircle,
  Clock,
  Sparkles,
  Server
} from 'lucide-react';

interface PlatformControlCenterProps {
  currentProfile: any;
  addNotification: (msg: string) => void;
}

export const PlatformControlCenter: React.FC<PlatformControlCenterProps> = ({
  currentProfile,
  addNotification
}) => {
  const [activeTab, setActiveTab] = useState<string>('health');

  const navItems = [
    { id: 'health', label: 'Platform Health', icon: Cpu },
    { id: 'udm-studio', label: 'UDM Studio', icon: Database },
    { id: 'kg-inspector', label: 'Knowledge Graph', icon: Network },
    { id: 'workflow', label: 'Workflow Engine Studio', icon: Workflow },
    { id: 'api-gateway', label: 'API Gateway & Integration', icon: Key },
    { id: 'security', label: 'Security & Audit Center', icon: ShieldCheck }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(17, 19, 30, 0.9) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--primary-color)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sliders size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-status badge-success">Munevo GovOS Control Center</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Platform Admin & System Telemetry</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                Operating System Control Center
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="ai-btn-send"
              onClick={() => addNotification('Triggered complete UDM schema sync across microservices')}
              style={{ fontSize: '0.75rem', padding: '8px 14px' }}
            >
              Sync UDM Schema
            </button>
          </div>
        </div>
      </div>

      {/* Subtabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
        {navItems.map(item => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--primary-color)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              <IconComp size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'health' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={16} style={{ color: 'var(--primary-color)' }} />
                <span>API Gateway Health</span>
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>99.98%</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Latency: 12ms • 1,420 req/sec • Supabase Auth active
            </p>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={16} style={{ color: '#3b82f6' }} />
                <span>UDM Synced Records</span>
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>148,920</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Canonical Entities: Property, Business, Permit, Inspection, Incident
            </p>
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Network size={16} style={{ color: '#8b5cf6' }} />
                <span>Knowledge Graph Edges</span>
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6' }}>412,040</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Real-time relationship connections active
            </p>
          </div>
        </div>
      )}

      {activeTab === 'udm-studio' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-title">Canonical UDM Entity Schemas</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { entity: 'PropertyParcel', fields: 'id, address, zoning, blockLot, ownerId, assessedValue, gisCoords', status: 'Canonical Shared' },
              { entity: 'BuildingPermit', fields: 'id, permitNumber, propertyId, type, status, estimatedCost, applicant', status: 'Canonical Shared' },
              { entity: 'CodeViolation', fields: 'id, caseNumber, propertyId, violationType, status, fineAmount', status: 'Canonical Shared' },
              { entity: 'OperationsWorkOrder', fields: 'id, title, status, priority, assignedTo, address, module', status: 'Canonical Shared' }
            ].map((schema, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{schema.entity}</span>
                  <span className="badge-status badge-primary">{schema.status}</span>
                </div>
                <code style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '4px' }}>
                  {schema.fields}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
