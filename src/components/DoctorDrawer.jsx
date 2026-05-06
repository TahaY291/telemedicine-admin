import { useState } from "react";
import {
    FiX, FiUser, FiMail, FiMapPin,
    FiCheckCircle, FiSlash, FiTrash2, FiClock,
    FiBriefcase, FiAward, FiStar,
    FiShield, FiHash, FiCalendar, FiFileText,
} from "react-icons/fi";
import api from "../api/axios";
import { useLightbox } from "../context/LightBoxContext";

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    const map = {
        pending: { label: "Pending", cls: "bg-amber-50 text-amber-600 border-amber-200" },
        active: { label: "Active", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
        blocked: { label: "Blocked", cls: "bg-red-50 text-red-500 border-red-200" },
    };
    const { label, cls } = map[s] || { label: status, cls: "bg-slate-50 text-slate-500 border-slate-200" };
    return (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cls}`}>
            {label}
        </span>
    );
};

/* ── Info row ── */
const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
            <span className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={13} />
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">{label}</p>
                <p className="text-sm text-slate-700 font-medium mt-0.5 break">{value}</p>
            </div>
        </div>
    );
};

const ImageSection = ({ src, label, openLightbox }) => {
    if (!src || src === "default-doctor.png") return null;
    return (
        <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {label}
            </p>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                    src={src}
                    onClick={() => src && openLightbox(src)}
                    alt={label}
                    className="w-full object-contain max-h-48 cursor-pointer"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
            </div>
        </div>
    );
};

const DoctorDrawer = ({ doctor, onClose, onAction, actionLoading }) => {
    const status = (doctor?.userId?.status || "").toLowerCase();
    const name = doctor?.userId?.username || "Unknown Doctor";
    const email = doctor?.userId?.email || null;
    const gender = doctor?.gender || null;
    const city = doctor?.location?.city || null;
    const address = doctor?.location?.address || null;
    const spec = doctor?.specialization || null;
    const exp = doctor?.experience != null
        ? `${doctor.experience} year${doctor.experience !== 1 ? "s" : ""}`
        : null;
    const quals = doctor?.qualifications || null;
    const fee = doctor?.consultationFee != null
        ? `Rs. ${doctor.consultationFee.toLocaleString()}`
        : null;
    const rating = doctor?.rating
        ? `${doctor.rating} / 5 (${doctor.totalReviews} review${doctor.totalReviews !== 1 ? "s" : ""})`
        : null;
    const consults = doctor?.numberOfConsultations != null
        ? `${doctor.numberOfConsultations}`
        : null;
    const pic = doctor?.doctorImage || null;
    const certificate = doctor?.certificateImage || null;
    const isVerified = doctor?.isVerified;
    const isPending = status === "pending";
    const isActive = status === "active";
    const isBlocked = status === "blocked";

    const { openLightbox } = useLightbox()

    /* ── Lazy stats ── */
    const [docStats, setDocStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsLoaded, setStatsLoaded] = useState(false);
    const [statsError, setStatsError] = useState(null);

    const loadStats = async () => {
        if (statsLoaded) return;
        setStatsLoading(true);
        setStatsError(null);
        try {
            const res = await api.get(`/admin/doctors/${doctor._id}/stats`);
            setDocStats(res.data?.data);
            setStatsLoaded(true);
        } catch (err) {
            console.error("Failed to load stats", err);
            setStatsError("Failed to load stats. Try again.");
        } finally {
            setStatsLoading(false);
        }
    };

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* ── Drawer Panel ── */}
            <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#274760]/10 flex items-center justify-center overflow-hidden shrink-0">
                            {pic && pic !== "default-doctor.png"
                                ? <img src={pic} alt={name} onClick={() => pic && openLightbox(pic)} className="w-full h-full object-cover" />
                                : <FiUser size={18} className="text-[#274760]" />
                            }
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">Dr. {name}</p>
                            {spec && <p className="text-xs text-slate-400 mt-0.5">{spec}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                        {isVerified && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1">
                                <FiShield size={9} /> Verified
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="ml-2 h-7 w-7 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition-colors"
                        >
                            <FiX size={14} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* ── Contact & Professional Details ── */}
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Contact & Details
                        </p>
                        <div className="grid grid-cols-2 gap-x-4">
                            <InfoRow icon={FiMail} label="Email" value={email} />
                            <InfoRow icon={FiUser} label="Gender" value={gender} />
                            <InfoRow icon={FiMapPin} label="City" value={city} />
                            <InfoRow icon={FiMapPin} label="Address" value={address} />
                            <InfoRow icon={FiBriefcase} label="Specialization" value={spec} />
                            <InfoRow icon={FiClock} label="Experience" value={exp} />
                            <InfoRow icon={FiAward} label="Qualifications" value={quals} />
                            <InfoRow icon={FiStar} label="Fee" value={fee} />
                            <InfoRow icon={FiStar} label="Rating" value={rating} />
                            <InfoRow icon={FiHash} label="Consultations" value={consults} />
                        </div>
                    </div>

                    {/* ── Activity Stats ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                Activity Stats
                            </p>
                            {!statsLoaded && !statsLoading && (
                                <button
                                    onClick={loadStats}
                                    className="text-[11px] font-semibold text-[#274760] hover:underline"
                                >
                                    Load Stats
                                </button>
                            )}
                        </div>

                        {statsError && (
                            <div className="flex items-center justify-between text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                                <span>{statsError}</span>
                                <button
                                    onClick={() => { setStatsLoaded(false); loadStats(); }}
                                    className="font-semibold underline ml-2"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Skeleton */}
                        {statsLoading && (
                            <div className="grid grid-cols-2 gap-3 animate-pulse">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-14 bg-slate-100 rounded-xl" />
                                ))}
                            </div>
                        )}

                        {/* Stats cards */}
                        {docStats && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Total Appointments", value: docStats.totalAppointments, icon: FiCalendar },
                                        { label: "Completed", value: docStats.completedAppointments, icon: FiCheckCircle },
                                        { label: "Cancellation Rate", value: docStats.cancellationRate, icon: FiSlash },
                                        { label: "Consultations", value: docStats.totalConsultations, icon: FiFileText },
                                        { label: "Avg Duration", value: docStats.avgDuration ?? "—", icon: FiClock },
                                        {
                                            label: "Rating", value: docStats.rating
                                                ? `${docStats.rating} / 5`
                                                : "—", icon: FiStar
                                        },
                                    ].map(({ label, value, icon: Icon }) => (
                                        <div
                                            key={label}
                                            className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5"
                                        >
                                            <span className="h-7 w-7 rounded-lg bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                                <Icon size={13} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium truncate">
                                                    {label}
                                                </p>
                                                <p className="text-sm font-bold text-slate-700 leading-tight">
                                                    {value ?? "—"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Joined date — full width below the grid */}
                                <div className="mt-3">
                                    <InfoRow
                                        icon={FiCalendar}
                                        label="Joined"
                                        value={new Date(docStats.joinedDate).toLocaleDateString("en-GB", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })}
                                    />
                                </div>
                            </>
                        )}

                        {statsLoaded && !docStats && (
                            <p className="text-xs text-slate-400 text-center py-3">
                                No stats available yet.
                            </p>
                        )}
                    </div>

                    {/* ── Images ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <ImageSection src={certificate} label="Certificate" openLightbox={openLightbox} />
                        <ImageSection
                            src={pic && pic !== "default-doctor.png" ? pic : null}
                            label="Profile Photo"
                            openLightbox={openLightbox}
                        />
                    </div>

                </div>{/* end scrollable body */}

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-slate-100 space-y-2 shrink-0">

                    {isPending && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onAction(doctor._id, "active")}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 transition-colors"
                            >
                                <FiCheckCircle size={14} /> Approve
                            </button>
                            <button
                                onClick={() => onAction(doctor._id, "blocked")}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm font-semibold hover:bg-red-100 disabled:opacity-60 transition-colors"
                            >
                                <FiSlash size={14} /> Reject
                            </button>
                        </div>
                    )}

                    {isActive && (
                        <button
                            onClick={() => onAction(doctor._id, "blocked")}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 text-sm font-semibold hover:bg-amber-100 disabled:opacity-60 transition-colors"
                        >
                            <FiSlash size={14} /> Block Account
                        </button>
                    )}

                    {isBlocked && (
                        <button
                            onClick={() => onAction(doctor._id, "active")}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-60 transition-colors"
                        >
                            <FiCheckCircle size={14} /> Reactivate Account
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to delete Dr. ${name}? This cannot be undone.`)) {
                                onAction(doctor._id, "delete");
                            }
                        }}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm font-semibold hover:bg-red-100 disabled:opacity-60 transition-colors"
                    >
                        <FiTrash2 size={14} /> Delete Account
                    </button>
                </div>

            </div>
        </>
    );
};

export default DoctorDrawer;