import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Kanban, 
  Clock, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  User, 
  RotateCcw, 
  Menu, 
  X,
  LogIn,
  LogOut,
  Users,
  Link2,
  Check
} from 'lucide-react';
import { UserProfile, Role } from '../types';
import { SITE_CONFIG } from '../constants/site';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onResetData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(SITE_CONFIG.domain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'works', label: 'Papan Status Karya', icon: Kanban },
    { id: 'calendar', label: 'Kalender Bulanan', icon: CalendarIcon },
    { id: 'bookings', label: 'Booking Ruang & Laptop', icon: Clock },
    { id: 'agendas', label: 'Agenda & Tema', icon: BookOpen },
    { id: 'recap', label: 'Rekap & Evaluasi', icon: BarChart3 },
    ...(currentUser?.role === 'admin'
      ? [{ id: 'users', label: 'Kelola Pengguna', icon: Users }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner Bar for Role & Organization Branding */}
      <div className="bg-emerald-950 text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold tracking-wide text-emerald-300">SEKOLAH CENDEKIA BAZNAS</span>
          <span className="text-emerald-500">·</span>
          <span className="hidden sm:inline text-emerald-200">Manajemen Alur Kerja Media & Fasilitas Studio</span>
          <span className="text-emerald-600 hidden md:inline">|</span>
          {/* Domain Sync Badge */}
          <button
            onClick={handleCopyDomain}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-900/80 hover:bg-emerald-800 text-[11px] text-emerald-200 hover:text-white transition-colors cursor-pointer border border-emerald-700/60"
            title="Klik untuk menyalin tautan resmi aplikasi"
          >
            {copiedDomain ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Tautan Tersalin!</span>
              </>
            ) : (
              <>
                <Link2 className="w-3 h-3 text-emerald-400" />
                <span className="font-mono text-[10.5px] truncate max-w-[190px] sm:max-w-none">
                  {SITE_CONFIG.domainHost}
                </span>
                <span className="text-[9px] bg-emerald-700/70 text-emerald-200 px-1 rounded uppercase font-bold">
                  Live
                </span>
              </>
            )}
          </button>
        </div>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative flex items-center gap-2">
              <span className="text-emerald-300 hidden md:inline text-[11px]">Sedang Masuk:</span>
              
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-800/90 hover:bg-emerald-800 text-white transition-all cursor-pointer border border-emerald-600 shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white uppercase border border-emerald-400">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span>{currentUser.name.split(' (')[0]}</span>
                  {currentUser.role === 'admin' ? (
                    <span className="text-[9px] bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded font-extrabold tracking-wide">
                      ADMIN
                    </span>
                  ) : (
                    <span className="text-[9px] bg-emerald-700 text-emerald-200 px-1.5 py-0.2 rounded font-bold">
                      {currentUser.team}
                    </span>
                  )}
                  <span className="text-[10px] ml-0.5">▼</span>
                </button>

                {/* Profile Popup Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-xs">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.email}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                          Unit: {currentUser.team}
                        </span>
                        {currentUser.role === 'admin' && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-900">
                            Hak Hapus & Akses Penuh
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-1.5">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setActiveTab('users');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-950 font-bold cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Kelola Pengguna & Role</span>
                        </button>
                      )}

                      <button
                        onClick={onOpenLogin}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-700 font-medium cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Ganti Akun / Pindah Pengguna</span>
                      </button>

                      <button
                        onClick={onLogout}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-rose-50 rounded-lg transition-colors text-rose-700 font-semibold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs border border-emerald-400"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk / Login Akun</span>
            </button>
          )}

          {/* Reset sample data */}
          <button
            onClick={() => {
              if (window.confirm('Reset data kembali ke contoh awal Sekolah Cendekia BAZNAS?')) {
                onResetData();
              }
            }}
            className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white transition-colors cursor-pointer ml-1"
            title="Kembalikan data sampel awal"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
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
