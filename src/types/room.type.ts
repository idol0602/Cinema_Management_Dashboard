export type RoomFormat = "2D" | "3D" | "IMAX";

export interface RoomType {
  id?: string;
  name: string;
  format: RoomFormat;
  location?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateRoomType {
  name: string;
  format: RoomFormat;
  location?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface UpdateRoomType {
  name?: string;
  format?: RoomFormat;
  location?: string;
  is_active?: boolean;
  created_at?: string;
}
