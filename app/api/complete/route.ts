import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const { userId, postId } = await req.json();
  if (!userId || !postId) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  const db = getServiceClient();
  await db
    .from("completed_materials")
    .upsert({ user_id: Number(userId), post_id: Number(postId) }, { onConflict: "user_id,post_id" });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { userId, postId } = await req.json();
  if (!userId || !postId) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  const db = getServiceClient();
  await db.from("completed_materials").delete().eq("user_id", Number(userId)).eq("post_id", Number(postId));
  return NextResponse.json({ ok: true });
}
