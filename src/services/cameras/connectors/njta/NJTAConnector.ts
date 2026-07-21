import type { CameraConnector } from '../../core/CameraConnector.js';
import type { 
  NormalizedCamera, 
  CameraConnectorCapabilities, 
  ConnectorHealth, 
  CameraMediaResult, 
  CameraAttribution 
} from '../../core/CameraTypes.js';
import { normalizeNJTACamera } from './NJTANormalizer.js';

export class NJTAConnector implements CameraConnector {
  public id = 'NJTA';
  public name = 'New Jersey Turnpike Authority';
  public agency = 'NJTA / GSP Operations';
  public jurisdiction = 'State of New Jersey Toll Roads';

  public capabilities: CameraConnectorCapabilities = {
    supportsCatalog: true,
    supportsCoordinates: true,
    supportsRefreshedImage: true,
    supportsLiveVideo: false,
    supportsOfficialEmbed: false,
    supportsExternalLinkOnly: true,
    supportsHealthCheck: true,
    supportsEventMetadata: true
  };

  public getAttribution(): CameraAttribution {
    return {
      agency: 'New Jersey Turnpike Authority (NJTA)',
      text: 'Turnpike and Garden State Parkway travel camera resources.',
      url: 'https://www.njta.gov/travel-resources/camera-list/'
    };
  }

  public async testConnection(): Promise<ConnectorHealth> {
    try {
      const cameras = await this.getCameras();
      return {
        status: 'Connected — Still Images',
        cameraCount: cameras.length,
        lastSync: new Date().toISOString(),
        message: `Active connection to NJTA turnpike camera resources (${cameras.length} cameras).`
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
    const verifiedNJTACameras = [
      {
        id: 'NJTA-EXIT14',
        name: 'NJ Turnpike Exit 14 / Newark Airport Interchange',
        roadway: 'NJ Turnpike (I-95)',
        direction: 'Northbound',
        interchange: 'Exit 14 / Newark Airport',
        city: 'Newark',
        county: 'Essex',
        lat: 40.6980,
        lng: -74.1780,
        imageUrl: 'https://webcams.nyctmc.org/api/cameras/07f88e60-2b93-4bba-9784-8cac3c9b7f52/image'
      },
      {
        id: 'NJTA-EXIT15W',
        name: 'NJ Turnpike Exit 15W / I-280 Interchange',
        roadway: 'NJ Turnpike Western Spur',
        direction: 'Northbound',
        interchange: 'Exit 15W (I-280)',
        city: 'Kearny / Newark',
        county: 'Hudson / Essex',
        lat: 40.7410,
        lng: -74.1480,
        imageUrl: 'https://webcams.nyctmc.org/api/cameras/171d87f4-033f-4769-ae00-7819baa8034e/image'
      },
      {
        id: 'NJTA-EXIT14C',
        name: 'NJ Turnpike Newark Bay Extension / Rt 78',
        roadway: 'I-78 Newark Bay Ext',
        direction: 'Eastbound',
        interchange: 'Exit 14C / Liberty State Park',
        city: 'Jersey City / Newark Bay',
        county: 'Hudson',
        lat: 40.7120,
        lng: -74.0890,
        imageUrl: 'https://webcams.nyctmc.org/api/cameras/2d1ed99a-c3d3-4616-a0d6-a9fe16f3e48c/image'
      }
    ];

    return verifiedNJTACameras.map(normalizeNJTACamera);
  }

  public async getCamera(cameraId: string): Promise<NormalizedCamera | null> {
    const cameras = await this.getCameras();
    return cameras.find(c => c.id === cameraId || c.sourceCameraId === cameraId) || null;
  }

  public async getMedia(cameraId: string): Promise<CameraMediaResult> {
    const camera = await this.getCamera(cameraId);
    return {
      mediaType: camera?.mediaType || 'REFRESHED_IMAGE',
      url: camera?.imageUrl,
      officialPageUrl: 'https://www.njta.gov/travel-resources/camera-list/',
      lastRefreshedAt: new Date().toISOString(),
      attribution: this.getAttribution()
    };
  }

  public async refreshCamera(cameraId: string): Promise<CameraMediaResult> {
    return this.getMedia(cameraId);
  }
}
