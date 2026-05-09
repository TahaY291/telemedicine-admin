import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import {
  FiSearch, FiRefreshCw, FiX, FiUsers,
  FiCheckCircle, FiClock, FiSlash,
} from "react-icons/fi";
import ErrorBanner from "../components/ErrorBanner.jsx";
import DoctorCard from "../components/DoctorCard.jsx";
import DoctorDrawer from "../components/DoctorDrawer.jsx";

const FILTERS = ["All", "pending", "active", "blocked"];

const AdminDoctorManagement = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);


  /* ── Fetch all doctors ── */
  const fetchDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/doctors"); // adjust endpoint to yours
      setDoctors(res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { fetchDoctors(); }, []);


  const handleAction = async (doctorId, action) => {
    setActionLoading(true);
    setError("");
    try {
      if (action === "delete") {
        await api.delete(`/admin/doctors/${doctorId}`);
        setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
        setSelectedDoctor(null);
      } else {
        await api.patch(`/admin/doctors/${doctorId}/status`, { status: action });

        // ✅ Don't rely on response shape — just update the status locally
        setDoctors((prev) =>
          prev.map((d) =>
            d._id === doctorId
              ? { ...d, userId: { ...d.userId, status: action } } // ← update nested status
              : d
          )
        );
        setSelectedDoctor((prev) =>
          prev?._id === doctorId
            ? { ...prev, userId: { ...prev.userId, status: action } } // ← also update drawer
            : prev
        );
      }
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${action} doctor.`);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...doctors];

    if (filter !== "All") {
      list = list.filter((d) => {
        const s = (d?.userId?.status)?.toLowerCase();
        return s === filter?.toLowerCase();
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) => {
        const name = d?.userId?.username || d?.personalInfo?.fullName || "";
        const spec = d?.specialization || "";
        return [name, spec].join(" ").toLowerCase().includes(q);
      });
    }

    // Pending always first
    const order = { pending: 0, approved: 1, blocked: 2 };
    list.sort((a, b) => {
      const sa = (a?.userId?.status || a?.approvalStatus || "")?.toLowerCase();
      const sb = (b?.userId?.status || b.approvalStatus || "")?.toLowerCase();
      return (order[sa] ?? 9) - (order[sb] ?? 9);
    });

    return list;
  }, [doctors, filter, search]);

  /* ── Stats ── */
  const counts = useMemo(() => ({
    all: doctors.length,
    pending: doctors.filter((d) => (d?.userId?.status  || "").toLowerCase() === "pending").length,
    approved: doctors.filter((d) => (d?.userId?.status || "").toLowerCase() === "active").length,
    blocked: doctors.filter((d) => (d?.userId?.status || "").toLowerCase() === "blocked").length,
  }), [doctors]);

  return (
    <div className="max-w-6xl mx-auto px-4 max-sm:px-0 py-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between max-sm:flex-col mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Doctor Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${filtered.length} doctor${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <button
          onClick={fetchDoctors}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <ErrorBanner error={error} />}

      {/* ── Summary Pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 max-[400px]:grid-cols-1 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total", value: counts.all, icon: FiUsers, bg: "bg-[#274760]/10", color: "text-[#274760]" },
          { label: "Pending", value: counts.pending, icon: FiClock, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Approved", value: counts.approved, icon: FiCheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Blocked", value: counts.blocked, icon: FiSlash, bg: "bg-red-50", color: "text-red-500" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
            <span className={`h-9 w-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
              <Icon size={16} />
            </span>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
              <p className="text-xs  text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white flex-1">
          <FiSearch size={14} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialization…"
            className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 shrink-0">
              <FiX size={13} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 rounded-xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filter === f
                  ? "bg-white text-[#274760] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex gap-4 items-start">

        {/* Doctor cards */}
        <div className={`flex flex-col gap-2.5 transition-all duration-300 ${selectedDoctor ? "w-105 shrink-0" : "w-full"}`}>

          {loading ? (
            <div className="space-y-2.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse flex gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-slate-100 rounded w-32" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                    <div className="h-3 bg-slate-100 rounded w-24" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="h-7 w-16 bg-slate-100 rounded-lg" />
                    <div className="h-7 w-16 bg-slate-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>

          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <FiUsers size={22} className="text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {search ? "No doctors match" : "No doctors found"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {search ? "Try a different search term." : "Doctors will appear here once registered."}
                </p>
              </div>
            </div>

          ) : (
            <>
              {/* Pending section */}
              {filtered.some((d) => (d?.userId?.status || "").toLowerCase() === "pending") && (
                <div className="mb-1">
                  <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest px-1 mb-2 flex items-center gap-1.5">
                    <FiClock size={11} /> Needs Action
                  </p>
                  {filtered
                    .filter((d) => (d?.userId?.status || d?.approvalStatus || "").toLowerCase() === "pending")
                    .map((doc) => (
                      <DoctorCard
                        key={doc._id}
                        doctor={doc}
                        isSelected={selectedDoctor?._id === doc._id}
                        onClick={() => setSelectedDoctor((p) => p?._id === doc._id ? null : doc)}
                        onAction={handleAction}
                        actionLoading={actionLoading}
                      />
                    ))}
                </div>
              )}

              {/* Other doctors */}
              {filtered.some((d) => (d?.userId?.status || "").toLowerCase() !== "pending") && (
                <div>
                  {filter === "All" && filtered.some((d) => (d?.userId?.status || "").toLowerCase() === "pending") && (
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">
                      All Doctors
                    </p>
                  )}
                  {filtered
                    .filter((d) => (d?.userId?.status)?.toLowerCase() !== "pending")
                    .map((doc) => (
                      <DoctorCard
                        key={doc._id}
                        doctor={doc}
                        isSelected={selectedDoctor?._id === doc._id}
                        onClick={() => setSelectedDoctor((p) => p?._id === doc._id ? null : doc)}
                        onAction={handleAction}
                        actionLoading={actionLoading}
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>

     
        {selectedDoctor && (
    <DoctorDrawer
        doctor={selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        onAction={handleAction}
        actionLoading={actionLoading}
    />
)}
      </div>
    </div>
  );
};

export default AdminDoctorManagement;