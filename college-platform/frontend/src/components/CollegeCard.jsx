/**
 * src/components/CollegeCard.jsx
 * Presentation card for a single college result.
 * Props: college, onCompare, isInCompare, onSave, isSaved
 */

import { Link } from "react-router-dom";
import {
  MapPin, Star, TrendingUp, BookOpen, Plus, Check,
  Bookmark, BookmarkCheck, ExternalLink, Award, Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TYPE_STYLES = {
  government: "tag-govt",
  private: "tag-private",
  deemed: "tag-deemed",
  central: "tag-central",
};

const formatFees = (fees) => {
  if (!fees) return "N/A";
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`;
  return `₹${fees.toLocaleString("en-IN")}`;
};

const formatCTC = (ctc) => {
  if (!ctc) return "N/A";
  return `${ctc} LPA`;
};

export default function CollegeCard({ college, onCompare, isInCompare, onSave, isSaved }) {
  const { isAuthenticated } = useAuth();

  // Latest placement record
  const latestPlacement = college.placements?.[0] || null;

  // Cheapest course fee
  const minFee = college.courses?.length
    ? Math.min(...college.courses.map((c) => parseFloat(c.fees) || 0))
    : null;

  return (
    <article className="card-hover group overflow-hidden animate-fsu">
      {/* ── Top strip: Type badge + actions ──────────────────────────────── */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="flex items-center gap-2">
          <span className={TYPE_STYLES[college.college_type] || "tag-private"}>
            <Building2 size={10} />
            {college.college_type?.charAt(0).toUpperCase() + college.college_type?.slice(1)}
          </span>
          {college.naac_grade && (
            <span className="badge bg-sky-500/15 text-sky-700">
              <Award size={10} /> NAAC {college.naac_grade}
            </span>
          )}
          {college.nirf_rank && (
            <span className="badge bg-rose-500/10 text-rose-700">
              #{college.nirf_rank} NIRF
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Compare toggle */}
          <button
            onClick={() => onCompare?.(college)}
            title={isInCompare ? "Remove from compare" : "Add to compare"}
            className={`p-1.5 rounded-lg transition-all text-xs font-medium flex items-center gap-1 ${
              isInCompare
                ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                : "bg-brand-50 text-[var(--text-muted)] hover:text-brand-800 hover:bg-brand-100 border border-transparent"
            }`}
          >
            {isInCompare ? <Check size={12} /> : <Plus size={12} />}
            <span className="hidden sm:inline">{isInCompare ? "Added" : "Compare"}</span>
          </button>

          {/* Save toggle */}
          {isAuthenticated && (
            <button
              onClick={() => onSave?.(college)}
              title={isSaved ? "Remove from saved" : "Save college"}
              className={`p-1.5 rounded-lg transition-all ${
                isSaved
                  ? "text-brand-400 bg-brand-500/10"
                  : "text-[var(--text-muted)] hover:text-brand-800 hover:bg-brand-100"
              }`}
            >
              {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* ── College identity ──────────────────────────────────────────────── */}
      <div className="p-4">
        <Link to={`/college/${college.id}`} className="group/link block mb-1">
          <h3 className="font-semibold text-base text-[var(--text-primary)] group-hover/link:text-brand-300 transition-colors leading-tight line-clamp-2">
            {college.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-[var(--text-muted)] text-sm mb-3">
          <MapPin size={12} />
          <span>{college.location}, {college.state}</span>
        </div>

        {/* Rating bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={12}
                className={
                  s <= Math.round(parseFloat(college.rating))
                    ? "text-amber-400 fill-amber-400"
                    : "text-amber-100 fill-amber-100"
                }
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-amber-400">{parseFloat(college.rating).toFixed(1)}</span>
          <span className="text-xs text-[var(--text-muted)]">/ 5.0</span>
        </div>

        {/* ── Key stats row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatPill
            icon={BookOpen}
            label="Min Fee"
            value={minFee ? formatFees(minFee) : "—"}
            color="blue"
          />
          <StatPill
            icon={TrendingUp}
            label="Avg CTC"
            value={formatCTC(latestPlacement?.average_ctc)}
            color="green"
          />
          <StatPill
            icon={TrendingUp}
            label="Placement"
            value={latestPlacement?.placement_percentage ? `${latestPlacement.placement_percentage}%` : "—"}
            color="purple"
          />
        </div>

        {/* ── Courses preview ───────────────────────────────────────────── */}
        {college.courses?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {college.courses.slice(0, 3).map((course) => (
              <span
                key={course.id}
                className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-[var(--text-muted)] border border-amber-100"
              >
                {course.degree_type} · {course.name.length > 25 ? course.name.slice(0, 25) + "…" : course.name}
              </span>
            ))}
            {college.courses.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400">
                +{college.courses.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <Link
          to={`/college/${college.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold
                     bg-brand-50 text-brand-800 border border-brand-200
                     hover:bg-brand-100 hover:border-brand-400 transition-all duration-200"
        >
          View Details <ExternalLink size={13} />
        </Link>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <Link
            to={`/reviews?college=${encodeURIComponent(college.name)}`}
            className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-white text-[var(--text-secondary)] border border-amber-200 hover:text-[var(--text-primary)] hover:border-brand-400 transition-all"
          >
            Reviews
          </Link>
          {college.website ? (
            <a
              href={college.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-white text-[var(--text-secondary)] border border-amber-200 hover:text-[var(--text-primary)] hover:border-brand-400 transition-all"
            >
              Website <ExternalLink size={12} />
            </a>
          ) : (
            <span className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-white text-[var(--text-muted)] border border-amber-100">
              No website
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Mini Stat Pill ───────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-emerald-400 bg-emerald-500/10",
    purple: "text-violet-700 bg-violet-500/10",
  };

  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-50/70 border border-amber-100">
      <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>
        <Icon size={11} />
      </div>
      <span className="text-[10px] font-bold text-[var(--text-primary)] leading-none">{value}</span>
      <span className="text-[9px] text-[var(--text-muted)] leading-none">{label}</span>
    </div>
  );
}
