import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function calcStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  while (set.has(cur.toISOString().split("T")[0])) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ checkin: null, streak: 0 });

  const today = new Date().toISOString().split("T")[0];
  const db = getServiceClient();

  const [{ data: todayData }, { data: allDates }] = await Promise.all([
    db.from("checkins").select("*").eq("user_id", userId).eq("checkin_date", today).maybeSingle(),
    db.from("checkins").select("checkin_date").eq("user_id", userId).order("checkin_date", { ascending: false }),
  ]);

  const streak = calcStreak((allDates ?? []).map((r: any) => r.checkin_date));
  return NextResponse.json({ checkin: todayData ?? null, streak });
}

export async function POST(req: Request) {
  const { userId, sprintId, energy, practice_done, note } = await req.json();
  if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });

  const today = new Date().toISOString().split("T")[0];
  const db = getServiceClient();
  const { data, error } = await db
    .from("checkins")
    .upsert(
      {
        user_id: Number(userId),
        sprint_id: sprintId ?? null,
        checkin_date: today,
        energy: energy ?? null,
        practice_done: practice_done ?? "no",
        note: note ?? null,
      },
      { onConflict: "user_id,checkin_date" }
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ checkin: data });
}
