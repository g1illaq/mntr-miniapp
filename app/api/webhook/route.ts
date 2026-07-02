import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const DISCUSSION_GROUP_ID = -1003797823590;
const OWNER_ID = 172575833;

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
    const supabase = getServiceClient();

    // ── Канальный пост (заголовок + хэштеги + фото) ──────────────────────
    const channelPost = body.channel_post;
    if (channelPost) {
      const text = channelPost.text || null;
      const caption = channelPost.caption || null;
      const content = text || caption || "";
      const hashtags = extractHashtags(content);

      let photoUrl: string | null = null;
      if (channelPost.photo?.length > 0) {
        const largest = channelPost.photo[channelPost.photo.length - 1];
        photoUrl = await downloadPhoto(largest.file_id);
      }

      await supabase.from("posts").upsert(
        {
          message_id: channelPost.message_id,
          caption: text || caption,
          body: null,
          photo_url: photoUrl,
          hashtags,
          published_at: new Date(channelPost.date * 1000).toISOString(),
        },
        { onConflict: "message_id" }
      );
    }

    const msg = body.message;
    if (!msg) return NextResponse.json({ ok: true });

    // ── Личное сообщение боту: пересланный урок для импорта ──────────────
    // Открой @mntrcomm_bot и перешли туда старые уроки из комментариев
    if (msg.chat?.type === "private" && msg.from?.id === OWNER_ID) {
      const text = msg.text || msg.caption || "";
      if (!text.trim()) return NextResponse.json({ ok: true });

      const hashtags = extractHashtags(text);
      const firstLine = text.split("\n")[0].replace(/[*_#]/g, "").trim();

      await supabase.from("posts").upsert(
        {
          message_id: msg.forward_from_message_id || msg.message_id + 1_000_000,
          caption: firstLine || "Материал из канала",
          body: text,
          photo_url: null,
          hashtags,
          published_at: new Date((msg.forward_date || msg.date) * 1000).toISOString(),
        },
        { onConflict: "message_id" }
      );

      // Подтверждение боту
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: OWNER_ID,
            text: `✅ Урок сохранён: «${firstLine.slice(0, 50)}»`,
          }),
        }
      );

      return NextResponse.json({ ok: true });
    }

    // ── Сообщения в группе обсуждений ────────────────────────────────────
    if (msg.chat?.id === DISCUSSION_GROUP_ID) {
      const commentText = msg.text || msg.caption || "";
      if (!commentText.trim()) return NextResponse.json({ ok: true });

      const replyTo = msg.reply_to_message;
      const channelPostId =
        replyTo?.forward_from_message_id ||
        replyTo?.reply_to_message?.forward_from_message_id ||
        null;

      // Нужна привязка к посту канала
      if (!channelPostId) return NextResponse.json({ ok: true });

      const isOwner = msg.from?.id === OWNER_ID;
      const isForwarded = !!msg.forward_from_chat || !!msg.forward_from; // пересланный урок
      const isLesson = /урок\s*\d+|→\s*урок|блок\s*\d+/i.test(commentText);

      // Захватываем: твои сообщения ИЛИ пересланные уроки из другого чата
      if (!isOwner && !isForwarded && !isLesson) return NextResponse.json({ ok: true });

      const { data: existing } = await supabase
        .from("posts")
        .select("body, hashtags")
        .eq("message_id", channelPostId)
        .single();

      const newBody = existing?.body
        ? existing.body + "\n\n" + commentText
        : commentText;

      const newTags = extractHashtags(commentText);
      const mergedTags = Array.from(
        new Set([...(existing?.hashtags || []), ...newTags])
      );

      await supabase
        .from("posts")
        .update({ body: newBody, hashtags: mergedTags })
        .eq("message_id", channelPostId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
