export interface TicketType {
  id?: string;
  ticket_price_id: string;
  order_id: string;
  showtime_seat_id: string;
  created_at?: string;
}

export interface CreateTicketType {
  ticket_price_id: string;
  order_id: string;
  showtime_seat_id: string;
  created_at?: string;
}

export interface UpdateTicketType {
  ticket_price_id?: string;
  order_id?: string;
  showtime_seat_id?: string;
  created_at?: string;
}