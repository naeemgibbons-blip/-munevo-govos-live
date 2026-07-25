import { describe, it, expect, beforeEach } from 'vitest';
import { CameraConnectorRegistry } from '../core/CameraConnectorRegistry.js';
import { NYCDOTConnector } from '../connectors/nycdot/NYCDOTConnector.js';
import { NJ511Connector } from '../connectors/nj511/NJ511Connector.js';
import { NJTAConnector } from '../connectors/njta/NJTAConnector.js';
import { ExternalViewConnector } from '../connectors/external/ExternalViewConnector.js';

describe('CameraConnector Framework', () => {
  let registry: CameraConnectorRegistry;

  beforeEach(() => {
    registry = CameraConnectorRegistry.getInstance();
    registry.register(new NYCDOTConnector());
    registry.register(new NJ511Connector());
    registry.register(new NJTAConnector());
    registry.register(new ExternalViewConnector());
  });

  it('registers connectors and prevents missing IDs', () => {
    expect(registry.get('NYCDOT')).toBeDefined();
    expect(registry.get('NJ511')).toBeDefined();
    expect(registry.get('NJTA')).toBeDefined();
    expect(registry.get('EXTERNAL')).toBeDefined();
    expect(registry.getAll().length).toBeGreaterThanOrEqual(4);
  });

  it('retrieves normalized camera feeds from connectors', async () => {
    const nj511 = registry.get('NJ511')!;
    const cameras = await nj511.getCameras();
    expect(cameras.length).toBeGreaterThan(0);
    expect(cameras[0].sourceSystem).toBe('NJ511');
    expect(cameras[0].mediaType).toBeDefined();
    expect(cameras[0].attribution.agency).toBeDefined();
  });

  it('verifies connector health checks execute cleanly', async () => {
    const healthMap = await registry.getHealthAll();
    expect(healthMap['NJ511']).toBeDefined();
    expect(healthMap['NJTA']).toBeDefined();
    expect(healthMap['EXTERNAL']).toBeDefined();
  });
});
