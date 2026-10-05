import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import {
  isSupabaseConfigured,
  getSupabaseClient,
} from '../../utils/supabase';

export interface AppUser {
  name: string;
  email: string;
}

interface LoginScreenProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('demo@hear2heal.com');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const trySupabaseLogin = async (loginEmail: string, loginPassword: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return undefined;
    }

    const { error } = await client.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      console.error('Supabase auth failed:', error.message);
      setAuthError(error.message);
      return false;
    }

    setAuthError('');
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      const supabaseLogin = await trySupabaseLogin(email, password);
      if (supabaseLogin === true) {
        setIsLoading(false);
        onLoginSuccess({
          name: email.split('@')[0] || 'User',
          email: email || 'demo@hear2heal.com',
        });
        return;
      }
      if (supabaseLogin === false) {
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Supabase login failed:', error);
      if (isSupabaseConfigured()) {
        const message = 'Supabase login failed. Check the connection and try again.';
        setAuthError(message);
        setIsLoading(false);
        return;
      }
    }

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: email.split('@')[0] || 'User',
        email: email || 'demo@hear2heal.com'
      });
    }, 400);
  };


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative font-sans text-slate-800 overflow-hidden">
      <div className="absolute -top-20 left-10 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[26px] bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 text-white shadow-[0_26px_50px_-22px_rgba(37,99,235,0.9)] mb-4 ring-8 ring-white/60">
            <span className="font-extrabold text-xl tracking-[0.14em]">H2H</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hear2Heal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
            Sign in to access Overview & Translation Tools
          </p>
        </div>

        <div className="glass-panel rounded-[30px] p-6 sm:p-8 border border-white/60">
          <div className="mb-6 pb-3 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600/80">Secure Portal</p>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Sign In</h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 ring-1 ring-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Ready</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-[0.12em]">
                Email / Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  required
                  className="w-full pl-11 pr-3 py-3 text-sm font-semibold rounded-2xl border border-slate-200/80 bg-white/80 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-[0.12em]">Password</label>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-11 py-3 text-sm font-semibold rounded-2xl border border-slate-200/80 bg-white/80 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="premium-button w-full mt-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm tracking-wide transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-75 shadow-[0_14px_30px_-10px_rgba(37,99,235,0.75)] border border-blue-400/40"
            >
              {isLoading ? (
                <>
                  <span className="w-4.5 h-4.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Enter Overview</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
            {authError && (
              <p role="alert" className="text-xs font-medium text-red-600 pt-1 text-center">
                {authError}
              </p>
            )}
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500 font-medium">
          Hear2Heal • Offline Medical Translation Assistant
        </p>
      </div>
    </div>
  );
};
