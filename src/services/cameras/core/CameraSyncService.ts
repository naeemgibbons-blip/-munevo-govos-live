import { CameraConnectorRegistry } from './CameraConnectorRegistry.ts';
import { NYCDOTConnector } from '../connectors/nycdot/NYCDOTConnector.ts';
import { NJ511Connector } from '../connectors/nj511/NJ511Connector.ts';
import { NJTAConnector } from '../connectors/njta/NJTAConnector.ts';
import { ExternalViewConnector } from '../connectors/external/ExternalViewConnector.ts';
import { validateNormalizedCamera } from './CameraValidation.ts';
import type { NormalizedCamera, ConnectorHealth } from './CameraTypes.ts';

export interface SyncStatistics {
  totalImported: number;
  totalAvailable: number;
  totalOffline: number;
  sourcesSynced: number;
  syncTimestamp: string;
  errors: Array<{ sourceId: string; error: string }>;
}

export class CameraSyncService {
  private static instance: CameraSyncService;
  private registry: CameraConnectorRegistry;
  private cachedCameras: NormalizedCamera[] = [];
  private lastSyncStats?: SyncStatistics;

  private constructor() {
    this.registry = CameraConnectorRegistry.getInstance();
    // Register default official public connectors cleanly
    this.registry.register(new NYCDOTConnector(), true);
    this.registry.register(new NJ511Connector(), true);
    this.registry.register(new NJTAConnector(), true);
    this.registry.register(new ExternalViewConnector(), true);
  }

  public static getInstance(): CameraSyncService {
    if (!CameraSyncService.instance) {
      CameraSyncService.instance = new CameraSyncService();
    }
    return CameraSyncService.instance;
  }

  public async syncAllConnectors(): Promise<{ total: number; cameras: NormalizedCamera[]; stats: SyncStatistics }> {
    const connectors = this.registry.getEnabled();
    let allNormalized: NormalizedCamera[] = [];
    const errors: Array<{ sourceId: string; error: string }> = [];

    for (const connector of connectors) {
      try {
        const health: ConnectorHealth = await connector.testConnection();
        if (health.status === 'Disabled' || health.status === 'Error') {
          console.warn(`[CameraSyncService] Skipping connector ${connector.id} due to health status: ${health.status}`);
          continue;
        }

        const rawCameras = await connector.getCameras();
        const validCameras = rawCameras.filter(cam => {
          const isValid = validateNormalizedCamera(cam);
          if (!isValid) {
            console.warn(`[CameraSyncService] Camera record invalid from ${connector.id}:`, (cam as any).id);
          }
          return isValid;
        });

        allNormalized = allNormalized.concat(validCameras);
      } catch (err: any) {
        console.error(`[CameraSyncService] Sync failed for connector ${connector.id}: ${err.message}`);
        errors.push({ sourceId: connector.id, error: err.message });
      }
    }

    // Preserve previously known cameras if temporary sync error occurs (mark missing as OFFLINE)
    const activeIds = new Set(allNormalized.map(c => c.id));
    for (const cached of this.cachedCameras) {
      if (!activeIds.has(cached.id)) {
        allNormalized.push({
          ...cached,
          status: 'OFFLINE',
          mediaType: 'UNAVAILABLE'
        });
      }
    }

    this.cachedCameras = allNormalized;
    const stats: SyncStatistics = {
      totalImported: allNormalized.length,
      totalAvailable: allNormalized.filter(c => c.status === 'AVAILABLE').length,
      totalOffline: allNormalized.filter(c => c.status === 'OFFLINE').length,
      sourcesSynced: connectors.length - errors.length,
      syncTimestamp: new Date().toISOString(),
      errors
    };

    this.lastSyncStats = stats;
    return { total: allNormalized.length, cameras: allNormalized, stats };
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
        mediaType: c.capabilities.supportsLiveVideo ? 'LIVE_VIDEO' : c.capabilities.supportsRefreshedImage ? 'REFRESHED_IMAGE' : 'EXTERNAL_VIEW',
        attribution: c.getAttribution(),
        capabilities: c.capabilities
      };
    });
  }

  public getLastSyncStats(): SyncStatistics | undefined {
    return this.lastSyncStats;
  }
}
