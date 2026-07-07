import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const DISCUSSION_GROUP_ID = -1003797823590;
const OWNER_ID = 172575833;

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\wа-яА-ЯёЁ]+/g) || [];
  return matches.map((t) => t.toLowerCase());
}

async function uploadPhoto(fileId: string, messageId: number): Promise<string | null> {
  try {
    // Получить временный URL от Telegram
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (!data.ok) return null;
    const tgUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;

    // Скачать фото
    const imgRes = await fetch(tgUrl);
    if (!imgRes.ok) return null;
    const buffer = await imgRes.arrayBuffer();

    // Загрузить в Supabase Storage
    const supabase = getServiceClient();
    await supabase.storage.createBucket("covers", { public: true }).catch(() => {});
    const fileName = `${messageId}.jpg`;
    await supabase.storage.from("covers").upload(fileName, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });
    const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(fileName);
    return publicUrl;
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
      if (!content.trim()) return NextResponse.json({ ok: true }); // фото без текста — пропускаем
      const hashtags = extractHashtags(content);

      let photoUrl: string | null = null;
      if (channelPost.photo?.length > 0) {
        const largest = channelPost.photo[channelPost.photo.length - 1];
        photoUrl = await uploadPhoto(largest.file_id, channelPost.message_id);
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

    // ── /start и /help — приветствие для новых участников ────────────────
    if (msg.chat?.type === "private") {
      const cmd = (msg.text || "").trim().split(" ")[0].toLowerCase();

      if (cmd === "/id") {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            text: `Твой Telegram ID: ${msg.from?.id}`,
          }),
        });
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/start") {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            parse_mode: "HTML",
            text: `Привет, ${msg.from?.first_name || "друг"} 👋\n\nЭто бот <b>MNTR Community</b> — пространства для системного личного и профессионального развития.\n\n<b>MNTR</b> — это четыре направления развития:\n\n🧠 <b>M · Mind</b> — как ты думаешь, учишься и принимаешь решения\n🧭 <b>N · Navigation</b> — твои ценности, ориентиры и направление движения\n⚡ <b>T · Thrive</b> — энергия, восстановление и устойчивое состояние\n🎯 <b>R · Realization</b> — проекты, действия и реальные результаты\n\nКаждый месяц — одна тема, одна практика, одно движение вперёд.\n\n👇 Чтобы попасть в комьюнити:`,
            reply_markup: {
              inline_keyboard: [
                [{ text: "📲 Открыть мини-приложение", web_app: { url: "https://mntr-miniapp.vercel.app" } }],
                [{ text: "📢 Канал MNTR Community", url: "https://t.me/mntrcomm" }],
              ],
            },
          }),
        });
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/help") {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            parse_mode: "HTML",
            text: `<b>Что умеет этот бот:</b>\n\n/start — узнать о MNTR Community\n/about — подробнее о четырёх направлениях\n\nЧерез мини-приложение ты можешь:\n• Читать материалы по направлениям M/N/T/R\n• Отмечать чек-ин каждый день\n• Следить за своим прогрессом\n• Участвовать в спринтах`,
            reply_markup: {
              inline_keyboard: [
                [{ text: "📲 Открыть MNTR", web_app: { url: "https://mntr-miniapp.vercel.app" } }],
              ],
            },
          }),
        });
        return NextResponse.json({ ok: true });
      }

      if (cmd === "/about") {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            parse_mode: "HTML",
            text: `<b>О MNTR Community</b>\n\nMNTR — это не просто канал с контентом. Это среда, где участник движется по понятному маршруту:\n\n1️⃣ <b>Тема месяца</b> — один фокус на 30 дней\n2️⃣ <b>Материалы</b> — подборка по теме из четырёх направлений\n3️⃣ <b>Практика / спринт</b> — конкретное действие\n4️⃣ <b>Обсуждение</b> — разбор с сообществом\n5️⃣ <b>Личное движение</b> — трекинг и чек-ины\n\nНе просто знания — а система, которая помогает их применять.`,
            reply_markup: {
              inline_keyboard: [
                [{ text: "📲 Открыть мини-приложение", web_app: { url: "https://mntr-miniapp.vercel.app" } }],
              ],
            },
          }),
        });
        return NextResponse.json({ ok: true });
      }
    }

    // ── Личное сообщение боту: перешли пост канала → бот сохраняет с фото ──
    if (msg.chat?.type === "private" && msg.from?.id === OWNER_ID) {
      const text = msg.text || msg.caption || "";
      if (!text.trim() || text.startsWith("/")) return NextResponse.json({ ok: true });

      // forward_from_message_id = реальный message_id поста в канале
      const channelMsgId = msg.forward_from_message_id as number | undefined;
      const msgId = channelMsgId ?? (msg.message_id + 1_000_000);

      const hashtags = extractHashtags(text);
      const firstLine = text.split("\n")[0].replace(/[*_]/g, "").trim();

      // Фото из пересланного поста
      let photoUrl: string | null = null;
      if (msg.photo?.length > 0) {
        const largest = msg.photo[msg.photo.length - 1];
        photoUrl = await uploadPhoto(largest.file_id, msgId);
      }

      await supabase.from("posts").upsert(
        {
          message_id: msgId,
          caption: text,
          body: null,
          photo_url: photoUrl,
          hashtags,
          published_at: new Date((msg.forward_date || msg.date) * 1000).toISOString(),
        },
        { onConflict: "message_id" }
      );

      const photoNote = photoUrl ? " + фото" : "";
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: OWNER_ID,
          text: `✅ Сохранено${photoNote}: «${firstLine.slice(0, 50)}»\n🔗 t.me/c/3555330551/${msgId}`,
        }),
      });

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
