export interface PostType {
  id?: string;
  title: string;
  content: string;
  image?: string;
  user_id: string;
  created_at?: string;
  is_active?: boolean;
}

export interface CreatePostType {
  title: string;
  content: string;
  image?: string;
  user_id: string;
  created_at?: string;
  is_active?: boolean;
}

export interface UpdatePostType {
  title?: string;
  content?: string;
  image?: string;
  user_id?: string;
  created_at?: string;
  is_active?: boolean;
}