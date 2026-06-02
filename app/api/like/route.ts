import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
