import React, { useState, useEffect, useMemo } from 'react'
import {
  FiSearch, FiRefreshCw, FiX, FiCalendar,
  FiFilter, FiClock, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiUser, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import api from '../api/axios';
import ErrorBanner from '../components/ErrorBanner';

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    dot: "bg-blue-400",
    badge: "bg-blue-50 text-blue-600 border-blue-100",
    icon: FiClock,
  },
  approved: {
    label: "Approved",
    dot: "bg-indigo-400",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
    icon: FiAlertCircle,
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: FiCheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-500 border-red-100",
    icon: FiXCircle,
  },
  rescheduled: {
    label: "Rescheduled",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-600 border-amber-100",
    icon: FiAlertCircle,
  },
  expired: {
    label: "Expired",
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-500 border-slate-200",
    icon: FiClock,
  },
};


const FILTERS = ["All", "pending", "approved", "completed", "cancelled", "rescheduled", "expired"];
const PAGE_SIZE = 10;


const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};


const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3.5 bg-slate-100 rounded w-full" />
      </td>
    ))}
  </tr>
);



const AppointmentMonitoring = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);


  const fetchAppointments = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await api.get("/admin/appointments")
      setAppointments(res?.data?.data || [])
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppointments(); }, [])

  const getPatientName = (appt) =>
    appt?.patient?.user?.username ||
    appt?.patient?.personalInfo?.fullName ||
    "Unknown Patient";

  const getDoctorName = (appt) =>
    appt?.doctor?.userId?.username ||
    "Unknown Doctor";

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const formatTime = (slot) => slot || "—";


  const filtered = useMemo(() => {
    let list = [...appointments]
    if (filter !== "All") {
      list = list.filter((a) => a.status.toLowerCase() === filter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((a) => {
        const patient = getPatientName(a).toLowerCase();
        const doctor = getDoctorName(a).toLowerCase();
        const reason = (a.reasonForVisit || "").toLowerCase();
        return [patient, doctor, reason].join(" ").includes(q);
      });
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter((a) => new Date(a.appointmentDate) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((a) => new Date(a.appointmentDate) <= to);
    }

    return list;
  }, [appointments, filter, search, dateFrom, dateTo])


  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  /* ── Counts for summary pills ── */
  const counts = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  }), [appointments]);

  const clearFilters = () => {
    setSearch("");
    setFilter("All");
    setDateFrom("");
    setDateTo("");
    resetPage();
  };

  const hasActiveFilters = search || filter !== "All" || dateFrom || dateTo;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${filtered.length} appointment${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <ErrorBanner error={error} />}

      {/* ── Summary pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total", value: counts.total, icon: FiCalendar, bg: "bg-[#274760]/10", color: "text-[#274760]" },
          { label: "Pending", value: counts.pending, icon: FiClock, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Completed", value: counts.completed, icon: FiCheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Cancelled", value: counts.cancelled, icon: FiXCircle, bg: "bg-red-50", color: "text-red-500" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
            <span className={`h-9 w-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
              <Icon size={16} />
            </span>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 space-y-3">

        {/* Row 1: Search + Status tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 flex-1">
            <FiSearch size={14} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search patient, doctor or reason…"
              className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0"
            />
            {search && (
              <button onClick={() => { setSearch(""); resetPage(); }} className="text-slate-400 hover:text-slate-600">
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
            >
              <FiX size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Row 2: Status filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); resetPage(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize
                                ${filter === f
                  ? "bg-[#274760] text-white shadow-sm"
                  : "bg-slate-100 text-slate-400 hover:text-slate-600"
                }`}
            >
              {f === "All" ? "All" : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {/* Row 3: Date range */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs font-semibold text-slate-400 shrink-0 w-10">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
              className="flex-1 text-sm text-slate-700 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#274760]/40 bg-slate-50 min-w-0"
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs font-semibold text-slate-400 shrink-0 w-10">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
              className="flex-1 text-sm text-slate-700 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#274760]/40 bg-slate-50 min-w-0"
            />
          </div>
        </div>
      </div>

      {/* ── Table — desktop ── */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["Patient", "Doctor", "Date", "Time", "Type", "Status", "Payment"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <FiCalendar size={20} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-500">No appointments found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((appt) => (
                <tr
                  key={appt._id}
                  className="hover:bg-slate-50/60 transition-colors cursor-default"
                >
                  {/* Patient */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#274760]/10 flex items-center justify-center shrink-0">
                        <FiUser size={12} className="text-[#274760]" />
                      </div>
                      <span className="font-medium text-slate-700 truncate max-w-30">
                        {getPatientName(appt)}
                      </span>
                    </div>
                  </td>

                  {/* Doctor */}
                  <td className="px-4 py-3">
                    <span className="text-slate-600 truncate max-w-30 block">
                      Dr. {getDoctorName(appt)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {appt?.doctor?.specialization || ""}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {formatDate(appt.appointmentDate)}
                  </td>

                  {/* Time */}
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-mono text-xs">
                    {formatTime(appt.timeSlot)}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="capitalize text-slate-500 text-xs font-medium">
                      {appt.consultationType || "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={appt.status} />
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3">
                    <div>
                      <span className={`text-xs font-semibold capitalize
                                                ${appt.payment?.status === "paid" ? "text-emerald-600" : ""}
                                                ${appt.payment?.status === "pending" ? "text-amber-500" : ""}
                                                ${appt.payment?.status === "refunded" ? "text-blue-500" : ""}
                                                ${appt.payment?.status === "failed" ? "text-red-500" : ""}
                                            `}>
                        {appt.payment?.status || "—"}
                      </span>
                      {appt.payment?.amount && (
                        <p className="text-[11px] text-slate-400">
                          Rs. {appt.payment.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Cards — mobile ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse space-y-2">
              <div className="h-4 bg-slate-100 rounded w-40" />
              <div className="h-3 bg-slate-100 rounded w-32" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
          ))
        ) : paginated.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 flex flex-col items-center gap-3 text-center">
            <FiCalendar size={24} className="text-slate-300" />
            <p className="text-sm font-bold text-slate-500">No appointments found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters</p>
          </div>
        ) : paginated.map((appt) => (
          <div
            key={appt._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {getPatientName(appt)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dr. {getDoctorName(appt)}
                  {appt?.doctor?.specialization ? ` · ${appt.doctor.specialization}` : ""}
                </p>
              </div>
              <StatusBadge status={appt.status} />
            </div>

            {/* Details row */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <FiCalendar size={11} />
                {formatDate(appt.appointmentDate)}
              </span>
              <span className="flex items-center gap-1">
                <FiClock size={11} />
                {formatTime(appt.timeSlot)}
              </span>
              <span className="capitalize">{appt.consultationType || "—"}</span>
            </div>

            {/* Payment row */}
            {appt.payment && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <span className="text-xs text-slate-400">Payment</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold capitalize
                                        ${appt.payment.status === "paid" ? "text-emerald-600" : ""}
                                        ${appt.payment.status === "pending" ? "text-amber-500" : ""}
                                        ${appt.payment.status === "refunded" ? "text-blue-500" : ""}
                                        ${appt.payment.status === "failed" ? "text-red-500" : ""}
                                    `}>
                    {appt.payment.status}
                  </span>
                  {appt.payment.amount && (
                    <span className="text-xs text-slate-500 font-mono">
                      Rs. {appt.payment.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}
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

            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              // show first, last, current ±1
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
              // ellipsis
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
    </div>
  )
}

export default AppointmentMonitoring