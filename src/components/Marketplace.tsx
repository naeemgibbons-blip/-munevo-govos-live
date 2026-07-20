import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Cpu, 
  Map, 
  Activity, 
  CloudRain, 
  Lock,
  Download,
  Check
} from 'lucide-react';

interface MarketItem {
  id: string;
  name: string;
  desc: string;
  category: 'Integrations' | 'AI Agents' | 'GIS Layers' | 'Workflows';
  icon: any;
  color: string;
  author: string;
  installed: boolean;
}

export const Marketplace: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [items, setItems] = useState<MarketItem[]>([
    {
      id: 'arcgis_sync',
      name: 'ArcGIS Enterprise Sync',
      desc: 'Synchronize parcel boundaries, zoning overlay layers, and land assessment attributes automatically.',
      category: 'GIS Layers',
      icon: Map,
      color: '#3b82f6',
      author: 'Esri Official',
      installed: false
    },
    {
      id: 'fema_reporter',
      name: 'FEMA Incident Reporter',
      desc: 'Direct bridge mapping emergency dispatches and municipal code hazards to Federal hazard databases.',
      category: 'Integrations',
      icon: Lock,
      color: '#10b981',
      author: 'Munevo Labs',
      installed: false
    },
    {
      id: 'planning_ai',
      name: 'Planning Board AI Planner',
      desc: 'Cognitive agent parsing zoning ordinances to review permit setback violations and height limits.',
      category: 'AI Agents',
      icon: Cpu,
      color: '#8b5cf6',
      author: 'Munevo Sentinel AI',
      installed: false
    },
    {
      id: 'twilio_sms',
      name: '311 Twilio SMS Dispatcher',
      desc: 'Send real-time SMS alerts to constituents when their pothole, code violation, or municipal inquiry updates.',
      category: 'Workflows',
      icon: Activity,
      color: '#ef4444',
      author: 'Twilio Inc',
      installed: true
    },
    {
      id: 'water_overlay',
      name: 'Water & Sewer Infrastructure Overlay',
      desc: 'Adds complex sub-surface water network layers, hydrant meters, and sewer main coordinates to Munevo Maps.',
      category: 'GIS Layers',
      icon: CloudRain,
      color: '#06b6d4',
      author: 'City Eng Dept',
      installed: false
    }
  ]);

  const handleInstall = (id: string) => {
    setInstallingId(id);
    setTimeout(() => {
      setItems(prev => prev.map(item => item.id === id ? { ...item, installed: true } : item));
      setInstallingId(null);
    }, 1500);
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'All' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.desc.toLowerCase().includes(search.toLowerCase()) ||
                          item.author.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', paddingBottom: '30px' }}>
      {/* Welcome Banner */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={22} style={{ color: 'var(--primary-color)' }} />
              Munevo Cloud Marketplace
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Extend your municipal capabilities with pre-built workflow templates, GIS layers, integrations, and AI models.
            </p>
          </div>
          <span style={{ fontSize: '10px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', padding: '4px 8px', borderRadius: '4px', color: '#a855f7', fontWeight: 700 }}>
            Marketplace Active
          </span>
        </div>
      </div>

      {/* Toolbar / Search Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Integrations', 'AI Agents', 'GIS Layers', 'Workflows'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`tab-btn ${filter === cat ? 'active' : ''}`}
              style={{
                background: filter === cat ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', width: '260px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search marketplace..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 0, outline: 0, color: '#fff', fontSize: '0.75rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Grid Apps Catalog */}
      <div className="market-grid">
        {filteredItems.map(item => {
          const ItemIcon = item.icon;
          return (
            <div key={item.id} className="market-card">
              <div className="market-header">
                <div className="market-icon" style={{ background: item.color }}>
                  <ItemIcon size={18} />
                </div>
                <div>
                  <h3 className="market-title">{item.name}</h3>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>by {item.author}</span>
                </div>
              </div>
              <p className="market-desc">{item.desc}</p>
              <div className="market-footer">
                <span className="market-badge">{item.category}</span>
                {item.installed ? (
                  <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} />
                    Installed
                  </span>
                ) : (
                  <button 
                    className="market-btn"
                    disabled={installingId === item.id}
                    onClick={() => handleInstall(item.id)}
                    style={{ background: installingId === item.id ? 'var(--text-muted)' : 'var(--primary-color)' }}
                  >
                    {installingId === item.id ? 'Installing...' : 'Install Extension'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
