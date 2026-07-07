import React, { useState } from 'react';
import { TrackerItem } from '../mockData';
import { 
  Layers, 
  Search, 
  Filter, 
  Clock, 
  X, 
  MessageSquare, 
  Paperclip, 
  History, 
  Sliders, 
  UserCheck, 
  Compass,
  ArrowRight,
  Plus
} from 'lucide-react';

interface UniversalTrackerProps {
  trackerItems: TrackerItem[];
  setTrackerItems: React.Dispatch<React.SetStateAction<TrackerItem[]>>;
  onOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => void;
  onOpenPropertyByAddress: (address: string) => void;
}

export const UniversalTracker: React.FC<UniversalTrackerProps> = ({
  trackerItems,
  setTrackerItems,
  onOpenChart,
  onOpenPropertyByAddress
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  // Selected tracker item for detailed workspace
  const [selectedItemId, setSelectedItemId] = useState<string | null>('TRK-9832'); // Default to Market St awning
  
  // Local state for new comment
  const [newComment, setNewComment] = useState('');
  // Local state for fake attachment upload
  const [uploadName, setUploadName] = useState('');

  // Find selected item
  const selectedItem = trackerItems.find(item => item.id === selectedItemId) || null;

  // Filter items
  const filteredItems = trackerItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = moduleFilter === 'All' || item.module === moduleFilter;
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;

    return matchesSearch && matchesModule && matchesPriority;
  });

  // Handle workflow updates (status, priority, assignment)
  const updateTrackerField = (itemId: string, field: keyof TrackerItem, value: any) => {
    setTrackerItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const auditAction = `Field '${String(field)}' updated to: ${value}`;
        const updatedHistory = [
          ...item.history,
          { action: auditAction, user: 'Naeem Gibbons (GovOS Session)', date: 'Just now' }
        ];
        return { 
          ...item, 
          [field]: value,
          history: updatedHistory
        };
      }
      return item;
    }));
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !newComment.trim()) return;

    setTrackerItems(prev => prev.map(item => {
      if (item.id === selectedItemId) {
        return {
          ...item,
          comments: [
            ...item.comments,
            { user: 'Naeem Gibbons (GovOS Session)', text: newComment, date: 'Just now' }
          ],
          history: [
            ...item.history,
            { action: 'Added Comment', user: 'Naeem Gibbons', date: 'Just now' }
          ]
        };
      }
      return item;
    }));
    setNewComment('');
  };

  // Simulate attachment upload
  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !uploadName.trim()) return;

    setTrackerItems(prev => prev.map(item => {
      if (item.id === selectedItemId) {
        return {
          ...item,
          attachments: [...item.attachments, uploadName],
          history: [
            ...item.history,
            { action: `Attached file: ${uploadName}`, user: 'Naeem Gibbons', date: 'Just now' }
          ]
        };
      }
      return item;
    }));
    setUploadName('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1.1fr 0.9fr' : '1fr', gap: '20px', flex: 1, height: '100%', overflow: 'hidden' }}>
      
      {/* Left Column: Grid list */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div className="card-title">
            <Layers className="brand-gradient-text" size={18} />
            <span>Universal Operations Tracker</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {filteredItems.length} of {trackerItems.length} records
          </span>
        </div>

        {/* Toolbar: Search, Filters */}
        <div className="tracker-toolbar">
          <div className="header-search" style={{ width: '240px' }}>
            <input 
              type="text" 
              placeholder="Search ID, address..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="header-search-icon" size={14} />
          </div>

          <div className="tracker-filters">
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

        {/* Tracker Grid Table */}
        <div className="tracker-table-container">
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
              {filteredItems.map((item) => {
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
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.75rem',
                        color: isCritical 
                          ? 'var(--danger-text)' 
                          : isHigh 
                          ? 'var(--warning-text)' 
                          : 'var(--text-secondary)'
                      }}>
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '80px' }}>
                        <div className="sla-progress-bar">
                          <div 
                            className={`sla-progress-fill ${progressColorClass}`} 
                            style={{ width: `${item.slaProgress}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                          {item.slaProgress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No operations tracker items found.
                  </td>
                </tr>
              )}
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
                <span>SLA Expiry Timeline</span>
              </span>
              <span style={{ fontWeight: 700, color: selectedItem.slaProgress > 80 ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                {selectedItem.slaDays} Days Limit ({selectedItem.slaProgress}% consumed)
              </span>
            </div>
            <div className="sla-progress-bar">
              <div 
                className={`sla-progress-fill ${selectedItem.slaProgress > 80 ? 'danger' : selectedItem.slaProgress > 50 ? 'warn' : ''}`}
                style={{ width: `${selectedItem.slaProgress}%` }}
              />
            </div>
          </div>

          {/* Custom Fields segment */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '8px' }}>
              <Sliders size={12} />
              <span>Module Custom Fields</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
              {Object.entries(selectedItem.customFields).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(255,255,255,0.01)', padding: '6px', borderRadius: '4px', userSelect: 'none' }} contentEditable={false}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', userSelect: 'none' }} contentEditable={false}>{key}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, userSelect: 'text' }} contentEditable={false}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              ATTACHMENTS ({selectedItem.attachments.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedItem.attachments.map((file, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem' }}>
                  <Paperclip size={12} style={{ color: 'var(--primary-color)' }} />
                  <span style={{ flex: 1 }}>{file}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>MIME-Verified</span>
                </div>
              ))}
              
              <form onSubmit={handleUploadFile} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="text" 
                  className="ai-input" 
                  placeholder="Simulate uploading file..." 
                  value={uploadName} 
                  onChange={(e) => setUploadName(e.target.value)}
                  style={{ fontSize: '0.75rem' }}
                />
                <button type="submit" className="ai-btn-send" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <Plus size={10} />
                  <span>Attach</span>
                </button>
              </form>
            </div>
          </div>

          {/* Comments Feed */}
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              COMMENTS FEED ({selectedItem.comments.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', marginBottom: '8px' }}>
              {selectedItem.comments.map((comm, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.7rem', marginBottom: '4px' }}>
                    <span>{comm.user}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{comm.date}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{comm.text}</p>
                </div>
              ))}
              {selectedItem.comments.length === 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px' }}>No comments recorded on this ticket.</span>
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="ai-input" 
                placeholder="Post an operational comment..." 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)}
                style={{ fontSize: '0.75rem' }}
                required
              />
              <button type="submit" className="ai-btn-send" style={{ fontSize: '0.75rem' }}>Post</button>
            </form>
          </div>

          {/* Audit History Timeline */}
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              TICKET AUDIT TRAILS
            </span>
            <div className="timeline" style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {selectedItem.history.map((hist, idx) => (
                <div key={idx} className="timeline-item" style={{ gap: '10px' }}>
                  <div className="timeline-node success" style={{ width: '8px', height: '8px' }} />
                  <div className="timeline-info" style={{ gap: '0' }}>
                    <span className="timeline-date" style={{ fontSize: '0.65rem' }}>{hist.date} • {hist.user}</span>
                    <span className="timeline-title" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{hist.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
