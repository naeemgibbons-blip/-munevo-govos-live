import type { NormalizedCamera } from '../../core/CameraTypes.js';

export function normalizeNJ511Camera(item: any): NormalizedCamera {
  const isOnline = item.status === 'ACTIVE' || item.isOnline !== false;
  const officialPageUrl = item.url || `https://511nj.org/camera`;

  return {
    id: `NJ511-${item.id || item.cameraId}`,
    sourceSystem: 'NJ511',
    sourceAgency: 'NJ511 / NJDOT',
    sourceCameraId: String(item.id || item.cameraId),
    name: item.name || item.title || 'NJ511 Traffic Camera',
    description: item.description || `NJ511 Camera - ${item.roadway || 'New Jersey Corridor'}`,
    roadway: item.roadway || item.name?.split('-')[0]?.trim(),
    direction: item.direction || 'Northbound',
    nearestIntersection: item.intersection,
    municipality: item.city || 'Newark',
    county: item.county || 'Essex',
    state: 'NJ',
    latitude: item.lat ? parseFloat(item.lat) : 40.7357,
    longitude: item.lng ? parseFloat(item.lng) : -74.1724,
    mediaType: item.streamUrl ? 'LIVE_VIDEO' : item.imageUrl ? 'REFRESHED_IMAGE' : 'EXTERNAL_VIEW',
    imageUrl: item.imageUrl,
    streamUrl: item.streamUrl,
    officialPageUrl,
    refreshIntervalSeconds: 15,
    sourceTimestamp: new Date().toISOString(),
    lastSuccessfulFetch: new Date().toISOString(),
    status: isOnline ? 'AVAILABLE' : 'OFFLINE',
    attribution: {
      agency: 'New Jersey Department of Transportation (NJDOT)',
      text: 'Camera feed provided by 511NJ Official Transportation Network.',
      url: 'https://511nj.org/camera'
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
