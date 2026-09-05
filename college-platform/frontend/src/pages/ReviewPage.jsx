import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AlertCircle, Loader2, MessageSquare, Sparkles, ExternalLink, GitCompare, Search } from "lucide-react";
import { collegesAPI } from "../api/axios";

export default function ReviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("college") || "");
  const [college, setCollege] = useState(null);
  const [aiReviews, setAiReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
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
    setAiReviews([]);
    try {
      const { data } = await collegesAPI.searchAI(trimmed);
      if (data.success) {
        const foundCollege = data.data.college;
        setCollege(foundCollege);
        setSearchParams({ college: trimmed }, { replace: true });

        if (!foundCollege.reviews || foundCollege.reviews.length === 0) {
          fetchAiReviews(foundCollege.name);
        }
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

  const fetchAiReviews = async (collegeName) => {
    setReviewsLoading(true);
    try {
      const { data } = await collegesAPI.reviewsAI(collegeName);
      if (data.success && data.data.reviews) {
        // Map AI format to match DB format for UI consistency
        const formatted = data.data.reviews.map((r, i) => ({
          id: `ai-${i}`,
          title: r.title || "Review",
          reviewer_name: "CampusIQ Research",
          rating: r.rating || (data.data.sentiment === "positive" ? 4.5 : 3.5),
          body: r.body
        }));
        setAiReviews(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch AI reviews", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const reviews = college?.reviews?.length > 0 ? college.reviews : aiReviews;

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
          <div className="flex justify-center">
            <div className="w-full max-w-4xl card p-8 shadow-xl border-t-4 border-t-pink-500">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 text-center md:text-left border-b border-pink-100 pb-6">
                <div className="w-full">
                  <h2 className="font-display text-4xl font-bold text-[var(--text-primary)]">{college.name}</h2>
                  <p className="text-md font-medium text-[var(--text-muted)] mt-2">
                    📍 {college.location}, {college.state}
                  </p>
                </div>
                <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                  {college.website && (
                    <a href={college.website} target="_blank" rel="noreferrer" className="btn-secondary text-sm px-5 py-2.5 font-bold shadow-sm">
                      Website <ExternalLink size={14} className="ml-1" />
                    </a>
                  )}
                  {college.id && (
                    <Link to={`/compare?ids=${college.id}`} className="btn-secondary text-sm px-5 py-2.5 font-bold shadow-sm">
                      <GitCompare size={14} className="ml-1" /> Compare
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-pink-500" /> College Overview
                  </h3>
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-line font-medium bg-pink-50/50 p-5 rounded-2xl border border-pink-100">
                    {college.overview || "No review summary returned yet."}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-pink-500" /> Review Summaries
                  </h3>
                  {reviewsLoading ? (
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-600 py-4 bg-brand-50 p-4 rounded-xl">
                      <Loader2 size={16} className="animate-spin" /> Fetching latest reviews...
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="rounded-2xl border-2 border-amber-100 bg-amber-50/80 p-6 shadow-sm transition-transform hover:scale-[1.01]">
                          <div className="flex items-center justify-between gap-3 border-b border-amber-200/50 pb-3 mb-3">
                            <div>
                               <p className="text-lg font-bold text-amber-950">{review.title}</p>
                              <p className="text-sm font-semibold text-amber-700/80 mt-1">{review.reviewer_name}</p>
                            </div>
                            <span className="text-lg font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-full shadow-sm">⭐ {review.rating}</span>
                          </div>
                          <p className="text-base font-medium text-amber-900/90 leading-relaxed">{review.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/30 p-6 text-center font-semibold text-amber-700">
                      No separate review list was returned for this college, but the profile above is ready to use.
                    </div>
                  )}
                </div>
              </div>
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
