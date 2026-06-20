import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramWebAppData, checkChannelMembership } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const { initData } = await req.json();

  if (!initData) {
    return NextResponse.json({ error: "No initData" }, { status: 400 });
  }

  const data = verifyTelegramWebAppData(initData);
  if (!data) {
    return NextResponse.json({ error: "Invalid initData" }, { status: 403 });
  }

  const user = JSON.parse(data.user || "{}");
  const isMember = await checkChannelMembership(user.id);

  return NextResponse.json({ user, isMember });
}
