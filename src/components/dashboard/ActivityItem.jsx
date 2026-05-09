import {
   FiCalendar ,FiUserPlus
} from "react-icons/fi";
import {Link} from 'react-router-dom'


const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

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

export default ActivityItem