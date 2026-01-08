export interface ComboItemType {
  id?: string;
  combo_id: string;
  menu_item_id: string;
  quantity?: number;
  unit_price: number;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateComboItemType {
  combo_id: string;
  menu_item_id: string;
  quantity?: number;
  unit_price: number;
  is_active?: boolean;
  created_at?: string;
}

export interface UpdateComboItemType {
  combo_id?: string;
  menu_item_id?: string;
  quantity?: number;
  unit_price?: number;
  is_active?: boolean;
  created_at?: string;
}