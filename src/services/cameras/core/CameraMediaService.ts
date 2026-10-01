import type { NormalizedCamera, CameraMediaResult, CameraMediaType } from './CameraTypes.ts';
import { CameraConnectorRegistry } from './CameraConnectorRegistry.ts';

export class CameraMediaService {
  private static instance: CameraMediaService;

  private constructor() {}

  public static getInstance(): CameraMediaService {
    if (!CameraMediaService.instance) {
      CameraMediaService.instance = new CameraMediaService();
    }
    return CameraMediaService.instance;
  }

  public resolveDisplayMode(camera: NormalizedCamera): CameraMediaType {
    if (camera.status === 'OFFLINE' || camera.status === 'ERROR') {
      return 'UNAVAILABLE';
    }

    if (camera.permissions && !camera.permissions.mayDisplay) {
      return 'EXTERNAL_VIEW';
    }

    if (camera.mediaType === 'LIVE_VIDEO' && camera.streamUrl) {
      return 'LIVE_VIDEO';
    }

    if (camera.mediaType === 'REFRESHED_IMAGE' && camera.imageUrl) {
      return 'REFRESHED_IMAGE';
    }

    if (camera.mediaType === 'OFFICIAL_EMBED' && camera.embedUrl) {
      return 'OFFICIAL_EMBED';
    }

    if (camera.officialPageUrl) {
      return 'EXTERNAL_VIEW';
    }

    return 'UNAVAILABLE';
  }

  public async getMediaForCamera(camera: NormalizedCamera): Promise<CameraMediaResult> {
    const registry = CameraConnectorRegistry.getInstance();
    const connector = registry.get(camera.sourceSystem);

    if (connector) {
      try {
        return await connector.getMedia(camera.id);
      } catch (err: any) {
        console.error(`[CameraMediaService] Failed to fetch media from connector ${camera.sourceSystem}: ${err.message}`);
      }
    }

    const displayMode = this.resolveDisplayMode(camera);

    return {
      mediaType: displayMode,
      url: displayMode === 'LIVE_VIDEO' ? camera.streamUrl : displayMode === 'REFRESHED_IMAGE' ? camera.imageUrl : undefined,
      embedHtml: displayMode === 'OFFICIAL_EMBED' ? `<iframe src="${camera.embedUrl}" width="100%" height="100%" frameborder="0"></iframe>` : undefined,
      officialPageUrl: camera.officialPageUrl,
      lastRefreshedAt: new Date().toISOString(),
      attribution: camera.attribution,
      permissions: camera.permissions
    };
  }
}
