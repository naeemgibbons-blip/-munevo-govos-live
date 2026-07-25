export interface RawNJ511CameraItem {
  id?: string | number;
  cameraId?: string | number;
  name?: string;
  title?: string;
  description?: string;
  roadway?: string;
  direction?: string;
  intersection?: string;
  city?: string;
  county?: string;
  lat?: number | string;
  lng?: number | string;
  imageUrl?: string;
  streamUrl?: string;
  url?: string;
  status?: string;
  isOnline?: boolean;
}

export function parseNJ511Item(data: any): RawNJ511CameraItem {
  return {
    id: data.id || data.cameraId || data.ID,
    name: data.name || data.title || data.Name || 'NJ511 Travel Camera',
    description: data.description || data.Description,
    roadway: data.roadway || data.Roadway,
    direction: data.direction || data.Direction,
    intersection: data.intersection || data.Intersection,
    city: data.city || data.City || data.municipality,
    county: data.county || data.County,
    lat: data.lat || data.latitude || data.Lat,
    lng: data.lng || data.longitude || data.Lng,
    imageUrl: data.imageUrl || data.ImageUrl || data.image,
    streamUrl: data.streamUrl || data.StreamUrl || data.stream,
    url: data.url || data.Url || 'https://511nj.org/camera',
    status: data.status || 'ACTIVE',
    isOnline: data.isOnline !== false
  };
}
