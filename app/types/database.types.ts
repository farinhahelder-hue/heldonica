export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
export type Database = {
  public: {
    Tables: {
      cms_blog_posts: {
        Row: {
          id: number; slug: string; title: string; content: string | null; excerpt: string | null
          published: boolean | null; file_path: string | null; cover_image: string | null
          author: string | null; category: string | null; tags: string[] | null
          reading_time: number | null; word_count: number | null; zones: string[] | null
          created_at: string | null; updated_at: string | null; published_at: string | null
          metadata: Json | null
        }
        Insert: { id?: number; slug: string; title: string; content?: string | null; excerpt?: string | null; published?: boolean | null; file_path?: string | null }
        Update: { id?: number; slug?: string; title?: string; content?: string | null; excerpt?: string | null; published?: boolean | null; file_path?: string | null }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}
