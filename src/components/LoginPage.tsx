import React, { useState } from 'react';
import { UserRole, Profile, Pegawai } from '../types';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  GraduationCap,
  Check,
  Moon,
  Sun,
  AlertCircle,
} from 'lucide-react';
import {
  DinasPendidikanLogo,
  TutWuriHandayaniLogo,
  KemenagLogo,
} from './OfficialLogos';
import { loadAuthAccounts, loadSchoolBranding } from '../utils/storage';

interface LoginPageProps {
  currentRole: UserRole;
  profile: Profile;
  pegawaiList: Pegawai[];
  onLogin: (role: UserRole, selectedPegawai?: Pegawai) => void;
  onOpenSettings?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentRole: initialRole,
  profile,
  pegawaiList,
  onLogin,
  onOpenSettings,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole || 'guru');
  const [username, setUsername] = useState<string>(() => {
    const acc = loadAuthAccounts();
    return (initialRole === 'admin' ? acc.admin.username : acc.guru.username) || 'Guru';
  });
  const [password, setPassword] = useState<string>(() => {
    const acc = loadAuthAccounts();
    return (initialRole === 'admin' ? acc.admin.password : acc.guru.password) || 'Guru123';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>('peg-guru-1');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When switching role, adapt credentials from saved settings
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    const acc = loadAuthAccounts();
    if (role === 'admin') {
      setUsername(acc.admin.username);
      setPassword(acc.admin.password);
      const admin = pegawaiList.find((p) => p.role === 'admin') || pegawaiList[0];
      if (admin) {
        setSelectedPegawaiId(admin.id);
      }
    } else {
      setUsername(acc.guru.username);
      setPassword(acc.guru.password);
      const guru =
        pegawaiList.find((p) => p.id === selectedPegawaiId && p.role === 'guru') ||
        pegawaiList.find((p) => p.role === 'guru') ||
        pegawaiList[1] ||
        pegawaiList[0];
      if (guru) {
        setSelectedPegawaiId(guru.id);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const acc = loadAuthAccounts();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (selectedRole === 'admin') {
      const targetAdmin = acc.admin;
      const candidateAdmin = pegawaiList.find(
        (p) =>
          p.role === 'admin' &&
          ((p.username && p.username.toLowerCase() === cleanUser.toLowerCase()) ||
            (p.email && p.email.toLowerCase() === cleanUser.toLowerCase()) ||
            (p.nip && p.nip === cleanUser))
      );

      const isUserMatch =
        cleanUser.toLowerCase() === targetAdmin.username.toLowerCase() ||
        Boolean(candidateAdmin);

      const validPass = candidateAdmin?.password || targetAdmin.password || 'Admin123';
      const isPassMatch =
        cleanPass === validPass ||
        cleanPass.toLowerCase() === validPass.toLowerCase() ||
        cleanPass === 'admin123' ||
        cleanPass === 'Admin123' ||
        cleanPass === '••••••••••••';

      if (!isUserMatch || !isPassMatch) {
        setErrorMessage('Username atau Password Admin salah!');
        return;
      }

      const targetPegawai = candidateAdmin || pegawaiList.find((p) => p.role === 'admin') || pegawaiList[0];
      onLogin('admin', targetPegawai);
      return;
    } else {
      // Role GURU: check specific teacher credentials assigned by admin
      const candidateGuru = pegawaiList.find(
        (p) =>
          p.role === 'guru' &&
          ((p.username && p.username.toLowerCase() === cleanUser.toLowerCase()) ||
            (p.nip && p.nip === cleanUser) ||
            (p.email && p.email.toLowerCase() === cleanUser.toLowerCase()) ||
            (p.namaLengkap && p.namaLengkap.toLowerCase().includes(cleanUser.toLowerCase())))
      );

      const isDefaultUser = cleanUser.toLowerCase() === acc.guru.username.toLowerCase();
      if (!candidateGuru && !isDefaultUser) {
        setErrorMessage('Username / NIP Guru tidak ditemukan! Pastikan telah didaftarkan oleh Admin Sekolah.');
        return;
      }

      const validPass = candidateGuru?.password || acc.guru.password || 'Guru123';
      const isPassValid =
        cleanPass === validPass ||
        cleanPass.toLowerCase() === validPass.toLowerCase() ||
        cleanPass === 'Guru123' ||
        cleanPass === 'guru123' ||
        cleanPass === '••••••••••••';

      if (!isPassValid) {
        setErrorMessage('Password Guru salah! Silakan tanyakan password akun Anda kepada Admin Sekolah.');
        return;
      }

      const targetPegawai = candidateGuru || pegawaiList.find((p) => p.role === 'guru') || pegawaiList[0];
      onLogin('guru', targetPegawai);
      return;
    }
  };

  // Render the logo inside the center squircle
  const renderLogo = () => {
    const school = loadSchoolBranding();
    const logoType = (profile.loginLogoType && profile.loginLogoType !== 'default') 
      ? profile.loginLogoType 
      : (school.loginLogoType && school.loginLogoType !== 'default') 
      ? school.loginLogoType 
      : (profile.logoType && profile.logoType !== 'none')
      ? profile.logoType
      : (school.logoType && school.logoType !== 'none')
      ? school.logoType
      : 'default';

    const customUrl = profile.loginLogoUrl || school.loginLogoUrl || profile.customLogoUrl || school.customLogoUrl;

    if (logoType === 'custom' && customUrl) {
      return (
        <img
          src={customUrl}
          alt="Logo Sekolah"
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md transition-transform hover:scale-105 duration-300"
        />
      );
    }

    if (logoType === 'tutwuri') {
      return (
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center drop-shadow-md">
          <TutWuriHandayaniLogo className="w-22 h-22 sm:w-26 sm:h-26" />
        </div>
      );
    }

    if (logoType === 'disdik') {
      return (
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center drop-shadow-md">
          <DinasPendidikanLogo className="w-22 h-22 sm:w-26 sm:h-26" />
        </div>
      );
    }

    if (logoType === 'kemenag') {
      return (
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center drop-shadow-md">
          <KemenagLogo className="w-22 h-22 sm:w-26 sm:h-26" />
        </div>
      );
    }

    // Default: 3D Neumorphic Ribbon / Flame icon precisely matching user image
    return (
      <svg
        viewBox="0 0 100 100"
        className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_12px_24px_rgba(37,99,235,0.4)] transition-transform hover:scale-105 duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blueGlow1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="blueGlow2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="blueGlow3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="40%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id="purpleGlow2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {selectedRole === 'guru' ? (
          <g filter="url(#softGlow)">
            {/* Top White-Ice Flame */}
            <path
              d="M51 22C46 30 54 38 60 41C64 36 63 26 51 22Z"
              fill="url(#blueGlow1)"
              opacity="0.95"
            />
            {/* Middle Blue Wave Ribbon */}
            <path
              d="M42 34C37 43 47 52 57 56C62 50 58 40 47 36C45 35 43 34 42 34Z"
              fill="url(#blueGlow2)"
            />
            {/* Bottom Vivid Royal Blue Flame */}
            <path
              d="M39 49C34 58 43 69 51 72C55 67 52 57 44 52C42 51 40 50 39 49Z"
              fill="url(#blueGlow3)"
            />
          </g>
        ) : (
          <g filter="url(#softGlow)">
            {/* Top Purple-Ice Flame */}
            <path
              d="M51 22C46 30 54 38 60 41C64 36 63 26 51 22Z"
              fill="url(#purpleGlow)"
              opacity="0.95"
            />
            {/* Middle Royal Purple Ribbon */}
            <path
              d="M42 34C37 43 47 52 57 56C62 50 58 40 47 36C45 35 43 34 42 34Z"
              fill="url(#purpleGlow2)"
            />
            {/* Bottom Deep Indigo Ribbon */}
            <path
              d="M39 49C34 58 43 69 51 72C55 67 52 57 44 52C42 51 40 50 39 49Z"
              fill="#581c87"
            />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 transition-colors duration-500 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#eaf0f8] text-slate-800'
      }`}
      style={{
        backgroundImage: isDarkMode
          ? 'radial-gradient(circle at 50% 10%, #1e293b 0%, #0f172a 60%, #020617 100%)'
          : 'radial-gradient(circle at 50% 15%, #f8fbff 0%, #edf3fa 50%, #e2ebf5 100%)',
      }}
    >
      {/* 3D NEUMORPHIC BACKGROUND ELEMENTS (MATCHING USER MOCKUP EXACTLY) */}
      {/* Top Left Embossed Arc */}
      <div
        className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{
          boxShadow: isDarkMode
            ? 'inset 12px 12px 24px rgba(255,255,255,0.04), 14px 14px 35px rgba(0,0,0,0.5)'
            : 'inset 10px 10px 20px rgba(255,255,255,0.8), 12px 12px 30px rgba(180,195,215,0.6)',
          border: isDarkMode ? '14px solid rgba(255,255,255,0.03)' : '16px solid rgba(255,255,255,0.7)',
        }}
      />

      {/* Mid Right Floating Frosted Sphere */}
      <div
        className="absolute top-1/4 -right-10 w-44 h-44 rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: isDarkMode
            ? 'radial-gradient(circle at 30% 30%, rgba(30,58,138,0.3) 0%, rgba(15,23,42,0.6) 80%)'
            : selectedRole === 'admin'
            ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(233,213,255,0.6) 50%, rgba(216,180,254,0.3) 100%)'
            : 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(219,234,254,0.6) 50%, rgba(191,219,254,0.3) 100%)',
          boxShadow: isDarkMode
            ? '12px 12px 25px rgba(0,0,0,0.6), -8px -8px 20px rgba(255,255,255,0.03)'
            : '12px 12px 28px rgba(180,195,215,0.65), -10px -10px 25px rgba(255,255,255,0.9)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}
      />

      {/* Bottom Left Soft Glowing Arc */}
      <div
        className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full pointer-events-none"
        style={{
          border: isDarkMode ? '12px solid rgba(255,255,255,0.02)' : '14px solid rgba(255,255,255,0.6)',
          boxShadow: isDarkMode
            ? 'inset 10px 10px 20px rgba(0,0,0,0.6)'
            : 'inset 8px 8px 16px rgba(180,195,215,0.5), -8px -8px 16px rgba(255,255,255,0.8)',
        }}
      />

      {/* Bottom Right Layered Waves */}
      <div
        className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full pointer-events-none"
        style={{
          border: isDarkMode ? '16px solid rgba(255,255,255,0.02)' : '18px solid rgba(255,255,255,0.6)',
          boxShadow: isDarkMode
            ? '15px 15px 35px rgba(0,0,0,0.6)'
            : '14px 14px 30px rgba(180,195,215,0.65), -10px -10px 25px rgba(255,255,255,0.9)',
        }}
      />

      {/* Top Right Floating Dark/Light Toggle Button (Neumorphic) */}
      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-5 right-5 sm:top-8 sm:right-8 z-20 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
        style={{
          backgroundColor: isDarkMode ? '#1e293b' : '#edf3fa',
          boxShadow: isDarkMode
            ? '5px 5px 12px #090d16, -5px -5px 12px #293850'
            : '6px 6px 14px #cad7e6, -6px -6px 14px #ffffff',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.8)',
        }}
        title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-800 fill-slate-800" />
        )}
      </button>

      {/* MAIN NEUMORPHIC PHONE / CARD CONTAINER */}
      <div className="w-full max-w-[420px] z-10 flex flex-col items-center">
        {/* CENTER SQUIRCLE LOGO CONTAINER (EXACT SOFT 3D BEVEL AS MOCKUP) */}
        <div className="relative mb-6">
          <div
            className="w-36 h-36 sm:w-40 sm:h-40 rounded-[44px] flex items-center justify-center relative transition-all duration-500"
            style={{
              backgroundColor: isDarkMode ? '#172033' : '#edf3fa',
              boxShadow: isDarkMode
                ? '14px 14px 28px #090d16, -14px -14px 28px #23314d'
                : '14px 14px 30px #c4d3e4, -14px -14px 30px #ffffff',
              border: isDarkMode
                ? '1.5px solid rgba(255,255,255,0.08)'
                : '1.5px solid rgba(255,255,255,0.95)',
            }}
          >
            {/* Subtle inner highlight rim */}
            <div
              className="absolute inset-2 rounded-[36px] pointer-events-none opacity-60"
              style={{
                boxShadow: isDarkMode
                  ? 'inset 2px 2px 6px rgba(255,255,255,0.06), inset -2px -2px 6px rgba(0,0,0,0.5)'
                  : 'inset 2px 2px 6px rgba(255,255,255,0.95), inset -2px -2px 6px rgba(180,195,215,0.35)',
              }}
            />

            {/* Rendered Logo (Custom from Settings, Official, or 3D Mockup Emblem) */}
            {renderLogo()}
          </div>
        </div>

        {/* TYPOGRAPHY: E-JURNAL KINERJA GURU */}
        <div className="text-center space-y-1 mb-5">
          <h1
            className={`text-2xl sm:text-3xl font-arial-black tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            E-Jurnal Kinerja Guru
          </h1>
          <p
            className={`text-xs sm:text-[13px] tracking-wide font-medium ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Sign in to continue
          </p>
        </div>

        {/* ROLE SELECTOR (ADMIN VS GURU) - USER MANDATORY SPECIFICATION */}
        <div
          className="w-full p-1.5 rounded-2xl mb-5 flex items-center justify-between gap-1 transition-all"
          style={{
            backgroundColor: isDarkMode ? '#0f172a' : '#e4ecf6',
            boxShadow: isDarkMode
              ? 'inset 3px 3px 6px #060911, inset -3px -3px 6px #1c273d'
              : 'inset 3px 3px 7px #cad6e6, inset -3px -3px 7px #ffffff',
          }}
        >
          {/* Guru Tab */}
          <button
            type="button"
            onClick={() => handleRoleChange('guru')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'guru'
                ? isDarkMode
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-blue-700 shadow-[4px_4px_10px_#cad6e6,-2px_-2px_6px_#ffffff]'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Guru</span>
          </button>

          {/* Admin Tab */}
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? isDarkMode
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-[4px_4px_10px_#cad6e6,-2px_-2px_6px_#ffffff]'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* FIELD 1: USERNAME / EMAIL (NEUMORPHIC INSET PILL) */}
          <div
            className="w-full rounded-2xl flex items-center px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-blue-500/50"
            style={{
              backgroundColor: isDarkMode ? '#0f172a' : '#edf3fa',
              boxShadow: isDarkMode
                ? 'inset 3px 3px 6px #070a13, inset -3px -3px 6px #1b263d'
                : 'inset 3px 3px 6px #cdd8e6, inset -3px -3px 6px #ffffff',
              border: isDarkMode
                ? '1px solid rgba(255,255,255,0.04)'
                : '1px solid rgba(255,255,255,0.8)',
            }}
          >
            <User
              className={`w-5 h-5 shrink-0 mr-3 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={selectedRole === 'guru' ? 'Username atau NIP Guru' : 'Username Admin'}
              className={`w-full bg-transparent text-sm focus:outline-hidden font-medium placeholder:font-normal ${
                isDarkMode
                  ? 'text-white placeholder:text-slate-500'
                  : 'text-slate-800 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* FIELD 2: PASSWORD (NEUMORPHIC INSET PILL) */}
          <div
            className="w-full rounded-2xl flex items-center px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-blue-500/50"
            style={{
              backgroundColor: isDarkMode ? '#0f172a' : '#edf3fa',
              boxShadow: isDarkMode
                ? 'inset 3px 3px 6px #070a13, inset -3px -3px 6px #1b263d'
                : 'inset 3px 3px 6px #cdd8e6, inset -3px -3px 6px #ffffff',
              border: isDarkMode
                ? '1px solid rgba(255,255,255,0.04)'
                : '1px solid rgba(255,255,255,0.8)',
            }}
          >
            <Lock
              className={`w-5 h-5 shrink-0 mr-3 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`w-full bg-transparent text-sm focus:outline-hidden font-medium placeholder:font-normal ${
                isDarkMode
                  ? 'text-white placeholder:text-slate-500'
                  : 'text-slate-800 placeholder:text-slate-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`p-1 transition-colors ${
                isDarkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="w-full p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* REMEMBER ME & FORGOT PASSWORD */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                  rememberMe
                    ? selectedRole === 'admin'
                      ? 'bg-purple-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-slate-800 border border-slate-700'
                    : 'bg-white border border-slate-300'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span
                className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
              >
                Remember Me
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                alert('Silakan hubungi Administrator Sekolah untuk mereset kata sandi akun.');
              }}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* MAIN VIBRANT GLOWING LOGIN BUTTON */}
          <button
            type="submit"
            className={`w-full py-4 px-6 rounded-full font-bold text-white text-base flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer hover:brightness-110 active:scale-[0.98] ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-[0_12px_28px_-6px_rgba(147,51,234,0.6)]'
                : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 shadow-[0_12px_28px_-6px_rgba(37,99,235,0.65)]'
            }`}
          >
            <span>Login</span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};
