import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hashtag = searchParams.get("hashtag");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (hashtag) {
    query = query.contains("hashtags", [hashtag]);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data || [] });
}
