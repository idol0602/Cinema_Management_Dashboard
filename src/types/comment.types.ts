export interface Comment {
  id: string;
  movie_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  is_active?: boolean;
  updated_at?: string;
}

export interface CreateCommentDTO {
  movie_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  is_active?: boolean;
}

export interface UpdateCommentDTO {
  movie_id?: string;
  user_id?: string;
  content?: string;
  created_at?: string;
  is_active?: boolean;
}

export interface CommentResponse {
  data: Comment[];
  error?: string;
}

export interface CommentDetailResponse {
  data: Comment;
  error?: string;
}
