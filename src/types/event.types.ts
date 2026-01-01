export interface Event {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  image?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventDTO {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  image?: string;
  is_active?: boolean;
}

export interface UpdateEventDTO {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  image?: string;
  is_active?: boolean;
}

export interface EventResponse {
  data: Event[];
  error?: string;
}

export interface EventDetailResponse {
  data: Event;
  error?: string;
}
