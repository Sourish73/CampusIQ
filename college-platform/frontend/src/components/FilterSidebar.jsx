/**
 * src/components/FilterSidebar.jsx
 * Reactive filter panel for the college search page.
 * Manages: text search, location/state dropdowns, college type, fee range, rating.
 */

import { useState, useEffect } from "react";
import {
  Search, MapPin, Building2, DollarSign, Star,
  SlidersHorizontal, RotateCcw, ChevronDown,
} from "lucide-react";
import { collegesAPI } from "../api/axios";

const COLLEGE_TYPES = [
  { value: "", label: "All Types" },
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
  { value: "deemed", label: "Deemed" },
  { value: "central", label: "Central" },
];

const FEE_RANGES = [
  { label: "Any", min: "", max: "" },
  { label: "Under ₹1L", min: 0, max: 100000 },
  { label: "₹1L – ₹5L", min: 100000, max: 500000 },
  { label: "₹5L – ₹15L", min: 500000, max: 1500000 },
  { label: "₹15L – ₹30L", min: 1500000, max: 3000000 },
  { label: "Above ₹30L", min: 3000000, max: "" },
];

const RATINGS = [
  { label: "Any", value: "" },
  { label: "4+ Stars", value: 4 },
  { label: "3.5+ Stars", value: 3.5 },
  { label: "3+ Stars", value: 3 },
];

const DEFAULT_FILTERS = {
  search: "",
  state: "",
  type: "",
  minFee: "",
  maxFee: "",
  minRating: "",
};

export default function FilterSidebar({ onFiltersChange }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [states] = useState([
    "Tamil Nadu",
    "Maharashtra",
    "Karnataka",
    "Delhi",
    "Telangana",
    "Uttar Pradesh",
    "West Bengal",
    "Gujarat",
    "Rajasthan",
    "Kerala",
    "Andhra Pradesh",
    "Madhya Pradesh",
    "Punjab",
    "Haryana",
    "Odisha",
    "Bihar",
    "Assam"
  ]);
  const [feeRangeIdx, setFeeRangeIdx] = useState(0);
  const [collapsed, setCollapsed] = useState({});

  // Debounced emit on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(filters);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]); // eslint-disable-line

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const applyFeeRange = (idx) => {
    const range = FEE_RANGES[idx];
    setFeeRangeIdx(idx);
    setFilters((prev) => ({ ...prev, minFee: range.min, maxFee: range.max }));
  };

  const resetAll = () => {
    setFilters(DEFAULT_FILTERS);
    setFeeRangeIdx(0);
  };

  const toggle = (key) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  const hasActiveFilters =
    filters.search || filters.state || filters.type ||
    filters.minFee !== "" || filters.maxFee !== "" || filters.minRating;

  return (
    <aside className="card h-fit sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-brand-700" />
          <span className="font-semibold text-sm text-[var(--text-primary)]">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-brand-800 transition-colors"
          >
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">

        {/* ── Search ─────────────────────────────────────────────────────── */}
        <FilterSection title="Search" icon={Search} collapsed={collapsed.search} onToggle={() => toggle("search")}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="College or city name..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="input-field pl-9 text-sm"
            />
          </div>
        </FilterSection>

        {/* ── State ──────────────────────────────────────────────────────── */}
        <FilterSection title="State" icon={MapPin} collapsed={collapsed.state} onToggle={() => toggle("state")}>
          <div className="relative">
            <select
              value={filters.state}
              onChange={(e) => updateFilter("state", e.target.value)}
              className="input-field text-sm appearance-none pr-8"
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </FilterSection>

        {/* ── College Type ───────────────────────────────────────────────── */}
        <FilterSection title="College Type" icon={Building2} collapsed={collapsed.type} onToggle={() => toggle("type")}>
          <div className="flex flex-col gap-2">
            {COLLEGE_TYPES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    filters.type === value
                      ? "border-brand-500 bg-brand-500"
                      : "border-amber-200 group-hover:border-brand-500"
                  }`}
                  onClick={() => updateFilter("type", value)}
                >
                  {filters.type === value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className={`text-sm transition-colors cursor-pointer ${
                    filters.type === value ? "text-brand-800" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                  }`}
                  onClick={() => updateFilter("type", value)}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* ── Fee Range ──────────────────────────────────────────────────── */}
        <FilterSection title="Fee Range" icon={DollarSign} collapsed={collapsed.fee} onToggle={() => toggle("fee")}>
          <div className="flex flex-col gap-2">
            {FEE_RANGES.map(({ label }, idx) => (
              <button
                key={idx}
                onClick={() => applyFeeRange(idx)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  feeRangeIdx === idx
                    ? "bg-brand-100 text-brand-800 border border-brand-300"
                    : "text-[var(--text-secondary)] hover:bg-amber-50 hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* ── Minimum Rating ─────────────────────────────────────────────── */}
        <FilterSection title="Minimum Rating" icon={Star} collapsed={collapsed.rating} onToggle={() => toggle("rating")}>
          <div className="flex flex-col gap-2">
            {RATINGS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => updateFilter("minRating", value)}
                className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.minRating === value
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "text-[var(--text-secondary)] hover:bg-amber-50 hover:text-[var(--text-primary)]"
                }`}
              >
                {value !== "" && <Star size={13} className="text-amber-400 fill-amber-400" />}
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

      </div>
    </aside>
  );
}

// ─── Collapsible Filter Section ───────────────────────────────────────────────
function FilterSection({ title, icon: Icon, children, collapsed, onToggle }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-brand-700" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
            {title}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-[var(--text-muted)] transition-transform ${collapsed ? "-rotate-90" : ""}`}
        />
      </button>
      {!collapsed && <div className="animate-fade-in">{children}</div>}
    </div>
  );
}
