export interface Combo {
  id: string;
  name: string;
  description?: string;
  total_price: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateComboDTO {
  name: string;
  description?: string;
  total_price: number;
  is_active?: boolean;
}

export interface UpdateComboDTO {
  name?: string;
  description?: string;
  total_price?: number;
  is_active?: boolean;
}

export interface ComboResponse {
  data: Combo[];
  error?: string;
}

export interface ComboDetailResponse {
  data: Combo;
  error?: string;
}
