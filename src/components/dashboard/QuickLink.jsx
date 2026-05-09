import {Link} from 'react-router-dom'
import {FiChevronRight} from 'react-icons/fi'


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

export default QuickLink