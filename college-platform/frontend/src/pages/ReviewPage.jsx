import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AlertCircle, Loader2, MessageSquare, Sparkles, ExternalLink, GitCompare, Search } from "lucide-react";
import { collegesAPI } from "../api/axios";

export default function ReviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("college") || "");
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const seed = searchParams.get("college");
    if (seed) {
      setQuery(seed);
      fetchCollege(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCollege = async (name = query) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      const { data } = await collegesAPI.searchAI(trimmed);
      if (data.success) {
        setCollege(data.data.college);
        setSearchParams({ college: trimmed }, { replace: true });
      } else {
        setCollege(null);
        setError(data.message || "Could not load review data.");
      }
    } catch (err) {
      setCollege(null);
      setError(err.response?.data?.message || "Could not load review data.");
    } finally {
      setLoading(false);
    }
  };

  const reviews = college?.reviews || [];

  return (
    <div className="min-h-screen bg-pink-100/10">
      <section className="border-b border-pink-200/70 bg-gradient-to-br from-pink-50/70 via-pink-100/40 to-rose-200/30 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-200 text-pink-900 text-xs font-semibold shadow-sm">
              <MessageSquare size={12} /> College Reviews
            </div>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-md transition-all">
              ← Back to Home Page
            </Link>
          </div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] mb-3">
            Read a <span className="gradient-text">smart review</span> before deciding
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Search any college name or official website and get the latest profile with review summaries, placements, and website access.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-700" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    fetchCollege();
                  }
                }}
                className="input-field pl-11 bg-white"
                placeholder="Search IIT Bombay, VIT, SRM, AIIMS, or a website URL"
              />
            </div>
            <button onClick={() => fetchCollege()} className="btn-primary px-5 py-3">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? "Loading..." : "Fetch Review"}
            </button>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-500">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-brand-700" />
          </div>
        )}

        {!loading && college && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl text-[var(--text-primary)]">{college.name}</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {college.location}, {college.state}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {college.website && (
                    <a href={college.website} target="_blank" rel="noreferrer" className="btn-secondary text-xs px-3 py-2">
                      Website <ExternalLink size={12} />
                    </a>
                  )}
                  {college.id && (
                    <Link to={`/compare?ids=${college.id}`} className="btn-secondary text-xs px-3 py-2">
                      <GitCompare size={12} /> Compare
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {college.overview || "No review summary returned yet."}
                </p>

                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-3">Review summaries</h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div key={review.id} className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[var(--text-primary)]">{review.title}</p>
                              <p className="text-xs text-[var(--text-muted)]">{review.reviewer_name}</p>
                            </div>
                            <span className="text-xs font-semibold text-brand-800">⭐ {review.rating}</span>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{review.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-5 text-sm text-[var(--text-muted)]">
                      No separate review list was returned for this college, but the profile above is ready to use.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <InfoCard title="Quick Facts" items={[
                ["NIRF", college.nirf_rank ? `#${college.nirf_rank}` : "—"],
                ["NAAC", college.naac_grade || "—"],
                ["Type", college.college_type || "—"],
                ["Established", college.established_year || "—"],
              ]} />

              <InfoCard title="What to compare" items={[
                ["Placements", college.placements?.[0] ? `${college.placements[0].average_ctc || "—"} LPA` : "—"],
                ["Courses", college.courses?.length || 0],
                ["Website", college.website ? "Available" : "Missing"],
                ["Reviews", reviews.length || 0],
              ]} />
            </div>
          </div>
        )}

        {!loading && !college && !error && (
          <div className="card p-10 text-center">
            <MessageSquare size={34} className="mx-auto text-[var(--text-muted)] mb-3" />
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Search a college to see reviews</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Try IIT Bombay, VIT, SRM, AIIMS, or paste an official website.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, items }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-[var(--text-primary)] mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--text-muted)]">{label}</span>
            <span className="font-semibold text-[var(--text-primary)]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
