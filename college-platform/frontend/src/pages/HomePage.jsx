

import { Link } from "react-router-dom";
import {
  Search, GitCompare, Brain, Bookmark, ArrowRight,
  GraduationCap, Star, TrendingUp, Users, Award,
  ChevronRight, Zap, Shield, BarChart2, BookOpen, MessageSquare,
} from "lucide-react";

const STATS = [
  { label: "Colleges Listed",   value: "150+",    icon: GraduationCap },
  { label: "Cut-Off Accuracy",  value: "90%",     icon: TrendingUp },
  { label: "Placement Records", value: "10k+",    icon: Star },
  { label: "Exams Covered",     value: "3+",      icon: Award },
];

const FEATURES = [
  {
    icon: Search,
    title: "Advanced Search & Filter",
    desc: "Filter by location, college type, fee range, rating, and more. Real-time search with paginated results.",
    href: "/search",
    color: "blue",
  },
  {
    icon: GitCompare,
    title: "Side-by-Side Comparison",
    desc: "Compare up to 3 colleges across 13 parameters including fees, placements, NIRF rank, and NAAC grade.",
    href: "/compare",
    color: "purple",
  },
  {
    icon: Brain,
    title: "AI Rank Predictor",
    desc: "Enter your exam and rank to get a ranked list of 10 colleges with the closest branch matches.",
    href: "/predictor",
    color: "pink",
  },
  {
    icon: MessageSquare,
    title: "College Reviews",
    desc: "Open a college review page with fetched summaries, website links, and quick comparison access.",
    href: "/reviews",
    color: "purple",
  },
  {
    icon: Bookmark,
    title: "Save & Shortlist",
    desc: "Bookmark your favourite colleges and build a personalised shortlist with notes for your applications.",
    href: "/saved",
    color: "amber",
  },
];

const EXAM_CARDS = [
  { label: "JEE Main", exam: "JEE Main", note: "Engineering predictions", desc: "Predict B.Tech admissions for NITs, IIITs, and other major state colleges based on JEE Main ranks." },
  { label: "JEE Advanced", exam: "JEE Advanced", note: "IIT branch outcomes", desc: "Estimate your chances of securing a seat in premier Indian Institutes of Technology (IITs)." },
  { label: "NEET UG", exam: "NEET UG", note: "Medical college chances", desc: "Predict MBBS and BDS course admissions in top government and private medical colleges." },
];

const colorMap = {
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   glow: "shadow-blue-500/20" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/20" },
  pink:   { bg: "bg-pink-500/10",   border: "border-pink-500/20",   text: "text-pink-400",   glow: "shadow-pink-500/20" },
  amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400",  glow: "shadow-amber-500/20" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 md:py-36"
        style={{ background: "linear-gradient(160deg, #ffffff 0%, #fff3d6 48%, #fff9ec 100%)" }}
      >
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(255,212,90,0.28),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(249,115,22,0.16),transparent_30%)]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-200 text-brand-800 text-xs font-semibold mb-8 animate-fsu shadow-sm">
            <Zap size={12} className="text-brand-700" />
            Smart college discovery
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-[var(--text-primary)] leading-[1.1] mb-6 animate-fsu animate-fsu-1">
            Find your{" "}
            <span className="gradient-text">dream college</span>
            <br />without the clutter
          </h1>

          <p className="text-[var(--text-secondary)] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fsu animate-fsu-2">
            Search colleges live, compare options fast, and open review pages that feel ready for a demo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fsu animate-fsu-3">
            <Link to="/search" className="btn-primary px-6 py-4 text-sm">
              Get Started <ArrowRight size={14} />
            </Link>
            <Link to="/predictor" className="btn-secondary px-6 py-4 text-sm">
              <Brain size={14} /> Try Predictor
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fsu animate-fsu-4 max-w-4xl mx-auto mt-10">
            {EXAM_CARDS.map(({ label, exam, note, desc }) => (
              <Link
                key={label}
                to={`/predictor?exam=${encodeURIComponent(exam)}`}
                className="group rounded-2xl border border-amber-200/50 bg-white/95 backdrop-blur-md p-6 text-left shadow-xl shadow-amber-900/5 hover:shadow-2xl hover:border-brand-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl group-hover:bg-brand-500/10 transition-colors" />
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-lg font-bold text-[var(--text-primary)] group-hover:text-brand-800 transition-colors">{label}</span>
                  <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                    <Brain size={14} className="text-brand-700 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-brand-700 tracking-wider uppercase mb-2">{note}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-amber-200/70 bg-white/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/15 flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-brand-700" />
                </div>
                <p className="font-display text-3xl text-[var(--text-primary)] mb-1">{value}</p>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl text-[var(--text-primary)] mb-3">
            Everything You Need to Choose
          </h2>
          <p className="text-[var(--text-muted)] max-w-lg mx-auto">
            From discovery to decision — our platform equips you with data-driven tools
            to make the most important choice of your life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, href, color }) => {
            const c = colorMap[color];
            return (
              <Link key={title} to={href} className="card p-7 group hover:scale-[1.01] transition-all duration-300 hover:shadow-xl block"
                style={{ borderColor: "transparent" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
              >
                <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 shadow-lg ${c.glow}`}>
                  <Icon size={22} className={c.text} />
                </div>
                <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-2 group-hover:text-brand-300 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{desc}</p>
                <div className={`flex items-center gap-1 text-sm font-semibold ${c.text}`}>
                  Explore <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── How Predictor Works ───────────────────────────────────────────── */}
      <section className="border-t border-amber-200/70 bg-gradient-to-b from-brand-50 to-transparent py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-200 text-brand-800 text-xs font-semibold mb-6">
            <Brain size={12} /> Rank-Based Prediction Engine
          </div>
          <h2 className="font-display text-4xl text-[var(--text-primary)] mb-4">
            Know Your Chances <span className="gradient-text">Before You Apply</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-lg mx-auto mb-10">
            Our predictor cross-references your rank against historical cutoff data across
            exams like JEE, CAT, NEET, CUET, and more.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: Shield, label: "Safe Picks", desc: "Colleges where your rank is well within their closing rank", color: "emerald" },
              { icon: BarChart2, label: "Good Bets", desc: "Colleges in your comfortable admission zone", color: "blue" },
              { icon: TrendingUp, label: "Reach Targets", desc: "Colleges that are achievable with strong preparation", color: "purple" },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className={`card p-6 border-${color}-500/20`}>
                <Icon size={24} className={`text-${color}-400 mb-3 mx-auto`} />
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{label}</h3>
                <p className="text-xs text-[var(--text-muted)]">{desc}</p>
              </div>
            ))}
          </div>

          <Link to="/predictor" className="btn-primary text-base py-3 px-8">
            <Brain size={18} /> Try the Predictor
          </Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="card p-12" style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(167,139,250,0.05) 100%)",
          borderColor: "rgba(99,102,241,0.15)",
        }}>
          <GraduationCap size={40} className="text-brand-400 mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl text-[var(--text-primary)] mb-4">
            Ready to Find Your College?
          </h2>
          <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
            Join thousands of students who use CampusIQ to make smarter college decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base py-3 px-8">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/search" className="btn-secondary text-base py-3 px-8">
              <BookOpen size={16} /> Browse Colleges
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-amber-200/70 py-8 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <GraduationCap size={12} className="text-white" />
            </div>
            <span className="font-display text-sm text-[var(--text-muted)]">CampusIQ</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} CampusIQ · College Discovery & Decision Platform
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <Link to="/search" className="hover:text-brand-400 transition-colors">Colleges</Link>
            <Link to="/predictor" className="hover:text-brand-400 transition-colors">Predictor</Link>
            <Link to="/compare" className="hover:text-brand-400 transition-colors">Compare</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
