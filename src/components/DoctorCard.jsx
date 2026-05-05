import { FiCheckCircle, FiSlash, FiEye, FiUser } from "react-icons/fi";
import { useLightbox } from "../context/LightBoxContext";

const StatusBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    const map = {
        pending: { label: "Pending", cls: "bg-amber-50 text-amber-600 border-amber-100" },
        active:  { label: "Active",  cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
        blocked: { label: "Blocked", cls: "bg-red-50 text-red-500 border-red-100" },
    };
    const { label, cls } = map[s] || { label: status, cls: "bg-slate-50 text-slate-500 border-slate-200" };
    return (
        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
            {label}
        </span>
    );
};

const DoctorCard = ({ doctor, isSelected, onClick, onAction, actionLoading }) => {
    const status     = (doctor.userId?.status || "").toLowerCase();
    const name       = doctor?.userId?.username || "Unknown Doctor";
    const spec       = doctor?.specialization   || "General";
    const exp        = doctor?.experience       ? `${doctor.experience} yrs` : null;
    const pic        = doctor?.doctorImage      || null;
    const isPending  = status === "pending";
    const isActive   = status === "active";
    const isBlocked  = status === "blocked";
    const {openLightbox} = useLightbox()

    return (
        <div
            onClick={onClick}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border px-4 py-3 mb-2 cursor-pointer transition-all
                ${isPending  ? "border-amber-200 bg-amber-50/40 hover:border-amber-300" : ""}
                ${isActive   ? "border-slate-200 bg-white hover:border-[#274760]/30" : ""}
                ${isBlocked  ? "border-red-100 bg-red-50/30 hover:border-red-200" : ""}
                ${isSelected ? "ring-2 ring-[#274760]/20 border-[#274760]/40 shadow-sm" : ""}
            `}
        >
            {/* Top row on mobile: avatar + info + eye */}
            <div className="flex items-center gap-3 flex-1 min-w-0">

                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-[#274760]/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {pic
                        ? <img src={pic} alt={name} onClick={()=> pic && openLightbox(pic)} className="w-full h-full object-cover" />
                        : <FiUser size={16} className="text-[#274760]" />
                    }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800 truncate">Dr. {name}</p>
                        <StatusBadge status={status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {spec}{exp ? ` · ${exp}` : ""}
                    </p>
                </div>

                {/* Eye — mobile only (top right of info row) */}
                <div className="sm:hidden w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <FiEye size={13} />
                </div>
            </div>

            {/* Action buttons — full width row on mobile, inline on desktop */}
            <div
                className="flex items-center gap-1.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                {isPending && (
                    <>
                        <button
                            onClick={() => onAction(doctor._id, "active")}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                        >
                            <FiCheckCircle size={12} /> Approve
                        </button>
                        <button
                            onClick={() => onAction(doctor._id, "blocked")}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
                        >
                            <FiSlash size={12} /> Reject
                        </button>
                    </>
                )}

                {isActive && (
                    <button
                        onClick={() => onAction(doctor._id, "blocked")}
                        disabled={actionLoading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold hover:bg-red-50 hover:text-red-500 hover:border-red-100 disabled:opacity-50 transition-colors"
                    >
                        <FiSlash size={12} /> Block
                    </button>
                )}

                {isBlocked && (
                    <button
                        onClick={() => onAction(doctor._id, "active")}
                        disabled={actionLoading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                    >
                        <FiCheckCircle size={12} /> Reactivate
                    </button>
                )}

                {/* Eye — desktop only */}
                <div className="hidden sm:flex w-7 h-7 rounded-lg bg-slate-100 items-center justify-center text-slate-400 shrink-0">
                    <FiEye size={13} />
                </div>
            </div>
        </div>
    );
};

export default DoctorCard;