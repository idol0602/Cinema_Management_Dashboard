export interface Ticket {
  id: string;
  user_id: string;
  showtime_seat_id: string;
  discount_id?: string;
  ticket_price_id?: string;
  ticket_vat?: number;
  service_vat?: number;
  total_price: number;
  purchased_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTicketDTO {
  user_id: string;
  showtime_seat_id: string;
  discount_id?: string;
  ticket_price_id?: string;
  ticket_vat?: number;
  service_vat?: number;
  total_price: number;
  purchased_at?: string;
}

export interface UpdateTicketDTO {
  user_id?: string;
  showtime_seat_id?: string;
  discount_id?: string;
  ticket_price_id?: string;
  ticket_vat?: number;
  service_vat?: number;
  total_price?: number;
  purchased_at?: string;
}

export interface TicketResponse {
  data: Ticket[];
  error?: string;
}

export interface TicketDetailResponse {
  data: Ticket;
  error?: string;
}
