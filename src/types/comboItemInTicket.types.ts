export interface ComboItemInTicket {
  id: string;
  ticket_id: string;
  combo_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateComboItemInTicketDTO {
  ticket_id: string;
  combo_id: string;
}

export interface UpdateComboItemInTicketDTO {
  ticket_id?: string;
  combo_id?: string;
}

export interface ComboItemInTicketResponse {
  data: ComboItemInTicket[];
  error?: string;
}

export interface ComboItemInTicketDetailResponse {
  data: ComboItemInTicket;
  error?: string;
}
