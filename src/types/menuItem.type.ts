export type ItemType = "FOOD" | "DRINK" | "GIFT";

export interface MenuItemType {
  id?: string;
  name: string;
  description?: string;
  price: number;
  item_type: ItemType;
  image?: string;
  num_instock?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateMenuItemType {
  name: string;
  description?: string;
  price: number;
  item_type: ItemType;
  image?: string;
  num_instock?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface UpdateMenuItemType {
  name?: string;
  description?: string;
  price?: number;
  item_type?: ItemType;
  image?: string;
  num_instock?: number;
  is_active?: boolean;
  created_at?: string;
}