import type { CameraConnector } from '../../core/CameraConnector.js';
import type { 
  NormalizedCamera, 
  CameraConnectorCapabilities, 
  ConnectorHealth, 
  CameraMediaResult, 
  CameraAttribution 
} from '../../core/CameraTypes.js';
import { normalizeNYCDOTCamera } from './NYCDOTNormalizer.js';

export class NYCDOTConnector implements CameraConnector {
  public id = 'NYCDOT';
  public name = 'NYC DOT Traffic Cameras';
  public agency = 'NYC DOT / NYCTMC';
  public jurisdiction = 'New York City / Metro NY-NJ';

  public capabilities: CameraConnectorCapabilities = {
    supportsCatalog: true,
    supportsCoordinates: true,
    supportsRefreshedImage: true,
    supportsLiveVideo: false,
    supportsOfficialEmbed: false,
    supportsExternalLinkOnly: false,
    supportsHealthCheck: true,
    supportsEventMetadata: false
  };

  private apiUrl = 'https://webcams.nyctmc.org/api/cameras';

  public getAttribution(): CameraAttribution {
    return {
      agency: 'NYC Department of Transportation',
      text: 'Traffic camera feed provided by NYC DOT / NYCTMC.',
      url: 'https://webcams.nyctmc.org/map'
    };
  }

  public async testConnection(): Promise<ConnectorHealth> {
    try {
      const cameras = await this.getCameras();
      const availableCount = cameras.filter(c => c.status === 'AVAILABLE').length;
      return {
        status: availableCount > 0 ? 'Connected — Still Images' : 'Temporarily Unavailable',
        cameraCount: cameras.length,
        lastSync: new Date().toISOString(),
        message: `Successfully retrieved ${cameras.length} cameras (${availableCount} online).`
      };
    } catch (err: any) {
      return {
        status: 'Error',
        cameraCount: 0,
        lastError: err.message
      };
    }
  }

  public async getCameras(): Promise<NormalizedCamera[]> {
    const res = await fetch(this.apiUrl);
    if (!res.ok) {
      throw new Error(`NYCDOT camera API returned status ${res.status}`);
    }
    const rawData = await res.json();
    if (!Array.isArray(rawData)) {
      throw new Error('NYCDOT camera API payload is not an array');
    }
    return rawData.map(normalizeNYCDOTCamera);
  }

  public async getCamera(cameraId: string): Promise<NormalizedCamera | null> {
    const cameras = await this.getCameras();
    const cleanId = cameraId.replace('NYCDOT-', '');
    const found = cameras.find(c => c.sourceCameraId === cleanId || c.id === cameraId);
    return found || null;
  }

  public async getMedia(cameraId: string): Promise<CameraMediaResult> {
    const camera = await this.getCamera(cameraId);
    if (!camera || camera.status === 'OFFLINE') {
      return {
        mediaType: 'UNAVAILABLE',
        officialPageUrl: 'https://webcams.nyctmc.org/map',
        lastRefreshedAt: new Date().toISOString(),
        attribution: this.getAttribution()
      };
    }

    return {
      mediaType: 'REFRESHED_IMAGE',
      url: camera.imageUrl,
      officialPageUrl: camera.officialPageUrl,
      lastRefreshedAt: new Date().toISOString(),
      attribution: this.getAttribution()
    };
  }

  public async refreshCamera(cameraId: string): Promise<CameraMediaResult> {
    return this.getMedia(cameraId);
  }
}
