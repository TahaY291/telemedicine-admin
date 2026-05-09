import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import {
  FiSearch, FiRefreshCw, FiX, FiUsers,
  FiUserCheck, FiUserX, FiUser,
  FiCheckCircle,
  FiSlash,
  FiClock,
} from "react-icons/fi";
import ErrorBanner from "../components/ErrorBanner.jsx";
import PatientCard from "../components/PatientCard.jsx";
import PatientDrawer from "../components/PatientDrawer.jsx";

const FILTERS = ["All", "active", "pending", "blocked"];

const AdminPatientManagement = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedPatient, setSelectedPatient] = useState(null);

  /* ── Fetch ── */
  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/patients");
      setPatients(res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  /* ── Actions ── */
  const handleAction = async (patientId, action) => {
    setActionLoading(true);
    setError("");
    try {
      if (action === "delete") {
        await api.delete(`/admin/patients/${patientId}`);
        setPatients((prev) => prev.filter((p) => p._id !== patientId));
        setSelectedPatient(null);
      } else {
        // action = "active" | "deactivated"
        const res = await api.patch(`/admin/patients/${patientId}/status`, { status: action });
        const updated = res.data?.data;
        setPatients((prev) =>
          prev.map((p) => (p._id === patientId ? { ...p, ...updated } : p))
        );
        setSelectedPatient((prev) => (prev?._id === patientId ? { ...prev, ...updated } : prev));
      }
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${action} patient.`);
    } finally {
      setActionLoading(false);
    }
  };

const filtered = useMemo(() => {
    let list = [...patients];

    if (filter !== "All") {
        list = list.filter((p) =>
            (p?.user?.status || "").toLowerCase() === filter.toLowerCase()
        );
    }

    if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((p) => {
            const name  = p?.user?.username || "";
            const email = p?.user?.email    || "";
            const city  = p?.personalInfo?.address?.city || "";
            return [name, email, city].join(" ").toLowerCase().includes(q);
        });
    }

    return list;
}, [patients, filter, search]);

 const counts = useMemo(() => ({
    all:      patients.length,
    pending:  patients.filter((p) => (p?.user?.status || "").toLowerCase() === "pending").length,
    approved: patients.filter((p) => (p?.user?.status || "").toLowerCase() === "active").length,
    blocked:  patients.filter((p) => (p?.user?.status || "").toLowerCase() === "blocked").length,
}), [patients]);

  return (
    <div className="max-w-6xl mx-auto px-4 max-sm:px-0 py-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between mb-5 max-sm:flex-col">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Patient Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${filtered.length} patient${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <button
          onClick={fetchPatients}
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
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white flex-1">
          <FiSearch size={14} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or city…"
            className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 shrink-0">
              <FiX size={13} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 bg-slate-100 rounded-xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filter === f ? "bg-white text-[#274760] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── List + Drawer ── */}
      <div className="flex gap-4 items-start">
        <div className={`flex flex-col gap-2.5 transition-all duration-300 ${selectedPatient ? "w-105 shrink-0" : "w-full"}`}>

          {loading ? (
            <div className="space-y-2.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse flex gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-slate-100 rounded w-32" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                  </div>
                  <div className="h-7 w-20 bg-slate-100 rounded-lg self-center" />
                </div>
              ))}
            </div>

          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <FiUser size={22} className="text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {search ? "No patients match" : "No patients found"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {search ? "Try a different search term." : "Patients will appear here after registration."}
                </p>
              </div>
            </div>

          ) : filtered.map((patient) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              isSelected={selectedPatient?._id === patient._id}
              onClick={() => setSelectedPatient((p) => p?._id === patient._id ? null : patient)}
              onAction={handleAction}
              actionLoading={actionLoading}
            />
          ))}
        </div>

        {/* Drawer */}
       {selectedPatient && (
        <PatientDrawer
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            onAction={handleAction}
            actionLoading={actionLoading}
        />
    )}
      </div>
    </div>
  );
};

export default AdminPatientManagement;