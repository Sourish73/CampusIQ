import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  GraduationCap, Search, Brain, Bookmark,
  LogIn, LogOut, UserCircle, Menu, X, ChevronDown, MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/search", label: "Colleges", icon: Search },
  { to: "/predictor", label: "Predictor", icon: Brain },
  { to: "/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: UserCircle, protected: true },
  { to: "/saved", label: "Saved", icon: Bookmark, protected: true },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-pink-200/70 shadow-sm shadow-pink-900/5"
      style={{
        background: "rgba(255, 248, 250, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg text-[var(--text-primary)] tracking-tight">CampusIQ</span>
              <span className="text-[10px] text-brand-700 font-mono tracking-widest uppercase">Discovery Platform</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.filter((link) => !link.protected || isAuthenticated).map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#fff8cc] text-brand-800 shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#fff8cc]"
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-pink-200 hover:border-brand-400 bg-white hover:bg-[#fff8cc] transition-all duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[var(--text-muted)] transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 card shadow-xl shadow-pink-900/10 py-1 animate-scale-in">
                    <div className="px-4 py-2 border-b border-pink-100">
                      <p className="text-xs text-[var(--text-muted)]">Signed in as</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#fff8cc] transition-colors"
                    >
                      <UserCircle size={14} /> Profile
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#fff8cc] transition-colors"
                    >
                      <Bookmark size={14} /> Saved Colleges
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  <LogIn size={15} /> Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#fff8cc]"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-pink-100 space-y-1 animate-slide-up">
            {NAV_LINKS.filter((link) => !link.protected || isAuthenticated).map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#fff8cc] text-brand-800"
                      : "text-[var(--text-secondary)] hover:bg-[#fff8cc] hover:text-[var(--text-primary)]"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-pink-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut size={16} /> Sign Out ({user?.name})
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary justify-center">
                    <LogIn size={15} /> Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary justify-center">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
