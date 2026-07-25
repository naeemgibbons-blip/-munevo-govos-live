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

  public register(connector: CameraConnector, enabled = true): boolean {
    const key = connector.id.toUpperCase();
    if (this.connectors.has(key)) {
      console.warn(`[CameraConnectorRegistry] Connector ${key} is already registered. Skipping duplicate registration.`);
      return false;
    }
    this.connectors.set(key, connector);
    this.enabledStates.set(key, enabled);
    return true;
  }

  public get(id: string): CameraConnector | undefined {
    return this.connectors.get(id.toUpperCase());
  }

  public getAll(): CameraConnector[] {
    return Array.from(this.connectors.values());
  }

  public getEnabled(): CameraConnector[] {
    return this.getAll().filter(c => this.isEnabled(c.id));
  }

  public setEnabled(id: string, enabled: boolean): void {
    const key = id.toUpperCase();
    if (this.connectors.has(key)) {
      this.enabledStates.set(key, enabled);
    }
  }

  public isEnabled(id: string): boolean {
    const key = id.toUpperCase();
    return this.enabledStates.get(key) ?? false;
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
