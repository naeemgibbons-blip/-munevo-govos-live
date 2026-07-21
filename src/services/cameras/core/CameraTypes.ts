export type CameraMediaType = 
  | 'LIVE_VIDEO'
  | 'REFRESHED_IMAGE'
  | 'OFFICIAL_EMBED'
  | 'EXTERNAL_VIEW'
  | 'UNAVAILABLE';

export type CameraStatus = 
  | 'AVAILABLE'
  | 'STALE'
  | 'OFFLINE'
  | 'RATE_LIMITED'
  | 'TERMS_REVIEW'
  | 'ERROR';

export type ConnectorHealthStatus = 
  | 'Connected'
  | 'Connected — Still Images'
  | 'Connected — Live Stream'
  | 'External View Only'
  | 'Authentication Required'
  | 'Rate Limited'
  | 'Temporarily Unavailable'
  | 'Terms Review Required'
  | 'Error'
  | 'Disabled';

export interface CameraAttribution {
  agency: string;
  text: string;
  url: string;
}

export interface CameraPermissions {
  mayDisplay: boolean;
  mayProxy: boolean;
  mayCache: boolean;
  mayRetainSnapshot: boolean;
  mayAnalyzeWithAI: boolean;
}

export interface NormalizedCamera {
  id: string;
  sourceSystem: string;
  sourceAgency: string;
  sourceCameraId: string;

  name: string;
  description?: string;

  roadway?: string;
  direction?: string;
  nearestIntersection?: string;

  municipality?: string;
  county?: string;
  state?: string;

  latitude?: number;
  longitude?: number;

  mediaType: CameraMediaType;

  imageUrl?: string;
  streamUrl?: string;
  embedUrl?: string;
  officialPageUrl: string;

  refreshIntervalSeconds?: number;
  sourceTimestamp?: string;
  lastSuccessfulFetch?: string;

  status: CameraStatus;

  attribution: CameraAttribution;
  permissions: CameraPermissions;
}

export interface CameraConnectorCapabilities {
  supportsCatalog: boolean;
  supportsCoordinates: boolean;
  supportsRefreshedImage: boolean;
  supportsLiveVideo: boolean;
  supportsOfficialEmbed: boolean;
  supportsExternalLinkOnly: boolean;
  supportsHealthCheck: boolean;
  supportsEventMetadata: boolean;
}

export interface ConnectorHealth {
  status: ConnectorHealthStatus;
  cameraCount: number;
  lastSync?: string;
  lastError?: string;
  message?: string;
}

export interface CameraMediaResult {
  mediaType: CameraMediaType;
  url?: string;
  embedHtml?: string;
  officialPageUrl: string;
  lastRefreshedAt: string;
  attribution: CameraAttribution;
}
