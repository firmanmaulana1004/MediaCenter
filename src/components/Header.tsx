import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Kanban, 
  Clock, 
  BookOpen, 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  User, 
  RotateCcw, 
  Check, 
  Menu, 
  X
} from 'lucide-react';
import { UserProfile, Role } from '../types';
import { INITIAL_USER_PROFILES } from '../data/sampleData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  onResetData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'works', label: 'Papan Status Karya', icon: Kanban },
    { id: 'calendar', label: 'Kalender Bulanan', icon: CalendarIcon },
    { id: 'bookings', label: 'Booking Ruang & Laptop', icon: Clock },
    { id: 'agendas', label: 'Agenda & Tema', icon: BookOpen },
    { id: 'recap', label: 'Rekap & Evaluasi', icon: BarChart3 },
  ];

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return { label: 'Humas / Admin (Akses Penuh)', color: 'bg-emerald-700 text-white' };
      case 'ketua_tim':
        return { label: 'Ketua Tim (Kelola Karya Tim)', color: 'bg-blue-700 text-white' };
      case 'siswa':
        return { label: 'Siswa / Kreator (Ajukan Karya & Booking)', color: 'bg-amber-600 text-white' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner Bar for Role & Organization Branding */}
      <div className="bg-emerald-950 text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide text-emerald-300">SEKOLAH CENDEKIA BAZNAS</span>
          <span className="text-emerald-500">·</span>
          <span className="hidden sm:inline text-emerald-200">Manajemen Alur Kerja Media & Fasilitas Studio</span>
        </div>

        {/* Role Switcher Pill */}
        <div className="relative flex items-center gap-2">
          <span className="text-emerald-300 hidden md:inline">Mode Peran:</span>
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-800 hover:bg-emerald-700 text-white transition-colors cursor-pointer border border-emerald-600"
              title="Ganti peran untuk menguji pengalaman Siswa, Ketua Tim, atau Humas"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{currentUser.name.split(' (')[0]}</span>
              <span className="text-emerald-400 font-normal">({currentUser.role.replace('_', ' ')})</span>
              <span className="text-[10px] ml-1">▼</span>
            </button>

            {roleDropdownOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-72 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Ganti Akun & Hak Akses Demo
                </div>
                {INITIAL_USER_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      setCurrentUser(profile);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-slate-50 transition-colors ${
                      currentUser.id === profile.id ? 'bg-emerald-50 text-emerald-900 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {currentUser.id === profile.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <div className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{profile.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {profile.role === 'admin' && 'Akses penuh: setujui karya, agenda & rekap'}
                        {profile.role === 'ketua_tim' && `Ketua ${profile.team}: update alur karya tim`}
                        {profile.role === 'siswa' && 'Siswa: ajukan ide karya & booking fasilitas'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset data kembali ke contoh awal Sekolah Cendekia BAZNAS?')) {
                onResetData();
              }
            }}
            className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white ml-2 transition-colors cursor-pointer"
            title="Kembalikan data sampel awal"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Cendekia Media Calendar
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                Pusat Koordinasi Karya Santri & Fasilitas Studio
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-3 pt-2 pb-3 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
