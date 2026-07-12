

import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  GitCompare, Plus, X, Star, MapPin, TrendingUp, BookOpen,
  Award, Building2, Loader2, AlertCircle, Trophy,
  DollarSign, BarChart2, Users, ChevronRight, Search,
} from "lucide-react";
import { collegesAPI } from "../api/axios";

const formatINR = (n) => {
  if (!n) return "—";
  const v = parseFloat(n);
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
};

const COMPARE_ROWS = [
  { key: "location",       label: "Location",         icon: MapPin,      render: (c) => `${c.location}, ${c.state}` },
  { key: "college_type",   label: "Type",             icon: Building2,   render: (c) => c.college_type?.charAt(0).toUpperCase() + c.college_type?.slice(1) },
  { key: "established_year", label: "Established",   icon: Award,       render: (c) => c.established_year || "—" },
  { key: "naac_grade",     label: "NAAC Grade",       icon: Award,       render: (c) => c.naac_grade || "—" },
  { key: "nirf_rank",      label: "NIRF Rank",        icon: Trophy,      render: (c) => c.nirf_rank ? `#${c.nirf_rank}` : "—" },
  { key: "rating",         label: "Rating",           icon: Star,        render: (c) => `${parseFloat(c.rating).toFixed(1)} / 5.0`, highlight: true },
  { key: "total_intake",   label: "Total Intake",     icon: Users,       render: (c) => c.total_intake ? `${c.total_intake.toLocaleString()} seats` : "—" },
  { key: "min_fee",        label: "Min Course Fee",   icon: DollarSign,  render: (c) => {
    const fees = c.courses?.map((x) => parseFloat(x.fees)).filter(Boolean);
    return fees?.length ? formatINR(Math.min(...fees)) : "—";
  }, highlight: true },
  { key: "avg_ctc",        label: "Avg CTC",          icon: TrendingUp,  render: (c) => c.placements?.[0]?.average_ctc ? `${c.placements[0].average_ctc} LPA` : "—", highlight: true },
  { key: "highest_ctc",    label: "Highest CTC",      icon: TrendingUp,  render: (c) => c.placements?.[0]?.highest_ctc ? `${c.placements[0].highest_ctc} Cr` : "—" },
  { key: "placement_pct",  label: "Placement %",      icon: BarChart2,   render: (c) => c.placements?.[0]?.placement_percentage ? `${c.placements[0].placement_percentage}%` : "—", highlight: true },
  { key: "top_recruiters", label: "Top Recruiters",   icon: Users,       render: (c) => {
    const recs = c.placements?.[0]?.top_recruiters;
    if (!recs?.length) return "—";
    return recs.slice(0, 3).join(", ") + (recs.length > 3 ? ` +${recs.length - 3}` : "");
  }},
  { key: "courses_count",  label: "Courses Offered",  icon: BookOpen,    render: (c) => c.courses?.length ? `${c.courses.length} courses` : "—" },
];

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [searchId, setSearchId] = useState("");
  const [adding, setAdding]     = useState(false);
  const [addError, setAddError] = useState("");
  const [aiCompare, setAiCompare] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const idsParam = searchParams.get("ids") || "";
  const idList   = idsParam.split(",").map((x) => parseInt(x)).filter((x) => !isNaN(x) && x > 0);

  // Load colleges from URL
  useEffect(() => {
    if (!idList.length) { setColleges([]); return; }
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } =
          idList.length === 1
            ? await collegesAPI.getById(idList[0])
            : await collegesAPI.compare(idList);
        if (data.success) {
          setColleges(idList.length === 1 ? [data.data.college] : data.data.colleges);
        }
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load comparison data.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [idsParam]); // eslint-disable-line

  const updateURL = (ids) => {
    if (!ids.length) navigate("/compare");
    else navigate(`/compare?ids=${ids.join(",")}`);
  };

  const handleRemove = (id) => {
    updateURL(idList.filter((x) => x !== id));
  };

  const handleAdd = async () => {
    const query = searchId.trim();
    if (!query) { setAddError("Enter a college name, website URL, or ID."); return; }
    if (idList.length >= 3)   { setAddError("Maximum 3 colleges allowed."); return; }
    setAddError("");
    setAdding(true);
    try {
      let id = parseInt(query, 10);
      if (!/^\d+$/.test(query)) {
        const { data } = await collegesAPI.searchAI(query);
        if (!data.success) throw new Error("College lookup failed");
        id = data.data.college.id;
      } else {
        await collegesAPI.getById(id);
      }

      if (idList.includes(id))  { setAddError("College already in compare list."); return; }
      updateURL([...idList, id]);
      setSearchId("");
    } catch {
      setAddError("College not found. Try the official college website URL.");
    } finally {
      setAdding(false);
    }
  };

  const handleAiCompare = async () => {
    if (colleges.length < 2) return;
    setAiLoading(true);
    setAiCompare(null);
    try {
      const { data } = await collegesAPI.compareAI(colleges[0].name, colleges[1].name);
      setAiCompare(data.data);
    } catch {
      setAiCompare({
        summary: "AI comparison is unavailable right now. The table below is still usable.",
        categories: [],
      });
    } finally {
      setAiLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-amber-200/70 bg-gradient-to-br from-white via-brand-50 to-amber-100/60 py-9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl text-[var(--text-primary)] flex items-center gap-3">
                <GitCompare className="text-brand-400" size={28} /> Compare Colleges
              </h1>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                Compare up to 3 colleges using saved records or fresh lookups
              </p>
            </div>

            {/* Add college by name, URL, or ID */}
            {colleges.length < 3 && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Name, website URL, or ID..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="input-field w-72 max-w-full text-sm"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={adding || !searchId}
                    className="btn-primary text-sm"
                  >
                    {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add
                  </button>
                  <Link to="/search" className="btn-secondary text-sm">
                    <Search size={14} /> Browse
                  </Link>
                </div>
                {addError && <p className="text-xs text-red-400">{addError}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={36} className="text-brand-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
            <AlertCircle size={18} /><span className="text-sm">{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && colleges.length === 0 && (
          <EmptyCompare />
        )}

        {/* Comparison Table */}
        {!loading && colleges.length >= 1 && (
          <div className="overflow-x-auto">
            {colleges.length >= 2 && (
              <div className="card p-4 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">AI structured comparison</h2>
                    <p className="text-xs text-[var(--text-muted)]">Compares the first two selected colleges.</p>
                  </div>
                  <button type="button" onClick={handleAiCompare} disabled={aiLoading} className="btn-primary text-sm">
                    {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <GitCompare size={14} />}
                    {aiLoading ? "Comparing..." : "Generate AI Compare"}
                  </button>
                </div>

                {aiLoading && (
                  <div className="flex items-center gap-2 py-4 text-sm text-[var(--text-muted)]">
                    <Loader2 size={16} className="animate-spin text-brand-400" />
                    AI is preparing a practical comparison...
                  </div>
                )}

                {aiCompare && !aiLoading && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-[var(--text-secondary)]">{aiCompare.summary}</p>
                    {(aiCompare.categories || []).map((row) => (
                      <div key={row.label} className="grid md:grid-cols-3 gap-3 border border-amber-100 rounded-lg p-3 text-sm">
                        <strong>{row.label}</strong>
                        <span>{row.college1}</span>
                        <span>{row.college2}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  {/* Row label header */}
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] w-44 sticky left-0 bg-[var(--bg-primary)] z-10">
                    Parameter
                  </th>

                  {/* College headers */}
                  {colleges.map((c) => (
                    <th key={c.id} className="p-4 min-w-[220px]">
                      <div className="card p-4 text-center relative">
                        <button
                          onClick={() => handleRemove(c.id)}
                          className="absolute top-2 right-2 p-1 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Remove"
                        >
                          <X size={13} />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600/30 to-accent-600/20 flex items-center justify-center mx-auto mb-2">
                          <Building2 size={18} className="text-brand-300" />
                        </div>
                        <Link
                          to={`/college/${c.id}`}
                          className="font-semibold text-sm text-[var(--text-primary)] hover:text-brand-300 transition-colors leading-tight block"
                        >
                          {c.name}
                        </Link>
                        <div className="flex items-center justify-center gap-1 mt-1.5">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-amber-400">{parseFloat(c.rating).toFixed(1)}</span>
                        </div>
                      </div>
                    </th>
                  ))}

                  {/* Empty slot(s) */}
                  {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-4 min-w-[220px]">
                      <Link to="/search">
                        <div className="card p-4 text-center border-dashed opacity-40 hover:opacity-70 transition-opacity h-full flex flex-col items-center justify-center gap-2 min-h-[100px]">
                          <Plus size={22} className="text-brand-400" />
                          <span className="text-xs text-[var(--text-muted)]">Add College</span>
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {COMPARE_ROWS.map((row, rowIdx) => {
                  const values = colleges.map((c) => row.render(c));

                  return (
                    <tr
                      key={row.key}
                      className={rowIdx % 2 === 0 ? "bg-white/[0.015]" : ""}
                    >
                      {/* Row label */}
                      <td className="p-4 sticky left-0 bg-[var(--bg-primary)] z-10" style={{ background: rowIdx % 2 === 0 ? "rgba(255,255,255,0.015)" : "var(--bg-primary)" }}>
                        <div className="flex items-center gap-2">
                          <row.icon size={13} className="text-brand-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-[var(--text-muted)]">{row.label}</span>
                        </div>
                      </td>

                      {/* College values */}
                      {colleges.map((c, ci) => {
                        const val = values[ci];
                        // Highlight best value for numeric highlight rows
                        const isBest = row.highlight && colleges.length > 1 && val === getBestValue(values, row.key);

                        return (
                          <td key={c.id} className="p-4 text-center">
                            <span className={`text-sm ${
                              isBest
                                ? "font-bold text-emerald-400"
                                : "font-medium text-[var(--text-primary)]"
                            }`}>
                              {val}
                            </span>
                            {isBest && (
                              <span className="ml-1 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                                Best
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Empty slots */}
                      {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, i) => (
                        <td key={i} className="p-4" />
                      ))}
                    </tr>
                  );
                })}

                {/* CTA row */}
                <tr>
                  <td className="p-4 sticky left-0 bg-[var(--bg-primary)] z-10" />
                  {colleges.map((c) => (
                    <td key={c.id} className="p-4 text-center">
                      <Link
                        to={`/college/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600/20 text-brand-300 border border-brand-500/20 hover:bg-brand-600/30 transition-all"
                      >
                        View Details <ChevronRight size={12} />
                      </Link>
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - colleges.length) }).map((_, i) => (
                    <td key={i} />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBestValue(values, key) {
  // For ratings and CTC-type fields, higher = better
  const numericVals = values.map((v) => {
    const n = parseFloat((v || "").toString().replace(/[^\d.]/g, ""));
    return isNaN(n) ? -Infinity : n;
  });
  const max = Math.max(...numericVals);
  if (max === -Infinity) return null;
  // For fee, lower is better
  if (key === "min_fee") {
    const min = Math.min(...numericVals.filter((n) => n !== -Infinity && n > 0));
    return values[numericVals.indexOf(min)];
  }
  return values[numericVals.indexOf(max)];
}

function EmptyCompare() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-5">
        <GitCompare size={36} className="text-brand-400" />
      </div>
      <h2 className="font-display text-2xl text-[var(--text-primary)] mb-2">No colleges selected</h2>
      <p className="text-[var(--text-muted)] text-sm max-w-sm mb-6">
        Browse colleges and use the <strong className="text-brand-400">Compare</strong> toggle on any card,
        or enter a College ID above.
      </p>
      <Link to="/search" className="btn-primary">
        <Search size={15} /> Browse Colleges
      </Link>
    </div>
  );
}
