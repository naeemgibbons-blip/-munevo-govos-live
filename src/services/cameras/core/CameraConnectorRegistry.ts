import type { CameraConnector } from './CameraConnector.js';
import type { ConnectorHealth } from './CameraTypes.js';

export class CameraConnectorRegistry {
  private static instance: CameraConnectorRegistry;
  private connectors: Map<string, CameraConnector> = new Map();
  private enabledStates: Map<string, boolean> = new Map();

  private constructor() {}

  public static getInstance(): CameraConnectorRegistry {
    if (!CameraConnectorRegistry.instance) {
      CameraConnectorRegistry.instance = new CameraConnectorRegistry();
    }
    return CameraConnectorRegistry.instance;
  }

  public register(connector: CameraConnector, enabled = true): void {
    this.connectors.set(connector.id, connector);
    this.enabledStates.set(connector.id, enabled);
  }

  public get(id: string): CameraConnector | undefined {
    return this.connectors.get(id);
  }

  public getAll(): CameraConnector[] {
    return Array.from(this.connectors.values());
  }

  public getEnabled(): CameraConnector[] {
    return this.getAll().filter(c => this.enabledStates.get(c.id) !== false);
  }

  public setEnabled(id: string, enabled: boolean): void {
    if (this.connectors.has(id)) {
      this.enabledStates.set(id, enabled);
    }
  }

  public isEnabled(id: string): boolean {
    return this.enabledStates.get(id) ?? false;
  }

  public async getHealthAll(): Promise<Record<string, ConnectorHealth>> {
    const results: Record<string, ConnectorHealth> = {};
    for (const connector of this.getAll()) {
      if (!this.isEnabled(connector.id)) {
        results[connector.id] = {
          status: 'Disabled',
          cameraCount: 0,
          message: 'Connector disabled by system administrator.'
        };
        continue;
      }
      try {
        results[connector.id] = await connector.testConnection();
      } catch (err: any) {
        results[connector.id] = {
          status: 'Error',
          cameraCount: 0,
          lastError: err.message
        };
      }
    }
    return results;
  }
}
