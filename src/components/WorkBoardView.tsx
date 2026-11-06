import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Calendar, 
  User, 
  Wrench, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Sparkles,
  ArrowRight,
  Video,
  FileText,
  Mic,
  Palette,
  Layers
} from 'lucide-react';
import { WorkItem, WorkStage, WorkType, TeamName, UserProfile } from '../types';
import { isWorkOverdue } from '../utils/storage';

interface WorkBoardViewProps {
  works: WorkItem[];
  onAddWork: (work: Omit<WorkItem, 'id' | 'createdAt'>) => void;
  onUpdateWork: (work: WorkItem) => void;
  onDeleteWork: (id: string) => void;
  currentUser: UserProfile;
}

const STAGES: { id: WorkStage; label: string; desc: string; color: string }[] = [
  { id: 'Ide', label: '1. Ide', desc: 'Konsep awal & usulan', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'Naskah', label: '2. Naskah', desc: 'Storyboard / script', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'Produksi', label: '3. Produksi', desc: 'Shooting & rekaman', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Editing', label: '4. Editing', desc: 'Pemotongan & render', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'Review', label: '5. Review', desc: 'Evaluasi Humas/Guru', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'Siap Tayang', label: '6. Siap Tayang', desc: 'Jadwal final & copy', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'Tayang', label: '7. Tayang', desc: 'Terbit di publik', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
];

const TEAMS: TeamName[] = [
  'OCEANS',
  'ADIWIYATA',
  'ROHIS',
  'MUDABIR',
  'MEDIA CENTER',
];

const WORK_TYPES: WorkType[] = ['Video', 'Dokumentasi', 'Podcast', 'Desain', 'Lainnya'];

export const WorkBoardView: React.FC<WorkBoardViewProps> = ({
  works,
  onAddWork,
  onUpdateWork,
  onDeleteWork,
  currentUser,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedTeam, setSelectedTeam] = useState<string>('Semua');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<WorkType>('Video');
  const [formTeam, setFormTeam] = useState<TeamName>(currentUser.team || 'Media Inti');
  const [formPic, setFormPic] = useState(currentUser.name.split(' (')[0]);
  const [formStage, setFormStage] = useState<WorkStage>('Ide');
  const [formProdDate, setFormProdDate] = useState('');
  const [formEditDate, setFormEditDate] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formActualDate, setFormActualDate] = useState('');
  const [formEquipment, setFormEquipment] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredWorks = works.filter((work) => {
    if (selectedTeam !== 'Semua' && work.team !== selectedTeam) return false;
    if (selectedType !== 'Semua' && work.type !== selectedType) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = work.title.toLowerCase().includes(q);
      const matchPic = work.personInCharge.toLowerCase().includes(q);
      const matchTeam = work.team.toLowerCase().includes(q);
      if (!matchTitle && !matchPic && !matchTeam) return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingWork(null);
    setFormTitle('');
    setFormType('Video');
    setFormTeam(currentUser.team || 'MEDIA CENTER');
    setFormPic(currentUser.role === 'admin' ? 'Ustadz Firman' : currentUser.name.split(' (')[0]);
    setFormStage('Ide');
    setFormProdDate('');
    setFormEditDate('');
    setFormTargetDate(today);
    setFormActualDate('');
    setFormEquipment('Kamera Sony A6400, Mic Wireless');
    setFormLink('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (work: WorkItem) => {
    setEditingWork(work);
    setFormTitle(work.title);
    setFormType(work.type);
    setFormTeam(work.team);
    setFormPic(work.personInCharge);
    setFormStage(work.stage);
    setFormProdDate(work.productionDate || '');
    setFormEditDate(work.editingDate || '');
    setFormTargetDate(work.targetPublishDate);
    setFormActualDate(work.actualPublishDate || '');
    setFormEquipment(work.requiredEquipment.join(', '));
    setFormLink(work.resultLink || '');
    setFormNotes(work.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Mohon isi judul karya!');
      return;
    }
    if (!formTargetDate) {
      alert('Mohon tentukan rencana tanggal tayang!');
      return;
    }

    const eqList = formEquipment
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingWork) {
      onUpdateWork({
        ...editingWork,
        title: formTitle.trim(),
        type: formType,
        team: formTeam,
        personInCharge: formPic.trim(),
        stage: formStage,
        productionDate: formProdDate || formTargetDate,
        editingDate: formEditDate || formTargetDate,
        targetPublishDate: formTargetDate,
        actualPublishDate: formStage === 'Tayang' ? (formActualDate || today) : formActualDate,
        requiredEquipment: eqList,
        resultLink: formLink.trim(),
        notes: formNotes.trim(),
      });
    } else {
      onAddWork({
        title: formTitle.trim(),
        type: formType,
        team: formTeam,
        personInCharge: formPic.trim(),
        stage: formStage,
        productionDate: formProdDate || formTargetDate,
        editingDate: formEditDate || formTargetDate,
        targetPublishDate: formTargetDate,
        actualPublishDate: formStage === 'Tayang' ? (formActualDate || today) : undefined,
        requiredEquipment: eqList,
        resultLink: formLink.trim(),
        notes: formNotes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const canEditWork = (work: WorkItem): boolean => {
    // Semua pengguna terdaftar dapat memperbarui detail atau memajukan tahap alur
    return true;
  };

  const handleQuickAdvance = (work: WorkItem) => {
    const currentIndex = STAGES.findIndex((s) => s.id === work.stage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1].id;
      const updated: WorkItem = {
        ...work,
        stage: nextStage,
        actualPublishDate: nextStage === 'Tayang' ? today : work.actualPublishDate,
      };
      onUpdateWork(updated);
    }
  };

  const getTypeIcon = (type: WorkType) => {
    switch (type) {
      case 'Video':
        return <Video className="w-3.5 h-3.5 text-blue-600" />;
      case 'Podcast':
        return <Mic className="w-3.5 h-3.5 text-purple-600" />;
      case 'Desain':
        return <Palette className="w-3.5 h-3.5 text-amber-600" />;
      case 'Dokumentasi':
        return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getTeamColor = (team: TeamName) => {
    switch (team) {
      case 'OCEANS':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'ADIWIYATA':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'ROHIS':
        return 'text-purple-800 bg-purple-50 border-purple-200';
      case 'MUDABIR':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'MEDIA CENTER':
        return 'text-teal-800 bg-teal-50 border-teal-200';
      default:
        return 'text-slate-800 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Papan Status Karya Siswa
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pantau siklus produksi konten dari tahap Ide hingga Tayang. Karya terlambat ditandai merah otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Tabel Rinci</span>
              </button>
            </div>

            {/* Add Work Button */}
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Usulkan Karya Baru</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul karya, nama PJ, atau tim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600"
            />
          </div>

          {/* Filter Tim */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Tim:</span>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-emerald-600"
            >
              <option value="Semua">Semua Tim</option>
              {TEAMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Filter Jenis */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Jenis:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-emerald-600"
            >
              <option value="Semua">Semua Jenis</option>
              {WORK_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Active summary badge */}
          <div className="text-xs text-slate-500 ml-auto tabular-nums">
            Menampilkan <span className="font-bold text-slate-900">{filteredWorks.length}</span> karya
          </div>
        </div>
      </div>

      {/* Overdue Warning Alert Box if any overdue exists */}
      {works.some((w) => isWorkOverdue(w, today)) && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Perhatian Humas/Ketua:</strong> Ditemukan karya yang melewati target rencana tayang dan belum berstatus "Tayang" (diberi tanda merah). Segera evaluasi atau perbarui jadwal!
            </span>
          </div>
          <span className="font-semibold text-rose-700 tabular-nums">
            {works.filter((w) => isWorkOverdue(w, today)).length} Karya Tertunda
          </span>
        </div>
      )}

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageWorks = filteredWorks.filter((w) => w.stage === stage.id);
            return (
              <div
                key={stage.id}
                className="bg-slate-100/80 rounded-xl p-3 flex flex-col border border-slate-200 min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-xs text-slate-800">{stage.label}</h3>
                    <p className="text-[10px] text-slate-500">{stage.desc}</p>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200 tabular-nums">
                    {stageWorks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                  {stageWorks.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      Belum ada karya
                    </div>
                  ) : (
                    stageWorks.map((work) => {
                      const overdue = isWorkOverdue(work, today);
                      const hasAccess = canEditWork(work);

                      return (
                        <div
                          key={work.id}
                          className={`p-3 rounded-lg bg-white border transition-all hover:shadow-md ${
                            overdue
                              ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-300'
                              : 'border-slate-200'
                          }`}
                        >
                          {/* Alert Badge for Overdue */}
                          {overdue && (
                            <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>MELEWATI TENGGAT ({work.targetPublishDate})</span>
                            </div>
                          )}

                          {/* Team & Type header */}
                          <div className="flex items-center justify-between gap-1 mb-1.5 text-[10px]">
                            <span className={`px-2 py-0.5 rounded font-medium border ${getTeamColor(work.team)}`}>
                              {work.team}
                            </span>
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              {getTypeIcon(work.type)}
                              <span>{work.type}</span>
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                            {work.title}
                          </h4>

                          {/* Metadata */}
                          <div className="space-y-1 text-[11px] text-slate-500 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="font-medium text-slate-700 truncate">{work.personInCharge}</span>
                            </div>
                            <div className="flex items-center gap-1.5 tabular-nums">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>Target: <strong>{work.targetPublishDate}</strong></span>
                            </div>
                            {work.requiredEquipment.length > 0 && (
                              <div className="flex items-start gap-1.5 text-[10px] text-slate-600">
                                <Wrench className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">{work.requiredEquipment.join(', ')}</span>
                              </div>
                            )}
                          </div>

                          {/* Link if available */}
                          {work.resultLink && (
                            <a
                              href={work.resultLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold mb-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Lihat Hasil Karya</span>
                            </a>
                          )}

                          {/* Actions / Advance button */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {hasAccess && (
                                <button
                                  onClick={() => openEditModal(work)}
                                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                                  title="Edit Karya"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {currentUser.role === 'admin' && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Hapus karya "${work.title}"?`)) {
                                      onDeleteWork(work.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                                  title="Hapus Karya (Khusus Humas)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Quick Advance button */}
                            {hasAccess && stage.id !== 'Tayang' && (
                              <button
                                onClick={() => handleQuickAdvance(work)}
                                className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors cursor-pointer border border-emerald-200"
                                title="Maju ke tahap alur selanjutnya"
                              >
                                <span>Lanjut</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            {stage.id === 'Tayang' && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Publik</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Judul Karya & Jenis</th>
                  <th className="py-3 px-3">Tim</th>
                  <th className="py-3 px-3">Penanggung Jawab</th>
                  <th className="py-3 px-3">Tahap</th>
                  <th className="py-3 px-3">Tgl Produksi</th>
                  <th className="py-3 px-3">Tgl Editing</th>
                  <th className="py-3 px-3">Target Tayang</th>
                  <th className="py-3 px-3">Tgl Aktual</th>
                  <th className="py-3 px-3">Alat & Link</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorks.map((work) => {
                  const overdue = isWorkOverdue(work, today);
                  const hasAccess = canEditWork(work);

                  return (
                    <tr
                      key={work.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        overdue ? 'bg-rose-50/50' : ''
                      }`}
                    >
                      {/* Judul & Jenis */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5">{getTypeIcon(work.type)}</span>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {work.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <span>{work.type}</span>
                              {overdue && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                                  Terlambat
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tim */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getTeamColor(work.team)}`}>
                          {work.team}
                        </span>
                      </td>

                      {/* PJ */}
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {work.personInCharge}
                      </td>

                      {/* Tahap */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {work.stage}
                        </span>
                      </td>

                      {/* Tgl Produksi */}
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {work.productionDate || '-'}
                      </td>

                      {/* Tgl Editing */}
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {work.editingDate || '-'}
                      </td>

                      {/* Target Tayang */}
                      <td className="py-3 px-3 tabular-nums">
                        <span className={overdue ? 'font-bold text-rose-700' : 'text-slate-800'}>
                          {work.targetPublishDate}
                        </span>
                      </td>

                      {/* Aktual Tayang */}
                      <td className="py-3 px-3 tabular-nums text-emerald-700 font-semibold">
                        {work.actualPublishDate || '-'}
                      </td>

                      {/* Alat & Link */}
                      <td className="py-3 px-3 text-[11px]">
                        <div className="truncate max-w-[150px] text-slate-500" title={work.requiredEquipment.join(', ')}>
                          {work.requiredEquipment.join(', ') || '-'}
                        </div>
                        {work.resultLink && (
                          <a
                            href={work.resultLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-semibold mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Link</span>
                          </a>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasAccess && (
                            <button
                              onClick={() => openEditModal(work)}
                              className="p-1 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded cursor-pointer"
                              title="Edit Data Karya"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasAccess && work.stage !== 'Tayang' && (
                            <button
                              onClick={() => handleQuickAdvance(work)}
                              className="px-2 py-0.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[10px] font-medium cursor-pointer"
                              title="Maju ke Tahap Selanjutnya"
                            >
                              Lanjut
                            </button>
                          )}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus karya "${work.title}"?`)) {
                                  onDeleteWork(work.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded cursor-pointer"
                              title="Hapus Karya"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: FORM TAMBAH / EDIT KARYA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingWork ? 'Edit Data Karya Media' : 'Usulkan Karya Media Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              {/* Judul Karya */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Karya <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Video Dokumentasi Hari Pahlawan 10 November"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600 text-slate-800"
                />
              </div>

              {/* Nama Pembuat & Pilihan User / Organisasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">
                    Nama Pembuat / Pengusul <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Fatih Al-Ghifari / Nama Santri"
                    value={formPic}
                    onChange={(e) => setFormPic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600 font-medium text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Diisi nama lengkap santri / pengusul</span>
                </div>

                <div>
                  <label className="block font-bold text-emerald-950 mb-1">
                    Pilihan User / Organisasi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTeam}
                    onChange={(e) => setFormTeam(e.target.value as TeamName)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600 font-bold text-emerald-900"
                  >
                    {TEAMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">OCEANS, ADIWIYATA, ROHIS, MUDABIR, MEDIA CENTER</span>
                </div>
              </div>

              {/* Jenis Karya & Tahap Alur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Karya</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as WorkType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    {WORK_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahap Alur</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as WorkStage)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label} ({s.desc})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tanggal Produksi, Editing, Target Tayang */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tgl Produksi</label>
                  <input
                    type="date"
                    value={formProdDate}
                    onChange={(e) => setFormProdDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tgl Editing</label>
                  <input
                    type="date"
                    value={formEditDate}
                    onChange={(e) => setFormEditDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Tayang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-emerald-600 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Tanggal Aktual Tayang (bila sudah tayang) */}
              {formStage === 'Tayang' && (
                <div>
                  <label className="block font-semibold text-emerald-800 mb-1">
                    Tanggal Aktual Tayang (Terbit di Publik)
                  </label>
                  <input
                    type="date"
                    value={formActualDate || today}
                    onChange={(e) => setFormActualDate(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50 rounded-lg focus:outline-emerald-600 font-bold text-emerald-900"
                  />
                </div>
              )}

              {/* Alat yang Dibutuhkan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alat yang Dibutuhkan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Kamera Sony A6400, Mic Wireless Boya, Laptop Asus ROG"
                  value={formEquipment}
                  onChange={(e) => setFormEquipment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
                />
              </div>

              {/* Link Hasil Karya */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Link Hasil Karya (YouTube / IG / Google Drive)
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/p/... atau https://youtube.com/..."
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
                />
              </div>

              {/* Catatan / Keterangan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan konsep, revisi atau kendala..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600"
                />
              </div>

              {/* Submit Buttons */}
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
                  {editingWork ? 'Simpan Perubahan' : 'Kirim Usulan Karya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
