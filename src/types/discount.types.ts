export interface Discount {
  id: string;
  event_id?: string;
  name?: string;
  description?: string;
  discount_percent?: number;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDiscountDTO {
  event_id?: string;
  name?: string;
  description?: string;
  discount_percent?: number;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
}

export interface UpdateDiscountDTO {
  event_id?: string;
  name?: string;
  description?: string;
  discount_percent?: number;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
}

export interface DiscountResponse {
  data: Discount[];
  error?: string;
}

export interface DiscountDetailResponse {
  data: Discount;
  error?: string;
}
