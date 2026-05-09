import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import {
  FiSearch, FiRefreshCw, FiX, FiStar,
  FiTrash2, FiAlertCircle, FiUser, FiChevronLeft,
  FiChevronRight, FiMessageSquare,
} from "react-icons/fi";
import ErrorBanner from "../components/ErrorBanner.jsx";
import DeleteModal from "../components/DeleteModal.jsx";

const PAGE_SIZE = 10;


const Stars = ({ rating, size = "sm" }) => {
  const r = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={size === "sm" ? 12 : 15}
          className={s <= r ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </div>
  );
};


const RatingBadge = ({ rating }) => {
  const r = Number(rating) || 0;
  const cls =
    r >= 4 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
      r >= 3 ? "bg-amber-50 text-amber-600 border-amber-100" :
        "bg-red-50 text-red-500 border-red-100";
  return (
    <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      <FiStar size={9} className="fill-current" />
      {r.toFixed(1)}
    </span>
  );
};

const AdminFeedback = () => {
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);

  /* ── Fetch ── */
  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/reviews");
      setReviews(res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/reviews/${toDelete._id}`);
      setReviews((prev) => prev.filter((r) => r._id !== toDelete._id));
      setToDelete(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── Helpers ── */
  const getPatientName = (r) =>
    r?.patientId?.user?.username ||
    r?.patientId?.personalInfo?.fullName ||
    "Unknown Patient";

  const getDoctorName = (r) =>
    r?.doctorId?.userId?.username || "Unknown Doctor";

  const getDoctorSpec = (r) =>
    r?.doctorId?.specialization || "";

  /* ── Per-doctor averages ── */
  const doctorAverages = useMemo(() => {
    const map = {};
    reviews.forEach((r) => {
      const id = r?.doctorId?._id?.toString() || r?.doctorId?.toString();
      if (!id) return;
      if (!map[id]) map[id] = { name: getDoctorName(r), spec: getDoctorSpec(r), total: 0, count: 0 };
      map[id].total += r.rating || 0;
      map[id].count += 1;
    });
    return Object.entries(map)
      .map(([id, v]) => ({ id, ...v, avg: v.total / v.count }))
      .sort((a, b) => b.avg - a.avg);
  }, [reviews]);

  /* ── Filter + search ── */
  const filtered = useMemo(() => {
    let list = [...reviews];

    if (ratingFilter !== "All") {
      const r = Number(ratingFilter);
      list = list.filter((rev) => Math.round(rev.rating) === r);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((rev) => {
        const patient = getPatientName(rev).toLowerCase();
        const doctor = getDoctorName(rev).toLowerCase();
        const comment = (rev.comment || "").toLowerCase();
        return [patient, doctor, comment].join(" ").includes(q);
      });
    }

    return list;
  }, [reviews, ratingFilter, search]);

  /* ── Pagination ── */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  /* ── Summary ── */
  const avgOverall = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  const hasActiveFilters = search || ratingFilter !== "All";

  return (
    <div className="max-w-7xl mx-auto px-4 max-sm:px-0 py-6">

      {/* ── Header ── */}
      <div className="flex max-[400px]:flex-col justify-between max-[400px]:justify-center items-center  mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Feedback Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${filtered.length} review${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <ErrorBanner error={error} />}

      {/* ── Summary pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 max-[400px]:grid-cols-1 gap-3 mb-5">
        {[
          { label: "Total Reviews", value: reviews.length, color: "text-[#274760]", bg: "bg-[#274760]/10" },
          { label: "Overall Rating", value: avgOverall, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "5★ Reviews", value: reviews.filter((r) => Math.round(r.rating) === 5).length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Low Rated (≤2)", value: reviews.filter((r) => Math.round(r.rating) <= 2).length, color: "text-red-500", bg: "bg-red-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
              <FiStar size={16} className="fill-current" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Doctor averages strip ── */}
      {!loading && doctorAverages.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-1">
            Average Rating per Doctor
          </p>
          <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {doctorAverages.map((d) => (
              <div
                key={d.id}
                onClick={() => { setSearch(d.name); resetPage(); }}
                className="shrink-0 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 cursor-pointer hover:border-[#274760]/30 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#274760]/10 flex items-center justify-center shrink-0">
                  <FiUser size={13} className="text-[#274760]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 whitespace-nowrap">Dr. {d.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Stars rating={d.avg} />
                    <span className="text-[10px] text-slate-400 font-mono">{d.avg.toFixed(1)} ({d.count})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 flex-1">
            <FiSearch size={14} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search patient, doctor or comment…"
              className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0"
            />
            {search && (
              <button onClick={() => { setSearch(""); resetPage(); }}>
                <FiX size={13} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Rating filter */}
          <div className="flex gap-1.5 max-sm:gap-1 bg-slate-100 rounded-xl p-1  shrink-0">
            {["All", "5", "4", "3", "2", "1"].map((r) => (
              <button
                key={r}
                onClick={() => { setRatingFilter(r); resetPage(); }}
                className={`px-2.5 max-sm:px-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                                    ${ratingFilter === r
                    ? "bg-white text-[#274760] shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                {r === "All" ? "All" : `${r}★`}
              </button>
            ))}
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(""); setRatingFilter("All"); resetPage(); }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
            >
              <FiX size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table — desktop ── */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {["Patient", "Doctor", "Rating", "Comment", "Date", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3.5 bg-slate-100 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <FiMessageSquare size={20} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">No reviews found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : paginated.map((rev) => (
              <tr key={rev._id} className="hover:bg-slate-50/60 transition-colors">

                {/* Patient */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FiUser size={12} className="text-blue-500" />
                    </div>
                    <span className="font-medium text-slate-700 truncate max-w-30">
                      {getPatientName(rev)}
                    </span>
                  </div>
                </td>

                {/* Doctor */}
                <td className="px-4 py-3">
                  <p className="text-slate-700 font-medium truncate max-w-30">
                    Dr. {getDoctorName(rev)}
                  </p>
                  {getDoctorSpec(rev) && (
                    <p className="text-[11px] text-slate-400">{getDoctorSpec(rev)}</p>
                  )}
                </td>

                {/* Rating */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Stars rating={rev.rating} />
                    <RatingBadge rating={rev.rating} />
                  </div>
                </td>

                {/* Comment */}
                <td className="px-4 py-3 max-w-55">
                  {rev.comment ? (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  ) : (
                    <span className="text-xs text-slate-300 italic">No comment</span>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                  {new Date(rev.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </td>

                {/* Action */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => setToDelete(rev)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    <FiTrash2 size={11} /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Cards — mobile ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse space-y-2">
              <div className="h-4 bg-slate-100 rounded w-40" />
              <div className="h-3 bg-slate-100 rounded w-28" />
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))
        ) : paginated.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 flex flex-col items-center gap-3 text-center">
            <FiMessageSquare size={24} className="text-slate-300" />
            <p className="text-sm font-bold text-slate-500">No reviews found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters</p>
          </div>
        ) : paginated.map((rev) => (
          <div key={rev._id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">

            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{getPatientName(rev)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dr. {getDoctorName(rev)}
                  {getDoctorSpec(rev) ? ` · ${getDoctorSpec(rev)}` : ""}
                </p>
              </div>
              <RatingBadge rating={rev.rating} />
            </div>

            {/* Stars */}
            <Stars rating={rev.rating} size="md" />

            {/* Comment */}
            {rev.comment && (
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-xl px-3 py-2 italic">
                "{rev.comment}"
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                {new Date(rev.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </span>
              <button
                onClick={() => setToDelete(rev)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 text-xs font-semibold hover:bg-red-100 transition-colors"
              >
                <FiTrash2 size={11} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-slate-400">
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft size={14} />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-colors
                                            ${page === p
                        ? "bg-[#274760] text-white border-[#274760]"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    {p}
                  </button>
                );
              }
              if (Math.abs(p - page) === 2) {
                return <span key={p} className="text-slate-300 text-xs px-1">…</span>;
              }
              return null;
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      <DeleteModal
        review={toDelete}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default AdminFeedback;