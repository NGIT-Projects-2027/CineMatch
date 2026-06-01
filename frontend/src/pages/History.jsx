import { useState, useEffect } from "react";
import { historyAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { History as HistoryIcon, Trash2, Clock, Search } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const res = await historyAPI.getHistory();
      setHistory(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const clearHistory = async () => {
    if (!window.confirm("Clear all search history?")) return;
    try {
      await historyAPI.clearHistory();
      setHistory([]);
    } catch (err) { console.error(err); }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div className="bg-particles" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <HistoryIcon size={24} style={{ color: "var(--color-accent-purple)" }} />
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Search History</h1>
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-error)", borderColor: "rgba(239,68,68,0.3)", fontSize: "0.85rem" }}>
              <Trash2 size={15} /> Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 72 }} />)}
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
            <Search size={48} style={{ color: "var(--color-text-muted)", margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>No search history</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Your movie searches will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {history.map((item, idx) => (
              <motion.div key={item._id || idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="glass-card" style={{ padding: "0.9rem 1.2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Search size={18} style={{ color: "var(--color-accent-purple)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.2rem" }}>{item.search}</p>
                  {item.results && item.results.length > 0 && (
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Results: {item.results.map(r => r.title).join(", ")}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0, color: "var(--color-text-muted)", fontSize: "0.78rem" }}>
                  <Clock size={13} />
                  {formatDate(item.searchedAt)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
