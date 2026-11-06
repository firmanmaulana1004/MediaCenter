import React from 'react';
import { 
  Film, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Building2, 
  Laptop, 
  Layers, 
  TrendingUp,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { WorkItem, BookingItem, SchoolAgenda, UserProfile } from '../types';
import { isWorkOverdue } from '../utils/storage';

interface DashboardViewProps {
  works: WorkItem[];
  bookings: BookingItem[];
  agendas: SchoolAgenda[];
  onNavigateTab: (tab: string) => void;
  currentUser: UserProfile;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  works,
  bookings,
  agendas,
  onNavigateTab,
  currentUser,
}) => {
  const today = '2026-11-05'; // Anchor date

  // Calculations for current month (November 2026)
  const novemberWorks = works.filter((w) => w.targetPublishDate.startsWith('2026-11'));
  const publishedCount = novemberWorks.filter((w) => w.stage === 'Tayang').length;
  const inProgressCount = novemberWorks.filter((w) => ['Produksi', 'Editing', 'Review'].includes(w.stage)).length;
  const readyCount = novemberWorks.filter((w) => w.stage === 'Siap Tayang').length;
  const overdueWorks = works.filter((w) => isWorkOverdue(w, today));

  // Upcoming deadlines in the next 7 days
  const upcomingDeadlines = works
    .filter((w) => w.stage !== 'Tayang' && w.targetPublishDate >= today)
    .sort((a, b) => a.targetPublishDate.localeCompare(b.targetPublishDate))
    .slice(0, 5);

  // Today's Bookings
  const todayBookings = bookings.filter((b) => b.bookingDate === today && b.status !== 'Ditolak');

  // Next school agenda
  const nextAgenda = agendas
    .filter((a) => a.eventDate >= today)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md border border-emerald-700/50 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Portal Alur Kerja Media & Studio Santri BAZNAS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Ahlan wa Sahlan, {currentUser.name}!
          </h1>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Kelola karya video, dokumentasi, podcast, dan desain secara tertib. Manfaatkan ruang studio dan laptop editing tanpa takut jadwal bentrok.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('works')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-800" />
            <span>Usulkan Karya</span>
          </button>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors border border-emerald-500/50 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Booking Fasilitas</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Bulan Ini */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Target Karya Bulan Ini</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {novemberWorks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Direncanakan November 2026</span>
          </div>
        </div>

        {/* Card 2: Sudah Tayang */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Sudah Tayang / Publik</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {publishedCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {novemberWorks.length > 0 ? `${Math.round((publishedCount / novemberWorks.length) * 100)}% ketercapaian` : '0%'}
          </div>
        </div>

        {/* Card 3: Dalam Produksi / Editing */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Sedang Diproduksi / Edit</span>
            <Film className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums">
            {inProgressCount + readyCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {readyCount} karya siap review/tayang
          </div>
        </div>

        {/* Card 4: Karya Terlambat / Overdue */}
        <div className={`p-4 rounded-xl border shadow-xs transition-colors ${
          overdueWorks.length > 0
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={overdueWorks.length > 0 ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
              Karya Melewati Tenggat
            </span>
            <AlertTriangle className={`w-4 h-4 ${overdueWorks.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold tabular-nums ${overdueWorks.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {overdueWorks.length}
          </div>
          <div className="text-[11px] mt-1 font-medium">
            {overdueWorks.length > 0 ? 'Perlu tindakan Humas/Ketua' : 'Semua alur sesuai target'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Deadlines & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri (7 Kolom): Karya Mendekati Tenggat & Terlambat */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Karya Mendekati Tenggat (Priority Watch)</h2>
              <p className="text-[11px] text-slate-500">Pantau jadwal tayang agar publikasi tepat waktu.</p>
            </div>
            <button
              onClick={() => onNavigateTab('works')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Overdue alert if any */}
          {overdueWorks.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">
                Perhatian: Karya Lewat Tenggat!
              </div>
              {overdueWorks.map((work) => (
                <div
                  key={work.id}
                  className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-rose-900">{work.title}</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Tim {work.team} · PJ: {work.personInCharge} · Tahap: <strong>{work.stage}</strong>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-200 px-2 py-0.5 rounded">
                      Target: {work.targetPublishDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming deadlines */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              Mendekati Tenggat Minggu Ini:
            </div>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                Tidak ada tenggat mendesak minggu ini.
              </div>
            ) : (
              upcomingDeadlines.map((work) => (
                <div
                  key={work.id}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{work.title}</div>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-medium text-emerald-800">{work.team}</span>
                      <span> · PJ: {work.personInCharge} · Tahap: <strong>{work.stage}</strong></span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-800 tabular-nums">
                      {work.targetPublishDate}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Rencana Tayang
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan (5 Kolom): Jadwal Pemakaian Ruang Hari Ini & Agenda Terdekat */}
        <div className="lg:col-span-5 space-y-6">
          {/* Jadwal Ruang Hari Ini */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Jadwal Fasilitas Hari Ini</h2>
                <p className="text-[11px] text-slate-500">Kamis, 5 November 2026</p>
              </div>
              <button
                onClick={() => onNavigateTab('bookings')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayBookings.length === 0 ? (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg text-emerald-900 text-xs text-center">
                Studio & Laptop belum dibooking untuk hari ini. Fasilitas siap digunakan!
              </div>
            ) : (
              <div className="space-y-2">
                {todayBookings.map((b) => (
                  <div key={b.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{b.resourceType}</span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                        {b.team}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {b.session} · PJ: {b.applicantName}
                    </div>
                    <div className="text-[10px] text-slate-500 italic">
                      "{b.purpose}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agenda Sekolah Terdekat */}
          {nextAgenda && (
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 uppercase tracking-wide text-[10px]">
                  Agenda Terdekat Sekolah
                </span>
                <span className="font-bold text-amber-800 tabular-nums">
                  {nextAgenda.eventDate}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{nextAgenda.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{nextAgenda.description}</p>
              <div className="pt-2 text-[11px] text-amber-900 font-medium">
                Target Liputan: <strong>{nextAgenda.targetCoverage}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
