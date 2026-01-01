export type RoomFormat = '2D' | '3D' | 'IMAX';

export interface Room {
  id: string;
  name: string;
  format: RoomFormat;
  location?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoomDTO {
  name: string;
  format: RoomFormat;
  location?: string;
  is_active?: boolean;
}

export interface UpdateRoomDTO {
  name?: string;
  format?: RoomFormat;
  location?: string;
  is_active?: boolean;
}

export interface RoomResponse {
  data: Room[];
  error?: string;
}

export interface RoomDetailResponse {
  data: Room;
  error?: string;
}
