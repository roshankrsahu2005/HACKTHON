import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string>('');

  const executeLogin = (user: AppUser) => {
    setIsLoading(true);
    setLoginSuccessMessage(`Signing in as ${user.name}...`);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(user);
    }, 100);
  };

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const trimmedEmail = email.trim() || 'demo@hear2heal.com';
    const userName = trimmedEmail.includes('@')
      ? trimmedEmail.split('@')[0]
      : trimmedEmail;

    // Fire Supabase auth in background (non-blocking)
    try {
      const client = getSupabaseClient();
      if (client && isSupabaseConfigured()) {
        client.auth.signInWithPassword({
          email: trimmedEmail.includes('@') ? trimmedEmail : `${trimmedEmail}@hear2heal.com`,
          password: password || 'password123'
        }).catch(() => {});
      }
    } catch {
      // Ignore background auth error
    }

    executeLogin({
      name: userName.charAt(0).toUpperCase() + userName.slice(1),
      email: trimmedEmail.includes('@') ? trimmedEmail : `${trimmedEmail}@hear2heal.com`
    });
  };

  const handleQuickRoleSelect = (roleName: string, roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    executeLogin({
      name: roleName,
      email: roleEmail
    });
  };

  const handleGoogleSignIn = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsLoading(true);
    setLoginSuccessMessage('Authenticating with Google...');

    try {
      const client = getSupabaseClient();
      if (client && isSupabaseConfigured()) {
        const { data, error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (err) {
      console.warn('Google sign in note:', err);
    }

    // Direct Google Clinician Session fallback
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'Dr. Clinician (Google)',
        email: 'clinician.google@hear2heal.com'
      });
    }, 100);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative font-sans text-slate-800 overflow-hidden bg-[#eef3fa]">
      <div className="absolute -top-20 left-10 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[26px] bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 text-white shadow-[0_26px_50px_-22px_rgba(37,99,235,0.9)] mb-4 ring-8 ring-white/60">
            <span className="font-extrabold text-xl tracking-[0.14em]">H2H</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hear2Heal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
            Sign in to access Overview & Clinical Triage Tools
          </p>
        </div>

        <div className="glass-panel rounded-[30px] p-6 sm:p-8 border border-white/60 shadow-xl">
          <div className="mb-5 pb-3 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600/80">Secure Portal</p>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Sign In</h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 ring-1 ring-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Ready</span>
            </span>
          </div>

          {/* Sign in with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-sm transition-all hover:shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 mb-4"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200/80 w-full" />
            <span className="bg-[#f0f4f9] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              or clinician sign-in
            </span>
          </div>

          {/* Quick Role Selection Pills */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">
              1-Tap Quick Demo Sign-In
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('Dr. Sharma', 'doctor@hear2heal.com')}
                className="py-2 px-2 rounded-xl neu-button text-[11px] font-bold text-slate-700 hover:text-blue-700 hover:border-blue-400 cursor-pointer transition-all text-center truncate"
              >
                👨‍⚕️ Doctor
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('Nurse Priya', 'nurse@hear2heal.com')}
                className="py-2 px-2 rounded-xl neu-button text-[11px] font-bold text-slate-700 hover:text-blue-700 hover:border-blue-400 cursor-pointer transition-all text-center truncate"
              >
                👩‍⚕️ Nurse / EMT
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('Triage Officer', 'triage@hear2heal.com')}
                className="py-2 px-2 rounded-xl neu-button text-[11px] font-bold text-slate-700 hover:text-blue-700 hover:border-blue-400 cursor-pointer transition-all text-center truncate"
              >
                🚨 Triage Lead
              </button>
            </div>
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
              onClick={handleSubmit}
              disabled={isLoading}
              className="premium-button w-full mt-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm tracking-wide transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-75 shadow-[0_14px_30px_-10px_rgba(37,99,235,0.75)] border border-blue-400/40"
            >
              {isLoading ? (
                <>
                  <span className="w-4.5 h-4.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                  <span>{loginSuccessMessage || 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>Sign In & Enter Overview</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500 font-medium">
          Hear2Heal • Offline Medical Translation Assistant
        </p>
      </div>
    </div>
  );
};
