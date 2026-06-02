import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { topic, story, insight, storyLiked, insightLiked } = await req.json();

    const { error } = await supabase.from("liked_insights").insert({
      topic,
      story,
      insight,
      story_liked: storyLiked,
      insight_liked: insightLiked,
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "שגיאה בשמירה" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}
