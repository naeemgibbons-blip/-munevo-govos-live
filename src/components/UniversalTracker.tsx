import React, { useState } from 'react';
import { TrackerItem } from '../mockData';
import { 
  Layers, 
  Search, 
  Clock, 
  X, 
  MessageSquare, 
  Paperclip, 
  History, 
  Plus,
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface UniversalTrackerProps {
  trackerItems: TrackerItem[];
  setTrackerItems: React.Dispatch<React.SetStateAction<TrackerItem[]>>;
  onOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => void;
  onOpenPropertyByAddress: (address: string) => void;
  canEdit?: boolean;
  properties?: Record<string, any>;
  currentOrgId?: string;
}

export const UniversalTracker: React.FC<UniversalTrackerProps> = ({
  trackerItems,
  setTrackerItems,
  onOpenChart,
  onOpenPropertyByAddress,
  canEdit = true,
  properties = {},
  currentOrgId = ''
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Selected item Workspace Drawer state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Custom Comment field local state
  const [commentInput, setCommentInput] = useState('');

  // Add Ticket Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');

  // AI Routing States
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any | null>(null);

  // Set default address when properties load
  React.useEffect(() => {
    const addresses = Object.values(properties).map((p: any) => p.address);
    if (addresses.length > 0 && !newAddress) {
      setNewAddress(addresses[0]);
    }
  }, [properties]);

  const selectedItem = trackerItems.find(item => item.id === selectedItemId);

  // Filter Items
  const filteredItems = trackerItems.filter((item) => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = 
      moduleFilter === 'All' || 
      (moduleFilter === '311' && item.module === '311') ||
      (moduleFilter === 'Permits' && item.module === 'Permits') ||
      (moduleFilter === 'Inspections' && item.module === 'Inspections') ||
      (moduleFilter === 'Code Enforcement' && item.module === 'Code Enforcement');

    const matchesPriority = 
      priorityFilter === 'All' || 
      item.priority === priorityFilter;

    return matchesSearch && matchesModule && matchesPriority;
  });

  // Action update handler for fields
  const updateTrackerField = (id: string, field: 'status' | 'priority' | 'assignedTo', val: string) => {
    setTrackerItems(prev => prev.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedItem) return;
    
    // Append locally
    selectedItem.comments.unshift({
      user: 'Naeem Gibbons',
      text: commentInput,
      date: 'Just now'
    });
    selectedItem.history.unshift({
      action: 'Added comment: ' + commentInput,
      user: 'Naeem Gibbons',
      date: 'Just now'
    });

    setCommentInput('');
  };

  // Run AI suggested routing engine
  const handleAnalyzeTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !newAddress) return;

    try {
      setAiAnalyzing(true);
      const res = await fetch(`${API_URL}/api/ai/suggest-routing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `${newTitle}. ${newDesc}`,
          organizationId: currentOrgId
        })
      });

      if (res.ok) {
        const suggestion = await res.json();
        setAiSuggestion(suggestion);
      } else {
        setAiSuggestion({
          suggestedModule: 'tracker',
          suggestedRoleName: 'Resident Services Coordinator',
          suggestedAssignee: 'Marcus Miller',
          rationale: 'Classification server offline. Defaulting to general operations queue.'
        });
      }
    } catch (e) {
      setAiSuggestion({
        suggestedModule: 'tracker',
        suggestedRoleName: 'Resident Services Coordinator',
        suggestedAssignee: 'Marcus Miller',
        rationale: 'Classification server offline. Defaulting to general operations queue.'
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Confirm and create ticket
  const handleConfirmRoute = () => {
    if (!aiSuggestion) return;

    const newItem: TrackerItem = {
      id: 'T-' + Math.floor(1000 + Math.random() * 9000),
      module: aiSuggestion.suggestedModule === 'code-enforcement' ? 'Code Enforcement' : aiSuggestion.suggestedModule === 'permits' ? 'Permits' : '311',
      title: newTitle,
      status: 'Open',
      priority: newPriority as any,
      assignedTo: aiSuggestion.suggestedAssignee,
      slaDays: 14,
      slaProgress: 0,
      reportedDate: new Date().toISOString().split('T')[0],
      address: newAddress,
      comments: [
        { user: 'Munevo AI Companion', text: `Suggested Route: ${aiSuggestion.suggestedRoleName} (${aiSuggestion.suggestedAssignee}). Rationale: ${aiSuggestion.rationale}`, date: 'Just now' }
      ],
      history: [
        { action: 'Ticket instantiated via AI routing confirmation', user: 'Munevo IT', date: 'Just now' }
      ],
      attachments: [],
      relatedRecords: [],
      customFields: {}
    };

    setTrackerItems(prev => [newItem, ...prev]);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setAiSuggestion(null);
    setShowAddModal(false);
  };

  const getPriorityBadgeClass = (priority: string) => {
    if (priority === 'Critical') return 'badge-danger';
    if (priority === 'High') return 'badge-warn';
    if (priority === 'Medium') return 'badge-primary';
    return 'badge-success';
  };

  return (
    <div className="module-content-grid" style={{ height: '100%', overflow: 'hidden' }}>
      
      {/* Left Column: List Queue */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
        
        {/* Module Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers className="logo-glow-cyan" size={18} />
            <h2 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Universal Operations Tracker</h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{filteredItems.length} active tickets</span>
        </div>

        {/* Toolbar: Search, Filters, Add Button */}
        <div className="tracker-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="header-search" style={{ width: '220px' }}>
              <input 
                type="text" 
                placeholder="Search ID, address..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="header-search-icon" size={14} />
            </div>

            <div className="tracker-filters" style={{ display: 'flex', gap: '6px' }}>
              <select 
                className="select-filter" 
                value={moduleFilter} 
                onChange={(e) => setModuleFilter(e.target.value)}
              >
                <option value="All">All Modules</option>
                <option value="311">311 requests</option>
                <option value="Permits">Permits</option>
                <option value="Inspections">Inspections</option>
                <option value="Code Enforcement">Code Cases</option>
              </select>

              <select 
                className="select-filter" 
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {canEdit && (
            <button 
              onClick={() => setShowAddModal(true)} 
              className="ai-btn-send"
              style={{ height: '36px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Plus size={14} />
              <span>New 311 Ticket</span>
            </button>
          )}
        </div>

        {/* Tracker Grid Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="tracker-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Module</th>
                <th>Title / Description</th>
                <th>Location</th>
                <th>Priority</th>
                <th>SLA Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                      <Layers size={40} style={{ color: 'var(--primary-color)', opacity: 0.5 }} />
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: '#fff' }}>No Operations Tickets Found</h3>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>There are no active operational records matching these filters.</p>
                      </div>
                      {canEdit && (
                        <button className="ai-btn-send" onClick={() => setShowAddModal(true)} style={{ padding: '6px 12px', fontSize: '11px', cursor: 'pointer', marginTop: '6px' }}>
                          Create Ticket
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  const isCritical = item.priority === 'Critical';
                const isHigh = item.priority === 'High';
                
                let progressColorClass = '';
                if (item.slaProgress > 80) progressColorClass = 'danger';
                else if (item.slaProgress > 50) progressColorClass = 'warn';

                return (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedItemId(item.id)}
                    className={`${isCritical ? 'critical-row' : ''} ${isSelected ? 'active-row' : ''}`}
                    style={{
                      background: isSelected 
                        ? 'rgba(var(--tenant-hue), var(--tenant-sat), var(--tenant-light), 0.15)' 
                        : isCritical 
                        ? 'rgba(239, 68, 68, 0.04)' 
                        : 'transparent',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '3px solid var(--accent-color)' : 'none'
                    }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{item.id}</td>
                    <td>
                      <span className={`badge-status ${
                        item.module === '311' 
                          ? 'badge-warn' 
                          : item.module === 'Permits' 
                          ? 'badge-primary' 
                          : item.module === 'Inspections'
                          ? 'badge-success'
                          : 'badge-danger'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {item.module}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.assignedTo}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {item.address.split(',')[0]}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${getPriorityBadgeClass(item.priority)}`} style={{ fontSize: '0.7rem' }}>
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '48px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${item.slaProgress}%`, 
                              height: '100%', 
                              background: progressColorClass === 'danger' ? 'var(--danger-text)' : progressColorClass === 'warn' ? 'var(--warning-text)' : 'var(--success-text)' 
                            }} 
                          />
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', minWidth: '24px', textAlign: 'right' }}>
                          {item.slaProgress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Detailed Ticket Workspace */}
      {selectedItem && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', borderLeft: '1px solid var(--border-color-glow)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-status badge-success" style={{ fontSize: '0.65rem' }}>{selectedItem.module} module</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {selectedItem.id}</span>
                {!canEdit && (
                  <span style={{ fontSize: '10px', color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                    Locked
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '6px' }}>{selectedItem.title}</h3>
            </div>
            <button 
              onClick={() => setSelectedItemId(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Workflow & Fields panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Status Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>WORKFLOW STATUS</label>
              <select 
                className="select-filter" 
                style={{ width: '100%' }}
                value={selectedItem.status} 
                onChange={(e) => updateTrackerField(selectedItem.id, 'status', e.target.value)}
                disabled={!canEdit}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Applied">Applied</option>
                <option value="Notice Issued">Notice Issued</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>TICKET PRIORITY</label>
              <select 
                className="select-filter" 
                style={{ width: '100%' }}
                value={selectedItem.priority} 
                onChange={(e) => updateTrackerField(selectedItem.id, 'priority', e.target.value)}
                disabled={!canEdit}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Assignment Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>ASSIGNED OFFICER / DEPT</label>
              <select 
                className="select-filter" 
                style={{ width: '100%' }}
                value={selectedItem.assignedTo} 
                onChange={(e) => updateTrackerField(selectedItem.id, 'assignedTo', e.target.value)}
                disabled={!canEdit}
              >
                <option value="Marcus Miller">Marcus Miller</option>
                <option value="Elena Rostova">Elena Rostova</option>
                <option value="Public Works Water Div">Public Works Water Div</option>
                <option value="Public Works Operations">Public Works Operations</option>
                <option value="Historical Landmarks Board">Historical Landmarks Board</option>
              </select>
            </div>

            {/* Location (Linked Record) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>GIS LOCATION</label>
              <button 
                onClick={() => onOpenPropertyByAddress(selectedItem.address)}
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  padding: '6px 10px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  color: 'var(--primary-color)',
                  textAlign: 'left', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {selectedItem.address.split(',')[0]}
              </button>
            </div>
          </div>

          {/* SLA Status Widget */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <Clock size={12} />
                SLA Compliance Matrix
              </span>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginLeft: 'auto' }}>Limit: {selectedItem.slaDays} days</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${selectedItem.slaProgress}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))' 
                }} 
              />
            </div>
          </div>

          {/* Comments Ledger Panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <MessageSquare size={14} />
              <span>Operations Comments Ledger</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="text" 
                className="ai-input" 
                placeholder="Log internal updates..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                style={{ flex: 1, fontSize: '0.75rem', height: '32px' }}
              />
              <button 
                type="submit" 
                className="ai-btn-send"
                style={{ height: '32px', padding: '0 10px', fontSize: '0.75rem' }}
              >
                Send
              </button>
            </form>

            {/* Comment list rendering */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedItem.comments.map((c, i) => (
                <div key={i} style={{ padding: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{c.user}</span>
                    <span>{c.date}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions & Related Records */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>RELATED PARCEL MAPS</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {selectedItem.relatedRecords.map((rec, i) => (
                <button 
                  key={i} 
                  className="tab-button active"
                  onClick={() => onOpenChart('property', rec.id)}
                  style={{ fontSize: '0.7rem', padding: '4px 8px', height: '26px' }}
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* AI Suggested Routing Popup Dialog Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '480px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', border: '1px solid var(--border-color-glow)', background: '#11131c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} className="text-emerald-400" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>Create & Route 311 Incident</h3>
              </div>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setAiSuggestion(null);
                }} 
                style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {!aiSuggestion ? (
              /* Request Intake Form */
              <form onSubmit={handleAnalyzeTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket Title Summary</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Water leak on sidewalk"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incident Details & Description</label>
                  <textarea 
                    placeholder="Describe issue (e.g. Water bubbling up next to fire hydrant, blocking path)"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    required
                    style={{ width: '100%', minHeight: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', lineHeight: '1.4' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location Address</label>
                    <select 
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', height: '36px' }}
                    >
                      {Object.values(properties).map((p: any) => (
                        <option key={p.id} value={p.address}>{p.address}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority Level</label>
                    <select 
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', height: '36px' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={aiAnalyzing}
                  style={{ padding: '10px 14px', borderRadius: '6px', border: 0, color: '#fff', background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '13px' }}
                >
                  {aiAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Munevo AI Companion routing ticket...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Route Ticket with Munevo AI</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* AI Suggestion Dialog Output */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
                    <Sparkles size={14} />
                    <span>AI Dispatch Suggestions:</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>TARGET MODULE</span>
                      <strong style={{ color: '#fff', fontSize: '13px', display: 'block', marginTop: '2px' }}>
                        {aiSuggestion.suggestedModule.replace('-', ' ').toUpperCase()}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>MUNICIPAL ASSIGNEE</span>
                      <strong style={{ color: '#fff', fontSize: '13px', display: 'block', marginTop: '2px' }}>
                        {aiSuggestion.suggestedAssignee} ({aiSuggestion.suggestedRoleName})
                      </strong>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>AI RECOMMENDATION RATIONALE</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '11.5px', lineHeight: '1.4', margin: '4px 0 0 0' }}>
                      {aiSuggestion.rationale}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button 
                    onClick={() => setAiSuggestion(null)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Override / Re-classify
                  </button>
                  <button 
                    onClick={handleConfirmRoute}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 0, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle size={12} />
                    Confirm & Assign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
