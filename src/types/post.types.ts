export interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  user_id: string;
  created_at?: string;
  is_active?: boolean;
  updated_at?: string;
}

export interface CreatePostDTO {
  title: string;
  content: string;
  image?: string;
  user_id: string;
  created_at?: string;
  is_active?: boolean;
}

export interface UpdatePostDTO {
  title?: string;
  content?: string;
  image?: string;
  user_id?: string;
  created_at?: string;
  is_active?: boolean;
}

export interface PostResponse {
  data: Post[];
  error?: string;
}

export interface PostDetailResponse {
  data: Post;
  error?: string;
}
