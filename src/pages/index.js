import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

export default function Home() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [queryCount, setQueryCount] = useState(0);
  const [searchedWord, setSearchedWord] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(false);

  const isEnglish = (text) => {
    return /^[a-zA-Z\s'-]+$/.test((text || "").trim());
  };

  const MAX_QUERIES_PER_DAY = 25;

  useEffect(() => {
    const stored = localStorage.getItem("lexilens-history");
    if (stored) setHistory(JSON.parse(stored));

    const count = parseInt(Cookies.get("lexilens-count") || "0");
    setQueryCount(count);
  }, []);

  useEffect(() => {
    if (triggerSearch && word.trim()) {
      fetchDefinition();
      setTriggerSearch(false);
    }
  }, [word, triggerSearch]);

  const updateHistory = (word) => {
    const newHistory = [word, ...history.filter((w) => w !== word)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("lexilens-history", JSON.stringify(newHistory));
  };

  const incrementQueryCount = () => {
    const newCount = queryCount + 1;
    setQueryCount(newCount);
    Cookies.set("lexilens-count", newCount.toString(), { expires: 1 });
  };

  const fetchDefinition = async () => {
    if (queryCount >= MAX_QUERIES_PER_DAY) {
      setError("Daily limit reached. Please come back tomorrow!");
      return;
    }

    if (word.trim().split(/\s+/).length > 3) {
      setError("Please enter only up to 3 words.");
      return;
    }

    if (!word.trim()) {
      setError("Missing word");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSearchedWord(word);

    try {
      console.log("Fetching:", word);
      const res = await fetch(`/api/define?word=${word}`);
      const data = await res.json();
      console.log("API Response:", data);

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        updateHistory(word);
        incrementQueryCount();
        setError(null);
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (w) => {
    setWord(w);
    setTriggerSearch(true);
  };

  const speakWord = (text) => {
    if (!text || typeof window === "undefined") return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <main
      className="min-h-screen py-10 px-4 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] text-white flex items-center justify-center"
      style={{
        backgroundImage: `
          radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 60%),
          radial-gradient(circle at center, rgba(255,255,255,0.04) 20%, rgba(0,0,0,0) 80%)
        `,
        backgroundRepeat: "no-repeat",
        backgroundSize: "150% 150%",
        backgroundPosition: "center center",
      }}
    >
      <div className="w-full max-w-lg space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-3 flex items-center justify-center gap-2">
            <span>📘</span> <span>LexiLens</span>
          </h1>
          <p className="text-gray-400 text-md">
            Search any word (in any language) and explore its meaning with AI
          </p>
        </div>

        {/* Input + CTA */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchDefinition();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg flex flex-col items-center gap-6"
          >
            <input
              type="text"
              name="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. resilience, epiphany, eloquence"
              className="w-full max-w-md px-4 py-3 rounded-lg bg-white text-black shadow shadow-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <motion.div
              whileTap={{ scale: 0.97 }}
              className="relative group w-[90%] max-w-md"
            >
              <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 blur-sm bg-[length:200%_200%] animate-borderGlow transition-all duration-500" />

              <button
                type="submit"
                disabled={!word || loading}
                className="relative z-10 w-full bg-black text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:shadow-lg transition-colors duration-300"
              >
                {loading ? "Looking up..." : "✨ Define Word"}
              </button>
            </motion.div>

            {(error || queryCount < MAX_QUERIES_PER_DAY) && (
              <div className="text-center space-y-1">
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <p className="text-xs text-gray-400">
                  {MAX_QUERIES_PER_DAY - queryCount} free searches left today
                </p>
              </div>
            )}
          </motion.div>
        </form>

        {/* History Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {history.map((w) => (
            <button
              key={w}
              onClick={() => handleHistoryClick(w)}
              className="p-2 text-sm bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition"
            >
              {w}
            </button>
          ))}
        </div>

        {loading && (
          <div className="bg-white text-black p-6 rounded-xl shadow-lg space-y-4 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        )}

        {/* Result Rendering */}
        {result && (
          <div className="bg-white text-black p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-2xl font-bold capitalize flex items-center gap-2">
              {searchedWord}
              {isEnglish(searchedWord) && (
                <button
                  onClick={() => speakWord(searchedWord)}
                  className="text-blue-500 hover:text-blue-700 transition"
                  title="Hear pronunciation"
                >
                  🔊
                </button>
              )}
            </h2>
            <p>
              <strong>Definition:</strong> {result.definition}
            </p>

            {result.synonyms?.length > 0 && (
              <p>
                <strong>Synonyms:</strong> {result.synonyms.join(", ")}
              </p>
            )}

            {result.antonyms?.length > 0 && (
              <p>
                <strong>Antonyms:</strong> {result.antonyms.join(", ")}
              </p>
            )}

            {result.examples?.length > 0 && (
              <div>
                <strong>Examples:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {result.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.fact && (
              <p className="text-sm text-gray-600 mt-4">
                <span>💡</span>
                <span className="italic">{result.fact}</span>
              </p>
            )}
          </div>
        )}

        {result?.usage && !loading && (
          <p className="text-xs text-blue-300 italic mt-2 text-center">
            {result.usage.prompt_tokens + result.usage.completion_tokens} tokens
            used ≈ $
            {(
              (result.usage.prompt_tokens * 0.0015 +
                result.usage.completion_tokens * 0.002) /
              1000
            ).toFixed(4)}{" "}
            USD
          </p>
        )}
      </div>
    </main>
  );
}
