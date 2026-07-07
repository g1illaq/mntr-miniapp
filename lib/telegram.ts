import crypto from "crypto";

export function verifyTelegramWebAppData(initData: string): Record<string, string> | null {
  const BOT_TOKEN = process.env.BOT_TOKEN!;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (expectedHash !== hash) return null;

  const result: Record<string, string> = {};
  entries.forEach(([k, v]) => (result[k] = v));
  return result;
}

export async function checkChannelMembership(userId: number): Promise<boolean> {
  const BOT_TOKEN = process.env.BOT_TOKEN!;
  // Приватный канал — только числовой ID работает с Bot API
  const CHANNEL_ID = "-1003555330551";

  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_ID}&user_id=${userId}`
  );
  const data = await res.json();

  if (!data.ok) return false;
  const status = data.result?.status;
  return ["member", "administrator", "creator"].includes(status);
}
