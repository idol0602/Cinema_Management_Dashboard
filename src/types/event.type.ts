import type { DiscountType } from "./discount.type";

export interface EventType {
  id?: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  image?: string;
  is_active?: boolean;
  created_at?: string;
  discount?: DiscountType;  
}

export interface CreateEventType {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  image?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface UpdateEventType {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  image?: string;
  is_active?: boolean;
  created_at?: string;
}