import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, GitCompare, Loader2, AlertCircle, ChevronLeft, ChevronRight, X, Sparkles, ExternalLink } from "lucide-react";
import CollegeCard from "../components/CollegeCard";
import { collegesAPI, savedItemsAPI } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const LIMIT = 9;

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const [colleges, setColleges] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [compareList, setCompareList] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  const [aiQuery, setAiQuery] = useState(searchParams.get("search") || "");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const fetchColleges = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, page, limit: LIMIT };
      delete params.search;
      Object.keys(params).forEach((k) => (params[k] === "" || params[k] === undefined) && delete params[k]);

      const { data } = await collegesAPI.getAll(params);
      if (data.success) {
        setColleges(data.data.colleges);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load colleges. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setCurrentPage(1);
    fetchColleges(1);
  }, [filters, fetchColleges]);

  useEffect(() => {
    fetchColleges(currentPage);
  }, [currentPage, fetchColleges]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedIds(new Set());
      return;
    }
    savedItemsAPI.getAll().then(({ data }) => {
      if (data.success) setSavedIds(new Set(data.data.savedItems.map((s) => s.college_id)));
    }).catch(() => {});
  }, [isAuthenticated]);

  const handleAiSearch = useCallback(async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setAiResult(null);
      setAiError(null);
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const { data } = await collegesAPI.searchAI(trimmed);
      if (data.success) {
        setAiResult({ ...data.data.college, source: data.source, message: data.message });
        if (data.data.college?.id) {
          fetchColleges(1);
        }
      } else {
        setAiResult(null);
        setAiError(data.message || "No matching college found. Try another name.");
      }
    } catch (err) {
      setAiResult(null);
      console.error("AI Search Error:", err);
      setAiError(err.response?.data?.message || err.message || "Could not find that college. Try a different name.");
    } finally {
      setAiLoading(false);
    }
  }, [fetchColleges]);

  useEffect(() => {
    if (!aiQuery.trim()) {
      setAiResult(null);
      setAiError(null);
    }
  }, [aiQuery]);

  const handleCompareToggle = (college) => {
    setCompareList((prev) => {
      const exists = prev.find((c) => c.id === college.id);
      if (exists) return prev.filter((c) => c.id !== college.id);
      if (prev.length >= 3) return prev;
      return [...prev, college];
    });
  };

  const handleSaveToggle = async (college) => {
    if (!isAuthenticated) return;
    try {
      if (savedIds.has(college.id)) {
        await savedItemsAPI.remove(college.id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(college.id);
          return next;
        });
      } else {
        await savedItemsAPI.add(college.id);
        setSavedIds((prev) => new Set(prev).add(college.id));
      }
    } catch (err) {
      console.error("Save toggle failed:", err);
    }
  };

  const renderSkeletons = () => Array.from({ length: LIMIT }).map((_, i) => (
    <div key={i} className="card p-5 space-y-3 animate-pulse">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-16" />
      <div className="skeleton h-9" />
    </div>
  ));

  return (
    <div className="min-h-screen">
      <div className="relative overflow-visible bg-gradient-to-br from-white via-brand-50 to-amber-100/70 border-b border-amber-200/70 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] mb-2 animate-fsu">
            Search any college or official website
          </h1>
          <p className="text-[var(--text-secondary)] text-sm md:text-base mb-6 animate-fsu animate-fsu-1">
            {pagination.total > 0
              ? `${pagination.total} institutions in your CampusIQ database.`
              : "Search the catalog or fetch a fresh college profile, then compare or save it."}
          </p>

          <div className="relative z-30 max-w-4xl animate-fsu animate-fsu-2">
            <p className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-1">
              <Sparkles size={12} className="text-brand-700" />
              Search your college instantly and fetch the latest profile
            </p>
            <div className="relative flex flex-col sm:flex-row gap-3 rounded-2xl border border-pink-200 bg-white/90 p-2 shadow-xl shadow-pink-900/10">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-700" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAiSearch(aiQuery);
                    }
                  }}
                  placeholder="Search IIT, VIT, SRM, AIIMS, or paste an official website..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleAiSearch(aiQuery)}
                disabled={aiLoading || !aiQuery.trim()}
                className="btn-primary justify-center text-sm px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {aiLoading ? "Searching..." : "Find College"}
              </button>
            </div>

            {aiError && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                <AlertCircle size={13} />
                {aiError}
              </div>
            )}

            {aiResult && (
              <div className="mt-5 p-5 rounded-2xl bg-white border border-brand-200 shadow-lg shadow-amber-900/10 animate-fsu">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-primary)] text-sm">{aiResult.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{aiResult.location}, {aiResult.state}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                      {aiResult.naac_grade && <span>NAAC: {aiResult.naac_grade}</span>}
                      {aiResult.nirf_rank && <span>NIRF: #{aiResult.nirf_rank}</span>}
                      {aiResult.rating && <span>⭐ {aiResult.rating}</span>}
                      {aiResult.website && (
                        <a href={aiResult.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-brand-800">
                          Website <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCompareToggle(aiResult)}
                      className="btn-secondary text-xs px-3 py-2"
                    >
                      <GitCompare size={13} /> Compare
                    </button>
                    <button
                      onClick={() => setAiResult(null)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {aiResult.id && (
                    <Link to={`/college/${aiResult.id}`} className="btn-primary text-xs inline-flex">
                      View Full Profile
                    </Link>
                  )}
                  {aiResult.website && (
                    <a href={aiResult.website} target="_blank" rel="noreferrer" className="btn-secondary text-xs inline-flex">
                      Official Website <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="flex-1 min-w-0">
          <div className="mb-5 text-sm text-[var(--text-muted)]">
            {pagination.total} colleges
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {renderSkeletons()}
            </div>
          ) : colleges.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {colleges.map((college, i) => (
                <div key={college.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <CollegeCard
                    college={college}
                    onCompare={handleCompareToggle}
                    isInCompare={compareList.some((c) => c.id === college.id)}
                    onSave={handleSaveToggle}
                    isSaved={savedIds.has(college.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
          )}
        </main>
      </div>

      {compareList.length > 0 && (
        <CompareBar
          compareList={compareList}
          onRemove={(id) => setCompareList((prev) => prev.filter((c) => c.id !== id))}
          onClear={() => setCompareList([])}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
        <Search size={28} className="text-brand-400" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No colleges found</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-xs">
        Try adjusting your filters or use the smart search above to fetch a fresh profile.
      </p>
    </div>
  );
}

function Pagination({ pagination, currentPage, onPageChange }) {
  const { totalPages, hasNextPage, hasPrevPage } = pagination;
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return start + i;
  }).filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
            p === currentPage
              ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30"
              : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function CompareBar({ compareList, onRemove, onClear }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-brand-500/20 py-3 px-6 animate-slide-up">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GitCompare size={16} className="text-brand-400" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {compareList.length} / 3 selected
          </span>
          <div className="flex items-center gap-2">
            {compareList.map((c) => (
              <span key={c.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-500/15 text-brand-300 text-xs">
                {c.name.split(" ").slice(0, 3).join(" ")}
                <button onClick={() => onRemove(c.id)} className="hover:text-red-400">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClear} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            Clear
          </button>
          {compareList.length >= 2 && (
            <Link to={`/compare?ids=${compareList.map((c) => c.id).join(",")}`} className="btn-primary text-sm">
              <GitCompare size={14} /> Compare Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
