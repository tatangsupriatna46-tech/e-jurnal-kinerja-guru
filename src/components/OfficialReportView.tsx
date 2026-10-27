import React from 'react';
import { Profile, DailyReport } from '../types';
import { formatTanggalLengkapIndo } from '../utils/dateUtils';
import {
  DinasPendidikanLogo,
  TutWuriHandayaniLogo,
  GarudaLogo,
  KemenagLogo,
} from './OfficialLogos';

interface OfficialReportViewProps {
  profile: Profile;
  report: DailyReport;
  printableRef?: React.RefObject<HTMLDivElement | null>;
}

export const OfficialReportView: React.FC<OfficialReportViewProps> = ({
  profile,
  report,
  printableRef,
}) => {
  const tanggalLengkap = formatTanggalLengkapIndo(report.tanggal);

  const hasLogo = Boolean(
    profile.customLogoUrl || (profile.logoType && profile.logoType !== 'none')
  );

  const renderLogo = () => {
    if (profile.customLogoUrl) {
      return (
        <img
          src={profile.customLogoUrl}
          alt="Logo Instansi"
          crossOrigin="anonymous"
          className="w-16 h-16 object-contain shrink-0"
        />
      );
    }
    if (profile.logoType === 'tutwuri') {
      return <TutWuriHandayaniLogo className="w-16 h-16 shrink-0" />;
    }
    if (profile.logoType === 'disdik') {
      return <DinasPendidikanLogo className="w-16 h-16 shrink-0" />;
    }
    if (profile.logoType === 'garuda') {
      return <GarudaLogo className="w-16 h-16 shrink-0" />;
    }
    if (profile.logoType === 'kemenag') {
      return <KemenagLogo className="w-16 h-16 shrink-0" />;
    }
    return null;
  };

  const isF4 = report.paperSize === 'F4';

  // Format Keterangan to 2 lines like in reference PDF: "Selesai 100%\n(Sesuai Target)"
  const formatKeterangan = (text: string) => {
    if (!text) {
      return (
        <div className="leading-tight text-center">
          <div className="font-bold text-black text-xs">Selesai 100%</div>
          <div className="text-[10.5px] text-slate-600 font-normal mt-0.5">(Sesuai Target)</div>
        </div>
      );
    }

    if (text.includes('(')) {
      const parts = text.split('(');
      const main = parts[0].trim();
      const sub = '(' + parts.slice(1).join('(').trim();
      return (
        <div className="leading-tight text-center">
          <div className="font-bold text-black text-xs">{main}</div>
          <div className="text-[10.5px] text-slate-600 font-normal mt-0.5">{sub}</div>
        </div>
      );
    }

    return (
      <div className="leading-tight text-center">
        <div className="font-bold text-black text-xs">{text}</div>
        <div className="text-[10.5px] text-slate-600 font-normal mt-0.5">(Sesuai Target)</div>
      </div>
    );
  };

  // Format Waktu to show time + WIB below
  const formatWaktu = (waktu: string) => {
    if (!waktu) return '-';
    const clean = waktu.replace(/WIB/i, '').trim();
    return (
      <div className="leading-tight text-center">
        <div className="font-medium text-black text-xs whitespace-nowrap">{clean}</div>
        <div className="text-[11px] text-black font-normal mt-0.5">WIB</div>
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center py-4 bg-slate-200/70 overflow-x-auto print-clean-wrapper print:bg-white print:p-0 print:m-0">
      <div
        id="printable-document"
        ref={printableRef}
        style={{
          width: isF4 ? '215mm' : '210mm',
          minHeight: isF4 ? '330mm' : '297mm',
          padding: '16mm 18mm 12mm 18mm',
          boxSizing: 'border-box',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          fontFamily:
            report.fontFamily === 'merriweather'
              ? 'Merriweather, serif'
              : report.fontFamily === 'times'
              ? '"Times New Roman", Times, serif'
              : 'Arial, "Helvetica Neue", Helvetica, sans-serif',
        }}
        className={`bg-white text-black shadow-xl print:shadow-none leading-normal flex flex-col justify-between transition-all duration-200 ${
          report.fontFamily === 'arial'
            ? 'font-arial'
            : report.fontFamily === 'merriweather'
            ? 'font-serif'
            : report.fontFamily === 'times'
            ? 'font-dinas'
            : 'font-sans'
        }`}
      >
        <div>
          {/* KOP SURAT RESMI */}
          <div className="official-kop-header relative pb-2">
            <div className="flex items-center justify-between gap-3">
              {/* Left Logo if available */}
              {hasLogo ? (
                <div className="w-20 shrink-0 flex items-center justify-start">
                  {renderLogo()}
                </div>
              ) : null}

              {/* Center Text */}
              <div className="flex-1 text-center">
                <h3 className="text-sm md:text-[15px] font-bold tracking-wide uppercase text-black leading-tight">
                  {profile.kopBaris1 || 'DINAS PENDIDIKAN KABUPATEN BEKASI'}
                </h3>
                <h1 className="text-base md:text-lg font-black tracking-wider uppercase text-black leading-tight mt-0.5">
                  {profile.kopBaris2 || 'JURNAL HARIAN KINERJA'}
                </h1>
                <h2 className="text-xs md:text-sm font-semibold tracking-wide uppercase text-black leading-tight mt-0.5">
                  {profile.kopBaris3 || 'SD NEGERI SUKABUDI 02'}
                </h2>
                {profile.kopAlamat && (
                  <p className="text-[11px] text-slate-700 leading-tight mt-1">
                    {profile.kopAlamat}
                  </p>
                )}
                {profile.kopKontak && (
                  <p className="text-[10px] text-slate-700 leading-tight">
                    {profile.kopKontak}
                  </p>
                )}
              </div>

              {/* Right Spacer for exact symmetrical centering only when logo exists */}
              {hasLogo ? (
                <div className="w-20 shrink-0 hidden sm:flex items-center justify-end opacity-0 select-none pointer-events-none">
                  <div className="w-16 h-16"></div>
                </div>
              ) : null}
            </div>

            {/* Garis Pembatas Kop Surat (Garis Solid Hitam Tebal sesuai PDF) */}
            <div className="mt-1.5 border-b-2 border-black w-full"></div>
          </div>

          {/* TABEL IDENTITAS PEGAWAI */}
          <div className="my-2 text-xs md:text-[12.5px] leading-normal">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-32 py-[1px] font-bold text-black whitespace-nowrap">Nama</td>
                  <td className="w-4 py-[1px] text-center text-black font-normal">:</td>
                  <td className="py-[1px] text-black font-normal">
                    {profile.namaLengkap || 'Tatang Supriatna, S.Pd.'}
                  </td>
                </tr>
                <tr>
                  <td className="py-[1px] font-bold text-black whitespace-nowrap">NIP</td>
                  <td className="py-[1px] text-center text-black font-normal">:</td>
                  <td className="py-[1px] text-black font-normal">
                    {profile.nip || '1989061420201210004'}
                  </td>
                </tr>
                <tr>
                  <td className="py-[1px] font-bold text-black whitespace-nowrap">Jabatan</td>
                  <td className="py-[1px] text-center text-black font-normal">:</td>
                  <td className="py-[1px] text-black font-normal">
                    {profile.jabatan || 'Guru'}
                  </td>
                </tr>
                <tr>
                  <td className="py-[1px] font-bold text-black whitespace-nowrap">Unit Kerja</td>
                  <td className="py-[1px] text-center text-black font-normal">:</td>
                  <td className="py-[1px] text-black font-normal">
                    {profile.unitKerja || 'SD Negeri Sukabudi 02'}
                  </td>
                </tr>
                <tr>
                  <td className="py-[1px] font-bold text-black whitespace-nowrap">Hari / Tanggal</td>
                  <td className="py-[1px] text-center text-black font-normal">:</td>
                  <td className="py-[1px] text-black font-normal">{tanggalLengkap}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL UTAMA JURNAL KINERJA (5 KOLOM BER-HEADER NAVY GELAP #141f33) */}
          <div className="mt-2 mb-3">
            <table
              className="w-full border-collapse border border-black text-xs"
              style={{
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <thead>
                <tr
                  className="bg-[#141f33] text-white print:bg-[#141f33] print:text-white text-center font-bold"
                  style={{
                    backgroundColor: '#141f33',
                    color: '#ffffff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  <th
                    className="border border-black px-1 py-2.5 text-center font-bold text-white leading-tight"
                    style={{ width: '6%', backgroundColor: '#141f33', color: '#ffffff' }}
                  >
                    <div>Nom</div>
                    <div>or</div>
                  </th>
                  <th
                    className="border border-black px-2 py-2.5 text-center font-bold text-white"
                    style={{ width: '15%', backgroundColor: '#141f33', color: '#ffffff' }}
                  >
                    Waktu
                  </th>
                  <th
                    className="border border-black px-3 py-2.5 text-center font-bold text-white"
                    style={{ width: '39%', backgroundColor: '#141f33', color: '#ffffff' }}
                  >
                    Kegiatan
                  </th>
                  <th
                    className="border border-black px-2 py-2.5 text-center font-bold text-white leading-tight"
                    style={{ width: '26%', backgroundColor: '#141f33', color: '#ffffff' }}
                  >
                    <div>Bukti Dukung</div>
                    <div className="font-normal text-[10.5px] mt-0.5">(Time Mark / Geotag)</div>
                  </th>
                  <th
                    className="border border-black px-2 py-2.5 text-center font-bold text-white"
                    style={{ width: '14%', backgroundColor: '#141f33', color: '#ffffff' }}
                  >
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.kegiatanList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-black p-4 text-center text-slate-500 italic"
                    >
                      Belum ada kegiatan yang ditambahkan untuk hari ini.
                    </td>
                  </tr>
                ) : (
                  report.kegiatanList.map((item, index) => {
                    const count = report.kegiatanList.length;
                    const photoFrameClass =
                      count <= 1
                        ? 'w-[155px] h-[112px]'
                        : count === 2
                        ? 'w-[145px] h-[100px]'
                        : count === 3
                        ? 'w-[125px] h-[86px]'
                        : 'w-[110px] h-[75px]';

                    const rowPaddingClass =
                      count <= 2
                        ? 'px-3.5 py-2.5'
                        : count === 3
                        ? 'px-3 py-1.5'
                        : 'px-2 py-1';

                    return (
                      <tr key={item.id} className="page-break-inside-avoid">
                        {/* Kolom 1: Nomor */}
                        <td className="border border-black p-2 text-center font-bold text-black align-middle">
                          {index + 1}
                        </td>

                        {/* Kolom 2: Waktu */}
                        <td className="border border-black p-2 text-center align-middle">
                          {formatWaktu(item.waktu)}
                        </td>

                        {/* Kolom 3: Uraian Kegiatan */}
                        <td className={`border border-black ${rowPaddingClass} text-left align-middle text-black leading-relaxed`}>
                          <p className="whitespace-pre-line text-xs leading-relaxed font-normal">
                            {item.deskripsi}
                          </p>
                        </td>

                        {/* Kolom 4: Bukti Dukung (Foto ber-stempel / Time Mark) */}
                        <td className="border border-black p-1 text-center align-middle">
                          {item.buktiFotoUrl ? (
                            <div className="flex flex-col items-center justify-center">
                              <div className={`${photoFrameClass} overflow-hidden border border-slate-300 rounded-xs bg-slate-50 flex items-center justify-center`}>
                                <img
                                  src={item.buktiFotoUrl}
                                  alt={`Bukti kegiatan ${index + 1}`}
                                  crossOrigin="anonymous"
                                  className="w-full h-full object-cover block"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className={`${photoFrameClass} mx-auto flex flex-col items-center justify-center border border-dashed border-slate-300 rounded bg-slate-50 text-[10px] text-slate-400 p-1`}>
                              <span>Bukti Foto</span>
                              <span className="text-[9px] italic">(Terlampir)</span>
                            </div>
                          )}
                        </td>

                        {/* Kolom 5: Keterangan */}
                        <td className="border border-black p-2 text-center align-middle">
                          {formatKeterangan(item.keterangan)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* LEMBAR PENGESAHAN / TANDA TANGAN */}
          <div className="mt-3.5 page-break-inside-avoid break-inside-avoid text-xs">
            {profile.sertakanAtasan ? (
              /* DUAL SIGNATURE MODE (IF ATASAN TOGGLED) */
              <div className="flex justify-between items-start gap-4">
                <div className="w-64 text-center">
                  <p className="text-black font-medium">Mengetahui,</p>
                  <p className="text-black font-medium">
                    {profile.jabatanAtasan || 'Kepala Sekolah'}
                  </p>

                  <div className="h-14 flex items-center justify-center my-0.5">
                    {profile.tandaTanganAtasanUrl ? (
                      <img
                        src={profile.tandaTanganAtasanUrl}
                        alt="Tanda Tangan Atasan"
                        crossOrigin="anonymous"
                        className="max-h-14 max-w-full object-contain"
                      />
                    ) : (
                      <div className="h-12 w-32 border-b border-dotted border-slate-300"></div>
                    )}
                  </div>

                  <p className="font-bold text-black uppercase">
                    {profile.namaAtasan || '( Nama Kepala Sekolah )'}
                  </p>
                  <p className="text-[11px] text-black">
                    NIP. {profile.nipAtasan || '....................................'}
                  </p>
                </div>

                <div className="w-64 text-center">
                  <p className="text-black">{tanggalLengkap}</p>
                  <p className="font-medium text-black">Pegawai Yang Bersangkutan,</p>

                  <div className="h-14 flex items-center justify-center my-0.5">
                    {profile.tandaTanganPegawaiUrl ? (
                      <img
                        src={profile.tandaTanganPegawaiUrl}
                        alt="Tanda Tangan Pegawai"
                        crossOrigin="anonymous"
                        className="max-h-14 max-w-full object-contain"
                      />
                    ) : (
                      <div className="h-12 w-32 border-b border-dotted border-slate-300"></div>
                    )}
                  </div>

                  <p className="font-bold text-black">
                    {profile.namaLengkap || 'Tatang Supriatna, S.Pd.'}
                  </p>
                  <p className="text-[11px] text-black">
                    NIP. {profile.nip || '1989061420201210004'}
                  </p>
                </div>
              </div>
            ) : (
              /* SINGLE SIGNATURE MODE (PERSIS SESUAI LAMPIRAN PDF) */
              <div className="flex justify-end">
                <div className="w-64 text-center">
                  <p className="text-black font-normal">{tanggalLengkap}</p>
                  <p className="font-semibold text-black mt-0.5">Pegawai Yang Bersangkutan,</p>

                  {/* Signature Space */}
                  <div className="h-14 flex items-center justify-center my-0.5">
                    {profile.tandaTanganPegawaiUrl ? (
                      <img
                        src={profile.tandaTanganPegawaiUrl}
                        alt="Tanda Tangan Pegawai"
                        crossOrigin="anonymous"
                        className="max-h-14 max-w-full object-contain"
                      />
                    ) : (
                      <div className="h-12"></div>
                    )}
                  </div>

                  <p className="font-bold text-black text-xs md:text-sm">
                    {profile.namaLengkap || 'Tatang Supriatna, S.Pd.'}
                  </p>
                  <p className="text-[11px] text-black mt-0.5 font-normal">
                    NIP. {profile.nip || '1989061420201210004'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER HALAMAN PERSIS DENGAN LAMPIRAN PDF - DIJAMIN IKUT HALAMAN PERTAMA */}
        <footer className="official-report-footer mt-auto pt-2 pb-0.5 text-center text-[9.5px] text-slate-500 select-none page-break-inside-avoid break-inside-avoid break-before-avoid page-break-before-avoid">
          Jurnal Harian Kinerja • {profile.namaLengkap || 'Tatang Supriatna, S.Pd.'} ({tanggalLengkap}) • Halaman 1 dari 1
        </footer>
      </div>
    </div>
  );
};
