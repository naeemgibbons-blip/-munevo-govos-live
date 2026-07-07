import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CommandCenter } from './components/CommandCenter';
import { ChartingSystem, ChartTabItem } from './components/ChartingSystem';
import { GisMap } from './components/GisMap';
import { UniversalTracker } from './components/UniversalTracker';
import { AiPanel } from './components/AiPanel';
import { LegislativeHub } from './components/LegislativeHub';
import { IdentityConsole } from './components/IdentityConsole';
import { 
  USER_ROLES, 
  PROPERTIES, 
  PERMITS, 
  VIOLATIONS, 
  INSPECTIONS, 
  TRACKER_ITEMS, 
  LEGISLATIVE_ITEMS,
  TrackerItem,
  PermitRecord,
  InspectionRecord,
  LegislativeItem
} from './mockData';
import { Bell, Search, AlertCircle } from 'lucide-react';

interface ToastMessage {
  id: number;
  text: string;
}

function App() {
  // Tenant & Role State
  const [tenant, setTenant] = useState('newark');
  const [currentRole, setCurrentRole] = useState(USER_ROLES.mayor);

  // Layout Modules
  const [activeModule, setActiveModule] = useState('command-center');
  // 'module' vs 'chart-workspace' view mode
  const [viewMode, setViewMode] = useState<'module' | 'chart'>('module');

  // Chart Workspace Tabs State
  const [chartTabs, setChartTabs] = useState<ChartTabItem[]>([]);
  const [activeChartTabId, setActiveChartTabId] = useState<string | null>(null);

  // Operations Data States
  const [trackerItems, setTrackerItemsRaw] = useState<TrackerItem[]>(TRACKER_ITEMS);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const setTrackerItems: React.Dispatch<React.SetStateAction<TrackerItem[]>> = (value) => {
    setTrackerItemsRaw(prev => {
      const next = typeof value === 'function' ? (value as any)(prev) : value;

      // Sync mutations to database backend Express server
      if (next.length > prev.length) {
        // New item added (CommandCenter submits 311)
        const newItem = next[0];
        fetch(`${API_URL}/api/tracker`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: newItem.module,
            title: newItem.title,
            status: newItem.status,
            priority: newItem.priority,
            assignedTo: newItem.assignedTo,
            slaDays: newItem.slaDays,
            address: newItem.address
          })
        })
        .then(res => res.json())
        .then(syncedItem => {
          // Replace mock temporary item in state with actual synced item containing DB primary key UUID
          setTrackerItemsRaw(current => current.map(item => item.id === newItem.id ? syncedItem : item));
          addNotification(`Saved ticket ${syncedItem.id} to Supabase!`);
        })
        .catch(err => console.error('Failed to sync new ticket to Supabase', err));
      } else if (next.length === prev.length) {
        // Item updated (UniversalTracker updates field values)
        next.forEach((newItem: any) => {
          const oldItem = prev.find(p => p.id === newItem.id);
          if (oldItem) {
            if (
              oldItem.status !== newItem.status || 
              oldItem.priority !== newItem.priority || 
              oldItem.assignedTo !== newItem.assignedTo
            ) {
              fetch(`${API_URL}/api/tracker/${newItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  status: newItem.status,
                  priority: newItem.priority,
                  assignedTo: newItem.assignedTo
                })
              })
              .then(res => res.json())
              .then(() => {
                addNotification(`Synced ticket ${newItem.id} status update to Supabase!`);
              })
              .catch(err => console.error('Failed to sync ticket update to Supabase', err));
            }
          }
        });
      }

      return next;
    });
  };

  const [legislativeItems, setLegislativeItems] = useState<LegislativeItem[]>(LEGISLATIVE_ITEMS);
  const [activePropertyId, setActivePropertyId] = useState<string | null>('prop_01');
  const [searchVal, setSearchVal] = useState('');

  // Toast Stack state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addNotification = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Switch role handler
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    const selectedRole = USER_ROLES[roleId];
    if (selectedRole) {
      setCurrentRole(selectedRole);
      addNotification(`Switched role session to ${selectedRole.name}`);
    }
  };

  // Open Chart in persistent workspace
  const handleOpenChart = (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => {
    let label = id;
    if (type === 'property') {
      label = PROPERTIES[id]?.address.split(',')[0] || id;
    } else if (type === 'permit') {
      label = PERMITS[id]?.permitNumber || id;
    }

    // Add tab if it doesn't exist
    setChartTabs(prev => {
      const exists = prev.some(tab => tab.id === id);
      if (exists) return prev;
      return [...prev, { id, type, label }];
    });

    setActiveChartTabId(id);
    setViewMode('chart');
    if (type === 'property') {
      setActivePropertyId(id);
    }
    addNotification(`Opened Workspace Chart: ${label}`);
  };

  // Close tab handler
  const handleCloseTab = (id: string) => {
    setChartTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== id);
      if (activeChartTabId === id) {
        // Select last tab or reset
        if (filtered.length > 0) {
          setActiveChartTabId(filtered[filtered.length - 1].id);
        } else {
          setActiveChartTabId(null);
          setViewMode('module');
        }
      }
      return filtered;
    });
  };

  // Global search parsing
  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;

    const term = searchVal.toLowerCase();

    // Check properties
    const matchedProp = Object.values(PROPERTIES).find(p => 
      p.address.toLowerCase().includes(term) || p.ownerName.toLowerCase().includes(term)
    );
    if (matchedProp) {
      handleOpenChart('property', matchedProp.id);
      setSearchVal('');
      return;
    }

    // Check permits
    const matchedPerm = Object.values(PERMITS).find(p => 
      p.permitNumber.toLowerCase().includes(term)
    );
    if (matchedPerm) {
      handleOpenChart('permit', matchedPerm.id);
      setSearchVal('');
      return;
    }

    addNotification(`Universal search: no exact record matches found for "${searchVal}"`);
  };

  // Cross-module property locator
  const handleOpenPropertyByAddress = (address: string) => {
    const matched = Object.values(PROPERTIES).find(p => p.address === address);
    if (matched) {
      handleOpenChart('property', matched.id);
    } else {
      addNotification(`Location "${address}" is not a registered municipal parcel.`);
    }
  };

  // Dynamic updates of permits (e.g. Inspector approves/fails work)
  const handleUpdatePermit = (id: string, updated: Partial<PermitRecord>) => {
    // In a real DB we'd update, here we just mock the update logs in notification
    addNotification(`Permit ${id} workflow updated: ${updated.status}`);
  };

  const handleUpdateInspection = (id: string, updated: Partial<InspectionRecord>) => {
    if (INSPECTIONS[id]) {
      INSPECTIONS[id] = { ...INSPECTIONS[id], ...updated } as any;
    }
  };

  // Extract map pins based on current operations state
  const getMapPins = () => {
    const pins: { id: string; label: string; coords: [number, number]; type: 'permit' | 'violation' | 'request' }[] = [];
    
    // Add open code violations
    Object.values(VIOLATIONS).forEach(v => {
      const prop = PROPERTIES[v.propertyId];
      if (prop && v.status !== 'Abated') {
        pins.push({
          id: v.caseNumber,
          label: `${v.violationType} - ${v.description}`,
          coords: prop.gisCoords,
          type: 'violation'
        });
      }
    });

    // Add active 311 tickets
    trackerItems.filter(item => item.module === '311' && item.status !== 'Resolved').forEach(item => {
      const prop = Object.values(PROPERTIES).find(p => p.address === item.address);
      if (prop) {
        pins.push({
          id: item.id,
          label: item.title,
          coords: prop.gisCoords,
          type: 'request'
        });
      }
    });

    return pins;
  };

  const activeChartTab = chartTabs.find(t => t.id === activeChartTabId) || null;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={(mod) => {
          setActiveModule(mod);
          setViewMode('module');
        }}
        currentRole={currentRole}
        tenant={tenant}
        setTenant={setTenant}
      />

      {/* Main Panel */}
      <main className="main-panel">
        {/* Top Header */}
        <header className="dashboard-header">
          <form onSubmit={handleGlobalSearch} className="header-search">
            <input 
              type="text" 
              placeholder="Search properties, permits, cases (e.g. 'Ferry St', 'PM-2026')..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <Search className="header-search-icon" size={14} />
          </form>

          <div className="header-actions">
            {/* Split workspace toggle */}
            {chartTabs.length > 0 && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setViewMode('module')}
                  style={{
                    border: 'none',
                    background: viewMode === 'module' ? 'var(--primary-glow)' : 'transparent',
                    color: viewMode === 'module' ? '#fff' : 'var(--text-secondary)',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Dashboard View
                </button>
                <button 
                  onClick={() => setViewMode('chart')}
                  style={{
                    border: 'none',
                    background: viewMode === 'chart' ? 'var(--primary-glow)' : 'transparent',
                    color: viewMode === 'chart' ? '#fff' : 'var(--text-secondary)',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Chart Workspace ({chartTabs.length})
                </button>
              </div>
            )}

            {/* Role Switcher */}
            <div className="role-switcher-container">
              <span className="role-switcher-label">GovOS Session:</span>
              <select className="role-select" value={currentRole.id} onChange={handleRoleChange}>
                <option value="mayor">Mayor / City Manager</option>
                <option value="inspector">Building Inspector</option>
                <option value="resident">Resident (MyMunevo)</option>
              </select>
            </div>

            {/* Notification Indicator */}
            <div className="notification-bell" onClick={() => addNotification('System audit logs are fully synced.')}>
              <Bell size={18} />
              <div className="notification-badge" />
            </div>
          </div>
        </header>

        {/* Workspace Canvas (Module OR Chart split + AI Panel) */}
        <div className="workspace-canvas">
          <div className="pane-left">
            {viewMode === 'module' ? (
              <>
                {/* CommandCenter module */}
                {activeModule === 'command-center' && (
                  <CommandCenter 
                    currentRole={currentRole}
                    onOpenChart={handleOpenChart}
                    trackerItems={trackerItems}
                    setTrackerItems={setTrackerItems}
                    addNotification={addNotification}
                    onUpdatePermit={handleUpdatePermit}
                    onUpdateInspection={handleUpdateInspection}
                  />
                )}

                {/* Universal Tracker Module */}
                {activeModule === 'tracker' && (
                  <UniversalTracker 
                    trackerItems={trackerItems}
                    setTrackerItems={setTrackerItems}
                    onOpenChart={handleOpenChart}
                    onOpenPropertyByAddress={handleOpenPropertyByAddress}
                  />
                )}

                {/* GIS Map Module */}
                {activeModule === 'gis' && (
                  <GisMap 
                    activePropertyId={activePropertyId}
                    onSelectProperty={(id) => {
                      setActivePropertyId(id);
                      handleOpenChart('property', id);
                    }}
                    pins={getMapPins()}
                    onOpenChart={handleOpenChart}
                    addNotification={addNotification}
                  />
                )}

                {/* Permits Hub Module */}
                {activeModule === 'permits' && (
                  <div className="glass-card">
                    <div className="card-header">
                      <div className="card-title">Permits & Licensing Desk</div>
                    </div>
                    <div className="list-queue">
                      {Object.values(PERMITS).map(p => (
                        <div key={p.id} className="queue-item" onClick={() => handleOpenChart('permit', p.id)}>
                          <div className="queue-details">
                            <span className="queue-title">{p.permitNumber} ({p.type})</span>
                            <span className="queue-sub">{PROPERTIES[p.propertyId]?.address} • Cost: ${p.estimatedCost.toLocaleString()}</span>
                          </div>
                          <span className={`badge-status ${p.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Enforcement Hub Module */}
                {activeModule === 'code-enforcement' && (
                  <div className="glass-card">
                    <div className="card-header">
                      <div className="card-title">Code Enforcement Case Files</div>
                    </div>
                    <div className="list-queue">
                      {Object.values(VIOLATIONS).map(v => (
                        <div key={v.id} className="queue-item" onClick={() => handleOpenChart('property', v.propertyId)}>
                          <div className="queue-details">
                            <span className="queue-title" style={{ color: 'var(--danger-text)' }}>{v.caseNumber} • {v.violationType}</span>
                            <span className="queue-sub">{PROPERTIES[v.propertyId]?.address} • Fines: ${v.fineAmount}</span>
                          </div>
                          <span className="badge-status badge-danger">
                            {v.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legislative Agenda Hub */}
                {activeModule === 'legislative' && (
                  <LegislativeHub 
                    legislativeItems={legislativeItems}
                    setLegislativeItems={setLegislativeItems}
                    onOpenChart={handleOpenChart}
                    addNotification={addNotification}
                  />
                )}

                {/* Identity & Security Administration Console */}
                {activeModule === 'identity-security' && (
                  <IdentityConsole 
                    currentRole={currentRole}
                    setCurrentRole={setCurrentRole}
                    setActiveModule={setActiveModule}
                    setViewMode={setViewMode}
                    handleOpenChart={handleOpenChart}
                    addNotification={addNotification}
                  />
                )}
              </>
            ) : (
              /* Epic-inspired Workspace active tab view */
              <ChartingSystem 
                tabs={chartTabs}
                activeTabId={activeChartTabId}
                onSelectTab={setActiveChartTabId}
                onCloseTab={handleCloseTab}
                onOpenChart={handleOpenChart}
              />
            )}
          </div>

          {/* AI Panel context engine */}
          <AiPanel 
            currentRole={currentRole}
            activeChartTab={activeChartTab}
            addNotification={addNotification}
          />
        </div>
      </main>

      {/* Toast Notification Container */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <AlertCircle size={16} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {toast.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
