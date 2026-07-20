import React from 'react';
import { 
  ShieldAlert, 
  Wrench, 
  Activity, 
  Car, 
  CloudSun, 
  Building, 
  Zap, 
  Droplet, 
  AlertTriangle, 
  Users, 
  Brain,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../mockData';

interface CityPulseProps {
  currentRole: UserRole;
  currentProfile: any;
  trackerItems: any[];
  inspections: any[];
  permits: any[];
}

export const CityPulse: React.FC<CityPulseProps> = ({
  currentRole,
  currentProfile,
  trackerItems,
  inspections,
  permits
}) => {
  // Count active stats
  const active311 = trackerItems.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const criticalInspections = inspections.filter(i => i.status === 'Scheduled' || i.status === 'Failed').length;
  const activePermits = permits.filter(p => p.status === 'In Review' || p.status === 'Issued').length;

  return (
    <div className="city-pulse-container">
      {/* Executive Welcome & AI Briefing */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
              City Pulse Executive Telemetry
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Munevo Insight • Real-time overview of municipal health and operations.
            </p>
          </div>
          <span style={{ fontSize: '10px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', padding: '4px 8px', borderRadius: '4px', color: '#ec4899', fontWeight: 700 }}>
            Executive Dashboard Mode
          </span>
        </div>

        <div style={{ padding: '14px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Brain size={20} style={{ color: '#8b5cf6', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', display: 'block' }}>Mayor AI Morning Executive Briefing</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Good morning, Admin. The electric grid is stable with peak demand under 65% capacity. Water pressure sensors at the Ferry St pump show normalized levels after maintenance. Constituent 311 intake volume is slightly elevated in the Central Ward due to minor road work on Market St. 2 permits are flagged for zoning reviews today. No emergency operations alerts have been triggered in the past 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Widgets */}
      <div className="pulse-grid">
        {/* EOC Status */}
        <div className="pulse-card">
          <div className="pulse-header">
            <span>Emergency Operations (EOC)</span>
            <span className="pulse-status" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Level 3 Normal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={28} style={{ color: '#10b981' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="pulse-value">Normal</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>0 Active Emergency Dispatches</span>
            </div>
          </div>
          <div className="pulse-indicator-grid">
            <div className="pulse-indicator">
              <span className="pulse-indicator-label">911 Dispatch Time</span>
              <span className="pulse-indicator-val">4.2 min</span>
            </div>
            <div className="pulse-indicator">
              <span className="pulse-indicator-label">Active Units</span>
              <span className="pulse-indicator-val">12 Patrols</span>
            </div>
          </div>
        </div>

        {/* 311 Workload */}
        <div className="pulse-card">
          <div className="pulse-header">
            <span>Constituent 311 Operations</span>
            <span className="pulse-status" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Moderate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Wrench size={28} style={{ color: '#f59e0b' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="pulse-value">{active311} Open</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Average resolution time: 14.8 hrs</span>
            </div>
          </div>
          <div className="pulse-indicator-grid">
            <div className="pulse-indicator">
              <span className="pulse-indicator-label">Roadways & Potholes</span>
              <span className="pulse-indicator-val">2 Active</span>
            </div>
            <div className="pulse-indicator">
              <span className="pulse-indicator-label">Sanitation Reports</span>
              <span className="pulse-indicator-val">4 Active</span>
            </div>
          </div>
        </div>

        {/* Utilities Health */}
        <div className="pulse-card">
          <div className="pulse-header">
            <span>Utility & Infrastructure</span>
            <span className="pulse-status" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Stable</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Zap size={20} style={{ color: '#eab308' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Power Grid</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>62% load</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Droplet size={20} style={{ color: '#3b82f6' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Water Supply</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>55 PSI OK</span>
              </div>
            </div>
          </div>
          <div className="pulse-indicator-grid">
            <div className="pulse-indicator">
              <span className="pulse-indicator-label">Main Breaker Temp</span>
              <span className="pulse-indicator-val">38.4°C Safe</span>
            </div>
            <div className="pulse-indicator">
              <span className="pulse-indicator-label">Water Leaks Detected</span>
              <span className="pulse-indicator-val">0 Warnings</span>
            </div>
          </div>
        </div>

        {/* Traffic & Smart City */}
        <div className="pulse-card">
          <div className="pulse-header">
            <span>Smart City & Mobility</span>
            <span className="pulse-status" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Clear</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Car size={28} style={{ color: '#3b82f6' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="pulse-value">Green</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Avg traffic velocity: 34.5 MPH</span>
            </div>
          </div>
          <div className="pulse-indicator-grid">
            <div className="pulse-indicator">
              <span className="pulse-indicator-label">Active Street Closures</span>
              <span className="pulse-indicator-val">1 (Market St)</span>
            </div>
            <div className="pulse-indicator">
              <span className="pulse-indicator-label">Smart Signals Sync</span>
              <span className="pulse-indicator-val">98% Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary Fleet and Weather Panels */}
      <div className="pulse-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
        {/* Active Projects & Staffing */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Building size={14} style={{ color: 'var(--primary-color)' }} />
              <span>Capital Infrastructure Projects</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                <span>Ferry Street Water Line Relining</span>
                <span style={{ color: '#10b981' }}>75% Complete</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: '#10b981' }} />
              </div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                <span>Washington St Facade Grants Program</span>
                <span style={{ color: '#eab308' }}>35% Active</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: '#eab308' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Environmental & Fleet summary */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <CloudSun size={14} style={{ color: '#3b82f6' }} />
              <span>Smart Environment Sensors</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Air Quality Index (AQI)</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>34 - Good</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ambient Temperature</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>76°F</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Municipal Fleet</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>18 Vehicles Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
