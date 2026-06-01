import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Search,
  User,
  LogOut,
  History,
  Heart,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setProfileOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Home", icon: Film },
    { path: "/history", label: "History", icon: History },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10, 10, 15, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--gradient-button)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Film size={20} color="white" />
          </div>
          <span
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
            className="gradient-text"
          >
            CineMatch
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
          className="desktop-nav"
        >
          {isAuthenticated &&
            navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: isActive(link.path)
                    ? "var(--color-accent-purple)"
                    : "var(--color-text-secondary)",
                  background: isActive(link.path)
                    ? "rgba(139, 92, 246, 0.1)"
                    : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
        </div>

        {/* Right Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {isAuthenticated ? (
            <div style={{ position: "relative" }}>
              <button
                id="profile-button"
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--gradient-button)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    color: "white",
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    maxWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name || "User"}
                </span>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: "200px",
                      background: "var(--color-bg-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--shadow-card)",
                      overflow: "hidden",
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {user?.name}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.65rem 1rem",
                        textDecoration: "none",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.85rem",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background =
                          "rgba(139, 92, 246, 0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      <User size={15} /> Profile
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.65rem 1rem",
                        textDecoration: "none",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.85rem",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background =
                          "rgba(139, 92, 246, 0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      <History size={15} /> Search History
                    </Link>
                    <div
                      style={{
                        borderTop: "1px solid var(--color-border)",
                      }}
                    >
                      <button
                        id="logout-button"
                        onClick={handleLogout}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.65rem 1rem",
                          width: "100%",
                          border: "none",
                          background: "none",
                          color: "var(--color-error)",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background =
                            "rgba(239, 68, 68, 0.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "transparent")
                        }
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link to="/login">
                <button className="btn-ghost">Login</button>
              </Link>
              <Link to="/signup">
                <button className="btn-gradient">Sign Up</button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
