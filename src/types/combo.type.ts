export interface ComboType {
  id?: string;
  name: string;
  description?: string;
  total_price: number;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateComboType {
  name: string;
  description?: string;
  total_price: number;
  is_active?: boolean;
  created_at?: string;
}

export interface UpdateComboType {
  name?: string;
  description?: string;
  total_price?: number;
  is_active?: boolean;
  created_at?: string;
}