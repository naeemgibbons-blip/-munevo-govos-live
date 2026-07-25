export interface RawNYCDOTCameraItem {
  id: string;
  name: string;
  area?: string;
  latitude: number | string;
  longitude: number | string;
  isOnline: string | boolean;
  imageUrl?: string;
}

export function parseNYCDOTItem(data: any): RawNYCDOTCameraItem {
  return {
    id: String(data.id || data.ID),
    name: String(data.name || data.Name || 'NYC Traffic Camera'),
    area: data.area || data.Area || 'Manhattan',
    latitude: data.latitude || data.Latitude || 40.7128,
    longitude: data.longitude || data.Longitude || -74.0060,
    isOnline: data.isOnline !== undefined ? data.isOnline : true,
    imageUrl: data.imageUrl || data.ImageUrl
  };
}
