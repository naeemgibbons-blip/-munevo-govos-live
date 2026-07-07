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

        {/* GIS Canvas Rendering (Pure Vector SVG) */}
        <div style={{ 
          background: 'radial-gradient(circle at center, #0d1629 0%, #050a16 100%)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '10px', 
          overflow: 'hidden', 
          height: '420px', 
          position: 'relative' 
        }}>
          
          <svg viewBox="0 0 500 500" className="gis-svg" style={{ width: '100%', height: '100%' }}>
            
            {/* Defs for zoning colors */}
            <defs>
              <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" style={{ stroke: 'rgba(239, 68, 68, 0.15)', strokeWidth: 2 }} />
              </pattern>
            </defs>

            {/* Base Grid */}
            <rect width="500" height="500" fill="transparent"/>

            {/* Zoning Overlays */}
            {layers.zoning && (
              <>
                {/* Downtown Commercial (Violet Overlay) */}
                <rect x="200" y="280" width="150" height="100" fill="rgba(168, 85, 247, 0.12)" stroke="rgba(168, 85, 247, 0.3)" strokeDasharray="3,3" />
                {/* Residential (Green Overlay) */}
                <rect x="100" y="50" width="160" height="180" fill="rgba(34, 197, 94, 0.08)" stroke="rgba(34, 197, 94, 0.2)" strokeDasharray="3,3" />
                {/* Ironbound Mixed Use (Orange Overlay) */}
                <rect x="340" y="320" width="140" height="160" fill="rgba(249, 115, 22, 0.1)" stroke="rgba(249, 115, 22, 0.25)" strokeDasharray="3,3" />
              </>
            )}

            {/* Administrative Wards (Dashed white boundaries) */}
            {layers.wards && (
              <>
                {/* North Ward Boundary Line */}
                <line x1="0" y1="210" x2="500" y2="210" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="6,6" />
                <text x="20" y="200" fill="var(--text-muted)" fontSize="8px" fontWeight="bold">NORTH WARD (DISTRICT 1)</text>

                {/* East Ward (Ironbound) Boundary Line */}
                <path d="M 250 210 Q 300 310 500 310" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="6,6" />
                <text x="380" y="295" fill="var(--text-muted)" fontSize="8px" fontWeight="bold">EAST WARD (IRONBOUND)</text>

                {/* Central Ward Label */}
                <text x="20" y="235" fill="var(--text-muted)" fontSize="8px" fontWeight="bold">CENTRAL WARD (DISTRICT 2)</text>
              </>
            )}

            {/* Utility Grid: Water Mains (Blue Pipe Lines) */}
            {layers.waterMains && (
              <g opacity="0.85">
                <line x1="252" y1="0" x2="252" y2="500" stroke="var(--primary-color)" strokeWidth="1.5" />
                <line x1="0" y1="312" x2="500" y2="312" stroke="var(--primary-color)" strokeWidth="1.2" />
                <path d="M 252 312 L 500 482" stroke="var(--primary-color)" strokeWidth="1.2" fill="none" />
                <line x1="162" y1="0" x2="162" y2="500" stroke="var(--primary-color)" strokeWidth="1.0" />
                {/* Pressure Valve Indicators */}
                <circle cx="252" cy="312" r="3" fill="#60a5fa" />
                <circle cx="162" cy="150" r="3" fill="#60a5fa" />
              </g>
            )}

            {/* Utility Grid: Sewer Mains (Brown/Green Flow Lines) */}
            {layers.sewerLines && (
              <g opacity="0.85">
                <line x1="248" y1="0" x2="248" y2="500" stroke="#16a34a" strokeWidth="2" strokeDasharray="4,4" />
                <line x1="0" y1="308" x2="500" y2="308" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4,4" />
                <line x1="158" y1="0" x2="158" y2="500" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4,4" />
                {/* Manhole Junctions */}
                <rect x="245" y="305" width="6" height="6" fill="#84cc16" />
                <rect x="155" y="147" width="6" height="6" fill="#84cc16" />
              </g>
            )}

            {/* Road network base (rendered under parcels if layers enabled) */}
            <line x1="250" y1="0" x2="250" y2="500" className="gis-street" strokeWidth="6" />
            <line x1="0" y1="310" x2="500" y2="310" className="gis-street" strokeWidth="5" />
            <path d="M 250 310 L 500 480" className="gis-street" strokeWidth="5" />
            <line x1="160" y1="0" x2="160" y2="500" className="gis-street" strokeWidth="4" />
            <line x1="160" y1="150" x2="250" y2="150" className="gis-street" strokeWidth="3" />
            <line x1="330" y1="0" x2="330" y2="500" className="gis-street" strokeWidth="3.5" />

            {/* Property Parcels Boundaries */}
            {layers.parcels && propertiesList.map((prop) => {
              const isActive = activePropertyId === prop.id;
              const [x, y] = prop.gisCoords;
              const size = prop.id === 'prop_01' ? 45 : prop.id === 'prop_05' || prop.id === 'prop_06' ? 22 : 30;
              const px = x - size / 2;
              const py = y - size / 2;

              return (
                <g key={prop.id} onClick={() => onSelectProperty(prop.id)}>
                  <rect
                    x={px}
                    y={py}
                    width={size}
                    height={size}
                    rx="4"
                    className={`gis-parcel ${isActive ? 'active' : ''}`}
                    style={{
                      fill: isActive ? 'rgba(var(--accent-hue), var(--accent-sat), 30%, 0.4)' : ''
                    }}
                  />
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="7px"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {prop.id === 'prop_01' ? 'HALL' : prop.id === 'prop_02' ? 'WASH' : prop.id === 'prop_03' ? 'BAKE' : prop.id === 'prop_04' ? 'RETL' : prop.id === 'prop_05' ? '125' : '129'}
                  </text>
                </g>
              );
            })}

            {/* Spatial Analysis Overlay Buffer Circle */}
            {spatialAnalysisType === 'schools' && (
              <g opacity="0.35">
                {/* 150px buffer zone around schools (represented by prop_01/hall near school zones) */}
                <circle cx="230" cy="150" r="85" fill="rgba(239, 68, 68, 0.15)" stroke="var(--danger-text)" strokeWidth="1.5" strokeDasharray="3,3" />
                <circle cx="230" cy="150" r="5" fill="var(--danger-text)" />
                <text x="230" y="138" fill="var(--danger-text)" fontSize="7px" fontWeight="bold" textAnchor="middle">SCHOOL ENFORCEMENT BUFFER</text>
              </g>
            )}

            {/* Spatial Analysis Route lines */}
            {spatialAnalysisType === 'route' && (
              <path 
                d="M 250 350 L 330 310 L 310 310 L 230 150 L 420 410" 
                fill="none" 
                stroke="var(--accent-color)" 
                strokeWidth="2.5" 
                strokeDasharray="5,3"
                style={{ filter: 'drop-shadow(0 0 8px var(--accent-color))' }}
              />
            )}

            {/* Render Pins */}
            {pins.map((pin) => {
              const [x, y] = pin.coords;
              const color =
                pin.type === 'violation'
                  ? 'var(--danger-text)'
                  : pin.type === 'request'
                  ? 'var(--warning-text)'
                  : 'var(--primary-color)';

              return (
                <g key={pin.id} className="gis-pin" transform={`translate(${x}, ${y - 12})`}>
                  <title>{`${pin.id}: ${pin.label}`}</title>
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill={color}
                    transform="scale(0.8) translate(-12, -22)"
                  />
                </g>
              );
            })}

            {/* Geocode Search Results Pin */}
            {resolvedAddress && (
              <g className="gis-pin" transform={`translate(${resolvedAddress.parcelCoords[0]}, ${resolvedAddress.parcelCoords[1] - 12})`}>
                <circle cx="0" cy="0" r="14" fill="rgba(245, 158, 11, 0.15)" stroke="var(--accent-color)" strokeWidth="1" strokeDasharray="3,3" />
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="var(--accent-color)"
                  transform="scale(0.9) translate(-12, -22)"
                />
              </g>
            )}
          </svg>
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
