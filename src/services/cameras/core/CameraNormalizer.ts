import type { NormalizedCamera, CameraMediaType, CameraStatus, CameraPermissions, CameraAttribution } from './CameraTypes.js';
import { validateNormalizedCamera } from './CameraValidation.js';

export class CameraNormalizer {
  public static createNormalizedCamera(input: {
    id: string;
    sourceSystem: string;
    sourceAgency: string;
    sourceCameraId: string;
    name: string;
    description?: string;
    roadway?: string;
    direction?: string;
    nearestIntersection?: string;
    municipality?: string;
    county?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    mediaType: CameraMediaType;
    imageUrl?: string;
    streamUrl?: string;
    embedUrl?: string;
    officialPageUrl: string;
    refreshIntervalSeconds?: number;
    sourceTimestamp?: string;
    status?: CameraStatus;
    attribution: CameraAttribution;
    permissions?: Partial<CameraPermissions>;
  }): NormalizedCamera {
    const defaultPermissions: CameraPermissions = {
      mayDisplay: true,
      mayProxy: true,
      mayCache: false,
      mayRetainSnapshot: true,
      mayAnalyzeWithAI: true,
      ...input.permissions
    };

    const camera: NormalizedCamera = {
      id: input.id,
      sourceSystem: input.sourceSystem,
      sourceAgency: input.sourceAgency,
      sourceCameraId: input.sourceCameraId,
      name: input.name,
      description: input.description,
      roadway: input.roadway,
      direction: input.direction,
      nearestIntersection: input.nearestIntersection,
      municipality: input.municipality,
      county: input.county,
      state: input.state || 'NJ',
      latitude: input.latitude,
      longitude: input.longitude,
      mediaType: input.mediaType,
      imageUrl: input.imageUrl,
      streamUrl: input.streamUrl,
      embedUrl: input.embedUrl,
      officialPageUrl: input.officialPageUrl,
      refreshIntervalSeconds: input.refreshIntervalSeconds || 15,
      sourceTimestamp: input.sourceTimestamp || new Date().toISOString(),
      lastSuccessfulFetch: new Date().toISOString(),
      status: input.status || 'AVAILABLE',
      attribution: input.attribution,
      permissions: defaultPermissions
    };

    if (!validateNormalizedCamera(camera)) {
      console.warn(`[CameraNormalizer] Camera ${camera.id} failed validation checks, defaulting status to ERROR.`);
      camera.status = 'ERROR';
    }

    return camera;
  }
}
