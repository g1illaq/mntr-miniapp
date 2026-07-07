import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const OWNER_ID = Number(process.env.OWNER_TELEGRAM_ID ?? "7276417797");

export async function GET() {
  const db = getServiceClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await db
    .from("sprints")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sprint: data ?? null });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  if (Number(body.userId) !== OWNER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const db = getServiceClient();
  await db.from("sprints").update({ is_active: false }).eq("is_active", true);
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (Number(body.userId) !== OWNER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { title, description, direction, daily_task, start_date, end_date } = body;
  if (!title || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const db = getServiceClient();
  await db.from("sprints").update({ is_active: false }).eq("is_active", true);
  const { data, error } = await db
    .from("sprints")
    .insert({
      title,
      description: description || null,
      direction: direction || null,
      daily_task: daily_task || null,
      start_date,
      end_date,
      is_active: true,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sprint: data });
}
