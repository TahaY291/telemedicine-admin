import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import {
    FiRefreshCw, FiDownload, FiTrendingUp,
    FiUsers, FiCalendar, FiAward, FiBarChart2,
    FiPieChart, FiActivity,
} from "react-icons/fi";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale,
    BarElement, LineElement, ArcElement,
    PointElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import ErrorBanner from "../components/ErrorBanner.jsx";

ChartJS.register(
    CategoryScale, LinearScale,
    BarElement, LineElement, ArcElement,
    PointElement, Tooltip, Legend, Filler
);

const baseFont = { family: "DM Sans, sans-serif", size: 11 };

const barOptions = (label) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.parsed.y} ${label}` },
            backgroundColor: "#1a2332",
            titleFont: baseFont,
            bodyFont: baseFont,
            padding: 10,
            cornerRadius: 8,
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { font: baseFont, color: "#94a3b8", maxRotation: 30 },
        },
        y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { precision: 0, font: baseFont, color: "#94a3b8" },
        },
    },
});

const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.parsed.y} signups` },
            backgroundColor: "#1a2332",
            titleFont: baseFont,
            bodyFont: baseFont,
            padding: 10,
            cornerRadius: 8,
        },
    },
    scales: {
        x: { grid: { display: false }, ticks: { font: baseFont, color: "#94a3b8" } },
        y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { precision: 0, font: baseFont, color: "#94a3b8" } },
    },
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} appointments` },
            backgroundColor: "#1a2332",
            titleFont: baseFont,
            bodyFont: baseFont,
            padding: 10,
            cornerRadius: 8,
        },
    },
};

const PALETTE = [
    "#1d9e75", "#185fa5", "#ba7517", "#d85a30",
    "#7c3aed", "#0891b2", "#be185d", "#15803d",
    "#b45309", "#1d4ed8",
];

const ChartCard = ({ title, sub, icon: Icon, children, action }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                    <Icon size={15} />
                </span>
                <div>
                    <p className="text-sm font-bold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                </div>
            </div>
            {action}
        </div>
        {children}
    </div>
);

const Skeleton = ({ h = "h-52" }) => (
    <div className={`${h} rounded-xl bg-slate-100 animate-pulse`} />
);


const exportCSV = (rows, filename) => {
    if (!rows?.length) return;
    const headers = Object.keys(rows[0]).join(",");
    const body    = rows.map((r) => Object.values(r).join(",")).join("\n");
    const blob    = new Blob([`${headers}\n${body}`], { type: "text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = filename;
    a.click();
    URL.revokeObjectURL(url);
};

const AdminReports = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [data, setData]       = useState(null);

    const fetchReports = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/admin/reports");
            setData(res.data?.data || null);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReports(); }, []);

    /* ── Chart 1 — Most Consulted Doctors (Bar) ── */
    const barChartData = useMemo(() => {
        const list = data?.mostConsultedDoctors || [];
        return {
            labels:   list.map((d) => `Dr. ${d.name}`),
            datasets: [{
                label: "Consultations",
                data:  list.map((d) => d.consultations),
                backgroundColor: list.map((_, i) => `${PALETTE[i % PALETTE.length]}22`),
                borderColor:     list.map((_, i) => PALETTE[i % PALETTE.length]),
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
            }],
        };
    }, [data]);

    /* ── Chart 2 — Patient Signups Over Time (Line) ── */
    const lineChartData = useMemo(() => {
        const list = data?.patientSignupsOverTime || [];
        return {
            labels:   list.map((d) => d.month),
            datasets: [{
                label: "Signups",
                data:  list.map((d) => d.count),
                fill: true,
                borderColor: "#1d9e75",
                backgroundColor: "rgba(29,158,117,0.08)",
                pointBackgroundColor: "#1d9e75",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 5,
                tension: 0.4,
            }],
        };
    }, [data]);

    /* ── Chart 3 — Appointments by Specialty (Doughnut) ── */
    const doughnutData = useMemo(() => {
        const list = data?.appointmentsBySpecialty || [];
        return {
            labels:   list.map((d) => d.specialty),
            datasets: [{
                data:            list.map((d) => d.count),
                backgroundColor: list.map((_, i) => PALETTE[i % PALETTE.length]),
                borderWidth: 0,
                hoverOffset: 6,
            }],
        };
    }, [data]);

    /* ── Summary stats ── */
    const summary = data?.summary || {};

    /* ── Export handlers ── */
    const exportDoctors = () => {
        exportCSV(
            (data?.mostConsultedDoctors || []).map((d) => ({
                Doctor: `Dr. ${d.name}`,
                Specialization: d.specialization || "",
                Consultations: d.consultations,
                Rating: d.rating || 0,
            })),
            "most_consulted_doctors.csv"
        );
    };

    const exportSignups = () => {
        exportCSV(
            (data?.patientSignupsOverTime || []).map((d) => ({
                Month: d.month,
                Signups: d.count,
            })),
            "patient_signups.csv"
        );
    };

    const exportSpecialty = () => {
        exportCSV(
            (data?.appointmentsBySpecialty || []).map((d) => ({
                Specialty: d.specialty,
                Appointments: d.count,
            })),
            "appointments_by_specialty.csv"
        );
    };

    const exportAll = () => {
        exportDoctors();
        exportSignups();
        exportSpecialty();
    };

    const ExportBtn = ({ onClick, label = "Export CSV" }) => (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
        >
            <FiDownload size={12} /> {label}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports & Analytics</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Platform-wide insights and trends</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportAll}
                        disabled={loading || !data}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#274760] text-white text-sm font-semibold hover:bg-[#1e3a55] disabled:opacity-50 transition-colors"
                    >
                        <FiDownload size={13} /> Export All
                    </button>
                    <button
                        onClick={fetchReports}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                        <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && <ErrorBanner error={error} />}

            {/* ── Summary pills ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Total Doctors",       value: summary.totalDoctors       ?? "—", icon: FiUsers,      bg: "bg-[#274760]/10", color: "text-[#274760]" },
                    { label: "Total Patients",       value: summary.totalPatients      ?? "—", icon: FiActivity,   bg: "bg-blue-50",      color: "text-blue-600"  },
                    { label: "Total Appointments",   value: summary.totalAppointments  ?? "—", icon: FiCalendar,   bg: "bg-amber-50",     color: "text-amber-600" },
                    { label: "Total Consultations",  value: summary.totalConsultations ?? "—", icon: FiTrendingUp, bg: "bg-emerald-50",   color: "text-emerald-600"},
                ].map(({ label, value, icon: Icon, bg, color }) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
                        <span className={`h-9 w-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                            <Icon size={16} />
                        </span>
                        <div>
                            <p className="text-xl font-bold text-slate-800 leading-none">
                                {loading ? <span className="inline-block w-10 h-5 bg-slate-100 rounded animate-pulse" /> : value}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Row 1: Bar chart (full width) ── */}
            <div className="mb-5">
                <ChartCard
                    title="Most Consulted Doctors"
                    sub="Top 10 doctors by total consultations"
                    icon={FiBarChart2}
                    action={<ExportBtn onClick={exportDoctors} />}
                >
                    {loading ? <Skeleton h="h-64" /> : (
                        <div className="h-64">
                            {(data?.mostConsultedDoctors?.length ?? 0) === 0 ? (
                                <EmptyState label="No consultation data yet" />
                            ) : (
                                <Bar data={barChartData} options={barOptions("consultations")} />
                            )}
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* ── Row 2: Line + Doughnut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                {/* Line chart — 2/3 width */}
                <div className="lg:col-span-2">
                    <ChartCard
                        title="Patient Engagement Over Time"
                        sub="Monthly new patient signups"
                        icon={FiTrendingUp}
                        action={<ExportBtn onClick={exportSignups} />}
                    >
                        {loading ? <Skeleton h="h-56" /> : (
                            <div className="h-56">
                                {(data?.patientSignupsOverTime?.length ?? 0) === 0 ? (
                                    <EmptyState label="No signup data yet" />
                                ) : (
                                    <Line data={lineChartData} options={lineOptions} />
                                )}
                            </div>
                        )}
                    </ChartCard>
                </div>

                {/* Doughnut — 1/3 width */}
                <div>
                    <ChartCard
                        title="By Specialty"
                        sub="Appointments per specialization"
                        icon={FiPieChart}
                        action={<ExportBtn onClick={exportSpecialty} />}
                    >
                        {loading ? <Skeleton h="h-56" /> : (
                            <>
                                {(data?.appointmentsBySpecialty?.length ?? 0) === 0 ? (
                                    <div className="h-56">
                                        <EmptyState label="No specialty data yet" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-40">
                                            <Doughnut data={doughnutData} options={doughnutOptions} />
                                        </div>
                                        {/* Legend */}
                                        <div className="mt-4 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                            {(data?.appointmentsBySpecialty || []).map((d, i) => (
                                                <div key={d.specialty} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                                            style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                                                        />
                                                        <span className="text-slate-500 truncate max-w-27.5">{d.specialty}</span>
                                                    </div>
                                                    <span className="font-bold text-slate-700 ml-2">{d.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </ChartCard>
                </div>
            </div>

            {/* ── Row 3: Top doctors leaderboard table ── */}
            <ChartCard
                title="Doctor Leaderboard"
                sub="Ranked by consultations, rating & reviews"
                icon={FiAward}
                action={<ExportBtn onClick={exportDoctors} />}
            >
                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {["#", "Doctor", "Specialization", "Consultations", "Rating", "Reviews"].map((h) => (
                                        <th key={h} className="pb-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-4">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(data?.mostConsultedDoctors || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                                            No data available
                                        </td>
                                    </tr>
                                ) : (data?.mostConsultedDoctors || []).map((doc, i) => (
                                    <tr key={doc.doctorId || i} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 pr-4">
                                            {i < 3 ? (
                                                <span className="text-sm font-bold" style={{ color: ["#f59e0b","#94a3b8","#b45309"][i] }}>
                                                    {["🥇","🥈","🥉"][i]}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 font-mono">{i + 1}</span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="text-sm font-semibold text-slate-700">Dr. {doc.name}</span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="text-xs text-slate-400">{doc.specialization || "—"}</span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="text-sm font-bold text-[#274760]">{doc.consultations}</span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex gap-0.5">
                                                    {[1,2,3,4,5].map((s) => (
                                                        <FiAward
                                                            key={s}
                                                            size={10}
                                                            className={s <= Math.round(doc.rating) ? "text-amber-400" : "text-slate-200"}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-mono text-slate-500">{(doc.rating || 0).toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-xs text-slate-400">{doc.totalReviews ?? 0}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </ChartCard>
        </div>
    );
};

/* ── Empty state ── */
const EmptyState = ({ label }) => (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
        <FiBarChart2 size={28} className="text-slate-200" />
        <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
);

export default AdminReports;