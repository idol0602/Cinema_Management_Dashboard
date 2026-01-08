export interface CommentType {
  id?: string;
  movie_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  is_active?: boolean;
}

export interface CreateCommentType {
  movie_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  is_active?: boolean;
}

export interface UpdateCommentType {
  movie_id?: string;
  user_id?: string;
  content?: string;
  created_at?: string;
  is_active?: boolean;
}