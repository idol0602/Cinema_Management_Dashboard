export interface ComboItemInTicketType {
  id?: string;
  order_id: string;
  combo_id: string;
  created_at?: string;
}

export interface CreateComboItemInTicketType {
  order_id: string;
  combo_id: string;
  created_at?: string;
}

export interface UpdateComboItemInTicketType {
  order_id?: string;
  combo_id?: string;
  created_at?: string;
}