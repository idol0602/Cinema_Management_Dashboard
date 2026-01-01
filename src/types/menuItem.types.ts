export type ItemType = 'FOOD' | 'DRINK' | 'GIFT';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  item_type: ItemType;
  image?: string;
  num_instock?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMenuItemDTO {
  name: string;
  description?: string;
  price: number;
  item_type: ItemType;
  image?: string;
  num_instock?: number;
  is_active?: boolean;
}

export interface UpdateMenuItemDTO {
  name?: string;
  description?: string;
  price?: number;
  item_type?: ItemType;
  image?: string;
  num_instock?: number;
  is_active?: boolean;
}

export interface MenuItemResponse {
  data: MenuItem[];
  error?: string;
}

export interface MenuItemDetailResponse {
  data: MenuItem;
  error?: string;
}
