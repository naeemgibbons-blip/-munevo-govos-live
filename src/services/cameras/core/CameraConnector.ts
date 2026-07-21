import type { 
  NormalizedCamera, 
  CameraConnectorCapabilities, 
  ConnectorHealth, 
  CameraMediaResult, 
  CameraAttribution 
} from './CameraTypes.js';

export interface CameraConnector {
  id: string;
  name: string;
  agency: string;
  jurisdiction: string;
  capabilities: CameraConnectorCapabilities;

  testConnection(): Promise<ConnectorHealth>;
  getCameras(): Promise<NormalizedCamera[]>;
  getCamera(cameraId: string): Promise<NormalizedCamera | null>;
  getMedia(cameraId: string): Promise<CameraMediaResult>;
  refreshCamera(cameraId: string): Promise<CameraMediaResult>;
  getAttribution(): CameraAttribution;
}
