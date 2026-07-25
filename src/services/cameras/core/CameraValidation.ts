import type { NormalizedCamera } from './CameraTypes.js';

export function validateNormalizedCamera(camera: any): camera is NormalizedCamera {
  if (!camera || typeof camera !== 'object') return false;

  if (typeof camera.id !== 'string' || !camera.id) return false;
  if (typeof camera.sourceSystem !== 'string' || !camera.sourceSystem) return false;
  if (typeof camera.sourceAgency !== 'string' || !camera.sourceAgency) return false;
  if (typeof camera.name !== 'string' || !camera.name) return false;
  if (typeof camera.officialPageUrl !== 'string' || !camera.officialPageUrl) return false;

  const validMediaTypes = ['LIVE_VIDEO', 'REFRESHED_IMAGE', 'OFFICIAL_EMBED', 'EXTERNAL_VIEW', 'UNAVAILABLE'];
  if (!validMediaTypes.includes(camera.mediaType)) return false;

  const validStatuses = ['AVAILABLE', 'STALE', 'OFFLINE', 'RATE_LIMITED', 'TERMS_REVIEW', 'ERROR'];
  if (!validStatuses.includes(camera.status)) return false;

  if (camera.latitude !== undefined && camera.latitude !== null) {
    const lat = Number(camera.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) return false;
  }

  if (camera.longitude !== undefined && camera.longitude !== null) {
    const lng = Number(camera.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) return false;
  }

  if (!camera.attribution || typeof camera.attribution.agency !== 'string') return false;
  if (!camera.permissions || typeof camera.permissions.mayDisplay !== 'boolean') return false;

  return true;
}

export function sanitizeCameraData(raw: Partial<NormalizedCamera>): Partial<NormalizedCamera> {
  const sanitized = { ...raw };
  if (sanitized.name) {
    sanitized.name = sanitized.name.trim();
  }
  if (sanitized.roadway) {
    sanitized.roadway = sanitized.roadway.trim();
  }
  if (sanitized.municipality) {
    sanitized.municipality = sanitized.municipality.trim();
  }
  return sanitized;
}
