import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  FiUsers, FiUserCheck, FiCalendar, FiActivity,
  FiTrendingUp, FiShield, FiChevronRight, FiRefreshCw,
  FiUserPlus, FiBookOpen, FiBarChart2, FiAlertTriangle,
  FiCheckCircle, FiClock,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend, ArcElement
);

// ─── helpers ──────────────────────────────────────────────────────────────────
const now = new Date();
const greeting = () => {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};
const todayLabel = now.toLocaleDateString(undefined, {
  weekday: "long", month: "long", day: "numeric",
});
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, accent, iconBg, iconColor, delta }) => (
  <div className={`relative rounded-2xl p-5 border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
    accent
      ? "bg-[#274760] border-[#274760] text-white"
      : "bg-white border-slate-200 text-slate-800"
  }`}>
    {accent && (
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5" />
    )}
    <div className="flex items-start justify-between mb-3">
      <span className={`h-9 w-9 rounded-xl flex items-center justify-center ${
        accent ? "bg-white/15 text-white" : (iconBg || "bg-[#274760]/10") + " " + (iconColor || "text-[#274760]")
      }`}>
        <Icon size={16} />
      </span>
      {delta !== undefined && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          accent ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
        }`}>
          +{delta}%
        </span>
      )}
    </div>
    <p className={`text-2xl font-bold tracking-tight ${accent ? "text-white" : "text-slate-800"}`}>
      {value ?? "—"}
    </p>
    <p className={`text-xs font-semibold mt-0.5 ${accent ? "text-white/70" : "text-slate-400"}`}>
      {label}
    </p>
    {sub && (
      <p className={`text-[11px] mt-1 ${accent ? "text-white/50" : "text-slate-300"}`}>{sub}</p>
    )}
  </div>
);

const ActivityItem = ({ item, index }) => {
  const isBooking = item.type === "booking";
  return (
    <div
      className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 animate-fadein"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
        isBooking ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"
      }`}>
        {isBooking ? <FiCalendar size={13} /> : <FiUserPlus size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 leading-snug truncate">
          {item.message || "—"}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(item.date)}</p>
      </div>
      <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
        isBooking
          ? "bg-blue-50 text-blue-500 border border-blue-100"
          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
      }`}>
        {isBooking ? "Booking" : "Signup"}
      </span>
    </div>
  );
};

const QuickLink = ({ to, icon: Icon, label, desc, color }) => (
  <Link
    to={to}
    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 hover:border-[#274760]/30 hover:bg-[#274760]/3 transition-all duration-150"
  >
    <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={15} />
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-800">{label}</p>
      <p className="text-[11px] text-slate-400 truncate">{desc}</p>
    </div>
    <FiChevronRight size={14} className="text-slate-300 group-hover:text-[#274760] transition-colors" />
  </Link>
);

// ─── main component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [stats, setStats]         = useState(null);
  const [activity, setActivity]   = useState([]);
  const [chartData, setChartData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const adminName = user?.username || user?.name || "Admin";

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const [statsRes, activityRes, chartRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/activity"),
        api.get("/admin/weekly-chart"),
      ]);
      setStats(statsRes.data?.data || null);
      setActivity(activityRes.data?.data?.activityFeed || []);
      setChartData(chartRes.data?.data?.chartData || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Bar chart ───────────────────────────────────────────────────────────────
  const barData = useMemo(() => ({
    labels: chartData.map((d) => d.day),
    datasets: [{
      label: "Appointments",
      data: chartData.map((d) => d.count),
      backgroundColor: chartData.map((_, i) =>
        i === new Date().getDay() - 1 ? "#274760" : "rgba(39,71,96,0.13)"
      ),
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: "#274760",
    }],
  }), [chartData]);

  const barOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} appointments` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, weight: "600" }, color: "#94a3b8" } },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 11 }, color: "#94a3b8" },
        grid: { color: "#f1f5f9" },
      },
    },
    maintainAspectRatio: false,
  };

  // ── Doughnut ────────────────────────────────────────────────────────────────
  const total = stats
    ? (stats.totalDoctors + stats.totalPatients + stats.totalAppointments + stats.totalConsultations)
    : 0;
  const doughnutData = useMemo(() => ({
    labels: ["Doctors", "Patients", "Appointments", "Consultations"],
    datasets: [{
      data: stats
        ? [stats.totalDoctors, stats.totalPatients, stats.totalAppointments, stats.totalConsultations]
        : [0, 0, 0, 0],
      backgroundColor: ["#274760", "#10b981", "#f59e0b", "#6366f1"],
      borderColor: ["#274760", "#10b981", "#f59e0b", "#6366f1"],
      borderWidth: 0,
      hoverOffset: 5,
    }],
  }), [stats]);

  const doughnutOptions = {
    cutout: "74%",
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } },
    },
    maintainAspectRatio: false,
  };

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-32 rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-200" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="lg:col-span-2 h-64 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Hero ── */}
      <div className="relative rounded-2xl bg-[#274760] overflow-hidden px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-16 bottom-0 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <FiShield size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              {greeting()}, {adminName}
            </p>
            <h1 className="text-white text-xl font-bold leading-tight mt-0.5">
              Admin Control Panel
            </h1>
            <p className="text-white/50 text-xs mt-0.5">{todayLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <span className="flex items-center gap-1.5 text-xs text-red-300 bg-red-900/30 border border-red-700/30 px-3 py-1.5 rounded-lg">
              <FiAlertTriangle size={12} /> {error}
            </span>
          )}
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-white/10 disabled:opacity-60"
          >
            <FiRefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {stats && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiUserCheck}
            label="Total Doctors"
            value={stats.totalDoctors}
            sub="Registered physicians"
            accent
          />
          <StatCard
            icon={FiUsers}
            label="Total Patients"
            value={stats.totalPatients}
            sub="Active accounts"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon={FiCalendar}
            label="Appointments"
            value={stats.totalAppointments}
            sub="All time bookings"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            icon={FiActivity}
            label="Consultations"
            value={stats.totalConsultations}
            sub="Completed sessions"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />
        </section>
      )}

      {/* ── Charts Row ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Doughnut — system overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-8 w-8 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
              <FiBarChart2 size={14} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">System Overview</p>
              <p className="text-xs text-slate-400">Distribution across entities</p>
            </div>
          </div>

          <div className="relative h-44">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold text-slate-800">{total.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Records</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: "Doctors",       color: "#274760", value: stats?.totalDoctors },
              { label: "Patients",      color: "#10b981", value: stats?.totalPatients },
              { label: "Appointments",  color: "#f59e0b", value: stats?.totalAppointments },
              { label: "Consultations", color: "#6366f1", value: stats?.totalConsultations },
            ].map(({ label, color, value }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-slate-500 font-medium">{label}</span>
                <span className="ml-auto text-[11px] font-bold text-slate-700">{value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart — weekly appointments */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                <FiTrendingUp size={14} />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">Weekly Appointments</p>
                <p className="text-xs text-slate-400">This week's booking activity</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg font-semibold">
              Mon → Sun
            </span>
          </div>
          <div className="h-52">
            {chartData.length > 0
              ? <Bar data={barData} options={barOptions} />
              : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-slate-300 font-medium">No data for this week</p>
                </div>
              )
            }
          </div>
        </div>
      </section>

      {/* ── Activity + Quick Links ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent activity feed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <FiClock size={14} />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">Recent Activity</p>
                <p className="text-xs text-slate-400">Latest bookings & signups</p>
              </div>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-500 font-semibold px-2 py-1 rounded-lg">
              {activity.length} events
            </span>
          </div>

          {activity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center mt-2">
              <FiCheckCircle className="mx-auto text-slate-300 mb-2" size={22} />
              <p className="text-sm text-slate-400 font-medium">No recent activity</p>
              <p className="text-xs text-slate-300 mt-1">Things will show up here as they happen</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto pr-1 mt-1">
              {activity.map((item, i) => (
                <ActivityItem key={i} item={item} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-8 w-8 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
              <FiBookOpen size={14} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">Quick Actions</p>
              <p className="text-xs text-slate-400">Jump to management sections</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <QuickLink
              to="/admin/doctor-management"
              icon={FiUserCheck}
              label="Doctor Management"
              desc="Review, approve & manage physicians"
              color="bg-[#274760]/10 text-[#274760]"
            />
            <QuickLink
              to="/admin/patient-management"
              icon={FiUsers}
              label="Patient Management"
              desc="Browse and manage patient records"
              color="bg-emerald-50 text-emerald-600"
            />
            <QuickLink
              to="/admin/appointments"
              icon={FiCalendar}
              label="Appointments"
              desc="View all scheduled appointments"
              color="bg-amber-50 text-amber-600"
            />
            <QuickLink
              to="/admin/feedback-management"
              icon={FiActivity}
              label="Feedback Management"
              desc="Check All Feedback to the doctors by the patient"
              color="bg-violet-50 text-violet-600"
            />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein { animation: fadein 0.3s ease both; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;