export interface ComboEventType {
  id?: string;
  combo_id: string;
  event_id: string;
  created_at?: string;
}

export interface CreateComboEventType {
  combo_id: string;
  event_id: string;
  created_at?: string;
}

export interface UpdateComboEventType {
  combo_id?: string;
  event_id?: string;
  created_at?: string;
}