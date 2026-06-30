import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const BOT_TOKEN = process.env.BOT_TOKEN!;

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\wа-яА-ЯёЁ]+/g) || [];
  return matches.map((t) => t.toLowerCase());
}

async function downloadPhoto(fileId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (!data.ok) return null;
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle channel_post updates
    const post = body.channel_post || body.message;
    if (!post) return NextResponse.json({ ok: true });

    const text = post.text || null;
    const caption = post.caption || null;
    const content = text || caption || "";

    const hashtags = extractHashtags(content);

    // Get photo URL if present
    let photoUrl: string | null = null;
    if (post.photo && post.photo.length > 0) {
      const largest = post.photo[post.photo.length - 1];
      photoUrl = await downloadPhoto(largest.file_id);
    }

    const supabase = getServiceClient();

    const { error } = await supabase.from("posts").upsert(
      {
        message_id: post.message_id,
        text,
        caption,
        photo_url: photoUrl,
        hashtags,
        published_at: new Date(post.date * 1000).toISOString(),
      },
      { onConflict: "message_id" }
    );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
