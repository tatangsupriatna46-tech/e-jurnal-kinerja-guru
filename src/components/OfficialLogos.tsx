import React from 'react';
import { BookOpen } from 'lucide-react';
import { Profile } from '../types';
import { loadSchoolBranding } from '../utils/storage';

export const DinasPendidikanLogo: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Dinas Pendidikan"
  >
    {/* Blue Pagoda / Tower Wings */}
    <path
      d="M50 10 L68 28 L62 46 L76 60 L68 74 L50 82 L32 74 L24 60 L38 46 L32 28 Z"
      fill="#0284c7"
      stroke="#0369a1"
      strokeWidth="1.5"
    />
    {/* Central Golden Flame / Torch */}
    <path
      d="M50 16 C54 26 58 32 50 48 C42 32 46 26 50 16 Z"
      fill="#f59e0b"
      stroke="#d97706"
      strokeWidth="1"
    />
    <path
      d="M50 22 C52 28 55 33 50 42 C45 33 48 28 50 22 Z"
      fill="#fef08a"
    />
    {/* Middle Blue Wing details */}
    <path
      d="M32 44 C40 40 46 46 50 50 C44 54 36 54 32 44 Z"
      fill="#0369a1"
    />
    <path
      d="M68 44 C60 40 54 46 50 50 C56 54 64 54 68 44 Z"
      fill="#0369a1"
    />
    {/* Lower Pedestal / Base */}
    <path
      d="M26 62 Q50 56 74 62 L70 70 Q50 64 30 70 Z"
      fill="#f59e0b"
    />
    {/* Blue Ribbon Banner at bottom */}
    <path
      d="M14 74 L24 69 L50 75 L76 69 L86 74 L80 84 L50 80 L20 84 Z"
      fill="#0284c7"
      stroke="#0369a1"
      strokeWidth="1.2"
    />
    <path
      d="M20 73 L50 78 L80 73 L76 81 L50 85 L24 81 Z"
      fill="#0369a1"
    />
    {/* Ribbon folds */}
    <path d="M14 74 L20 84 L24 73 Z" fill="#0284c7" opacity="0.8" />
    <path d="M86 74 L80 84 L76 73 Z" fill="#0284c7" opacity="0.8" />
    {/* Text: DINAS PENDIDIKAN */}
    <text
      x="50"
      y="94"
      textAnchor="middle"
      fontSize="6.5"
      fontWeight="900"
      fill="#0369a1"
      fontFamily="sans-serif"
      letterSpacing="0.4"
    >
      DINAS PENDIDIKAN
    </text>
  </svg>
);

export const TutWuriHandayaniLogo: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Tut Wuri Handayani"
  >
    {/* Outer circle / shield */}
    <path
      d="M50 5 L88 28 L78 78 L50 95 L22 78 L12 28 Z"
      fill="#0369a1"
      stroke="#0c4a6e"
      strokeWidth="2"
    />
    {/* Inner golden shield */}
    <path
      d="M50 11 L82 31 L73 74 L50 89 L27 74 L18 31 Z"
      fill="#f59e0b"
      stroke="#b45309"
      strokeWidth="1.5"
    />
    {/* White base */}
    <circle cx="50" cy="50" r="30" fill="#ffffff" />
    {/* Belencong Flame */}
    <path
      d="M50 24 C55 34 60 40 50 56 C40 40 45 34 50 24 Z"
      fill="#dc2626"
    />
    <path
      d="M50 30 C53 37 56 42 50 52 C44 42 47 37 50 30 Z"
      fill="#facc15"
    />
    {/* Wings */}
    <path
      d="M26 48 C34 44 42 50 48 54 C42 58 32 58 26 48 Z"
      fill="#0284c7"
    />
    <path
      d="M74 48 C66 44 58 50 52 54 C58 58 68 58 74 48 Z"
      fill="#0284c7"
    />
    <path
      d="M28 58 C36 56 44 60 48 64 C40 68 32 66 28 58 Z"
      fill="#0284c7"
    />
    <path
      d="M72 58 C64 56 56 60 52 64 C60 68 68 66 72 58 Z"
      fill="#0284c7"
    />
    {/* Book / Pedestal */}
    <path
      d="M32 72 Q50 66 68 72 L64 77 Q50 72 36 77 Z"
      fill="#0f172a"
    />
  </svg>
);

export const GarudaLogo: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Garuda Pancasila"
  >
    {/* Golden Body */}
    <circle cx="50" cy="50" r="44" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
    {/* Wings Spread */}
    <path
      d="M10 38 Q30 20 50 32 Q70 20 90 38 Q74 65 50 58 Q26 65 10 38 Z"
      fill="#f59e0b"
      stroke="#b45309"
      strokeWidth="1.5"
    />
    {/* Head & Crown */}
    <circle cx="50" cy="24" r="8" fill="#d97706" />
    <path d="M50 14 L55 22 L45 22 Z" fill="#b45309" />
    {/* Shield in center */}
    <path
      d="M36 38 L64 38 L62 62 L50 72 L38 62 Z"
      fill="#dc2626"
      stroke="#ffffff"
      strokeWidth="2"
    />
    <path d="M50 38 L50 72 M36 54 L64 54" stroke="#ffffff" strokeWidth="2" />
    <rect x="44" y="48" width="12" height="12" fill="#000000" />
    <circle cx="50" cy="54" r="3" fill="#facc15" />
    {/* Ribbon Bhinneka Tunggal Ika */}
    <path
      d="M26 78 Q50 72 74 78 L70 84 Q50 78 30 84 Z"
      fill="#ffffff"
      stroke="#0f172a"
      strokeWidth="1"
    />
  </svg>
);

export const KemenagLogo: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Kementerian Agama"
  >
    {/* Green shield */}
    <path
      d="M50 8 L86 26 L78 76 L50 92 L22 76 L14 26 Z"
      fill="#15803d"
      stroke="#166534"
      strokeWidth="2"
    />
    <path
      d="M50 15 L80 30 L73 72 L50 86 L27 72 L20 30 Z"
      fill="#ffffff"
    />
    {/* Scales of justice & Quran / Book */}
    <circle cx="50" cy="46" r="22" fill="#16a34a" />
    <path d="M50 30 L50 64" stroke="#facc15" strokeWidth="3" />
    <path d="M35 38 L65 38" stroke="#facc15" strokeWidth="2.5" />
    <path d="M32 50 L42 50 L37 42 Z" fill="#facc15" />
    <path d="M58 50 L68 50 L63 42 Z" fill="#facc15" />
    {/* Book at bottom */}
    <path d="M36 68 Q50 62 64 68 L60 74 Q50 68 40 74 Z" fill="#facc15" />
  </svg>
);

export interface SchoolBrandLogoProps {
  profile?: Profile;
  className?: string; // Container className e.g. "w-9 h-9"
}

export const SchoolBrandLogo: React.FC<SchoolBrandLogoProps> = ({
  profile,
  className = 'w-9 h-9',
}) => {
  const school = loadSchoolBranding();

  // 1. Cek custom logo yang diunggah pengguna untuk instansi / kop atau login
  const customUrl =
    profile?.customLogoUrl ||
    school.customLogoUrl ||
    profile?.loginLogoUrl ||
    school.loginLogoUrl;

  if (customUrl) {
    return (
      <div
        className={`${className} rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden`}
      >
        <img
          src={customUrl}
          alt="Logo Instansi"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // 2. Cek logo resmi kedinasan yang dipilih di pengaturan
  const effectiveLogoType =
    profile?.logoType && profile.logoType !== 'none'
      ? profile.logoType
      : school.logoType && school.logoType !== 'none'
      ? school.logoType
      : profile?.loginLogoType && profile.loginLogoType !== 'default'
      ? profile.loginLogoType
      : school.loginLogoType && school.loginLogoType !== 'default'
      ? school.loginLogoType
      : (profile?.loginLogoType === 'default' || school.loginLogoType === 'default')
      ? 'default'
      : 'none';

  if (effectiveLogoType === 'tutwuri') {
    return (
      <div
        className={`${className} rounded-xl bg-sky-50 border border-sky-200 p-1 flex items-center justify-center shadow-xs shrink-0`}
      >
        <TutWuriHandayaniLogo className="w-full h-full p-0.5 drop-shadow-2xs" />
      </div>
    );
  }

  if (effectiveLogoType === 'disdik') {
    return (
      <div
        className={`${className} rounded-xl bg-sky-50 border border-sky-200 p-1 flex items-center justify-center shadow-xs shrink-0`}
      >
        <DinasPendidikanLogo className="w-full h-full p-0.5 drop-shadow-2xs" />
      </div>
    );
  }

  if (effectiveLogoType === 'garuda') {
    return (
      <div
        className={`${className} rounded-xl bg-amber-50 border border-amber-200 p-1 flex items-center justify-center shadow-xs shrink-0`}
      >
        <GarudaLogo className="w-full h-full p-0.5 drop-shadow-2xs" />
      </div>
    );
  }

  if (effectiveLogoType === 'kemenag') {
    return (
      <div
        className={`${className} rounded-xl bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center shadow-xs shrink-0`}
      >
        <KemenagLogo className="w-full h-full p-0.5 drop-shadow-2xs" />
      </div>
    );
  }

  if (effectiveLogoType === 'default') {
    return (
      <div
        className={`${className} rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-1 flex items-center justify-center shadow-xs text-white shrink-0`}
      >
        <div className="w-5 h-5 rounded-full bg-white/25 backdrop-blur-xs flex items-center justify-center font-black text-[9px] tracking-tight">
          3D
        </div>
      </div>
    );
  }

  // 3. Fallback jika tidak ada logo khusus
  return (
    <div
      className={`${className} rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 flex items-center justify-center shadow-xs text-white shrink-0`}
    >
      <BookOpen className="w-5 h-5 drop-shadow-xs" />
    </div>
  );
};
