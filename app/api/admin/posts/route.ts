import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const OWNER_ID = 172575833;

export async function POST(req: NextRequest) {
  const { userId, title, body, hashtags, photoUrl } = await req.json();

  if (userId !== OWNER_ID) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!title || !body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const tags = (hashtags as string)
    .split(/[\s,]+/)
    .map((t: string) => t.trim().toLowerCase().replace(/^#/, ""))
    .filter(Boolean)
    .map((t: string) => `#${t}`);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      message_id: Date.now(),
      caption: title,
      body,
      photo_url: photoUrl || null,
      hashtags: tags,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, post: data });
}

export async function DELETE(req: NextRequest) {
  const { userId, postId } = await req.json();
  if (userId !== OWNER_ID) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const supabase = getServiceClient();
  await supabase.from("posts").delete().eq("id", postId);
  return NextResponse.json({ ok: true });
}
