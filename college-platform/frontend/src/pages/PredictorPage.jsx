import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Brain, ChevronDown, Search, Loader2, AlertCircle, MapPin, Sparkles, ArrowRight, ExternalLink, Trophy, MessageSquare } from "lucide-react";
import { collegesAPI, predictorAPI } from "../api/axios";

const CATEGORIES = ["General", "OBC"];

const EXAM_CHOICES = ["JEE Main", "JEE Advanced", "NEET UG", "VITEEE"];

const CHANCE_TONE = {
  Safe: "text-emerald-700 bg-emerald-500/10 border-emerald-500/20",
  Good: "text-sky-700 bg-sky-500/10 border-sky-500/20",
  Moderate: "text-amber-800 bg-amber-500/10 border-amber-500/20",
  Reach: "text-rose-700 bg-rose-500/10 border-rose-500/20",
};

export default function PredictorPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ exam: "", rank: "", category: "General" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [exams, setExams] = useState(EXAM_CHOICES);
  const [activeCollege, setActiveCollege] = useState(null);

  useEffect(() => {
    predictorAPI.getExams()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.data.exams) && data.data.exams.length) {
          setExams(data.data.exams.filter((exam) => EXAM_CHOICES.includes(exam)));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const prefillExam = searchParams.get("exam");
    if (prefillExam && EXAM_CHOICES.includes(prefillExam)) {
      setForm((prev) => ({ ...prev, exam: prefillExam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.exam.trim()) {
      setError("Please select an exam.");
      return;
    }
    if (!form.rank || parseInt(form.rank, 10) < 1) {
      setError("Please enter a valid rank.");
      return;
    }

    setLoading(true);
    setError(null);
    setSubmitted(true);

    try {
      const { data } = await predictorAPI.predict({
        exam_name: form.exam,
        rank: parseInt(form.rank, 10),
        category: form.category,
        filters: {},
      });

      if (data.success) {
        setResults(data.data.results || []);
      } else {
        setResults([]);
        setError(data.message || "No ranked matches were returned.");
      }
    } catch (err) {
      setResults([]);
      setError(err.response?.data?.message || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const examOptions = useMemo(() => (exams.length ? exams : EXAM_CHOICES), [exams]);

  return (
    <div className="min-h-screen bg-pink-100/10">
      <section className="relative overflow-hidden border-b border-pink-200/70" style={{ background: "linear-gradient(135deg, #fff2f7 0%, #ffe9f0 55%, #fff5e0 100%)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.18),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(244,114,182,0.20),transparent_26%),radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.12),transparent_26%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-200 text-brand-800 text-xs font-semibold shadow-sm">
              <Sparkles size={12} /> Smart rank prediction
            </div>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-md transition-all">
              ← Back to Home Page
            </Link>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-[var(--text-primary)] mb-4 leading-tight">
            Predict your <span className="gradient-text">best-fit colleges</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-3xl">
            Enter your exam and rank, and the app will return 10 colleges with the closest branches and realistic admission buffers.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="card p-6 mb-8 border-pink-100 shadow-pink-900/5 animate-fsu">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Select Exam">
              <div className="relative">
                <select
                  value={form.exam}
                  onChange={(e) => update("exam", e.target.value)}
                  className="input-field appearance-none pr-8"
                >
                  <option value="">Choose exam</option>
                  {examOptions.map((exam) => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </Field>

            <Field label="Your Rank">
              <input
                type="number"
                min="1"
                placeholder="e.g. 12000"
                value={form.rank}
                onChange={(e) => update("rank", e.target.value)}
                className="input-field"
              />
            </Field>

            <Field label="Category">
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="input-field appearance-none pr-8"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </Field>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm mt-4">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-5 px-5 py-3 text-sm">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            {loading ? "Finding..." : "Find 10 Colleges"}
          </button>
        </form>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Brain size={42} className="text-brand-400 animate-pulse mx-auto mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">Ranking the closest branch matches...</p>
            </div>
          </div>
        )}

        {submitted && !loading && results.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100 bg-white/70 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Top 10 recommendations</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {form.exam} · Rank {Number(form.rank).toLocaleString()} · {form.category}
                </p>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Generated from cutoff data
              </div>
            </div>

            <div className="divide-y divide-amber-100">
              {results.map((result, index) => (
                <ResultRow
                  key={result.id || `${index}-${result.college?.name}`}
                  result={result}
                  index={index}
                  onInsight={() => setActiveCollege(result.college)}
                />
              ))}
            </div>
          </div>
        )}

        {submitted && !loading && results.length === 0 && !error && (
          <EmptyState exam={form.exam} rank={form.rank} category={form.category} />
        )}
      </div>
      {activeCollege && (
        <CollegeInsightModal college={activeCollege} onClose={() => setActiveCollege(null)} />
      )}
    </div>
  );
}

function ResultRow({ result, index, onInsight }) {
  const { college = {}, chance = {}, closing_rank, opening_rank, course_name, rankBuffer = 0 } = result;
  const tone = CHANCE_TONE[chance.label] || CHANCE_TONE.Moderate;
  const website = college.website && college.website.startsWith("http") ? college.website : "";
  const detailHref = college.id ? `/college/${college.id}` : `/search?search=${encodeURIComponent(college.name || "")}`;

  return (
    <div className="p-5 hover:bg-[#fffdf5] transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-200 flex items-center justify-center text-brand-800 font-bold flex-shrink-0">
            {String(index + 1).padStart(2, "0")}
          </div>
          <div className="min-w-0">
            <Link to={detailHref} className="text-lg font-semibold text-[var(--text-primary)] hover:text-brand-800 transition-colors block truncate">
              {college.name || "Recommended college"}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} /> {college.location || "Unknown"}, {college.state || "India"}
              </span>
              {course_name && <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-800 text-xs">{course_name}</span>}
              {college.nirf_rank && <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 text-xs">NIRF #{college.nirf_rank}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${tone}`}>
                <Trophy size={11} /> {chance.label || "Moderate"}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Closing rank: <strong className="text-[var(--text-primary)]">{closing_rank?.toLocaleString?.() || "—"}</strong>
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Opening rank: <strong className="text-[var(--text-primary)]">{opening_rank?.toLocaleString?.() || "—"}</strong>
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Buffer: <strong className="text-[var(--text-primary)]">+{rankBuffer.toLocaleString()}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap lg:justify-end">
          <Link to={detailHref} className="btn-secondary text-xs px-3 py-2">
            View College
          </Link>
          <button type="button" onClick={onInsight} className="btn-secondary text-xs px-3 py-2">
            AI Summary
          </button>
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-xs px-3 py-2"
            >
              Website <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CollegeInsightModal({ college, onClose }) {
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoadingSummary(true);
    setLoadingReviews(true);

    collegesAPI.summary(college.name)
      .then(({ data }) => alive && setSummary(data.data))
      .catch(() => alive && setSummary({ summary: "Summary is unavailable right now.", highlights: [] }))
      .finally(() => alive && setLoadingSummary(false));

    collegesAPI.reviewsAI(college.name)
      .then(({ data }) => alive && setReviews(data.data))
      .catch(() => alive && setReviews({ sentiment: "neutral", reviews: [] }))
      .finally(() => alive && setLoadingReviews(false));

    return () => {
      alive = false;
    };
  }, [college.name]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm px-4 py-6 flex items-center justify-center transition-all duration-300">
      <div className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 bg-[#fffdfa] border-pink-200/80 shadow-2xl relative animate-fsu">
        <div className="flex items-start justify-between gap-4 border-b border-pink-100 pb-5 mb-6">
          <div>
            <span className="text-[10px] font-bold text-pink-700 uppercase tracking-widest bg-pink-100/50 px-2.5 py-1 rounded-md mb-2 inline-block">AI Decision Insight</span>
            <h2 className="font-display text-2xl md:text-3xl text-brand-950 font-bold leading-tight">{college.name}</h2>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-pink-600" /> {college.location || "Unknown"}, {college.state || "India"}
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-secondary text-xs px-4 py-2 hover:bg-pink-100/50 border-pink-300 text-pink-900 transition-all font-semibold rounded-xl"
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          {/* Summary Section */}
          <section className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-display font-semibold text-brand-900 text-base mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-pink-600 animate-pulse" /> Factual AI Summary
            </h3>
            {loadingSummary ? (
              <SpinnerText text="Generating verified summary..." />
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-normal">{summary?.summary}</p>
                {!!summary?.highlights?.length && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-pink-50">
                    {summary.highlights.map((item) => (
                      <span key={item} className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-900 text-xs font-medium border border-pink-200/20">{item}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Sentiment Section */}
          <section className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="font-display font-semibold text-brand-900 text-base flex items-center gap-2">
                <MessageSquare size={16} className="text-pink-600" /> Review Sentiment
              </h3>
              {!loadingReviews && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  reviews?.sentiment === "positive" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
                }`}>
                  {reviews?.sentiment || "neutral"}
                </span>
              )}
            </div>

            {loadingReviews ? (
              <SpinnerText text="Analyzing student reviews..." />
            ) : (
              <div className="space-y-4">
                {(reviews?.reviews || []).length > 0 ? (
                  (reviews?.reviews || []).map((review, index) => (
                    <div key={`${review.title}-${index}`} className="border border-pink-100/50 rounded-xl p-4 bg-pink-50/20">
                      <p className="font-bold text-sm text-brand-950 mb-1">{review.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{review.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--text-muted)] italic">No student review analyses are available at the moment.</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function SpinnerText({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] py-4">
      <Loader2 size={16} className="animate-spin text-brand-500" />
      {text}
    </div>
  );
}

function EmptyState({ exam, rank, category }) {
  return (
    <div className="card p-10 text-center">
      <AlertCircle size={36} className="text-[var(--text-muted)] mx-auto mb-3" />
      <h3 className="font-semibold text-[var(--text-primary)] mb-2">No predictions returned</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
        No usable list was returned for <strong>{exam}</strong> with rank {Number(rank).toLocaleString()} in {category}. Try a different exam or broader rank.
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</span>
      {children}
    </label>
  );
}
