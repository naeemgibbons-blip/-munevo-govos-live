import React, { useState } from 'react';
import { PROPERTIES, PropertyRecord } from '../mockData';
import { geocodeAddress, PROVIDER_METADATA, GisProvider, GeocodedAddress } from '../gisService';
import { 
  Navigation, 
  Layers, 
  Search, 
  Sparkles, 
  Activity, 
  MapPin, 
  Database,
  Eye,
  Route,
  AlertTriangle
} from 'lucide-react';

// Leaflet Imports
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid #fff; box-shadow: 0 0 6px rgba(0,0,0,0.6);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const mapCoordsToLatLng = (coords: [number, number]): [number, number] => {
  const [x, y] = coords;
  const lat = 40.735657 - (y - 250) * 0.00005;
  const lng = -74.172367 + (x - 250) * 0.00008;
  return [lat, lng];
};

interface GisMapProps {
  activePropertyId: string | null;
  onSelectProperty: (id: string) => void;
  pins: { id: string; label: string; coords: [number, number]; type: 'permit' | 'violation' | 'request' }[];
  onOpenChart: (type: 'property' | 'permit' | 'legislative' | 'business', id: string) => void;
  addNotification: (message: string) => void;
}

export const GisMap: React.FC<GisMapProps> = ({ 
  activePropertyId, 
  onSelectProperty, 
  pins,
  onOpenChart,
  addNotification
}) => {
  // Provider Abstraction Layer State
  const [provider, setProvider] = useState<GisProvider>('ArcGIS');
  
  // Layers State
  const [layers, setLayers] = useState({
    parcels: true,
    waterMains: false,
    sewerLines: false,
    zoning: false,
    wards: false,
    projects: true
  });

  // Address Intelligence Search States
  const [searchVal, setSearchVal] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<GeocodedAddress | null>(null);

  // Spatial Intelligence Analysis State
  const [spatialAnalysisType, setSpatialAnalysisType] = useState<string | null>(null);

  // Filters State
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const propertiesList = Object.values(PROPERTIES);

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Run Address Intelligence
  const handleAddressSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;

    const result = geocodeAddress(searchVal);
    setResolvedAddress(result);
    
    // If it maps to one of our mock properties, set it active
    const matchedProp = propertiesList.find(p => p.address.toLowerCase().includes(result.address.toLowerCase()) || result.normalizedAddress.includes(p.address));
    if (matchedProp) {
      onSelectProperty(matchedProp.id);
    }
  };

  const getProviderInfo = () => {
    return PROVIDER_METADATA.find(p => p.provider === provider);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', width: '100%', height: '100%' }}>
      
      {/* Left: GIS Map Panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', padding: '16px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
          <div className="card-title">
            <Navigation className="brand-gradient-text" size={18} />
            <span>Enterprise Spatial Intelligence GIS</span>
          </div>
          
          {/* Provider Abstraction Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Provider Engine:</span>
            <select 
              className="role-select" 
              style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-color)' }}
              value={provider}
              onChange={(e) => setProvider(e.target.value as GisProvider)}
            >
              <option value="ArcGIS">ArcGIS (Tax/Utility Layers)</option>
              <option value="Mapbox">Mapbox (3D Building Tiles)</option>
              <option value="OpenStreetMap">OpenStreetMap (Base Map Fallback)</option>
            </select>
          </div>
        </div>

        {/* Map Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Type:</span>
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
            >
              <option value="All">All Types</option>
              <option value="Properties">Properties Only</option>
              <option value="Permits">Permits Only</option>
              <option value="Tickets">Tracker Cases / 311</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active / Open</option>
              <option value="Resolved">Resolved / Completed</option>
            </select>
          </div>
        </div>

        {/* GIS Canvas Rendering (Leaflet Interactive Map) */}
        <div style={{ 
          background: '#0d1629', 
          border: '1px solid var(--border-color)', 
          borderRadius: '10px', 
          overflow: 'hidden', 
          height: '420px', 
          position: 'relative',
          zIndex: 1
        }}>
          <MapContainer 
            center={[40.735657, -74.172367]} 
            zoom={16} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render Properties Pins */}
            {(filterType === 'All' || filterType === 'Properties') && layers.parcels && propertiesList.map(prop => {
              const latlng = mapCoordsToLatLng(prop.gisCoords);
              // Filter status check
              if (filterStatus === 'Resolved' && prop.taxStatus !== 'Paid') return null;
              if (filterStatus === 'Active' && prop.taxStatus === 'Paid') return null;

              return (
                <Marker 
                  key={prop.id} 
                  position={latlng} 
                  icon={createCustomIcon(activePropertyId === prop.id ? 'var(--accent-color)' : '#3b82f6')}
                >
                  <Popup>
                    <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.4' }}>
                      <strong style={{ display: 'block', fontSize: '12px' }}>{prop.address}</strong>
                      <span>Owner: {prop.ownerName}</span><br />
                      <span>Value: ${prop.assessedValue.toLocaleString()}</span><br />
                      <span>Tax Status: <strong style={{ color: prop.taxStatus === 'Paid' ? 'green' : 'red' }}>{prop.taxStatus}</strong></span>
                      <button 
                        onClick={() => {
                          onSelectProperty(prop.id);
                          onOpenChart('property', prop.id);
                        }}
                        style={{ display: 'block', marginTop: '6px', background: 'var(--primary-color)', color: '#fff', border: 0, padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Open Property Chart
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Render Permits Pins */}
            {(filterType === 'All' || filterType === 'Permits') && (
              // Seed permits at property coordinates with small offset
              propertiesList.map(prop => {
                const latlng = mapCoordsToLatLng(prop.gisCoords);
                const offsetLatlng: [number, number] = [latlng[0] + 0.0001, latlng[1] + 0.0001];

                return (
                  <Marker 
                    key={`perm-${prop.id}`} 
                    position={offsetLatlng} 
                    icon={createCustomIcon('#10b981')}
                  >
                    <Popup>
                      <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.4' }}>
                        <strong style={{ display: 'block', fontSize: '12px' }}>Building Permit Desk</strong>
                        <span>Ref Address: {prop.address}</span><br />
                        <span>Work Scope: Foundation Structural restoration</span>
                        <button 
                          onClick={() => onOpenChart('permit', 'perm_02')}
                          style={{ display: 'block', marginTop: '6px', background: '#10b981', color: '#fff', border: 0, padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Open Permit Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })
            )}

            {/* Render 311 / Code Cases Pins */}
            {(filterType === 'All' || filterType === 'Tickets') && pins.map(pin => {
              const latlng = mapCoordsToLatLng(pin.coords);
              const color = pin.type === 'violation' ? '#ef4444' : '#f59e0b';
              
              if (filterStatus === 'Resolved' && pin.label.includes('Open')) return null;
              if (filterStatus === 'Active' && pin.label.includes('Resolved')) return null;

              return (
                <Marker 
                  key={pin.id} 
                  position={latlng} 
                  icon={createCustomIcon(color)}
                >
                  <Popup>
                    <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.4' }}>
                      <strong style={{ display: 'block', fontSize: '12px', color: '#ef4444' }}>{pin.type.toUpperCase()}: {pin.id}</strong>
                      <span>{pin.label}</span>
                      <button 
                        onClick={() => onOpenChart('property', 'prop_01')}
                        style={{ display: 'block', marginTop: '6px', background: '#ef4444', color: '#fff', border: 0, padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Inspect Associated Property
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Resolved search address marker */}
            {resolvedAddress && (
              <Marker 
                position={[resolvedAddress.lat, resolvedAddress.lng]} 
                icon={createCustomIcon('#d97706')}
              >
                <Popup>
                  <div style={{ fontSize: '11px', color: '#333' }}>
                    <strong>Geocoded Search Result</strong><br />
                    <span>{resolvedAddress.normalizedAddress}</span>
                  </div>
                </Popup>
              </Marker>
            )}

          </MapContainer>
        </div>

        {/* Map Legend */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Permit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning-text)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>311 Request</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger-text)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Code Case</span>
          </div>
          {resolvedAddress && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Geocoded Point</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: GIS Layers, Address intelligence & Spatial AI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        
        {/* Address Intelligence normalizer */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Search size={14} style={{ color: 'var(--primary-color)' }} />
              <span>Address Intelligence Engine</span>
            </div>
          </div>
          
          <form onSubmit={handleAddressSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input 
              type="text" 
              className="ai-input" 
              placeholder="Enter address (e.g. '255 Leon Avenue')..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <button type="submit" className="ai-btn-send">Validate</button>
          </form>

          {resolvedAddress && (
            <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Normalized Address:</div>
              <div>{resolvedAddress.normalizedAddress}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                <div><strong>Ward:</strong> {resolvedAddress.ward}</div>
                <div><strong>District:</strong> {resolvedAddress.district}</div>
                <div><strong>Neighborhood:</strong> {resolvedAddress.neighborhood}</div>
                <div><strong>ZIP:</strong> {resolvedAddress.zipCode}</div>
                <div><strong>Block/Lot:</strong> Blk {resolvedAddress.block}, Lot {resolvedAddress.lot}</div>
                <div><strong>Coords:</strong> {resolvedAddress.lat.toFixed(4)}, {resolvedAddress.lng.toFixed(4)}</div>
              </div>
              
              {/* Show chart trigger */}
              {resolvedAddress.normalizedAddress.includes('Leon') ? (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                  This address represents a new vacant site. No Munevo digital twin created yet.
                </div>
              ) : (
                <button 
                  className="ai-btn-send"
                  style={{ marginTop: '8px', width: '100%', fontSize: '0.75rem' }}
                  onClick={() => {
                    const matchedProp = propertiesList.find(p => resolvedAddress.normalizedAddress.includes(p.address));
                    if (matchedProp) {
                      onOpenChart('property', matchedProp.id);
                    }
                  }}
                >
                  Open Property Digital Twin Chart
                </button>
              )}
            </div>
          )}
        </div>

        {/* GIS Layers Control panel */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={14} style={{ color: 'var(--primary-color)' }} />
              <span>GIS Thematic Overlays</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={layers.parcels} onChange={() => toggleLayer('parcels')} />
              Tax Parcels Boundaries
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={layers.zoning} onChange={() => toggleLayer('zoning')} />
              Zoning Districts
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={layers.wards} onChange={() => toggleLayer('wards')} />
              Wards & Council Districts
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={layers.waterMains} onChange={() => toggleLayer('waterMains')} />
              Water Main Utilities
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={layers.sewerLines} onChange={() => toggleLayer('sewerLines')} />
              Sewer Main Utility Networks
            </label>
          </div>
        </div>

        {/* AI Spatial Intelligence Analysis panel */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <div className="card-header">
            <div className="card-title">
              <Sparkles className="brand-gradient-text" size={14} />
              <span>AI Spatial Analytics Engine</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              className="btn-action" 
              style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', padding: '8px 12px' }}
              onClick={() => {
                setSpatialAnalysisType(spatialAnalysisType === 'schools' ? null : 'schools');
                setLayers(prev => ({ ...prev, wards: true }));
              }}
            >
              <AlertTriangle size={14} style={{ color: 'var(--danger-text)', marginRight: '6px' }} />
              <span>Show Code Violations near Schools (150m Buffer)</span>
            </button>

            <button 
              className="btn-action" 
              style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start', padding: '8px 12px' }}
              onClick={() => {
                setSpatialAnalysisType(spatialAnalysisType === 'route' ? null : 'route');
                addNotification('Optimized inspection routing drawn on GIS.');
              }}
            >
              <Route size={14} style={{ color: 'var(--accent-color)', marginRight: '6px' }} />
              <span>Optimize Marcus Miller\'s Inspection Route Map</span>
            </button>
          </div>

          {spatialAnalysisType === 'schools' && (
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed var(--danger-text)', borderRadius: '6px', fontSize: '0.75rem', lineHeight: 1.4 }}>
              <strong>AI Spatial Cluster Detection:</strong> High priority building structural violation found at **15 Washington St** falls within the **150m School safety enforcement zone**. Risk Index: **High**. Recommended action: Dispatch Code Enforcement Supervisor.
            </div>
          )}

          {spatialAnalysisType === 'route' && (
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(34, 197, 94, 0.05)', border: '1px dashed var(--success-text)', borderRadius: '6px', fontSize: '0.75rem', lineHeight: 1.4 }}>
              <strong>AI Optimized Route Map:</strong> 5 properties connected. Total travel window reduced by **35%** (14 minutes transit average). Dispatching route parameters to Building Inspector Command Center dashboard.
            </div>
          )}
        </div>

        {/* Provider Engine description details */}
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
            <Database size={10} />
            <span>Active Service Provider: {provider}</span>
          </div>
          <ul style={{ paddingLeft: '14px' }}>
            {getProviderInfo()?.responsibilities.map((resp, idx) => (
              <li key={idx}>{resp}</li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};
