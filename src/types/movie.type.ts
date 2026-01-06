export interface movieType {
    id?: string,
    title: string,
    director: string,
    country: string,
    description: string,
    release_date?: string,
    duration?: number,
    rating?: number,
    image?: string,
    thumbnail?: string,
    trailer?: string,
    movie_type_id: string,
    is_active?: boolean,
    created_at?: string
}