export interface Slide {
  id: string;
  image: string;
  trailer?: string;
  title?: string;
  content?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSlideDTO {
  image: string;
  trailer?: string;
  title?: string;
  content?: string;
  is_active?: boolean;
}

export interface UpdateSlideDTO {
  image?: string;
  trailer?: string;
  title?: string;
  content?: string;
  is_active?: boolean;
}

export interface SlideResponse {
  data: Slide[];
  error?: string;
}

export interface SlideDetailResponse {
  data: Slide;
  error?: string;
}
