export interface ComboItem {
  id: string;
  combo_id: string;
  menu_item_id: string;
  quantity?: number;
  unit_price: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateComboItemDTO {
  combo_id: string;
  menu_item_id: string;
  quantity?: number;
  unit_price: number;
  is_active?: boolean;
}

export interface UpdateComboItemDTO {
  combo_id?: string;
  menu_item_id?: string;
  quantity?: number;
  unit_price?: number;
  is_active?: boolean;
}

export interface ComboItemResponse {
  data: ComboItem[];
  error?: string;
}

export interface ComboItemDetailResponse {
  data: ComboItem;
  error?: string;
}
