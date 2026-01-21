export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELED";

export interface OrderType {
  id?: string;
  discount_id?: string; // Reference to discounts table
  user_id: string; // Reference to users table
  service_vat?: number;
  payment_status?: PaymentStatus;
  payment_method?: string;
  total_price: number;
  created_at?: string;
}

export interface CreateOrderType {
  discount_id?: string; // Reference to discounts table
  user_id: string; // Reference to users table
  service_vat?: number;
  payment_status?: PaymentStatus;
  payment_method?: string;
  total_price: number;
  created_at?: string;
}

export interface UpdateOrderType {
  discount_id?: string; // Reference to discounts table
  user_id?: string; // Reference to users table
  service_vat?: number;
  payment_status?: PaymentStatus;
  payment_method?: string;
  total_price?: number;
  created_at?: string;
}
