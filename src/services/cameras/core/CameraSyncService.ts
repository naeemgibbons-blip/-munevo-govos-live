import { CameraConnectorRegistry } from './CameraConnectorRegistry.js';
import { NYCDOTConnector } from '../connectors/nycdot/NYCDOTConnector.js';
import { NJ511Connector } from '../connectors/nj511/NJ511Connector.js';
import { NJTAConnector } from '../connectors/njta/NJTAConnector.js';
import type { NormalizedCamera } from './CameraTypes.js';

export class CameraSyncService {
  private static instance: CameraSyncService;
  private registry: CameraConnectorRegistry;
  private cachedCameras: NormalizedCamera[] = [];
  private lastSyncTime?: string;

  private constructor() {
    this.registry = CameraConnectorRegistry.getInstance();
    // Register official connectors
    this.registry.register(new NYCDOTConnector(), true);
    this.registry.register(new NJ511Connector(), true);
    this.registry.register(new NJTAConnector(), true);
  }

  public static getInstance(): CameraSyncService {
    if (!CameraSyncService.instance) {
      CameraSyncService.instance = new CameraSyncService();
    }
    return CameraSyncService.instance;
  }

  public async syncAllConnectors(): Promise<{ total: number; cameras: NormalizedCamera[] }> {
    const connectors = this.registry.getEnabled();
    let allNormalized: NormalizedCamera[] = [];

    for (const connector of connectors) {
      try {
        const cameras = await connector.getCameras();
        allNormalized = allNormalized.concat(cameras);
      } catch (err: any) {
        console.error(`[CameraSyncService] Sync failed for connector ${connector.id}: ${err.message}`);
      }
    }

    this.cachedCameras = allNormalized;
    this.lastSyncTime = new Date().toISOString();
    return { total: allNormalized.length, cameras: allNormalized };
  }

  public async getActiveCameras(): Promise<NormalizedCamera[]> {
    if (this.cachedCameras.length === 0) {
      await this.syncAllConnectors();
    }
    return this.cachedCameras;
  }

  public getConnectorStatusList() {
    const connectors = this.registry.getAll();
    return connectors.map(c => {
      const isEnabled = this.registry.isEnabled(c.id);
      return {
        id: c.id,
        name: c.name,
        agency: c.agency,
        jurisdiction: c.jurisdiction,
        status: isEnabled ? 'CONNECTED' : 'DISABLED',
        mediaType: c.capabilities.supportsLiveVideo ? 'LIVE_VIDEO' : 'REFRESHED_IMAGE',
        attribution: c.getAttribution(),
        capabilities: c.capabilities
      };
    });
  }
}
