import { FiUserX, FiUserCheck, FiEye, FiUser } from "react-icons/fi";
 
const StatusBadge = ({ isActive }) => (
  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border
    ${isActive
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : "bg-red-50 text-red-500 border-red-100"
    }`}>
    {isActive ? "Active" : "Deactivated"}
  </span>
);
 
 const PatientCard = ({ patient, isSelected, onClick, onAction, actionLoading }) => {
  const isActive = (patient?.user?.status || "").toLowerCase() === "active";
  const name     = patient?.user?.username || patient?.personalInfo?.fullName || "Unknown Patient";
  const email    = patient?.user?.email    || patient?.personalInfo?.email    || "";
  const gender   = patient?.personalInfo?.gender || null;
  const age      = patient?.personalInfo?.age    || null;
  const pic      = patient?.personalInfo?.profileImage       || patient?.user?.profilePicture || null;
  const meta     = [gender, age ? `${age} yrs` : null].filter(Boolean).join(" · ");
 
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all
        ${isActive   ? "border-slate-200 bg-white hover:border-[#274760]/30" : "border-red-100 bg-red-50/30 hover:border-red-200"}
        ${isSelected ? "ring-2 ring-[#274760]/20 border-[#274760]/40 shadow-sm" : ""}
      `}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-[#274760]/10 flex items-center justify-center shrink-0 overflow-hidden">
        {pic
          ? <img src={pic} alt={name} className="w-full h-full object-cover" />
          : <FiUser size={16} className="text-[#274760]" />
        }
      </div>
 
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
          <StatusBadge isActive={isActive} />
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {email}{meta ? ` · ${meta}` : ""}
        </p>
      </div>
 
      {/* Quick actions */}
      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        {isActive ? (
          <button
            onClick={() => onAction(patient._id, "blocked")}
            disabled={actionLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold hover:bg-red-50 hover:text-red-500 hover:border-red-100 disabled:opacity-50 transition-colors"
          >
            <FiUserX size={12} /> Block
          </button>
        ) : (
          <button
            onClick={() => onAction(patient._id, "active")}
            disabled={actionLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50 transition-colors"
          >
            <FiUserCheck size={12} /> Activate
          </button>
        )}
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
          <FiEye size={13} />
        </div>
      </div>
    </div>
  );
};

export default PatientCard