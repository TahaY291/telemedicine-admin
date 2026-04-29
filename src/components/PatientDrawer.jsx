import {
  FiX, FiMail, FiPhone, FiMapPin,
  FiUserX, FiUserCheck, FiTrash2,
  FiCalendar, FiHeart, FiDroplet, FiUser,
  FiAlertCircle,
} from "react-icons/fi";

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
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

const PatientDrawer = ({ patient, onClose, onAction, actionLoading }) => {
  // ✅ Bug 1 fixed — read status field, not isActive
  const isActive = (patient?.user?.status || "").toLowerCase() === "active";
  const name = patient?.user?.username || "Unknown";
  const email = patient?.user?.email || null;
  const phone = patient?.phoneNumber || null;
  const city = patient?.personalInfo?.address?.city || null;
  const street = patient?.personalInfo?.address?.street || null;
  const gender = patient?.personalInfo?.gender || null;
  const pic = patient?.personalInfo?.profileImage || null;

  // ✅ Bug 4 fixed — calculate age from dob
  const dobRaw = patient?.personalInfo?.dob || null;
  const age = dobRaw
    ? `${new Date().getFullYear() - new Date(dobRaw).getFullYear()} years`
    : null;

  // ✅ Bug 5 fixed — format dob for display
  const dob = dobRaw
    ? new Date(dobRaw).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    })
    : null;

  // ✅ Bug 6 fixed — no duplicate fallback
  const bloodGroup = patient?.medicalInfo?.bloodGroup || null;

  const allergies = Array.isArray(patient?.medicalInfo?.allergies)
    ? patient.medicalInfo.allergies.join(", ")
    : patient?.medicalInfo?.allergies || null;

  // ✅ Bug 3 fixed — chronicDiseases matches schema
  const conditions = Array.isArray(patient?.medicalInfo?.chronicDiseases)
    ? patient.medicalInfo.chronicDiseases.join(", ")
    : patient?.medicalInfo?.chronicDiseases || null;

  const medications = Array.isArray(patient?.medicalInfo?.medications)
    ? patient.medicalInfo.medications.join(", ")
    : patient?.medicalInfo?.medications || null;

  const medicalNotes = patient?.medicalInfo?.medicalNotes || null;
  const contactName = patient?.emergencyInfo?.contactName || null;
  const contactPhone = patient?.emergencyInfo?.contactPhone || null;
  const contactRel = patient?.emergencyInfo?.relation || null;

  return (
    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose}>

      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden" >


        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <p className="text-sm font-bold text-slate-700">Patient Profile</p>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <FiX size={14} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Profile */}
          <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-20 h-20 rounded-2xl bg-[#274760]/10 flex items-center justify-center overflow-hidden">
              {pic
                ? <img src={pic} alt={name} className="w-full h-full object-cover" />
                : <FiUser size={30} className="text-[#274760]" />
              }
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{name}</h2>
              {gender && (
                <p className="text-sm text-slate-400 mt-0.5 capitalize">
                  {gender}{age ? `, ${age}` : ""}
                </p>
              )}
              <div className="mt-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border
                                ${isActive
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-red-50 text-red-500 border-red-200"
                  }`}>
                  {isActive ? "Active" : "Blocked"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contact</p>
            <InfoRow icon={FiMail} label="Email" value={email} />
            <InfoRow icon={FiPhone} label="Phone" value={phone} />
            <InfoRow icon={FiMapPin} label="City" value={city} />
            <InfoRow icon={FiMapPin} label="Street" value={street} />
          </div>

          {/* Personal */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Personal</p>
            <InfoRow icon={FiCalendar} label="Date of Birth" value={dob} />
            <InfoRow icon={FiDroplet} label="Blood Group" value={bloodGroup} />
          </div>

          {/* Medical History */}
          {(allergies || conditions || medications || medicalNotes) && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Medical History</p>
              <InfoRow icon={FiAlertCircle} label="Allergies" value={allergies} />
              <InfoRow icon={FiHeart} label="Chronic Diseases" value={conditions} />
              <InfoRow icon={FiHeart} label="Medications" value={medications} />
              <InfoRow icon={FiHeart} label="Notes" value={medicalNotes} />
            </div>
          )}

          {/* Emergency Contact */}
          {(contactName || contactPhone) && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Emergency Contact</p>
              <InfoRow icon={FiUser} label="Name" value={contactName} />
              <InfoRow icon={FiPhone} label="Phone" value={contactPhone} />
              <InfoRow icon={FiUser} label="Relationship" value={contactRel} />
            </div>
          )}

        </div>

        {/* ── Footer Actions ── */}
        <div className="px-5 py-4 border-t border-slate-100 space-y-2 shrink-0">
          {/* ✅ Bug 2 fixed — sends "blocked" not "deactivated" */}
          {isActive ? (
            <button
              onClick={() => onAction(patient._id, "blocked")}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 text-sm font-semibold hover:bg-amber-100 disabled:opacity-60 transition-colors"
            >
              <FiUserX size={14} /> Block Account
            </button>
          ) : (
            <button
              onClick={() => onAction(patient._id, "active")}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-60 transition-colors"
            >
              <FiUserCheck size={14} /> Reactivate Account
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm(`Delete ${name}? This cannot be undone.`)) {
                onAction(patient._id, "delete");
              }
            }}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm font-semibold hover:bg-red-100 disabled:opacity-60 transition-colors"
          >
            <FiTrash2 size={14} /> Delete Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default PatientDrawer;