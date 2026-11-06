import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserPlus, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Mail, 
  User, 
  Sparkles
} from 'lucide-react';
import { UserProfile, Role, TeamName } from '../types';
import { 
  getStoredUsers, 
  updateUserRole, 
  updateUserTeam, 
  deleteUserAccount, 
  registerNewUser 
} from '../utils/storage';

interface UserManagementViewProps {
  currentUser: UserProfile;
}

const TEAMS: TeamName[] = [
  'OCEANS',
  'ADIWIYATA',
  'ROHIS',
  'MUDABIR',
  'MEDIA CENTER',
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
}) => {
  const [users, setUsers] = useState<UserProfile[]>(() => getStoredUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('Semua');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Add User
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTeam, setFormTeam] = useState<TeamName>('OCEANS');
  const [formRole, setFormRole] = useState<Role>('siswa');
  const [formPass, setFormPass] = useState('santri123');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
    const res = updateUserRole(userId, newRole);
    if (res.success) {
      setUsers(getStoredUsers());
      showNotification('success', 'Peran pengguna berhasil diperbarui!');
    } else {
      showNotification('error', res.message || 'Gagal mengubah peran.');
    }
  };

  const handleTeamChange = (userId: string, newTeam: TeamName) => {
    const res = updateUserTeam(userId, newTeam);
    if (res.success) {
      setUsers(getStoredUsers());
      showNotification('success', 'Organisasi pengguna berhasil diperbarui!');
    } else {
      showNotification('error', res.message || 'Gagal mengubah organisasi.');
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (window.confirm(`Hapus akun pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      const res = deleteUserAccount(userId);
      if (res.success) {
        setUsers(getStoredUsers());
        showNotification('success', `Akun ${name} berhasil dihapus.`);
      } else {
        showNotification('error', res.message || 'Gagal menghapus akun.');
      }
    }
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showNotification('error', 'Mohon lengkapi nama dan email pengguna.');
      return;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      team: formTeam,
      role: formRole,
      password: formPass.trim() || 'santri123',
      registeredAt: new Date().toISOString().split('T')[0],
    };

    const res = registerNewUser(newUser);
    if (res.success) {
      setUsers(getStoredUsers());
      showNotification('success', `Pengguna ${newUser.name} berhasil ditambahkan!`);
      setIsAddModalOpen(false);
      setFormName('');
      setFormEmail('');
    } else {
      showNotification('error', res.message || 'Gagal menambahkan pengguna.');
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (teamFilter !== 'Semua' && u.team !== teamFilter) return false;
    if (roleFilter !== 'Semua' && u.role !== roleFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchTeam = u.team.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTeam) return false;
    }
    return true;
  });

  const getTeamBadge = (team: TeamName) => {
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
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Panel Khusus Administrator · Ustadz Firman</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Kelola Pengguna & Pengaturan Role
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur wewenang pengguna, promosikan santri menjadi Ketua Tim / Admin, mutasi organisasi, atau kelola akun aktif.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* User Stats KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Total Pengguna Terdaftar</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{users.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Siswa, Pengurus & Guru</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Administrator</div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            {users.filter((u) => u.role === 'admin').length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Otoritas Penuh & Hak Hapus</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Ketua Tim / Koordinator</div>
          <div className="text-2xl font-bold text-blue-800 tabular-nums">
            {users.filter((u) => u.role === 'ketua_tim').length}
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Kelola alur karya tim</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Anggota Santri</div>
          <div className="text-2xl font-bold text-slate-700 tabular-nums">
            {users.filter((u) => u.role === 'siswa').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pengusul karya & booking</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, email, atau organisasi pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Organisasi:</span>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 font-medium"
          >
            <option value="Semua">Semua Organisasi</option>
            {TEAMS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 font-medium"
          >
            <option value="Semua">Semua Peran</option>
            <option value="admin">Administrator</option>
            <option value="ketua_tim">Ketua Tim</option>
            <option value="siswa">Anggota Santri</option>
          </select>
        </div>

        <div className="text-slate-500 tabular-nums">
          Total: <strong className="text-slate-900">{filteredUsers.length}</strong> akun
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Pengguna & Email</th>
                <th className="py-3 px-3">Organisasi / Unit</th>
                <th className="py-3 px-3">Role / Hak Akses</th>
                <th className="py-3 px-3">Hak Hapus?</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isAdmin = user.role === 'admin';
                const isUstadzFirman = user.email === 'firman.maulana1004@gmail.com' || user.id === 'user-admin-1';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                          isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isUstadzFirman && (
                              <span className="text-[9px] bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded font-extrabold">
                                ADMIN UTAMA
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Organisasi Selector */}
                    <td className="py-3 px-3">
                      <select
                        value={user.team}
                        onChange={(e) => handleTeamChange(user.id, e.target.value as TeamName)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold border cursor-pointer focus:outline-emerald-600 ${getTeamBadge(user.team)}`}
                      >
                        {TEAMS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>

                    {/* Role Selector */}
                    <td className="py-3 px-3">
                      <select
                        value={user.role}
                        disabled={isUstadzFirman}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold border cursor-pointer focus:outline-emerald-600 ${
                          user.role === 'admin'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : user.role === 'ketua_tim'
                            ? 'bg-blue-50 text-blue-900 border-blue-300'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="admin">Administrator (Akses Penuh)</option>
                        <option value="ketua_tim">Ketua Tim / Koordinator</option>
                        <option value="siswa">Anggota Santri / Pengusul</option>
                      </select>
                      {isUstadzFirman && (
                        <div className="text-[10px] text-slate-400 mt-0.5">Terkunci sebagai Admin Utama</div>
                      )}
                    </td>

                    {/* Hak Hapus status */}
                    <td className="py-3 px-3">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Bisa Hapus Data</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Tidak Berwenang
                        </span>
                      )}
                    </td>

                    {/* Aksi Hapus Akun */}
                    <td className="py-3 px-3 text-right">
                      {!isUstadzFirman ? (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Akun Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic px-2">Akun Sistem</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH PENGGUNA BARU OLEH ADMIN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-bold text-slate-900">Tambah Akun Pengguna Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold px-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Santri / Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Wildan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Akun Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="wildan@cendekiabaznas.sch.id"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600 text-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organisasi / Unit</label>
                  <select
                    value={formTeam}
                    onChange={(e) => setFormTeam(e.target.value as TeamName)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600 font-semibold text-emerald-900"
                  >
                    {TEAMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran / Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as Role)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-600 font-semibold"
                  >
                    <option value="siswa">Anggota Santri</option>
                    <option value="ketua_tim">Ketua Tim</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi Sementara
                </label>
                <input
                  type="text"
                  value={formPass}
                  onChange={(e) => setFormPass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-600 font-mono text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
