import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const HASHTAG_DIR: Record<string, "M" | "N" | "T" | "R"> = {
  саморазвитие: "M", образование: "M", библиотека: "M", разборы: "M", softskills: "M",
  встречи: "N", обсуждения: "N", анонсы: "N", faq: "N",
  здоровье: "T", биохакинг: "T", эффективность: "T",
  финансы: "R", hardskills: "R", digital: "R", промокоды: "R",
};

function firstDir(hashtags: string[]): "M" | "N" | "T" | "R" | null {
  for (const h of hashtags) {
    const key = h.replace(/^#/, "").toLowerCase();
    if (HASHTAG_DIR[key]) return HASHTAG_DIR[key];
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });

  const db = getServiceClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split("T")[0];

  const [{ data: completed }, { count: checkinCount }, { data: allPosts }] = await Promise.all([
    db.from("completed_materials").select("post_id").eq("user_id", userId),
    db.from("checkins")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("checkin_date", monthStartStr),
    db.from("posts").select("id, hashtags"),
  ]);

  const completedSet = new Set((completed ?? []).map((r: any) => String(r.post_id)));

  const dirTotal: Record<string, number> = { M: 0, N: 0, T: 0, R: 0 };
  const dirCompleted: Record<string, number> = { M: 0, N: 0, T: 0, R: 0 };

  for (const post of allPosts ?? []) {
    const dir = firstDir(post.hashtags ?? []);
    if (!dir) continue;
    dirTotal[dir]++;
    if (completedSet.has(String(post.id))) dirCompleted[dir]++;
  }

  return NextResponse.json({
    completedCount: completedSet.size,
    completedIds: [...completedSet],
    checkinCount: checkinCount ?? 0,
    dirTotal,
    dirCompleted,
  });
}
