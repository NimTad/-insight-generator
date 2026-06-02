import { NextRequest, NextResponse } from "next/server";

const RANDOM_TOPICS = [
  "AI", "זוגיות", "ילדים", "עבודה ובוסים", "כלכלה",
  "פוליטיקה", "אקווריומים", "בעלי חיים",
  "מדע", "מעבדות וכימיה", "התנהגות אנושית", "פסיכולוגיה", "הזדקנות/בריאות",
];

const NARRATORS = [
  {
    name: "נמרוד",
    profile: "רווק, מכונה 'פיץ' על ידי החברים. יוצא עם בנות בגילאי 35-40 שחושבות שהן מושלמות — אבל לדעתו הן שרוטות ללא מודעות עצמית. מספר על דייטים מתסכלים, על כך שכולן אותו הדבר, וגם על טיולים בחו\"ל ותאילנד.",
    topics: ["זוגיות", "טיולים", "דייטים", "בנות"],
  },
  {
    name: "רן",
    profile: "נשוי באושר, 3 ילדים, כלכלן. החיים שלו מלאים ושלמים — אבל הוא תמיד נרדם מוקדם מדי, והילדים מעייפים אותו מוות.",
    topics: ["ילדים", "עבודה", "כלכלה", "משפחה", "עייפות"],
  },
  {
    name: "גיא",
    profile: "נשוי, 3 ילדים, מתעצבן על הכל — בעיקר בירוקרטיה, אשתו, הילדים. מומחה בכלכלה ונדל\"ן. צורך יוטיוב ב-2 הלילה ועוקב אחרי חשבונות טוויטר שאף אחד לא מכיר.",
    topics: ["בירוקרטיה", "עבודה", "בוסים", "כלכלה", "נדל\"ן", "פוליטיקה"],
  },
  {
    name: "דניאל",
    profile: "נשוי בסבל, ללא ילדים, חי בארה\"ב עם אשה משוגעת. רואה חשבון אפור ומשעמם על פניו — אבל חכם יותר מגוגל. יודע הכל בכל תחום: היסטוריה, כלכלה, פוליטיקה, כסף.",
    topics: ["כלכלה", "פוליטיקה", "גיאופוליטיקה", "כספים", "היסטוריה", "ארה\"ב"],
  },
  {
    name: "גיל אייזיק",
    profile: "ד\"ר לכימיה, נשוי לא באושר, 3 ילדים. אוהב ספורט אבל בקושי קם מהכיסא. ציני בעיקרו, אוהב כימיה, ביולוגיה, ניסויים וטיולים.",
    topics: ["מדע", "ביוטכנולוגיה", "ספורט", "כימיה", "ביולוגיה", "התנהגות אנושית", "פסיכולוגיה"],
  },
];

function pickNarrator(topic: string): typeof NARRATORS[0] {
  if (topic === "זוגיות") {
    // 80% סיכוי לנשוי (תלונות על אישה), 20% לפיץ (דייטינג)
    const marriedNarrators = NARRATORS.filter(n => n.name !== "נמרוד");
    const nimrod = NARRATORS.find(n => n.name === "נמרוד")!;
    if (Math.random() < 0.2) return nimrod;
    return marriedNarrators[Math.floor(Math.random() * marriedNarrators.length)];
  }
  const matches = NARRATORS.filter(n =>
    n.topics.some(t => topic.includes(t) || t.includes(topic))
  );
  const pool = matches.length > 0 ? matches : NARRATORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildPrompt(
  topic: string,
  isGeyakenMode: boolean,
  humorLevel: number,
  cynicismLevel: number,
  absurdLevel: number,
  includeAnalogy: boolean
): string {
  const narrator = pickNarrator(topic);

  const cynicismDesc =
    cynicismLevel <= 2 ? "עם ציניות עדינה" : cynicismLevel >= 4 ? "ציני וחד" : "עם הומור יבש";

  const analogyInstruction = includeAnalogy
    ? 'הוסף שדה "analogy" עם אנלוגיה קצרה שממחישה את התובנה (משפט אחד עד שניים).'
    : 'השאר את שדה "analogy" כ-null.';

  const geyakenSection = isGeyakenMode
    ? `שדה "counter": תובנה קיצונית ומפתיעה על הסיפור — לא הזווית הנגדית הרגילה, אלא המסקנה שאף אחד לא אומר בקול. משהו שנשמע כמעט מוגזם אבל מרגיש נכון. אסור שיהיה "הצד השני של המטבע" — חייב להיות מחוץ לנורמה לחלוטין. משפט אחד.`
    : 'שדה "counter": null';

  const topicContext = topic === "זוגיות" && narrator.name === "נמרוד"
    ? `Write about dating women aged 35-40 who are dramatic and self-unaware. Add "(פיץ)" at the very end of the story text.`
    : topic === "זוגיות"
    ? `Write a funny/cynical story about a specific everyday complaint about the narrator's wife.`
    : `Write about: ${topic}`;

  return `Write ONLY in natural colloquial Israeli Hebrew — exactly like the examples below. Short sentences. No literary language. No translation from English.

Be ${narrator.name}: ${narrator.profile}

${topicContext}

STYLE EXAMPLES — copy this exact tone, sentence length, and Hebrew:

Example 1 (זוגיות):
Story: "אשתי אמרה 'רק קופצים לסופר לחמש דקות'. שעה וחצי אחר כך אני עומד ליד מדף נרות ריחניים ושומע דיון אסטרטגי על ההבדלים בין וניל צרפתי לוניל בורבון. אני לא בטוח שהיא קנתה משהו שהיא באה לקנות. אבל איכשהו יצאנו עם 400 שקל פחות ועם סלסלה דקורטיבית שאף אחד לא יודע למה היא קיימת."
Insight (TWISTED - not the obvious): "הסופר הוא המקום היחיד שבו אתה נכנס עם תוכנית ויוצא עם חרטה."

Example 2 (עבודה):
Story: "הבוס שלי קבע ישיבה דחופה כדי לדון למה הפרויקט מתעכב. אחרי שעה וחצי הגענו למסקנה שאין זמן לעבוד על הפרויקט כי כולנו בישיבה. יצאתי עם שלושה אקשן איטמס שאף אחד לא יעקוב אחריהם."
Insight (TWISTED): "הפגישה על בעיית הזמן היא הסיבה שאין זמן."

Example 3 (ילדים):
Story: "כל היום הילד לא רוצה ממני כלום. ברגע שאני מתיישב לשירותים, פתאום אני הופך לאדם הכי חשוב בעולם. תוך שתי דקות יש דפיקות בדלת, שאלות פילוסופיות ובקשה לעזרה במשהו שיכול לחכות עד גיל 18."
Insight (TWISTED): "הילד לא צריך אותך — הוא צריך שלא תהיה זמין."

Example 4 (בריאות/גיל):
Story: "בגיל 20 נפצעתי מכדורגל. בגיל 40 נתפס לי הגב כי הסתכלתי ימינה בהתלהבות. אני כבר לא חושש מפעילויות אקסטרים. אני חושש מהתעטשות לא מבוקרת."
Insight (TWISTED): "הגוף לא מזדקן — הוא פשוט מפסיק להתאמץ לעשות רושם."

THE INSIGHT RULE: Always find the UNEXPECTED angle. NOT the obvious moral. Ask yourself: what's the cynical/surprising/counter-intuitive truth this story reveals? That's the insight.

Now write a NEW original story (NOT a copy). ${cynicismDesc}.
- 5-8 short sentences, specific Israeli details, casual Hebrew
- NO lesson inside the story — just tell what happened
- FORBIDDEN words in insight: "בסופו של דבר","כולנו","מסע","צמיחה","חשוב לזכור","בעצם"

${analogyInstruction}
${geyakenSection}

Return ONLY raw JSON, no markdown:
{"story":"...","insight":"...","analogy":null,"counter":null}`;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, isGeyakenMode, surprise } = await req.json();

    const finalTopic = surprise
      ? RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)]
      : topic;

    if (!finalTopic || finalTopic.trim() === "") {
      return NextResponse.json({ error: "נושא חסר" }, { status: 400 });
    }

    const humorLevel = Math.floor(Math.random() * 5) + 1;
    const cynicismLevel = Math.floor(Math.random() * 5) + 1;
    const absurdLevel = Math.floor(Math.random() * 5) + 1;
    const includeAnalogy = Math.random() < 0.4;

    const prompt = buildPrompt(finalTopic, isGeyakenMode, humorLevel, cynicismLevel, absurdLevel, includeAnalogy);

    const apiKey = process.env.OPENAI_API_KEY || "";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.95,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return NextResponse.json({ error: "שגיאה בייצור התובנה" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text);
      return NextResponse.json({ error: "שגיאה בפענוח התשובה" }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("JSON parse error. Raw text:", text);
      return NextResponse.json({ error: "שגיאה בפענוח התשובה" }, { status: 500 });
    }

    return NextResponse.json({
      topic: finalTopic,
      story: parsed.story,
      insight: parsed.insight,
      analogy: parsed.analogy || null,
      counter: parsed.counter || null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "שגיאה בייצור התובנה" }, { status: 500 });
  }
}
