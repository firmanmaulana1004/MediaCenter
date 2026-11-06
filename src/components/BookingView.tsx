import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  ShieldAlert, 
  Laptop, 
  Mic, 
  Video, 
  User, 
  Filter, 
  Search, 
  Trash2,
  Check,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import { BookingItem, FacilityType, BookingSession, TeamName, UserProfile } from '../types';
import { checkBookingConflict } from '../utils/storage';

interface BookingViewProps {
  bookings: BookingItem[];
  onAddBooking: (booking: Omit<BookingItem, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  onCancelBooking: (id: string) => void;
  currentUser: UserProfile;
}

const SESSIONS: BookingSession[] = [
  'Sesi 1 (08.00 - 10.00)',
  'Sesi 2 (10.15 - 12.00)',
  'Sesi 3 (13.30 - 15.30)',
  'Sesi 4 (16.00 - 17.30)',
  'Sesi Malam Asrama (19.45 - 21.00)',
];

const FACILITIES: FacilityType[] = [
  'Ruang Studio Media',
  'Laptop Editing A (Asus ROG)',
  'Laptop Editing B (MacBook)',
  'Ruang Podcast & Voice Over',
  'Semua Fasilitas Studio',
];

const TEAMS: TeamName[] = [
  'Media Inti',
  'Media OSIS',
  'Media Adiwiyata',
  'Pramuka & PMR',
  'Rohis & Keagamaan',
  'Organisasi Lain',
];

const COMMON_EQUIPMENT = [
  'Kamera Sony A6400',
  'Mic Wireless Boya (2 Transmit)',
  'Lighting Softbox Godox 2x',
  'Tripod Takara Heavy Duty',
  'Gimbal Stabilizer Ronin-SC',
  'Green Screen Studio',
  'Mic Podcast Rode NT-USB',
];

export const BookingView: React.FC<BookingViewProps> = ({
  bookings,
  onAddBooking,
  onCancelBooking,
  currentUser,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Form states
  const [formDate, setFormDate] = useState<string>(today);
  const [formSession, setFormSession] = useState<BookingSession>('Sesi 1 (08.00 - 10.00)');
  const [formFacility, setFormFacility] = useState<FacilityType>('Ruang Studio Media');
  const [formTeam, setFormTeam] = useState<TeamName>(currentUser.team || 'Media Inti');
  const [formApplicant, setFormApplicant] = useState<string>(currentUser.name.split(' (')[0]);
  const [formPurpose, setFormPurpose] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Conflict warning banner state
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filter states
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterFacility, setFilterFacility] = useState<string>('Semua');

  // Real-time conflict preview
  const liveConflictCheck = checkBookingConflict(
    {
      bookingDate: formDate,
      session: formSession,
      resourceType: formFacility,
    },
    bookings
  );

  const handleEquipmentToggle = (item: string) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setSuccessNotice(null);

    if (!formPurpose.trim()) {
      setConflictError('Mohon cantumkan keperluan pemesanan secara jelas!');
      return;
    }

    // Attempt to book through parent handler
    const result = onAddBooking({
      bookingDate: formDate,
      session: formSession,
      resourceType: formFacility,
      team: formTeam,
      applicantName: formApplicant.trim(),
      purpose: formPurpose.trim(),
      equipmentNeeded: selectedEquipment,
      status: 'Disetujui',
    });

    if (!result.success) {
      setConflictError(result.message || 'Jadwal bentrok! Fasilitas ini sudah dipakai tim lain.');
      return;
    }

    setSuccessNotice(`Pemesanan berhasil! ${formFacility} pada ${formDate} (${formSession}) telah dikonfirmasi.`);
    setFormPurpose('');
    setSelectedEquipment([]);
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterDate && b.bookingDate !== filterDate) return false;
    if (filterFacility !== 'Semua' && b.resourceType !== filterFacility) return false;
    return true;
  });

  const getFacilityIcon = (facility: FacilityType) => {
    if (facility.includes('Laptop')) return <Laptop className="w-4 h-4 text-blue-600" />;
    if (facility.includes('Podcast')) return <Mic className="w-4 h-4 text-purple-600" />;
    return <Building2 className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Booking Ruang Media & Laptop Editing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Solusi anti-bentrok fasilitas Sekolah Cendekia BAZNAS. Sistem otomatis menolak pemesanan bila jam & alat sudah terpakai.
          </p>
        </div>
        <div className="text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>Validasi Bentrok Real-Time Aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORM PEMESANAN BARU (Kiri / 5 Kolom) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">Form Pemesanan Fasilitas</h2>
          </div>

          {/* Banner Pesan Jadwal Bentrok */}
          {liveConflictCheck.hasConflict && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-rose-800">PERINGATAN: JADWAL BENTROK!</strong>
                <p className="mt-0.5 leading-relaxed text-rose-700">
                  {liveConflictCheck.reason}
                </p>
                <div className="mt-1 text-[11px] text-rose-800 font-semibold">
                  Silakan ganti tanggal, pilih sesi jam lain, atau gunakan laptop cadangan.
                </div>
              </div>
            </div>
          )}

          {conflictError && !liveConflictCheck.hasConflict && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{conflictError}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
            {/* Tanggal Booking */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Pemakaian <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => {
                  setFormDate(e.target.value);
                  setConflictError(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600 text-slate-800 font-medium"
              />
            </div>

            {/* Sesi Jam */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jam / Sesi Pemakaian <span className="text-rose-500">*</span>
              </label>
              <select
                value={formSession}
                onChange={(e) => {
                  setFormSession(e.target.value as BookingSession);
                  setConflictError(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600 text-slate-800"
              >
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Fasilitas Utama */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fasilitas / Unit yang Dipesan <span className="text-rose-500">*</span>
              </label>
              <select
                value={formFacility}
                onChange={(e) => {
                  setFormFacility(e.target.value as FacilityType);
                  setConflictError(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600 text-slate-800 font-semibold"
              >
                {FACILITIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Tim & Pemohon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tim Media</label>
                <select
                  value={formTeam}
                  onChange={(e) => setFormTeam(e.target.value as TeamName)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600"
                >
                  {TEAMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  required
                  placeholder="Nama santri pemohon"
                  value={formApplicant}
                  onChange={(e) => setFormApplicant(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Keperluan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Keperluan Pemakaian <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Contoh: Shooting video host dokumentasi Hari Pahlawan & podcast inspirasi"
                value={formPurpose}
                onChange={(e) => setFormPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600 text-slate-800"
              />
            </div>

            {/* Alat Tambahan Checklist */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Peralatan Pendukung yang Dibutuhkan:
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {COMMON_EQUIPMENT.map((item) => {
                  const isChecked = selectedEquipment.includes(item);
                  return (
                    <label
                      key={item}
                      className="flex items-center gap-2 text-[11px] text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleEquipmentToggle(item)}
                        className="rounded text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={liveConflictCheck.hasConflict}
              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                liveConflictCheck.hasConflict
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-white'
              }`}
            >
              {liveConflictCheck.hasConflict ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Jadwal Bentrok - Tidak Bisa Dipesan</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi Booking Fasilitas</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* DAFTAR JADWAL BOOKING & MONITORING (Kanan / 7 Kolom) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Jadwal Pemakaian Ruang & Laptop</h2>
              <p className="text-[11px] text-slate-500">Daftar booking aktif yang sudah terdaftar di sistem.</p>
            </div>

            {/* Filter Tanggal */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700"
                placeholder="Pilih tgl"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Visual Availability Matrix Today */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-800">
                Ketersediaan Hari Ini ({formDate}):
              </span>
              <span className="text-[11px] text-slate-500">
                Merah: Terisi · Hijau: Kosong
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {SESSIONS.map((sess) => {
                const isBooked = bookings.some(
                  (b) => b.bookingDate === formDate && b.session === sess && b.status !== 'Ditolak'
                );
                return (
                  <div
                    key={sess}
                    className={`p-2 rounded border text-center transition-all ${
                      isBooked
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <div className="text-[10px] font-bold leading-tight truncate">
                      {sess.split(' ')[0]} {sess.split(' ')[1]}
                    </div>
                    <div className="text-[9px] mt-0.5 font-semibold">
                      {isBooked ? 'Terpakai' : 'Tersedia'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of Bookings */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                Tidak ada data pemesanan pada filter ini.
              </div>
            ) : (
              filteredBookings.map((b) => {
                const canCancel = currentUser.role === 'admin' || b.applicantName.includes(currentUser.name.split(' ')[0]);

                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 font-bold text-xs text-slate-900">
                          {getFacilityIcon(b.resourceType)}
                          <span>{b.resourceType}</span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {b.team}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 font-medium">
                        {b.purpose}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 tabular-nums pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{b.bookingDate}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{b.session}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>PJ: {b.applicantName}</span>
                        </span>
                      </div>

                      {b.equipmentNeeded.length > 0 && (
                        <div className="text-[10px] text-slate-500 pt-0.5">
                          Alat: {b.equipmentNeeded.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {b.status}
                      </span>

                      {canCancel && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Batalkan pemesanan ${b.resourceType} pada ${b.bookingDate}?`)) {
                              onCancelBooking(b.id);
                            }
                          }}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-medium cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Batalkan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
