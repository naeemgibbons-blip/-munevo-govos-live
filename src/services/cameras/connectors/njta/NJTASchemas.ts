export interface RawNJTACameraItem {
  id: string | number;
  name?: string;
  roadway?: string;
  direction?: string;
  interchange?: string;
  exitNumber?: string | number;
  city?: string;
  county?: string;
  lat?: number | string;
  lng?: number | string;
  imageUrl?: string;
}

export function parseNJTAItem(data: any): RawNJTACameraItem {
  return {
    id: data.id || data.ID || data.cameraId,
    name: data.name || data.Name || 'NJ Turnpike Camera',
    roadway: data.roadway || data.Roadway || 'NJ Turnpike',
    direction: data.direction || data.Direction || 'Northbound',
    interchange: data.interchange || data.Interchange,
    exitNumber: data.exitNumber || data.ExitNumber || '14',
    city: data.city || data.City || 'Newark',
    county: data.county || data.County || 'Essex',
    lat: data.lat || data.Lat || 40.6980,
    lng: data.lng || data.Lng || -74.1780,
    imageUrl: data.imageUrl || data.ImageUrl
  };
}
