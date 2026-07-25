import type { CameraConnector } from '../../core/CameraConnector.js';
import type { 
  NormalizedCamera, 
  CameraConnectorCapabilities, 
  ConnectorHealth, 
  CameraMediaResult, 
  CameraAttribution 
} from '../../core/CameraTypes.js';

export class ExternalViewConnector implements CameraConnector {
  public id = 'EXTERNAL';
  public name = 'External View-Only Provider Connector';
  public agency = 'External Authorized Systems';
  public jurisdiction = 'Multi-State / Federal / Authorized Partner';

  public capabilities: CameraConnectorCapabilities = {
    supportsCatalog: true,
    supportsCoordinates: true,
    supportsRefreshedImage: false,
    supportsLiveVideo: false,
    supportsOfficialEmbed: false,
    supportsExternalLinkOnly: true,
    supportsHealthCheck: true,
    supportsTimestamps: true,
    supportsRoadwayData: true,
    supportsTrafficDirection: true,
    supportsEventMetadata: true,
    supportsSnapshotRetention: false,
    supportsAiAnalysis: false,
    supportsThirdPartyDisplay: false
  };

  public getAttribution(): CameraAttribution {
    return {
      agency: 'External Authorized Feed Provider',
      text: 'Direct media access restricted by provider policy. Access via official portal link.',
      url: 'https://munevo.gov/cameras/external'
    };
  }

  public async testConnection(): Promise<ConnectorHealth> {
    return {
      status: 'External View Only',
      cameraCount: 1,
      lastSync: new Date().toISOString(),
      message: 'External view connector active. Direct streaming disabled by provider permissions.'
    };
  }

  public async getCameras(): Promise<NormalizedCamera[]> {
    return [
      {
        id: 'EXT-001',
        sourceSystem: 'EXTERNAL',
        sourceAgency: 'Port Authority of NY & NJ',
        sourceCameraId: 'PANYNJ-GW-01',
        name: 'George Washington Bridge Upper Level Plaza',
        description: 'PANYNJ Toll Plaza Camera - External Viewing Portal',
        roadway: 'I-95 / GWB',
        direction: 'Eastbound',
        municipality: 'Fort Lee',
        county: 'Bergen',
        state: 'NJ',
        latitude: 40.8517,
        longitude: -73.9681,
        mediaType: 'EXTERNAL_VIEW',
        officialPageUrl: 'https://www.panynj.gov/bridges-tunnels/en/george-washington-bridge.html',
        refreshIntervalSeconds: 60,
        sourceTimestamp: new Date().toISOString(),
        lastSuccessfulFetch: new Date().toISOString(),
        status: 'AVAILABLE',
        attribution: {
          agency: 'Port Authority of NY & NJ',
          text: 'Official Port Authority travel camera page.',
          url: 'https://www.panynj.gov'
        },
        permissions: {
          mayDisplay: false,
          mayProxy: false,
          mayCache: false,
          mayRetainSnapshot: false,
          mayAnalyzeWithAI: false
        }
      }
    ];
  }

  public async getCamera(cameraId: string): Promise<NormalizedCamera | null> {
    const cameras = await this.getCameras();
    return cameras.find(c => c.id === cameraId || c.sourceCameraId === cameraId) || null;
  }

  public async getMedia(cameraId: string): Promise<CameraMediaResult> {
    const camera = await this.getCamera(cameraId);
    return {
      mediaType: 'EXTERNAL_VIEW',
      officialPageUrl: camera?.officialPageUrl || 'https://www.panynj.gov',
      lastRefreshedAt: new Date().toISOString(),
      attribution: this.getAttribution(),
      permissions: camera?.permissions
    };
  }

  public async refreshCamera(cameraId: string): Promise<CameraMediaResult> {
    return this.getMedia(cameraId);
  }
}
