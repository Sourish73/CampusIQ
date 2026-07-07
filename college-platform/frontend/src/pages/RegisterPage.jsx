

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, AlertCircle, GraduationCap, Loader2, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const pwRules = [
  { test: (p) => p.length >= 6,            label: "At least 6 characters" },
  { test: (p) => /[A-Z]/.test(p),          label: "One uppercase letter" },
  { test: (p) => /[0-9]/.test(p),          label: "One number" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.password);
      if (result.success) navigate("/search", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "radial-gradient(ellipse at 40% 0%, rgba(255, 212, 90, 0.28) 0%, transparent 58%)" }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center mb-4 shadow-xl shadow-amber-500/20">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="font-display text-3xl text-[var(--text-primary)]">Create your account</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Start your college discovery journey</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
              <AlertCircle size={15} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Arjun Sharma"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                minLength={2}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  className="input-field pr-11"
                />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength indicators */}
              {form.password && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {pwRules.map(({ test, label }) => (
                    <span key={label} className={`flex items-center gap-1 text-[10px] ${test(form.password) ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                      <Check size={9} className={test(form.password) ? "text-emerald-600" : "text-amber-200"} />
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Confirm Password</label>
              <input
                type={showPw ? "text" : "password"}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                required
                className={`input-field ${form.confirm && form.confirm !== form.password ? "border-red-500/40 focus:ring-red-500/30" : ""}`}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-sm">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                : <><UserPlus size={16} /> Create Account</>
              }
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-amber-100 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-700 hover:text-brand-800 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
