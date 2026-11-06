import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Video, 
  Film, 
  Clock, 
  CheckCircle, 
  Layers, 
  BookOpen, 
  Filter,
  X
} from 'lucide-react';
import { WorkItem, BookingItem, SchoolAgenda, TeamName } from '../types';

interface CalendarViewProps {
  works: WorkItem[];
  bookings: BookingItem[];
  agendas: SchoolAgenda[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  works,
  bookings,
  agendas,
}) => {
  // Calendar current viewed year & month (default to November 2026 based on sample data)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 1)); // Month is 0-indexed: 10 = November

  // Filter toggles
  const [showAgendas, setShowAgendas] = useState(true);
  const [showProduction, setShowProduction] = useState(true);
  const [showPublish, setShowPublish] = useState(true);
  const [showBookings, setShowBookings] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>('Semua');

  // Selected date details modal
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    dateStr: string;
    events: {
      type: 'agenda' | 'produksi' | 'tayang' | 'booking';
      title: string;
      team: string;
      detail: string;
      color: string;
    }[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 1));
  };

  // Days calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert to Monday-first (0 = Monday, ..., 6 = Sunday)
  const mondayFirstIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getTeamColor = (team: string) => {
    switch (team) {
      case 'Media Inti':
        return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-600' };
      case 'Media OSIS':
        return { bg: 'bg-blue-100 text-blue-900 border-blue-300', dot: 'bg-blue-600' };
      case 'Media Adiwiyata':
        return { bg: 'bg-teal-100 text-teal-900 border-teal-300', dot: 'bg-teal-600' };
      case 'Pramuka & PMR':
        return { bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-600' };
      case 'Rohis & Keagamaan':
        return { bg: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-600' };
      default:
        return { bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-600' };
    }
  };

  // Compile events for a specific date (YYYY-MM-DD)
  const getEventsForDate = (dateStr: string) => {
    const list: {
      type: 'agenda' | 'produksi' | 'tayang' | 'booking';
      title: string;
      team: string;
      detail: string;
      color: string;
    }[] = [];

    // 1. Agendas
    if (showAgendas) {
      agendas
        .filter((a) => a.eventDate === dateStr)
        .forEach((a) => {
          if (selectedTeam === 'Semua' || a.teamInCharge === selectedTeam) {
            list.push({
              type: 'agenda',
              title: `[Agenda] ${a.title}`,
              team: a.teamInCharge,
              detail: a.targetCoverage,
              color: 'bg-amber-100 text-amber-900 border-amber-300',
            });
          }
        });
    }

    // 2. Produksi / Shooting
    if (showProduction) {
      works
        .filter((w) => w.productionDate === dateStr)
        .forEach((w) => {
          if (selectedTeam === 'Semua' || w.team === selectedTeam) {
            const teamStyle = getTeamColor(w.team);
            list.push({
              type: 'produksi',
              title: `[Shooting] ${w.title}`,
              team: w.team,
              detail: `PJ: ${w.personInCharge} | Tahap: ${w.stage}`,
              color: teamStyle.bg,
            });
          }
        });
    }

    // 3. Tanggal Tayang Rencana / Aktual
    if (showPublish) {
      works
        .filter((w) => w.targetPublishDate === dateStr || w.actualPublishDate === dateStr)
        .forEach((w) => {
          if (selectedTeam === 'Semua' || w.team === selectedTeam) {
            const isTayang = w.stage === 'Tayang';
            list.push({
              type: 'tayang',
              title: `[Tayang] ${w.title}`,
              team: w.team,
              detail: isTayang ? 'Status: Sudah Terbit' : `Rencana Tayang (Tahap: ${w.stage})`,
              color: isTayang
                ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold'
                : 'bg-indigo-100 text-indigo-900 border-indigo-300',
            });
          }
        });
    }

    // 4. Booking Ruang & Laptop
    if (showBookings) {
      bookings
        .filter((b) => b.bookingDate === dateStr && b.status !== 'Ditolak')
        .forEach((b) => {
          if (selectedTeam === 'Semua' || b.team === selectedTeam) {
            list.push({
              type: 'booking',
              title: `[Booking] ${b.resourceType.split(' ')[0]} ${b.session.split(' ')[0]}`,
              team: b.team,
              detail: `${b.resourceType} - ${b.session} (Keperluan: ${b.purpose})`,
              color: 'bg-slate-100 text-slate-800 border-slate-300',
            });
          }
        });
    }

    return list;
  };

  const dayHeaders = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'];

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Kalender Produksi & Penayangan Media
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi terpadu agenda sekolah, jadwal shooting, pemakaian studio/laptop, dan jadwal tayang per tim.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Bulan Ini
          </button>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 whitespace-nowrap min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Kategori:</span>
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showAgendas}
              onChange={(e) => setShowAgendas(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-amber-800 font-medium">Agenda Sekolah</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showProduction}
              onChange={(e) => setShowProduction(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-blue-800 font-medium">Jadwal Shooting</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPublish}
              onChange={(e) => setShowPublish(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-emerald-800 font-medium">Jadwal Tayang</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showBookings}
              onChange={(e) => setShowBookings(e.target.checked)}
              className="rounded text-slate-600 focus:ring-slate-500"
            />
            <span className="text-slate-800 font-medium">Booking Studio/Laptop</span>
          </label>
        </div>

        {/* Filter Tim */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Filter Tim:</span>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-emerald-600"
          >
            <option value="Semua">Semua Tim</option>
            <option value="Media Inti">Media Inti (Hijau)</option>
            <option value="Media OSIS">Media OSIS (Biru)</option>
            <option value="Media Adiwiyata">Media Adiwiyata (Teal)</option>
            <option value="Pramuka & PMR">Pramuka & PMR (Amber)</option>
            <option value="Rohis & Keagamaan">Rohis & Keagamaan (Ungu)</option>
          </select>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center font-bold text-xs text-slate-700">
          {dayHeaders.map((day, idx) => (
            <div key={day} className={`py-2.5 border-r border-slate-200 last:border-r-0 ${idx >= 5 ? 'text-rose-600' : ''}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-y divide-slate-200">
          {/* Empty cells before month start */}
          {Array.from({ length: mondayFirstIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-slate-50/50 border-r border-slate-200 p-1.5" />
          ))}

          {/* Actual days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const events = getEventsForDate(dateStr);
            const isToday = dateStr === '2026-11-05'; // Current date anchor

            return (
              <div
                key={dateStr}
                onClick={() => {
                  if (events.length > 0) {
                    setSelectedDayEvents({ dateStr, events });
                  }
                }}
                className={`min-h-[110px] border-r border-slate-200 p-1.5 transition-colors flex flex-col justify-between cursor-pointer hover:bg-slate-50/80 ${
                  isToday ? 'bg-emerald-50/30' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full tabular-nums ${
                        isToday
                          ? 'bg-emerald-800 text-white'
                          : 'text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {events.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        +{events.length - 2} lagi
                      </span>
                    )}
                  </div>

                  {/* Micro list of events */}
                  <div className="space-y-1">
                    {events.slice(0, 3).map((ev, evIdx) => (
                      <div
                        key={evIdx}
                        className={`text-[10px] px-1.5 py-0.5 rounded border leading-tight truncate font-medium ${ev.color}`}
                        title={`${ev.title} (${ev.team}) - ${ev.detail}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>

                {events.length > 0 && (
                  <div className="mt-1 text-[9px] text-slate-400 text-right">
                    Klik untuk rincian ({events.length})
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: DETAIL EVENT PADA TANGGAL TERPILIH */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Agenda & Kegiatan Tanggal {selectedDayEvents.dateStr}
                </h3>
                <p className="text-xs text-slate-500">
                  Total {selectedDayEvents.events.length} jadwal terdaftar pada hari ini.
                </p>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[400px] overflow-y-auto">
              {selectedDayEvents.events.map((ev, idx) => (
                <div key={idx} className={`p-3 rounded-lg border text-xs ${ev.color}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{ev.title}</span>
                    <span className="text-[10px] font-semibold bg-white/70 px-1.5 py-0.5 rounded border border-black/10">
                      {ev.team}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">{ev.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
