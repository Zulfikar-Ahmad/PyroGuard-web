import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Turnstile, TurnstileHandle } from '../components/Turnstile';
import { AuthError, authService } from '../services/authService';

type View = 'login' | 'register' | 'forgot';

// Cloudflare's public "always passes" test key is used when no real site key is configured.
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

const inputClass =
  'w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';
const iconClass = 'w-4 h-4 absolute left-3.5 top-3 text-blue-500';
const primaryButtonClass =
  'w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center';
const linkButtonClass = 'font-bold text-blue-600 dark:text-blue-400 hover:underline';

const Spinner: React.FC = () => (
  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder: string;
  minLength?: number;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
}) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <Lock className={iconClass} />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          className={`${inputClass} pr-10`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export const AuthPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const captchaRef = useRef<TurnstileHandle>(null);

  const [view, setView] = useState<View>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // login + forgot
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // register
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const switchView = (next: View) => {
    setView(next);
    setErrorMsg('');
    setErrorCode('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const fail = (e: unknown) => {
    const err = e instanceof AuthError ? e : new AuthError('unknown', 'Terjadi kesalahan. Silakan coba lagi.');
    setErrorMsg(err.message);
    setErrorCode(err.code);
  };

  const begin = () => {
    setLoading(true);
    setErrorMsg('');
    setErrorCode('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!captchaToken) {
      setErrorMsg('Selesaikan verifikasi "Saya bukan robot" terlebih dahulu.');
      setErrorCode('captcha');
      return;
    }
    begin();
    try {
      await authService.login(identifier, password, rememberMe);
      // On success the auth listener swaps this page for the dashboard.
    } catch (err) {
      fail(err);
      captchaRef.current?.reset(); // a Turnstile token is single-use
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    begin();
    try {
      await authService.register({ username, email, password, confirmPassword });
      const sentTo = email.trim();
      setIdentifier(username.trim());
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setView('login');
      setSuccessMsg(
        `Akun berhasil dibuat! Kami mengirim email verifikasi ke ${sentTo}. Verifikasi email Anda terlebih dahulu sebelum masuk.`
      );
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    begin();
    try {
      await authService.resetPassword(identifier);
      setSuccessMsg(
        'Jika akun terdaftar, link untuk mengatur ulang password sudah dikirim ke email terkait. Periksa juga folder spam.'
      );
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading) return;
    begin();
    try {
      await authService.resendVerification(identifier, password);
      setSuccessMsg('Email verifikasi telah dikirim ulang. Periksa kotak masuk dan folder spam Anda.');
    } catch (err) {
      fail(err);
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<View, { title: string; subtitle: string }> = {
    login: { title: 'PyroGuard IoT', subtitle: 'ESP32-S3 Telemetry & Fire Emergency Command Center' },
    register: { title: 'Daftar Akun Baru', subtitle: 'Buat akun untuk memantau telemetri gudang' },
    forgot: { title: 'Pemulihan Password', subtitle: 'Masukkan username atau email terdaftar' },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0F172A] transition-colors">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Flame className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {titles[view].title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{titles[view].subtitle}</p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
            <div className="space-y-1.5">
              <p>{errorMsg}</p>
              {errorCode === 'email-not-verified' && (
                <button type="button" onClick={handleResend} disabled={loading} className="font-bold underline">
                  Kirim ulang email verifikasi
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex gap-2"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-px" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* ------------------------------ LOGIN ------------------------------ */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-identifier" className={labelClass}>
                Username / Email
              </label>
              <div className="relative">
                <User className={iconClass} />
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  className={inputClass}
                  placeholder="Username atau email"
                />
              </div>
            </div>

            <PasswordField
              id="login-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              placeholder="Password"
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-blue-600"
                />
                Ingat saya
              </label>
              <button type="button" onClick={() => switchView('forgot')} className={linkButtonClass}>
                Lupa password?
              </button>
            </div>

            <Turnstile
              ref={captchaRef}
              siteKey={TURNSTILE_SITE_KEY}
              theme={isDarkMode ? 'dark' : 'light'}
              onToken={setCaptchaToken}
            />

            <button type="submit" disabled={loading || !captchaToken} className={primaryButtonClass}>
              {loading ? <Spinner /> : 'MASUK'}
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Belum punya akun?{' '}
              <button type="button" onClick={() => switchView('register')} className={linkButtonClass}>
                Daftar sekarang
              </button>
            </p>
          </form>
        )}

        {/* ----------------------------- REGISTER ----------------------------- */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-username" className={labelClass}>
                Username
              </label>
              <div className="relative">
                <AtSign className={iconClass} />
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  maxLength={20}
                  className={inputClass}
                  placeholder="3-20 karakter: huruf, angka, . atau _"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className={labelClass}>
                Email
              </label>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputClass}
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <PasswordField
              id="reg-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
            />

            <PasswordField
              id="reg-confirm"
              label="Konfirmasi Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Ulangi password"
            />

            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? <Spinner /> : 'DAFTAR AKUN'}
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Sudah punya akun?{' '}
              <button type="button" onClick={() => switchView('login')} className={linkButtonClass}>
                Masuk
              </button>
            </p>
          </form>
        )}

        {/* ------------------------- FORGOT PASSWORD ------------------------- */}
        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4" noValidate>
            <div>
              <label htmlFor="forgot-identifier" className={labelClass}>
                Username / Email
              </label>
              <div className="relative">
                <User className={iconClass} />
                <input
                  id="forgot-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  className={inputClass}
                  placeholder="Username atau email"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? <Spinner /> : 'KIRIM LINK RESET'}
            </button>

            <p className="text-center text-xs">
              <button
                type="button"
                onClick={() => switchView('login')}
                className={`${linkButtonClass} inline-flex items-center gap-1`}
              >
                <ArrowLeft className="w-3 h-3" />
                Kembali ke halaman masuk
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
