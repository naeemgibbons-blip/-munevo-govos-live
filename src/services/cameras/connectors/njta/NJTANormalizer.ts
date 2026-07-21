import type { NormalizedCamera } from '../../core/CameraTypes.js';

export function normalizeNJTACamera(item: any): NormalizedCamera {
  const officialPageUrl = `https://www.njta.gov/travel-resources/camera-list/`;

  return {
    id: `NJTA-${item.id}`,
    sourceSystem: 'NJTA',
    sourceAgency: 'New Jersey Turnpike Authority',
    sourceCameraId: String(item.id),
    name: item.name || 'NJ Turnpike Camera',
    description: `NJTA Highway Camera - ${item.roadway}`,
    roadway: item.roadway || 'NJ Turnpike',
    direction: item.direction || 'Northbound',
    nearestIntersection: item.interchange || `Exit ${item.exitNumber || '14'}`,
    municipality: item.city || 'Newark',
    county: item.county || 'Essex',
    state: 'NJ',
    latitude: item.lat || 40.7100,
    longitude: item.lng || -74.1650,
    mediaType: item.imageUrl ? 'REFRESHED_IMAGE' : 'EXTERNAL_VIEW',
    imageUrl: item.imageUrl,
    officialPageUrl,
    refreshIntervalSeconds: 15,
    sourceTimestamp: new Date().toISOString(),
    lastSuccessfulFetch: new Date().toISOString(),
    status: 'AVAILABLE',
    attribution: {
      agency: 'New Jersey Turnpike Authority (NJTA)',
      text: 'Official camera feed provided by the New Jersey Turnpike Authority.',
      url: 'https://www.njta.gov/travel-resources/camera-list/'
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
