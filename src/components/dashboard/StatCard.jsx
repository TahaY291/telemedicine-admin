const StatCard = ({ icon: Icon, label, value, sub, accent, iconBg, iconColor, delta }) => (
  <div className={`relative rounded-2xl p-5 max-sm:p-3 border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
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


export default StatCard