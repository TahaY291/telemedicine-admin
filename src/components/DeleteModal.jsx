import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import {
    FiSearch, FiRefreshCw, FiX, FiStar,
    FiTrash2, FiAlertCircle, FiUser, FiChevronLeft,
    FiChevronRight, FiMessageSquare,
} from "react-icons/fi";
 
const PAGE_SIZE = 10;

const Stars = ({ rating, size = "sm" }) => {
    const r = Math.round(rating || 0);
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <FiStar
                    key={s}
                    size={size === "sm" ? 12 : 15}
                    className={s <= r ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
                />
            ))}
        </div>
    );
};
 

const RatingBadge = ({ rating }) => {
    const r = Number(rating) || 0;
    const cls =
        r >= 4 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
        r >= 3 ? "bg-amber-50 text-amber-600 border-amber-100" :
                 "bg-red-50 text-red-500 border-red-100";
    return (
        <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
            <FiStar size={9} className="fill-current" />
            {r.toFixed(1)}
        </span>
    );
};
 
const DeleteModal = ({ review, onConfirm, onCancel, loading }) => {
    if (!review) return null;
    const patientName = review?.patientId?.user?.username || "this patient";
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-sm">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <FiAlertCircle size={22} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Remove this review?</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Review by <span className="font-semibold text-slate-600">{patientName}</span> will be permanently deleted.
                            This also updates the doctor's rating.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors"
                        >
                            {loading ? "Removing…" : "Remove"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default DeleteModal