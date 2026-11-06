import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Award, 
  HelpCircle, 
  TrendingUp, 
  FileSpreadsheet, 
  Save, 
  Sparkles,
  PieChart
} from 'lucide-react';
import { WorkItem, BookingItem, MonthlyRecap, UserProfile, TeamName, WorkType } from '../types';
import { getStoredRecap, saveStoredRecap, downloadCsv, isWorkOverdue } from '../utils/storage';

interface RecapViewProps {
  works: WorkItem[];
  bookings: BookingItem[];
  currentUser: UserProfile;
}

export const RecapView: React.FC<RecapViewProps> = ({
  works,
  bookings,
  currentUser,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [recapData, setRecapData] = useState<MonthlyRecap>(() => getStoredRecap('2026-11'));
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Filter works for selected month
  const monthWorks = works.filter((w) => w.targetPublishDate.startsWith(selectedMonth));
  const plannedCount = monthWorks.length;
  const publishedWorks = monthWorks.filter((w) => w.stage === 'Tayang');
  const publishedCount = publishedWorks.length;
  const completionRate = plannedCount > 0 ? Math.round((publishedCount / plannedCount) * 100) : 0;

  // On-time vs Late calculations
  const onTimeCount = publishedWorks.filter((w) => {
    if (!w.actualPublishDate) return true;
    return w.actualPublishDate <= w.targetPublishDate;
  }).length;

  const lateCount = publishedWorks.filter((w) => {
    if (!w.actualPublishDate) return false;
    return w.actualPublishDate > w.targetPublishDate;
  }).length + monthWorks.filter((w) => isWorkOverdue(w, '2026-11-05')).length;

  // Bookings count in this month
  const monthBookings = bookings.filter((b) => b.bookingDate.startsWith(selectedMonth) && b.status !== 'Ditolak');
  const bookingCount = monthBookings.length;

  // Team breakdown
  const teams: TeamName[] = [
    'Media Inti',
    'Media OSIS',
    'Media Adiwiyata',
    'Pramuka & PMR',
    'Rohis & Keagamaan',
    'Organisasi Lain',
  ];

  const teamBreakdown = teams.map((team) => {
    const count = monthWorks.filter((w) => w.team === team).length;
    const published = monthWorks.filter((w) => w.team === team && w.stage === 'Tayang').length;
    const percentage = plannedCount > 0 ? Math.round((count / plannedCount) * 100) : 0;
    return { team, count, published, percentage };
  });

  // Type breakdown
  const types: WorkType[] = ['Video', 'Dokumentasi', 'Podcast', 'Desain', 'Lainnya'];
  const typeBreakdown = types.map((type) => {
    const count = monthWorks.filter((w) => w.type === type).length;
    const percentage = plannedCount > 0 ? Math.round((count / plannedCount) * 100) : 0;
    return { type, count, percentage };
  });

  const handleMonthChange = (m: string) => {
    setSelectedMonth(m);
    setRecapData(getStoredRecap(m));
  };

  const handleSaveEvaluation = () => {
    saveStoredRecap(recapData);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handleExportCSV = () => {
    const monthLabel = selectedMonth === '2026-11' ? 'November 2026' : selectedMonth;
    
    let csv = `REKAP KINERJA MEDIA SEKOLAH CENDEKIA BAZNAS - BULAN ${monthLabel.toUpperCase()}\n`;
    csv += `Tanggal Ekspor: ${new Date().toISOString().split('T')[0]}\n\n`;

    csv += `RINGKASAN UTAMA\n`;
    csv += `Total Karya Direncanakan;${plannedCount}\n`;
    csv += `Karya Berhasil Tayang;${publishedCount}\n`;
    csv += `Persentase Ketercapaian;${completionRate}%\n`;
    csv += `Tayang Tepat Waktu;${onTimeCount}\n`;
    csv += `Terlambat / Melewati Tenggat;${lateCount}\n`;
    csv += `Total Sesi Booking Studio & Laptop;${bookingCount}\n\n`;

    csv += `EVALUASI BULANAN\n`;
    csv += `Karya Terbaik Bulan Ini;"${(recapData.bestWork || '').replace(/"/g, '""')}"\n`;
    csv += `Kendala yang Dihadapi;"${(recapData.obstacles || '').replace(/"/g, '""')}"\n`;
    csv += `Rencana Perbaikan;"${(recapData.improvementPlan || '').replace(/"/g, '""')}"\n\n`;

    csv += `DAFTAR RINCI KARYA MEDIA BULAN ${monthLabel.toUpperCase()}\n`;
    csv += `ID;Judul Karya;Jenis;Tim;Penanggung Jawab;Tahap;Tgl Produksi;Tgl Editing;Target Tayang;Tgl Aktual Tayang;Alat Dibutuhkan;Link Hasil\n`;

    monthWorks.forEach((w) => {
      csv += `"${w.id}";"${w.title.replace(/"/g, '""')}";"${w.type}";"${w.team}";"${w.personInCharge}";"${w.stage}";"${w.productionDate || '-'}";"${w.editingDate || '-'}";"${w.targetPublishDate}";"${w.actualPublishDate || '-'}";"${w.requiredEquipment.join(', ')}";"${w.resultLink || '-'}"\n`;
    });

    downloadCsv(`rekap-media-cendekia-${selectedMonth}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Rekap Bulanan & Laporan Kinerja Media
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analisis produktivitas karya santri, ketepatan waktu penayangan, utilisasi studio, dan catatan evaluasi humas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
          >
            <option value="2026-10">Oktober 2026</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-12">Desember 2026</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor ke CSV</span>
          </button>
        </div>
      </div>

      {/* KPI 4-Card Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned vs Published */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Rencana vs Tayang</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {publishedCount} <span className="text-sm font-normal text-slate-400">/ {plannedCount} karya</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-700 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, completionRate)}%` }}
            />
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 tabular-nums">
            {completionRate}% Ketercapaian
          </div>
        </div>

        {/* Tepat Waktu */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Tayang Tepat Waktu</div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {onTimeCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sesuai target tanggal</span>
          </div>
        </div>

        {/* Terlambat */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          lateCount > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <div className={`text-xs mb-1 ${lateCount > 0 ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}>
            Karya Terlambat / Tertunda
          </div>
          <div className={`text-2xl font-bold tabular-nums ${lateCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {lateCount}
          </div>
          <div className="text-[11px] mt-1 text-slate-500 flex items-center gap-1">
            <AlertCircle className={`w-3.5 h-3.5 ${lateCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Melewati batas tenggat</span>
          </div>
        </div>

        {/* Sesi Booking */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Total Sesi Booking</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {bookingCount} <span className="text-sm font-normal text-slate-400">sesi</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Studio & Laptop terpakai</span>
          </div>
        </div>
      </div>

      {/* Visual Distribution Graphs: Karya per Tim & Karya per Jenis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi per Tim */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">Distribusi Karya per Tim Media</h2>
            <span className="text-[11px] text-slate-400">Total {plannedCount} karya</span>
          </div>

          <div className="space-y-3">
            {teamBreakdown.map((item) => (
              <div key={item.team} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.team}</span>
                  <span className="text-slate-500 tabular-nums">
                    <strong>{item.count} karya</strong> ({item.published} tayang) · {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-700 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribusi per Jenis Karya */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">Distribusi per Jenis Karya</h2>
            <span className="text-[11px] text-slate-400">Video, Desain, Podcast, dll</span>
          </div>

          <div className="space-y-3">
            {typeBreakdown.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.type}</span>
                  <span className="text-slate-500 tabular-nums">
                    <strong>{item.count} karya</strong> · {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-teal-700 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulir Evaluasi Kualitatif Bulanan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Lembar Evaluasi & Tindak Lanjut Humas</h2>
            <p className="text-[11px] text-slate-500">
              Dokumentasikan karya terbaik, kendala teknis/fasilitas, dan rencana perbaikan alur kerja.
            </p>
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={handleSaveEvaluation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Evaluasi</span>
            </button>
          )}
        </div>

        {saveFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            <span>Evaluasi bulanan berhasil disimpan dan akan tersertakan pada ekspor CSV!</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Karya Terbaik */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Karya Terbaik Bulan Ini (Best Media Award)</span>
            </label>
            <input
              type="text"
              disabled={currentUser.role !== 'admin'}
              placeholder="Contoh: Video Dokumentasi Hari Pahlawan 10 November (Editing sinematik & sound design sangat rapi)"
              value={recapData.bestWork}
              onChange={(e) => setRecapData({ ...recapData, bestWork: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50 text-slate-800"
            />
          </div>

          {/* Kendala yang Dihadapi */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Kendala & Hambatan Produksi (Peralatan, Jadwal, SDM)</span>
            </label>
            <textarea
              rows={3}
              disabled={currentUser.role !== 'admin'}
              placeholder="Contoh: Laptop Editing A sempat mengalami overheat saat rendering 4K, dan santri bentrok dengan jadwal tahfidz malam..."
              value={recapData.obstacles}
              onChange={(e) => setRecapData({ ...recapData, obstacles: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50 text-slate-800"
            />
          </div>

          {/* Rencana Perbaikan */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Rencana Perbaikan Bulan Depan (Action Items)</span>
            </label>
            <textarea
              rows={3}
              disabled={currentUser.role !== 'admin'}
              placeholder="Contoh: 1. Jadwal rutin servis dan pembersihan debu laptop editing. 2. Workshop editing dasar untuk santri baru..."
              value={recapData.improvementPlan}
              onChange={(e) => setRecapData({ ...recapData, improvementPlan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white disabled:bg-slate-50 text-slate-800"
            />
          </div>

          <div className="text-[11px] text-slate-400 italic">
            Disusun oleh: {recapData.submittedBy} · Terakhir diperbarui: {recapData.updatedAt}
          </div>
        </div>
      </div>
    </div>
  );
};
