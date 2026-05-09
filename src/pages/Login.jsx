import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminAuth = ({ mode = 'login' }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const accountRole = 'admin';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = mode === 'login' ? '/users/login' : '/users/register';
    const payload =
      mode === 'login'
        ? { email: formData.email, password: formData.password }
        : { ...formData, role: accountRole };

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1${endpoint}`,
        payload,
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );

      setMessage({ type: 'success', text: data.message });

      if (mode === 'login') {
        setUser(data.data.user);
        setTimeout(() => navigate(`/${data.data.user.role}`), 1500);
      } else {
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f1e2e] px-4">

      {/* Background decorative blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#274760]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#4a90b8]/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#274760]/10 blur-2xl pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-linear-to-r from-[#4a90b8] via-[#274760] to-[#4a90b8]" />

          <div className="px-8 pt-8 pb-10">

            {/* Icon + Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#274760] to-[#4a90b8] flex items-center justify-center mb-4 shadow-lg shadow-[#274760]/40">
                <svg width="28" height="28" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {mode === 'login' ? 'Admin Sign In' : 'Admin Registration'}
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                ProHealth &mdash; {mode === 'login' ? 'secure admin access' : 'create admin account'}
              </p>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border ${
                message.type === 'error'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {message.type === 'error' ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {message.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                    <input
                      type="text"
                      name="username"
                      required
                      placeholder="Admin Name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-[#4a90b8]/60 focus:ring-2 focus:ring-[#4a90b8]/20 outline-none transition text-sm"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="admin@prohealth.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-[#4a90b8]/60 focus:ring-2 focus:ring-[#4a90b8]/20 outline-none transition text-sm"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-[#4a90b8]/60 focus:ring-2 focus:ring-[#4a90b8]/20 outline-none transition text-sm"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#4a90b8] transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide mt-2 flex items-center justify-center gap-2 bg-linear-to-r from-[#274760] to-[#4a90b8] hover:from-[#1e364a] hover:to-[#3a7da6] shadow-lg shadow-[#274760]/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === 'login' ? (
                  <>
                    Sign In
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                ) : 'Register as Admin'}
              </button>
            </form>

            {/* Footer link */}
            <p className="text-center mt-6 text-sm text-slate-500">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <Link
                to={mode === 'login' ? '/signup' : '/login'}
                className="ml-1.5 font-bold text-[#4a90b8] hover:text-white transition-colors"
              >
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </Link>
            </p>

          </div>
        </div>

        {/* Bottom label */}
        <p className="text-center text-xs text-slate-600 mt-5">
          ProHealth Medical Care &mdash; Admin Portal &mdash; Secure & Private
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;