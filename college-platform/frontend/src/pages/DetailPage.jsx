

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, Star, Globe, Calendar, Award, TrendingUp,
  BookOpen, Users, DollarSign, Building2, ArrowLeft,
  Bookmark, BookmarkCheck, GitCompare, ExternalLink,
  ChevronRight, Briefcase, MessageSquare, BarChart2,
  AlertCircle, Loader2, GraduationCap, Trophy, Check,
} from "lucide-react";
import { collegesAPI, savedItemsAPI } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "overview",   label: "Overview",   icon: Building2 },
  { id: "courses",    label: "Courses",    icon: BookOpen },
  { id: "placements", label: "Placements", icon: Briefcase },
  { id: "reviews",    label: "Reviews",    icon: MessageSquare },
];

const TYPE_LABELS = {
  government: { label: "Government", cls: "tag-govt" },
  private:    { label: "Private",    cls: "tag-private" },
  deemed:     { label: "Deemed",     cls: "tag-deemed" },
  central:    { label: "Central",    cls: "tag-central" },
};

const formatINR = (n) => {
  if (!n) return "—";
  const v = parseFloat(n);
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
};

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [college, setCollege]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [saved, setSaved]       = useState(false);
  const [savingBusy, setSavingBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await collegesAPI.getById(id);
        if (data.success) setCollege(data.data.college);
        else setError("College not found.");
      } catch {
        setError("Failed to load college. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Check saved status
  useEffect(() => {
    if (!isAuthenticated) { setSaved(false); return; }
    savedItemsAPI.getAll().then(({ data }) => {
      if (data.success) {
        setSaved(data.data.savedItems.some((s) => s.college_id === parseInt(id)));
      }
    }).catch(() => {});
  }, [id, isAuthenticated]);

  const handleSave = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setSavingBusy(true);
    try {
      if (saved) {
        await savedItemsAPI.remove(id);
        setSaved(false);
      } else {
        await savedItemsAPI.add(parseInt(id));
        setSaved(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error)   return <PageError message={error} />;
  if (!college) return null;

  const latestPlacement = college.placements?.[0] || null;
  const typeInfo = TYPE_LABELS[college.college_type] || TYPE_LABELS.private;

  return (
    <div className="min-h-screen">

      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-amber-200/70" style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fff3c4 55%, #fff9ec 100%)"
      }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-brand-800 transition-colors mb-6"
          >
            <ArrowLeft size={15} /> Back to results
          </button>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo placeholder */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-200 to-amber-100 border border-brand-300 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-900/10">
              <GraduationCap size={36} className="text-brand-800" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={typeInfo.cls}>{typeInfo.label}</span>
                {college.naac_grade && (
                  <span className="badge bg-sky-500/15 text-sky-700">
                    <Award size={10} /> NAAC {college.naac_grade}
                  </span>
                )}
                {college.nirf_rank && (
                  <span className="badge bg-rose-500/10 text-rose-700">
                    <Trophy size={10} /> #{college.nirf_rank} NIRF
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl text-brand-950 mb-2 leading-tight">
                {college.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)] mb-4">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-700" />
                  {college.location}, {college.state}
                </span>
                {college.established_year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-brand-700" />
                    Est. {college.established_year}
                  </span>
                )}
                {college.website && (
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-brand-800 transition-colors"
                  >
                    <Globe size={14} /> Website <ExternalLink size={11} />
                  </a>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= Math.round(parseFloat(college.rating))
                        ? "text-amber-400 fill-amber-400"
                        : "text-amber-100 fill-amber-100"}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-amber-400">
                  {parseFloat(college.rating).toFixed(1)}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  ({college.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row md:flex-col gap-2 md:w-40 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={savingBusy}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  saved
                    ? "bg-brand-100 border-brand-300 text-brand-800"
                    : "bg-white border-amber-200 text-[var(--text-secondary)] hover:border-brand-400 hover:text-brand-800"
                }`}
              >
                {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                {saved ? "Saved" : "Save"}
              </button>
              <Link
                to={`/compare?ids=${id}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-amber-200 text-[var(--text-secondary)] hover:border-brand-400 hover:text-brand-800 transition-all"
              >
                <GitCompare size={15} /> Compare
              </Link>
            </div>
          </div>

          {/* Quick stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <QuickStat label="Avg CTC" value={latestPlacement?.average_ctc ? `${latestPlacement.average_ctc} LPA` : "N/A"} icon={TrendingUp} />
            <QuickStat label="Highest CTC" value={latestPlacement?.highest_ctc ? `${latestPlacement.highest_ctc} Cr` : "N/A"} icon={Trophy} />
            <QuickStat label="Placement %" value={latestPlacement?.placement_percentage ? `${latestPlacement.placement_percentage}%` : "N/A"} icon={BarChart2} />
            <QuickStat label="Total Intake" value={college.total_intake ? `${college.total_intake.toLocaleString()} seats` : "N/A"} icon={Users} />
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-[var(--bg-primary)] border-b border-amber-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map(({ id: tid, label, icon: Icon }) => (
              <button
                key={tid}
                onClick={() => setActiveTab(tid)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tid
                    ? "border-brand-500 text-brand-800"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fsu" key={activeTab}>
          {activeTab === "overview"   && <OverviewTab college={college} />}
          {activeTab === "courses"    && <CoursesTab courses={college.courses} />}
          {activeTab === "placements" && <PlacementsTab placements={college.placements} />}
          {activeTab === "reviews"    && <ReviewsTab reviews={college.reviews} />}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Stat ───────────────────────────────────────────────────────────────
function QuickStat({ label, value, icon: Icon }) {
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-brand-400" />
      </div>
      <div>
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="text-sm font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ college }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
      <div className="lg:col-span-2 space-y-6">
        <div className="card-hover p-6 hover:scale-[1.015]">
          <h2 className="font-display text-xl text-[var(--text-primary)] mb-4">About {college.name}</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line">
            {college.overview || "Detailed overview not available yet."}
          </p>
        </div>

        <div className="card-hover p-6 hover:scale-[1.015]">
          <h2 className="font-display text-xl text-[var(--text-primary)] mb-4">Key Facts</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Established", value: college.established_year || "—" },
              { label: "College Type", value: college.college_type?.charAt(0).toUpperCase() + college.college_type?.slice(1) || "—" },
              { label: "Affiliation", value: college.affiliation || "—" },
              { label: "NAAC Grade", value: college.naac_grade || "—" },
              { label: "NIRF Rank", value: college.nirf_rank ? `#${college.nirf_rank}` : "—" },
              { label: "Total Intake", value: college.total_intake ? `${college.total_intake} seats` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1 p-3 rounded-xl bg-amber-50/70 border border-amber-100 transition-transform duration-200 hover:scale-[1.03]">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {college.placements?.[0] && (
          <div className="card-hover p-5 hover:scale-[1.015]">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Briefcase size={15} className="text-brand-400" /> Latest Placements ({college.placements[0].year})
            </h3>
            <div className="space-y-3">
              <PlacementRow label="Average CTC" value={`${college.placements[0].average_ctc} LPA`} />
              <PlacementRow label="Highest CTC" value={`${college.placements[0].highest_ctc} Cr`} />
              <PlacementRow label="Placement %" value={`${college.placements[0].placement_percentage}%`} />
              {Array.isArray(college.placements[0].top_recruiters) && (
                <div className="pt-2 border-t border-amber-100">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Top Recruiters</p>
                  <div className="flex flex-wrap gap-1.5">
                    {college.placements[0].top_recruiters.slice(0, 6).map((r) => (
                      <span key={r} className="text-[10px] px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {college.courses?.[0] && (
          <div className="card-hover p-5 hover:scale-[1.015]">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <BookOpen size={15} className="text-brand-400" /> Popular Courses
            </h3>
            <div className="space-y-2">
              {college.courses.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70">
                  <span className="text-xs text-[var(--text-secondary)] truncate max-w-[65%]">{c.name}</span>
                  <span className="text-xs font-semibold text-brand-800">{formatINR(c.fees)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlacementRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

// ─── Courses Tab ──────────────────────────────────────────────────────────────
function CoursesTab({ courses = [] }) {
  const [filter, setFilter] = useState("All");
  const types = ["All", ...new Set(courses.map((c) => c.degree_type))];
  const filtered = filter === "All" ? courses : courses.filter((c) => c.degree_type === filter);

  if (!courses.length) return <EmptySection label="No course data available." />;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === t
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                : "bg-white text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-brand-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((course) => (
          <div key={course.id} className="card-hover p-5 hover:scale-[1.015]">
            <div className="flex items-start justify-between mb-3">
              <span className={`badge text-[10px] ${
                course.degree_type === "UG" ? "bg-sky-500/15 text-sky-700" :
                course.degree_type === "PG" ? "bg-violet-500/15 text-violet-700" :
                "bg-amber-500/20 text-amber-800"
              }`}>
                {course.degree_type}
              </span>
              {course.seats_available && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  {course.seats_available} seats
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1 leading-snug">{course.name}</h3>
            {course.specialisation && (
              <p className="text-xs text-[var(--text-muted)] mb-3">{course.specialisation}</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-amber-100">
              <div>
                <p className="text-[10px] text-[var(--text-muted)]">Total Fees</p>
                <p className="text-base font-bold text-brand-800">{formatINR(course.fees)}</p>
              </div>
              {course.duration && (
                <div className="text-right">
                  <p className="text-[10px] text-[var(--text-muted)]">Duration</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{course.duration}</p>
                </div>
              )}
            </div>
            {course.fees_per_year && (
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                ≈ {formatINR(course.fees_per_year)} / year
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Placements Tab ───────────────────────────────────────────────────────────
function PlacementsTab({ placements = [] }) {
  if (!placements.length) return <EmptySection label="No placement data available." />;

  return (
    <div className="space-y-6">
      {placements.map((p) => (
        <div key={p.id} className="card-hover p-6 hover:scale-[1.015]">
          <h2 className="font-display text-xl text-[var(--text-primary)] mb-5 flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-400" />
            Placement Statistics — {p.year}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <PlacementStat label="Average CTC" value={`${p.average_ctc} LPA`} color="blue" />
            <PlacementStat label="Median CTC" value={p.median_ctc ? `${p.median_ctc} LPA` : "—"} color="indigo" />
            <PlacementStat label="Highest CTC" value={`${p.highest_ctc} Cr`} color="purple" />
            <PlacementStat label="Placement %" value={`${p.placement_percentage}%`} color="green" />
          </div>

          {p.total_offers && (
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Total offers: <span className="text-[var(--text-primary)] font-semibold">{p.total_offers.toLocaleString()}</span>
            </p>
          )}

          {Array.isArray(p.top_recruiters) && p.top_recruiters.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Top Recruiters
              </p>
              <div className="flex flex-wrap gap-2">
                {p.top_recruiters.map((r) => (
                  <span key={r} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800 text-xs font-medium border border-brand-200">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PlacementStat({ label, value, color }) {
  const colorMap = {
    blue:   "from-blue-600/20 to-blue-600/5 text-blue-300",
    indigo: "from-indigo-600/20 to-indigo-600/5 text-indigo-300",
    purple: "from-purple-600/20 to-purple-600/5 text-purple-300",
    green:  "from-emerald-600/20 to-emerald-600/5 text-emerald-300",
  };
  return (
    <div className={`rounded-xl bg-gradient-to-b p-4 border border-amber-100 ${colorMap[color]}`}>
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab({ reviews = [] }) {
  if (!reviews.length) return <EmptySection label="No reviews yet." />;

  const avgRating = (reviews.reduce((a, r) => a + parseFloat(r.rating), 0) / reviews.length).toFixed(1);

  return (
    <div>
      {/* Rating summary */}
      <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="text-center">
          <p className="text-6xl font-display font-bold text-[var(--text-primary)]">{avgRating}</p>
          <div className="flex justify-center gap-0.5 mt-2">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={18} className={s <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-amber-100"} />
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">{reviews.length} reviews</p>
        </div>
        <div className="flex-1 w-full space-y-2">
          {["infrastructure", "faculty", "placement"].map((cat) => {
            const avg = reviews.reduce((a, r) => a + parseFloat(r[`${cat}_rating`] || 0), 0) / reviews.length;
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)] w-24 capitalize">{cat}</span>
                <div className="flex-1 h-1.5 rounded-full bg-amber-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                    style={{ width: `${(avg / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-brand-800 w-8">{avg.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="card-hover p-5 hover:scale-[1.01]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">{review.reviewer_name}</p>
                {review.batch_year && (
                  <p className="text-xs text-[var(--text-muted)]">Batch of {review.batch_year}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={12} className={s <= Math.round(review.rating) ? "text-amber-400 fill-amber-400" : "text-amber-100"} />
                ))}
                <span className="text-xs font-bold text-amber-400 ml-1">{review.rating}</span>
              </div>
            </div>
            <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-2">{review.title}</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{review.body}</p>
            {(review.pros || review.cons) && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-100">
                {review.pros && (
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-400 uppercase mb-1">Pros</p>
                    <p className="text-xs text-[var(--text-secondary)]">{review.pros}</p>
                  </div>
                )}
                {review.cons && (
                  <div>
                    <p className="text-[10px] font-semibold text-red-400 uppercase mb-1">Cons</p>
                    <p className="text-xs text-[var(--text-secondary)]">{review.cons}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function EmptySection({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle size={32} className="text-[var(--text-muted)] mb-3" />
      <p className="text-[var(--text-muted)] text-sm">{label}</p>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={36} className="text-brand-400 animate-spin" />
    </div>
  );
}

function PageError({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle size={36} className="text-red-400" />
      <p className="text-[var(--text-muted)]">{message}</p>
      <Link to="/search" className="btn-primary">Browse Colleges</Link>
    </div>
  );
}
