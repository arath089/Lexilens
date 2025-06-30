import { useState } from "react";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Home() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("lexilens-history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const updateHistory = (word) => {
    const newHistory = [word, ...history.filter((w) => w !== word)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("lexilens-history", JSON.stringify(newHistory));
  };

  const fetchDefinition = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/define?word=${word}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        updateHistory(word);
        console.log("Token usage:", data.usage);
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] text-white flex items-center justify-center px-4"
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
          <p className="text-gray-400 text-lg">
            Explore the beauty of words with AI
          </p>
        </div>

        {/* Input + CTA */}
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
            <div
              className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 blur-sm  bg-[length:200%_200%] animate-borderGlow transition-all duration-500"
            />

            <button
              onClick={fetchDefinition}
              disabled={!word || loading}
              className="relative z-10 w-full bg-black text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:shadow-lg transition-colors duration-300"
            >
              {loading ? "Looking up..." : "✨ Define Word"}
            </button>
          </motion.div>

          {error && <p className="text-red-400">{error}</p>}
        </motion.div>

        {history.length > 0 && (
          <div className="w-full flex flex-wrap justify-center gap-2 mt-2">
            {history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setWord(item);
                  fetchDefinition(item);
                }}
                className="px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200 transition"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Skeleton Loader */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white backdrop-blur border border-white/10 p-6 rounded-xl shadow space-y-4 text-black animate-pulse"
          >
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-3 bg-gray-300 rounded w-1/3"></div>
          </motion.div>
        )}

        {/* Result Output */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white backdrop-blur border border-white/10 p-6 rounded-xl shadow space-y-4 text-black"
          >
            <h2 className="text-2xl font-bold capitalize">{word}</h2>
            <p>
              <strong>Definition:</strong> {result.definition}
            </p>
            <p>
              <strong>Synonyms:</strong> {result.synonyms?.join(", ")}
            </p>
            <p>
              <strong>Antonyms:</strong> {result.antonyms?.join(", ")}
            </p>
            <div>
              <strong>Examples:</strong>
              <ul className="list-disc list-inside mt-1">
                {result.examples?.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
            {result.fact && (
              <p className="italic text-sm text-gray-400">💡 {result.fact}</p>
            )}
          </motion.div>
        )}

        {/* Token Usage */}
        {result?.usage && !loading && (
          <p className="text-xs text-blue-300 italic">
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
