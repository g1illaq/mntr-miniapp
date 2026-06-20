import { NextRequest, NextResponse } from "next/server";
import { checkChannelMembership } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const { initData } = await req.json();

  if (!initData) {
    return NextResponse.json({ error: "No initData" }, { status: 400 });
  }

  // Parse user from initData without strict verification for now
  let user: { id: number; first_name: string; username?: string } | null = null;
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch {
    return NextResponse.json({ error: "Failed to parse initData" }, { status: 400 });
  }

  if (!user?.id) {
    return NextResponse.json({ error: "No user in initData" }, { status: 400 });
  }

  const isMember = await checkChannelMembership(user.id);

  return NextResponse.json({ user, isMember });
}
