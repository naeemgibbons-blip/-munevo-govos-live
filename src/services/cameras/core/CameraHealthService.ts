import { CameraConnectorRegistry } from './CameraConnectorRegistry.js';
import type { ConnectorHealth } from './CameraTypes.js';

export class CameraHealthService {
  private static instance: CameraHealthService;
  private healthHistory: Map<string, ConnectorHealth[]> = new Map();

  private constructor() {}

  public static getInstance(): CameraHealthService {
    if (!CameraHealthService.instance) {
      CameraHealthService.instance = new CameraHealthService();
    }
    return CameraHealthService.instance;
  }

  public async checkAllHealth(): Promise<Record<string, ConnectorHealth>> {
    const registry = CameraConnectorRegistry.getInstance();
    const healthMap = await registry.getHealthAll();

    for (const [id, health] of Object.entries(healthMap)) {
      const history = this.healthHistory.get(id) || [];
      history.push(health);
      if (history.length > 50) history.shift();
      this.healthHistory.set(id, history);
    }

    return healthMap;
  }

  public getConnectorHealthHistory(connectorId: string): ConnectorHealth[] {
    return this.healthHistory.get(connectorId) || [];
  }
}
