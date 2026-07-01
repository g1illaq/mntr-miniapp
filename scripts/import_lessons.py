#!/usr/bin/env python3
"""
Одноразовый импорт старых уроков из @mntrcomm в Supabase.
Запуск: python3 scripts/import_lessons.py
"""

import asyncio
import re
import httpx
from pyrogram import Client

# ── Заполни эти два поля ────────────────────────────────────────────
API_ID   = 0       # число из my.telegram.org
API_HASH = ""      # строка из my.telegram.org
# ────────────────────────────────────────────────────────────────────

BOT_TOKEN        = "8427055547:AAEJIaNRHDxvTcwMtQRtOiB2vKk5CRiOOFU"
CHANNEL_ID       = -1003555330551
DISCUSSION_ID    = -1003797823590
OWNER_ID         = 172575833

SUPABASE_URL = "https://dgnwbknxypkwsgxhdiii.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbndia254eXBrd3NneGhkaWlpIiwicm9sZSI6"
    "InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjg1MTQwNywiZXhwIjoyMDk4NDI3NDA3fQ."
    "Wd-DBhGmi5SsW11XPcHd7TcFxKR7sYQ866pWV6r03Nw"
)

def extract_hashtags(text: str) -> list:
    return [m.lower() for m in re.findall(r"#[\wа-яА-ЯёЁ]+", text or "")]

async def main():
    if not API_ID or not API_HASH:
        print("❌ Заполни API_ID и API_HASH в начале скрипта!")
        return

    print("🔌 Подключаюсь к Telegram...")
    async with Client("mntr_import_session", api_id=API_ID, api_hash=API_HASH, bot_token=BOT_TOKEN) as app:
        print("✓ Подключено\n")

        # Шаг 1: карта пересланных постов канала в группе обсуждений
        # ключ = message_id в discussion group, значение = message_id в канале
        print("📋 Читаю группу обсуждений...")
        forwarded_map: dict[int, int] = {}
        async for msg in app.get_chat_history(DISCUSSION_ID):
            if (
                msg.forward_from_chat
                and msg.forward_from_chat.id == CHANNEL_ID
                and msg.forward_from_message_id
            ):
                forwarded_map[msg.id] = msg.forward_from_message_id
        print(f"   Найдено {len(forwarded_map)} пересланных постов канала\n")

        # Шаг 2: читаю посты канала
        print("📢 Читаю посты канала...")
        channel_posts: dict[int, dict] = {}
        async for msg in app.get_chat_history(CHANNEL_ID):
            text = msg.text or msg.caption or ""
            if not text.strip():
                continue
            photo_url = None
            if msg.photo:
                try:
                    path = await app.download_media(msg.photo, in_memory=True)
                    # Не скачиваем фото — просто пропускаем URL
                except Exception:
                    pass
            channel_posts[msg.id] = {
                "message_id": msg.id,
                "caption": text,
                "body": None,
                "photo_url": None,
                "hashtags": extract_hashtags(text),
                "published_at": msg.date.isoformat(),
            }
        print(f"   Найдено {len(channel_posts)} постов\n")

        # Шаг 3: читаю твои комментарии (уроки)
        print("📚 Читаю уроки из комментариев...")
        lesson_count = 0
        async for msg in app.get_chat_history(DISCUSSION_ID):
            if not (msg.from_user and msg.from_user.id == OWNER_ID):
                continue
            text = msg.text or msg.caption or ""
            if not text.strip():
                continue

            # Найти channel_post_id через forwarded_map
            channel_post_id = None
            if msg.reply_to_message_id:
                channel_post_id = forwarded_map.get(msg.reply_to_message_id)

            if not channel_post_id or channel_post_id not in channel_posts:
                continue

            post = channel_posts[channel_post_id]
            post["body"] = (post["body"] + "\n\n" + text) if post["body"] else text

            extra = extract_hashtags(text)
            post["hashtags"] = list(set(post["hashtags"] + extra))
            lesson_count += 1
            print(f"   ✓ Урок к посту #{channel_post_id}: {text[:60].strip()}...")

        print(f"\n   Итого уроков: {lesson_count}\n")

        # Шаг 4: вставляю в Supabase только посты с уроками
        posts_to_import = [p for p in channel_posts.values() if p["body"]]
        print(f"💾 Импортирую {len(posts_to_import)} материалов в Supabase...")

        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        }

        async with httpx.AsyncClient() as http:
            for post in posts_to_import:
                r = await http.post(
                    f"{SUPABASE_URL}/rest/v1/posts",
                    headers=headers,
                    json=post,
                )
                title = (post["caption"] or "")[:50].strip()
                if r.status_code in (200, 201):
                    print(f"   ✓ {title}")
                else:
                    print(f"   ✗ Ошибка ({r.status_code}): {r.text[:80]}")

        print("\n✅ Готово! Открой мини-апп и проверь материалы.")

asyncio.run(main())
