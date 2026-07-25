import { CameraConnectorRegistry } from '../core/CameraConnectorRegistry.js';
import { CameraSyncService } from '../core/CameraSyncService.js';
import { CameraMediaService } from '../core/CameraMediaService.js';
import { CameraProxySecurity } from '../security/CameraProxySecurity.js';
import { RiskRoutingService } from '../routing/RiskRoutingService.js';
import { validateNormalizedCamera } from '../core/CameraValidation.js';
import { NYCDOTConnector } from '../connectors/nycdot/NYCDOTConnector.js';
import { NJ511Connector } from '../connectors/nj511/NJ511Connector.js';
import { NJTAConnector } from '../connectors/njta/NJTAConnector.js';
import { ExternalViewConnector } from '../connectors/external/ExternalViewConnector.js';
import { normalizeNYCDOTCamera } from '../connectors/nycdot/NYCDOTNormalizer.js';
import { normalizeNJ511Camera } from '../connectors/nj511/NJ511Normalizer.js';
import { normalizeNJTACamera } from '../connectors/njta/NJTANormalizer.js';
import { MunevoSentinelAiProvider } from '../ai/CameraAnalysisInterface.js';

async function runAllCameraFrameworkTests() {
  console.log('--- STARTING SENTINEL CAMERA CONNECTOR FRAMEWORK SUITE ---');

  // 1. Registry tests
  const registry = CameraConnectorRegistry.getInstance();
  registry.register(new NYCDOTConnector());
  registry.register(new NJ511Connector());
  registry.register(new NJTAConnector());
  registry.register(new ExternalViewConnector());

  const allConnectors = registry.getAll();
  console.log(`[PASS] Registered ${allConnectors.length} connectors in registry.`);

  // 2. Normalization tests
  const rawNycdot = { id: '301002c0-fe39-4fad-998a-fdc66e531b1d', name: 'Lincoln Tunnel Approach', area: 'Manhattan', latitude: 40.7530, longitude: -73.9960, isOnline: true };
  const normNycdot = normalizeNYCDOTCamera(rawNycdot);
  if (!validateNormalizedCamera(normNycdot)) throw new Error('NYCDOT Normalization failed');
  console.log('[PASS] NYCDOT Camera Normalization');

  const rawNj511 = { id: '101', name: 'Broad St Corridor', lat: 40.7357, lng: -74.1724, imageUrl: 'https://511nj.org/image.jpg' };
  const normNj511 = normalizeNJ511Camera(rawNj511);
  if (!validateNormalizedCamera(normNj511)) throw new Error('NJ511 Normalization failed');
  console.log('[PASS] NJ511 Camera Normalization');

  const rawNjta = { id: 'EXIT14', name: 'NJ Turnpike Exit 14', lat: 40.6980, lng: -74.1780, imageUrl: 'https://njta.gov/cam.jpg' };
  const normNjta = normalizeNJTACamera(rawNjta);
  if (!validateNormalizedCamera(normNjta)) throw new Error('NJTA Camera Normalization');
  console.log('[PASS] NJTA Camera Normalization');

  // 3. Camera Sync Service tests
  const syncService = CameraSyncService.getInstance();
  const syncResult = await syncService.syncAllConnectors();
  console.log(`[PASS] Camera Sync Service imported ${syncResult.total} normalized cameras across ${syncResult.stats.sourcesSynced} active sources.`);

  // 4. Media Service & Security tests
  const mediaService = CameraMediaService.getInstance();
  const sampleCam = syncResult.cameras[0];
  const mediaResult = await mediaService.getMediaForCamera(sampleCam);
  console.log(`[PASS] Media Access Service resolved media type: ${mediaResult.mediaType}`);

  const secCheckValid = CameraProxySecurity.validateProxyRequestUrl('https://webcams.nyctmc.org/api/cameras/301002c0/image');
  if (!secCheckValid.allowed) throw new Error('Proxy security rejected valid domain');

  const secCheckSsrf = CameraProxySecurity.validateProxyRequestUrl('http://localhost:3000/admin');
  if (secCheckSsrf.allowed) throw new Error('Proxy security failed SSRF check for localhost');
  console.log('[PASS] SSRF & Domain Allowlist Proxy Security Checks');

  // 5. Risk Routing Service tests
  const lowRiskRule = RiskRoutingService.evaluateRouting('pothole', sampleCam);
  if (lowRiskRule.action !== 'AUTO_DRAFT_SERVICE_REQUEST') throw new Error('Low risk routing failed');
  
  const highRiskRule = RiskRoutingService.evaluateRouting('fire', sampleCam);
  if (highRiskRule.action !== 'HUMAN_VERIFICATION_REQUIRED' || highRiskRule.autoDispatch) throw new Error('High risk safety routing failed');
  console.log('[PASS] Low vs Safety-Critical Risk Routing Rules');

  // 6. AI Vision Analysis Interface test
  const aiProvider = new MunevoSentinelAiProvider();
  if (normNycdot.imageUrl) {
    const aiResult = await aiProvider.analyzeStillImage({ camera: normNycdot, imageUrl: normNycdot.imageUrl });
    console.log(`[PASS] AI Analysis Provider generated vision output model: ${aiResult.model}`);
  }

  console.log('--- ALL SENTINEL CAMERA FRAMEWORK TESTS COMPLETED SUCCESSFULLY ---');
}

runAllCameraFrameworkTests().catch(err => {
  console.error('[FAIL] Camera Framework Tests Error:', err);
  process.exit(1);
});
