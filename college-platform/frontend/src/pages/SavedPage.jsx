
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark, Loader2, AlertCircle, MapPin, Star, TrendingUp,
  Trash2, ExternalLink, Search, BookmarkX,
} from "lucide-react";
import { savedItemsAPI } from "../api/axios";

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState(null);
  const [removing, setRemoving]    = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await savedItemsAPI.getAll();
        if (data.success) setSavedItems(data.data.savedItems);
      } catch {
        setError("Failed to load saved colleges.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (collegeId) => {
    setRemoving(collegeId);
    try {
      await savedItemsAPI.remove(collegeId);
      setSavedItems((prev) => prev.filter((s) => s.college_id !== collegeId));
    } catch {
      alert("Failed to remove. Please try again.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-gradient-to-r from-brand-950/30 to-transparent py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl text-[var(--text-primary)] flex items-center gap-3">
            <Bookmark className="text-brand-400" size={28} /> Saved Colleges
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {!loading && `${savedItems.length} college${savedItems.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={36} className="text-brand-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {!loading && savedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-5">
              <BookmarkX size={36} className="text-brand-400" />
            </div>
            <h2 className="font-display text-2xl text-[var(--text-primary)] mb-2">No saved colleges yet</h2>
            <p className="text-[var(--text-muted)] text-sm max-w-xs mb-6">
              Browse colleges and click the bookmark icon to save them here for easy access.
            </p>
            <Link to="/search" className="btn-primary">
              <Search size={15} /> Explore Colleges
            </Link>
          </div>
        )}

        {!loading && savedItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {savedItems.map(({ id, college, college_id, notes, createdAt }) => {
              if (!college) return null;
              const latestPlacement = college.placements?.[0];
              return (
                <div key={id} className="card-hover group relative animate-fsu">
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(college_id)}
                    disabled={removing === college_id}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 z-10"
                    title="Remove from saved"
                  >
                    {removing === college_id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Trash2 size={13} />
                    }
                  </button>

                  <div className="p-5">
                    {/* Type badge */}
                    <span className={`badge text-[10px] mb-3 ${
                      college.college_type === "government" ? "tag-govt" :
                      college.college_type === "central" ? "tag-central" :
                      college.college_type === "deemed" ? "tag-deemed" : "tag-private"
                    }`}>
                      {college.college_type?.charAt(0).toUpperCase() + college.college_type?.slice(1)}
                    </span>

                    <Link to={`/college/${college.id}`} className="block mb-1">
                      <h3 className="font-semibold text-sm text-[var(--text-primary)] hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
                        {college.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs mb-3">
                      <MapPin size={11} />
                      <span>{college.location}, {college.state}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={11} className={s <= Math.round(parseFloat(college.rating)) ? "text-amber-400 fill-amber-400" : "text-white/10"} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-400">{parseFloat(college.rating).toFixed(1)}</span>
                    </div>

                    {/* Placement quick stat */}
                    {latestPlacement && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/3 border border-white/5 mb-4">
                        <TrendingUp size={14} className="text-emerald-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[var(--text-muted)]">Avg CTC ({latestPlacement.year})</p>
                          <p className="text-sm font-bold text-emerald-400">{latestPlacement.average_ctc} LPA</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-[var(--text-muted)]">Placed</p>
                          <p className="text-xs font-bold text-[var(--text-primary)]">{latestPlacement.placement_percentage}%</p>
                        </div>
                      </div>
                    )}

                    {notes && (
                      <p className="text-xs text-[var(--text-muted)] italic border-t border-white/5 pt-3 mb-4">
                        📝 {notes}
                      </p>
                    )}

                    <p className="text-[10px] text-[var(--text-muted)] mb-3">
                      Saved {new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>

                    <Link
                      to={`/college/${college.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold
                                 bg-brand-600/15 text-brand-300 border border-brand-500/20 hover:bg-brand-600/25 transition-all"
                    >
                      View Details <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
