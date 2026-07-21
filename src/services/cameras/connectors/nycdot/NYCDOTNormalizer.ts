import type { NormalizedCamera } from '../../core/CameraTypes.js';

export function normalizeNYCDOTCamera(item: any): NormalizedCamera {
  const isOnline = item.isOnline === 'true' || item.isOnline === true;
  const officialPageUrl = `https://webcams.nyctmc.org/map`;
  const imageUrl = item.imageUrl || `https://webcams.nyctmc.org/api/cameras/${item.id}/image`;

  return {
    id: `NYCDOT-${item.id}`,
    sourceSystem: 'NYCDOT',
    sourceAgency: 'NYC DOT / NYCTMC',
    sourceCameraId: item.id,
    name: item.name || 'NYC Traffic Camera',
    description: `Official NYC DOT Camera in ${item.area || 'Metro Area'}`,
    roadway: item.name?.split('@')[0]?.trim() || item.name,
    direction: item.name?.includes('NB') ? 'Northbound' : item.name?.includes('SB') ? 'Southbound' : item.name?.includes('EB') ? 'Eastbound' : item.name?.includes('WB') ? 'Westbound' : undefined,
    nearestIntersection: item.name?.includes('@') ? item.name.split('@')[1]?.trim() : undefined,
    municipality: item.area || 'New York City',
    county: item.area || 'New York',
    state: 'NY',
    latitude: typeof item.latitude === 'number' ? item.latitude : parseFloat(item.latitude),
    longitude: typeof item.longitude === 'number' ? item.longitude : parseFloat(item.longitude),
    mediaType: isOnline ? 'REFRESHED_IMAGE' : 'UNAVAILABLE',
    imageUrl: isOnline ? imageUrl : undefined,
    officialPageUrl,
    refreshIntervalSeconds: 15,
    sourceTimestamp: new Date().toISOString(),
    lastSuccessfulFetch: new Date().toISOString(),
    status: isOnline ? 'AVAILABLE' : 'OFFLINE',
    attribution: {
      agency: 'NYC Department of Transportation',
      text: 'Traffic camera feed provided by NYC DOT / NYCTMC Webcams.',
      url: 'https://webcams.nyctmc.org/map'
    },
    permissions: {
      mayDisplay: true,
      mayProxy: true,
      mayCache: false,
      mayRetainSnapshot: true,
      mayAnalyzeWithAI: true
    }
  };
}
