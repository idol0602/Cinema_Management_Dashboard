export interface SeatType {
    id?: string,
    room_id: string,
    seat_number: string
    type: "VIP" | "STANDARD",
    is_active: boolean,
    created_at?: string;
}

export interface SeatTypeCreate {
    room_id: string,
    seat_number: string
    type: "VIP" | "STANDARD",
    is_active: boolean,
    created_at?: string;
}

export interface SeatTypeUpdate {
    room_id?: string,
    seat_number?: string
    type?: "VIP" | "STANDARD",
    is_active?: boolean,
    created_at?: string;
}