export interface MenuItemInTicket {
  id: string;
  ticket_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMenuItemInTicketDTO {
  ticket_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

export interface UpdateMenuItemInTicketDTO {
  ticket_id?: string;
  item_id?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
}

export interface MenuItemInTicketResponse {
  data: MenuItemInTicket[];
  error?: string;
}

export interface MenuItemInTicketDetailResponse {
  data: MenuItemInTicket;
  error?: string;
}
