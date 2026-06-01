import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserPlus, Film, Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", position: "relative" }}>
      <div className="bg-particles" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--gradient-button)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}><Film size={28} color="white" /></div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }} className="gradient-text">Create Account</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Join CineMatch for AI-powered movie picks</p>
        </div>
        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)", padding: "0.7rem 1rem", marginBottom: "1.2rem", fontSize: "0.85rem", color: "var(--color-error)" }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input id="signup-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" required className="input-field" style={{ paddingLeft: "2.5rem" }} />
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="input-field" style={{ paddingLeft: "2.5rem" }} />
            </div>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input id="signup-password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required className="input-field" style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", display: "flex" }}>{showPw ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
          </div>
          <button id="signup-submit" type="submit" disabled={loading} className="btn-gradient" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", height: 48, fontSize: "1rem" }}>
            {loading ? <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }}/> : <><UserPlus size={18}/> Create Account</>}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Already have an account? <Link to="/login" style={{ color: "var(--color-accent-purple)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link></p>
      </motion.div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
