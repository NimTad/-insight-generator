"use client";

import { useState } from "react";

const TOPICS = [
  "AI", "זוגיות", "ילדים", "עבודה ובוסים", "כלכלה",
  "פוליטיקה", "אקווריומים", "בעלי חיים",
  "מדע", "מעבדות וכימיה", "התנהגות אנושית", "פסיכולוגיה", "הזדקנות/בריאות",
];

interface Result {
  topic: string;
  story: string;
  insight: string;
  analogy: string | null;
  counter: string | null;
}

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [isGeyakenMode, setIsGeyakenMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const activeTopic = customTopic.trim() || selectedTopic;

  async function generate(surprise = false) {
    if (!surprise && !activeTopic) return;
    setLoading(true);
    setResult(null);
    setError("");
    setCopied(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: activeTopic, isGeyakenMode, surprise }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("שגיאת רשת. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    if (!result) return;
    let text = `נושא: ${result.topic}\n\n${result.story}\n\n💡 ${result.insight}`;
    if (result.analogy) text += `\n\n🔁 ${result.analogy}`;
    if (result.counter) text += `\n\n↩️ זווית נגדית: ${result.counter}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col gap-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">מחולל תובנות</h1>
          <p className="text-zinc-400 text-sm">תובנות חכמות על החיים — בלי בולשיט</p>
        </div>

        {/* Topic Selection */}
        <div className="flex flex-col gap-3">
          <p className="text-zinc-300 text-sm font-medium">בחר נושא:</p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => { setSelectedTopic(t); setCustomTopic(""); }}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  selectedTopic === t && !customTopic
                    ? "bg-white text-black border-white font-medium"
                    : "border-zinc-700 text-zinc-300 hover:border-zinc-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={customTopic}
            onChange={(e) => { setCustomTopic(e.target.value); setSelectedTopic(""); }}
            placeholder="או כתוב נושא משלך..."
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
          />
        </div>

        {/* Geyaken Mode */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium">מצב גיאקן</p>
            <p className="text-zinc-500 text-xs mt-0.5">מציג גם זווית נגדית לתובנה</p>
          </div>
          <button
            onClick={() => setIsGeyakenMode(!isGeyakenMode)}
            className={`w-12 h-6 rounded-full transition-all relative ${
              isGeyakenMode ? "bg-white" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                isGeyakenMode ? "right-1 bg-black" : "right-7 bg-zinc-400"
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => generate(false)}
            disabled={!activeTopic || loading}
            className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                מייצר...
              </span>
            ) : "צור תובנה"}
          </button>
          <button
            onClick={() => generate(true)}
            disabled={loading}
            className="px-4 py-3 border border-zinc-700 rounded-xl text-zinc-300 hover:border-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm whitespace-nowrap"
          >
            🎲 הפתע אותי
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="fade-in flex flex-col gap-4">

            {/* Topic Tag */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">נושא:</span>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">{result.topic}</span>
              {isGeyakenMode && (
                <span className="text-xs bg-zinc-800 text-amber-400 px-3 py-1 rounded-full">מצב גיאקן</span>
              )}
            </div>

            {/* Story */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wider">הסיפור</p>
              <p className="text-zinc-100 leading-relaxed text-sm">{result.story}</p>
            </div>

            {/* Insight */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/30 to-transparent pointer-events-none" />
              <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wider">התובנה</p>
              <p className="text-white font-medium leading-relaxed">💡 {result.insight}</p>
            </div>

            {/* Analogy */}
            {result.analogy && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wider">אנלוגיה</p>
                <p className="text-zinc-300 leading-relaxed text-sm">🔁 {result.analogy}</p>
              </div>
            )}

            {/* Counter (Geyaken) */}
            {result.counter && (
              <div className="bg-zinc-900 border border-amber-900/50 rounded-2xl p-5">
                <p className="text-xs text-amber-600 mb-3 font-medium uppercase tracking-wider">זווית נגדית</p>
                <p className="text-zinc-300 leading-relaxed text-sm">↩️ {result.counter}</p>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={copyResult}
              className="w-full py-3 border border-zinc-700 rounded-xl text-zinc-300 hover:border-zinc-400 hover:text-white transition-all text-sm font-medium"
            >
              {copied ? "✓ הועתק!" : "העתק לשיתוף"}
            </button>

          </div>
        )}

      </div>
    </main>
  );
}
