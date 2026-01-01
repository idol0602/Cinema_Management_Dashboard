export interface ComboEvent {
  id: string;
  combo_id: string;
  event_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateComboEventDTO {
  combo_id: string;
  event_id: string;
}

export interface UpdateComboEventDTO {
  combo_id?: string;
  event_id?: string;
}

export interface ComboEventResponse {
  data: ComboEvent[];
  error?: string;
}

export interface ComboEventDetailResponse {
  data: ComboEvent;
  error?: string;
}
