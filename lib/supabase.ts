import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey);
}

export interface Post {
  id: number;
  message_id: number;
  text: string | null;
  caption: string | null;
  photo_url: string | null;
  hashtags: string[];
  views: number;
  published_at: string;
  created_at: string;
}
