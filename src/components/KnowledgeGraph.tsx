import React, { useState } from 'react';
import { 
  Network, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  Briefcase, 
  Droplet, 
  Calendar, 
  Layers, 
  Wrench, 
  FileDown
} from 'lucide-react';

interface KGNode {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: any;
  x: number;
  y: number;
  relations: string[];
  records: { title: string; subtitle: string; status: string }[];
}

interface KnowledgeGraphProps {
  onOpenRecord?: (type: 'property' | 'permit' | 'legislative' | 'business' | 'project', id: string, targetWorkspace?: string) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onOpenRecord }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('property');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Nodes arranged in a ring layout for clear visual mapping
  const nodes: KGNode[] = [
    {
      id: 'property',
      name: 'Property Parcel',
      type: 'Property',
      color: '#10b981', // Emerald
      icon: MapPin,
      x: 250,
      y: 250,
      relations: ['permit', 'code_case', 'business', 'utility'],
      records: [
        { title: '920 Broad St', subtitle: 'Block 102, Lot 1 • Central Ward', status: 'Assess: Active' },
        { title: '42 Ferry St', subtitle: 'Block 402, Lot 10 • East Ward', status: 'Assess: Active' }
      ]
    },
    {
      id: 'permit',
      name: 'Building Permit',
      type: 'Permit',
      color: '#3b82f6', // Blue
      icon: FileText,
      x: 250,
      y: 90,
      relations: ['property', 'inspection', 'council_item'],
      records: [
        { title: 'PERM-2026-081', subtitle: 'Facade Structural Renovation', status: 'Issued' },
        { title: 'PERM-2026-102', subtitle: 'Electrical Hookup Upgrade', status: 'In Review' }
      ]
    },
    {
      id: 'inspection',
      name: 'Safety Inspection',
      type: 'Inspection',
      color: '#f59e0b', // Amber
      icon: ShieldCheck,
      x: 360,
      y: 130,
      relations: ['permit', 'code_case', 'work_order'],
      records: [
        { title: 'INSP-9034', subtitle: 'Structural Masonry Integrity Check', status: 'Passed' },
        { title: 'INSP-9244', subtitle: 'Zoning setback validation', status: 'Scheduled' }
      ]
    },
    {
      id: 'code_case',
      name: 'Enforcement Case',
      type: 'Code Case',
      color: '#ef4444', // Red
      icon: ShieldAlert,
      x: 410,
      y: 250,
      relations: ['property', 'inspection', 'work_order'],
      records: [
        { title: 'CASE-2026-12', subtitle: 'Debris & Façade Netting Hazard', status: 'Resolved' },
        { title: 'CASE-2026-44', subtitle: 'Zoning setback transgression', status: 'Active' }
      ]
    },
    {
      id: 'business',
      name: 'Registered Business',
      type: 'Business',
      color: '#06b6d4', // Teal
      icon: Briefcase,
      x: 360,
      y: 370,
      relations: ['property', 'council_item'],
      records: [
        { title: 'Ironbound Café LLC', subtitle: 'Commercial Occupancy Permit', status: 'Active' },
        { title: 'Broad St Retail Corp', subtitle: 'Mercantile License #90234', status: 'Active' }
      ]
    },
    {
      id: 'utility',
      name: 'Utility Account',
      type: 'Utility',
      color: '#eab308', // Gold
      icon: Droplet,
      x: 250,
      y: 410,
      relations: ['property', 'work_order'],
      records: [
        { title: 'MuniWater #920-A', subtitle: 'Meter ID: W-90234 (Active)', status: 'On Track' },
        { title: 'MuniSewer #920-B', subtitle: 'Discharge line certified', status: 'On Track' }
      ]
    },
    {
      id: 'council_item',
      name: 'Council Ordinance',
      type: 'Council Item',
      color: '#ec4899', // Pink
      icon: Calendar,
      x: 140,
      y: 370,
      relations: ['permit', 'business', 'project'],
      records: [
        { title: 'RES-2026-004', subtitle: 'Facade Preservation Grant Approval', status: 'Approved' },
        { title: 'ORD-2026-12', subtitle: 'Broad St Zoning rezoning ordinance', status: 'Approved' }
      ]
    },
    {
      id: 'project',
      name: 'Capital Project',
      type: 'Project',
      color: '#8b5cf6', // Purple
      icon: Layers,
      x: 90,
      y: 250,
      relations: ['council_item', 'work_order'],
      records: [
        { title: 'Water Pump Relining', subtitle: 'Ferry St Pump Station upgrade', status: '75% Active' },
        { title: 'Market St Smart Signal', subtitle: 'Installation of Smart Camera array', status: 'In Design' }
      ]
    },
    {
      id: 'work_order',
      name: 'Maintenance Work Order',
      type: 'Work Order',
      color: '#f43f5e', // Rose
      icon: Wrench,
      x: 140,
      y: 130,
      relations: ['project', 'utility', 'code_case', 'inspection'],
      records: [
        { title: 'WO-9842', subtitle: 'Set safety masonry barrier netting', status: 'Completed' },
        { title: 'WO-9912', subtitle: 'Flush water connection points', status: 'In Progress' }
      ]
    }
  ];

  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Helper to determine if a connection is active
  const isLinkActive = (fromId: string, toId: string) => {
    if (selectedNodeId === fromId && nodes.find(n => n.id === fromId)?.relations.includes(toId)) return true;
    if (selectedNodeId === toId && nodes.find(n => n.id === toId)?.relations.includes(fromId)) return true;
    if (hoveredNodeId === fromId || hoveredNodeId === toId) return true;
    return false;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={20} style={{ color: 'var(--primary-color)' }} />
          Government Knowledge Graph
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
          Relationship Engine mapping structural bindings between entities. Click a node to filter records.
        </p>
      </div>

      <div className="kg-container">
        {/* Visual Graph Area */}
        <div className="kg-canvas-wrapper">
          <svg className="kg-svg">
            <defs>
              <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Backdrop glow */}
            <circle cx="250" cy="250" r="180" fill="url(#glowGrad)" />

            {/* Links line list */}
            {nodes.flatMap(fromNode => 
              fromNode.relations.map(toId => {
                const toNode = nodes.find(n => n.id === toId);
                if (!toNode || fromNode.id > toNode.id) return null; // Avoid duplicate lines
                const isActive = isLinkActive(fromNode.id, toNode.id);
                return (
                  <line
                    key={`${fromNode.id}-${toNode.id}`}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    className="kg-link"
                    style={{
                      stroke: isActive ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
                      strokeWidth: isActive ? 2 : 1
                    }}
                  />
                );
              })
            )}

            {/* Node markers */}
            {nodes.map(n => {
              const NodeIcon = n.icon;
              const isSelected = selectedNodeId === n.id;
              const isHovered = hoveredNodeId === n.id;
              const isConnected = isLinkActive(selectedNodeId, n.id);

              return (
                <g 
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  className="kg-node"
                  style={{ '--node-color': n.color } as React.CSSProperties}
                  onClick={() => setSelectedNodeId(n.id)}
                  onMouseEnter={() => setHoveredNodeId(n.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  <circle
                    r={isSelected ? 24 : isHovered ? 22 : 18}
                    fill="#11131c"
                    stroke={isSelected ? 'var(--primary-color)' : isConnected ? 'rgba(255,255,255,0.7)' : n.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  <g transform="translate(-8, -8)" style={{ color: isSelected ? 'var(--primary-color)' : n.color, pointerEvents: 'none' }}>
                    <NodeIcon size={16} />
                  </g>
                  <text
                    y="36"
                    className="kg-node-label"
                    style={{
                      fill: isSelected ? '#fff' : 'var(--text-secondary)',
                      fontWeight: isSelected ? '800' : '500'
                    }}
                  >
                    {n.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detailed Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ borderLeft: `4px solid ${activeNode.color}` }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: activeNode.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Entity Details
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {activeNode.name}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              Active relationship connections: {activeNode.relations.length} classes bound within the local graph database.
            </p>
          </div>

          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Linked Records Database ({activeNode.records.length})</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
              {activeNode.records.map((rec, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '10px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{rec.title}</span>
                    <span style={{ fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      {rec.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{rec.subtitle}</span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px', justifyContent: 'space-between' }}>
                    <button style={{ background: 'transparent', border: 0, padding: 0, color: 'var(--primary-color)', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileDown size={10} />
                      Download PDF
                    </button>
                    {onOpenRecord && (
                      <button 
                        onClick={() => onOpenRecord(activeNode.id === 'permit' ? 'permit' : activeNode.id === 'council_item' ? 'legislative' : 'property', 'prop_01', 'safe')}
                        style={{ background: 'var(--primary-glow)', border: '1px solid var(--primary-color)', padding: '2px 8px', borderRadius: '4px', color: '#fff', fontSize: '9px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Open Workspace
                      </button>
                    )}
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
