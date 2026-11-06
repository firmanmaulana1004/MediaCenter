import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  Sparkles, 
  Tag, 
  Video, 
  Trash2, 
  CheckCircle, 
  Edit2,
  Users
} from 'lucide-react';
import { SchoolAgenda, TeamName, UserProfile } from '../types';

interface AgendaViewProps {
  agendas: SchoolAgenda[];
  onAddAgenda: (agenda: Omit<SchoolAgenda, 'id'>) => void;
  onDeleteAgenda: (id: string) => void;
  currentUser: UserProfile;
}

const TEAMS: TeamName[] = [
  'OCEANS',
  'ADIWIYATA',
  'ROHIS',
  'MUDABIR',
  'MEDIA CENTER',
];

export const AgendaView: React.FC<AgendaViewProps> = ({
  agendas,
  onAddAgenda,
  onDeleteAgenda,
  currentUser,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formMonth, setFormMonth] = useState('2026-11');
  const [formTheme, setFormTheme] = useState('Semangat Kepahlawanan & Kemandirian Santri Cendekia');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('2026-11-10');
  const [formDesc, setFormDesc] = useState('');
  const [formCoverage, setFormCoverage] = useState('Highlight Reels 60 detik & Foto Dokumentasi');
  const [formTeam, setFormTeam] = useState<TeamName>('MEDIA CENTER');

  const filteredAgendas = agendas.filter((a) => a.monthKey === selectedMonth);
  const activeTheme = filteredAgendas[0]?.monthlyTheme || 'Tema Belum Ditentukan';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Mohon isi judul agenda kegiatan!');
      return;
    }

    onAddAgenda({
      monthKey: formMonth,
      monthlyTheme: formTheme.trim(),
      title: formTitle.trim(),
      eventDate: formDate,
      description: formDesc.trim(),
      targetCoverage: formCoverage.trim(),
      teamInCharge: formTeam,
    });

    setFormTitle('');
    setFormDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Agenda Sekolah & Tema Konten Bulanan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Panduan tema kurikulum media dan daftar acara besar Sekolah Cendekia BAZNAS untuk diliput tim media.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
          >
            <option value="2026-10">Oktober 2026</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-12">Desember 2026</option>
          </select>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Agenda</span>
            </button>
          )}
        </div>
      </div>

      {/* Monthly Theme Spotlight Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-xl p-5 text-white shadow-xs border border-emerald-800">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Tema Konten Bulan {selectedMonth === '2026-11' ? 'November 2026' : selectedMonth}:</span>
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
          "{activeTheme}"
        </h2>
        <p className="text-xs text-emerald-100 mt-1.5 leading-relaxed">
          Semua karya video, dokumentasi, podcast, dan desain pada bulan ini diimbau menyelaraskan dengan nilai kepahlawanan, kemandirian asrama, dan syiar zakat produktif BAZNAS.
        </p>
      </div>

      {/* Agendas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgendas.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl">
            Belum ada agenda sekolah yang dijadwalkan untuk bulan ini.
          </div>
        ) : (
          filteredAgendas.map((agenda) => (
            <div
              key={agenda.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="tabular-nums">{agenda.eventDate}</span>
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  PJ: {agenda.teamInCharge}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{agenda.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{agenda.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Liputan Media:</span>
                  <div className="font-semibold text-slate-800 text-[11px]">{agenda.targetCoverage}</div>
                </div>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus agenda "${agenda.title}"?`)) {
                        onDeleteAgenda(agenda.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: TAMBAH AGENDA BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Tambah Agenda Sekolah & Liputan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold px-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bulan</label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="2026-11">November 2026</option>
                    <option value="2026-12">Desember 2026</option>
                    <option value="2027-01">Januari 2027</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Acara</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tema Besar Bulanan</label>
                <input
                  type="text"
                  required
                  value={formTheme}
                  onChange={(e) => setFormTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Acara / Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Wisuda Akbar Tahfidz Al-Qur'an"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Acara</label>
                <textarea
                  rows={2}
                  placeholder="Rincian kegiatan dan tamu yang hadir..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tim PJ Peliputan</label>
                  <select
                    value={formTeam}
                    onChange={(e) => setFormTeam(e.target.value as TeamName)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {TEAMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Liputan</label>
                  <input
                    type="text"
                    required
                    placeholder="Highlight Reels & Dokumentasi"
                    value={formCoverage}
                    onChange={(e) => setFormCoverage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
