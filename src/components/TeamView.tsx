import React from 'react';
import { Profile } from '../types';
import { Users, Mail, Phone, MapPin, Award, ShieldCheck } from 'lucide-react';

interface TeamViewProps {
  profile: Profile;
}

export const TeamView: React.FC<TeamViewProps> = ({ profile }) => {
  const colleagues = [
    {
      name: profile.namaAtasan || 'Dra. Hj. Siti Rohmah, M.M.Pd.',
      role: 'Kepala Sekolah',
      nip: profile.nipAtasan || '19680715 199303 2 004',
      status: 'Atasan Langsung',
      statusColor: 'bg-purple-50 text-purple-700',
    },
    {
      name: profile.namaLengkap || 'Tatang Supriatna, S.Pd.',
      role: profile.jabatan || 'Guru Kelas / Penata Muda',
      nip: profile.nip || '1989061420201210004',
      status: 'Anda Sendiri',
      statusColor: 'bg-blue-50 text-blue-700',
    },
    {
      name: 'Ahmad Fauzi, S.Pd.I.',
      role: 'Guru PAI & Budi Pekerti',
      nip: '19910512 201903 1 008',
      status: 'Rekan Guru',
      statusColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      name: 'Dewi Lestari, S.Pd.',
      role: 'Guru PJOK',
      nip: '19940228 202221 2 015',
      status: 'Rekan Guru',
      statusColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      name: 'Rahmat Hidayat, S.Kom.',
      role: 'Operator Sekolah / Dapodik',
      nip: '19951104 202321 1 002',
      status: 'Tenaga Kependidikan',
      statusColor: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Direktori Tim & Rekan Kerja
        </h2>
        <p className="text-xs text-slate-500">
          Daftar pendidik dan tenaga kependidikan di satuan pendidikan {profile.unitKerja || 'SD Negeri Sukabudi 02'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colleagues.map((person, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm shrink-0">
                  {person.name
                    .split(' ')
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${person.statusColor}`}>
                  {person.status}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {person.name}
                </h4>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{person.role}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  NIP. {person.nip}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>{profile.unitKerja || 'SD Negeri Sukabudi 02'}</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Aktif
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
