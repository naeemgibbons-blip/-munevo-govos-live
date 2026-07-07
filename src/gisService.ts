export interface GeocodedAddress {
  address: string;
  normalizedAddress: string;
  lat: number;
  lng: number;
  block: string;
  lot: string;
  ward: string;
  district: string;
  neighborhood: string;
  zipCode: string;
  parcelCoords: [number, number]; // Mock SVG coordinate mapping
}

export type GisProvider = 'ArcGIS' | 'Mapbox' | 'OpenStreetMap';

export interface ProviderResponsibility {
  provider: GisProvider;
  responsibilities: string[];
  status: 'active' | 'standby' | 'inactive';
}

export const PROVIDER_METADATA: ProviderResponsibility[] = [
  {
    provider: 'ArcGIS',
    status: 'active',
    responsibilities: [
      'Parcel Boundaries & Geometry',
      'Zoning Districts & Land Use Overlays',
      'Municipal Utility Networks (Water/Sewer)',
      'Government Address Validation & Geocoding',
      'Spatial Buffer Analysis & Tax Assessment GIS'
    ]
  },
  {
    provider: 'Mapbox',
    status: 'active',
    responsibilities: [
      'Fast client-side vector tiles rendering',
      '3D Building models & height rendering',
      'Marker clustering & thermal heatmaps',
      'Interactive routing & transit navigation lines',
      'Mobile client responsive viewports'
    ]
  },
  {
    provider: 'OpenStreetMap',
    status: 'standby',
    responsibilities: [
      'Streets & Roadway geometry fallback base maps',
      'Public Parks, walkways, and community trails mapping',
      'Crowdsourced landmark markers lookup'
    ]
  }
];

export const ADDRESS_DATABASE: Record<string, Omit<GeocodedAddress, 'address'>> = {
  '920 broad st': {
    normalizedAddress: '920 Broad St, Newark, NJ 07102',
    lat: 40.7303,
    lng: -74.1724,
    block: '102',
    lot: '1',
    ward: 'Central Ward',
    district: 'Council District 2',
    neighborhood: 'Broad St Corridor',
    zipCode: '07102',
    parcelCoords: [250, 350]
  },
  '15 washington st': {
    normalizedAddress: '15 Washington St, Newark, NJ 07102',
    lat: 40.7441,
    lng: -74.1685,
    block: '201',
    lot: '14',
    ward: 'North Ward',
    district: 'Council District 1',
    neighborhood: 'Washington Park',
    zipCode: '07102',
    parcelCoords: [230, 150]
  },
  '42 ferry st': {
    normalizedAddress: '42 Ferry St, Newark, NJ 07105',
    lat: 40.7322,
    lng: -74.1631,
    block: '402',
    lot: '10',
    ward: 'East Ward',
    district: 'Council District 5',
    neighborhood: 'Ironbound District',
    zipCode: '07105',
    parcelCoords: [420, 410]
  },
  '105 market st': {
    normalizedAddress: '105 Market St, Newark, NJ 07102',
    lat: 40.7351,
    lng: -74.1712,
    block: '304',
    lot: '22',
    ward: 'Central Ward',
    district: 'Council District 3',
    neighborhood: 'Market St Center',
    zipCode: '07102',
    parcelCoords: [310, 310]
  },
  '125 market st': {
    normalizedAddress: '125 Market St, Newark, NJ 07102',
    lat: 40.7352,
    lng: -74.1708,
    block: '304',
    lot: '12',
    ward: 'Central Ward',
    district: 'Council District 3',
    neighborhood: 'Market St Center',
    zipCode: '07102',
    parcelCoords: [330, 310]
  },
  '129 market st': {
    normalizedAddress: '129 Market St, Newark, NJ 07102',
    lat: 40.7353,
    lng: -74.1706,
    block: '304',
    lot: '13',
    ward: 'Central Ward',
    district: 'Council District 3',
    neighborhood: 'Market St Center',
    zipCode: '07102',
    parcelCoords: [350, 310]
  },
  '255 leon avenue': {
    normalizedAddress: '255 Leon Avenue, Newark, NJ 07103',
    lat: 40.7410,
    lng: -74.1952,
    block: '602',
    lot: '8',
    ward: 'West Ward',
    district: 'Council District 4',
    neighborhood: 'West Side Park',
    zipCode: '07103',
    parcelCoords: [110, 230]
  }
};

export const geocodeAddress = (rawAddress: string): GeocodedAddress => {
  let cleaned = rawAddress.toLowerCase().trim();

  // Address Intelligence Normalization: If Newark is not explicitly mentioned, append NJ details
  if (!cleaned.includes('newark') && !cleaned.includes('nj') && !cleaned.includes('jersey')) {
    // Check if it exists in address database, if not assume a default newark parsing
    // Try to match partial strings like 'leon', 'broad', 'ferry', 'market', 'washington'
    const keys = Object.keys(ADDRESS_DATABASE);
    const matchedKey = keys.find(k => k.includes(cleaned) || cleaned.includes(k));
    if (matchedKey) {
      cleaned = matchedKey;
    } else {
      // Default fallback normalization
      return {
        address: rawAddress,
        normalizedAddress: `${rawAddress}, Newark, NJ 07102`,
        lat: 40.7356,
        lng: -74.1724,
        block: '999',
        lot: '99',
        ward: 'Central Ward',
        district: 'Council District 2',
        neighborhood: 'Municipal Administration',
        zipCode: '07102',
        parcelCoords: [250, 250]
      };
    }
  }

  // Exact matching or fallback mapping
  const matched = ADDRESS_DATABASE[cleaned];
  if (matched) {
    return {
      address: rawAddress,
      ...matched
    };
  }

  // If no match found, check fuzzy matches
  const keys = Object.keys(ADDRESS_DATABASE);
  const matchedKey = keys.find(k => cleaned.includes(k) || k.includes(cleaned));
  if (matchedKey) {
    return {
      address: rawAddress,
      ...ADDRESS_DATABASE[matchedKey]
    };
  }

  // General geocoding mapping response
  return {
    address: rawAddress,
    normalizedAddress: `${rawAddress}, Newark, NJ 07102`,
    lat: 40.7356,
    lng: -74.1724,
    block: '999',
    lot: '99',
    ward: 'Central Ward',
    district: 'Council District 2',
    neighborhood: 'Municipal Administration',
    zipCode: '07102',
    parcelCoords: [250, 250]
  };
};
