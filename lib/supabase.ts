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
  caption: string | null;
  body: string | null;
  photo_url: string | null;
  hashtags: string[];
  views: number;
  published_at: string;
  created_at: string;
}

export interface Sprint {
  id: string;
  title: string;
  description: string | null;
  direction: string | null;
  daily_task: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Checkin {
  id: string;
  user_id: number;
  sprint_id: string | null;
  checkin_date: string;
  energy: number | null;
  practice_done: string;
  note: string | null;
  created_at: string;
}
