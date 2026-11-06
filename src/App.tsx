import React, { useState, useEffect } from 'react';
import { 
  WorkItem, 
  BookingItem, 
  SchoolAgenda, 
  UserProfile 
} from './types';
import { 
  getStoredWorks, 
  saveStoredWorks, 
  getStoredBookings, 
  saveStoredBookings, 
  getStoredAgendas, 
  saveStoredAgendas, 
  getStoredCurrentUser, 
  saveStoredCurrentUser, 
  resetAllDataToDefault,
  checkBookingConflict
} from './utils/storage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WorkBoardView } from './components/WorkBoardView';
import { CalendarView } from './components/CalendarView';
import { BookingView } from './components/BookingView';
import { AgendaView } from './components/AgendaView';
import { RecapView } from './components/RecapView';
import { LoginModal } from './components/LoginModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [agendas, setAgendas] = useState<SchoolAgenda[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load initial data from localStorage
  useEffect(() => {
    setWorks(getStoredWorks());
    setBookings(getStoredBookings());
    setAgendas(getStoredAgendas());
    setCurrentUser(getStoredCurrentUser());
  }, []);

  // Login handler
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredCurrentUser(null);
  };

  // Reset data handler
  const handleResetData = () => {
    resetAllDataToDefault();
    setWorks(getStoredWorks());
    setBookings(getStoredBookings());
    setAgendas(getStoredAgendas());
    setCurrentUser(getStoredCurrentUser());
  };

  // Active user fallback (Guest / Tamu)
  const activeUser: UserProfile = currentUser || {
    id: 'guest',
    name: 'Tamu (Pengunjung)',
    role: 'siswa',
    team: 'MEDIA CENTER',
    email: 'tamu@cendekiabaznas.sch.id',
  };

  // Work Handlers
  const handleAddWork = (newWorkData: Omit<WorkItem, 'id' | 'createdAt'>) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    const newWork: WorkItem = {
      ...newWorkData,
      id: `work-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newWork, ...works];
    setWorks(updated);
    saveStoredWorks(updated);
  };

  const handleUpdateWork = (updatedWork: WorkItem) => {
    const updated = works.map((w) => (w.id === updatedWork.id ? updatedWork : w));
    setWorks(updated);
    saveStoredWorks(updated);
  };

  const handleDeleteWork = (id: string) => {
    // Only Ustadz Firman (admin) can delete
    if (activeUser.role !== 'admin') {
      alert('Maaf, hanya Ustadz Firman (Administrator) yang berwenang menghapus karya.');
      return;
    }
    const updated = works.filter((w) => w.id !== id);
    setWorks(updated);
    saveStoredWorks(updated);
  };

  // Booking Handlers with conflict prevention logic
  const handleAddBooking = (
    newBookingData: Omit<BookingItem, 'id' | 'createdAt'>
  ): { success: boolean; message?: string } => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return { success: false, message: 'Silakan login terlebih dahulu untuk melakukan pemesanan.' };
    }

    const check = checkBookingConflict(
      {
        bookingDate: newBookingData.bookingDate,
        session: newBookingData.session,
        resourceType: newBookingData.resourceType,
      },
      bookings
    );

    if (check.hasConflict) {
      return { success: false, message: check.reason };
    }

    const newBooking: BookingItem = {
      ...newBookingData,
      id: `book-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    saveStoredBookings(updated);
    return { success: true };
  };

  const handleCancelBooking = (id: string) => {
    // Only Ustadz Firman (admin) can delete booking
    if (activeUser.role !== 'admin') {
      alert('Maaf, hanya Ustadz Firman (Administrator) yang dapat membatalkan pemesanan fasilitas.');
      return;
    }
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
    saveStoredBookings(updated);
  };

  // Agenda Handlers
  const handleAddAgenda = (newAgendaData: Omit<SchoolAgenda, 'id'>) => {
    const newAgenda: SchoolAgenda = {
      ...newAgendaData,
      id: `agenda-${Date.now()}`,
    };
    const updated = [...agendas, newAgenda];
    setAgendas(updated);
    saveStoredAgendas(updated);
  };

  const handleDeleteAgenda = (id: string) => {
    if (activeUser.role !== 'admin') {
      alert('Hanya Ustadz Firman (Administrator) yang berwenang menghapus agenda.');
      return;
    }
    const updated = agendas.filter((a) => a.id !== id);
    setAgendas(updated);
    saveStoredAgendas(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Navigation Header with School Logo & User Profile / Login */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            works={works}
            bookings={bookings}
            agendas={agendas}
            onNavigateTab={setActiveTab}
            currentUser={activeUser}
          />
        )}

        {activeTab === 'works' && (
          <WorkBoardView
            works={works}
            onAddWork={handleAddWork}
            onUpdateWork={handleUpdateWork}
            onDeleteWork={handleDeleteWork}
            currentUser={activeUser}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            works={works}
            bookings={bookings}
            agendas={agendas}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingView
            bookings={bookings}
            onAddBooking={handleAddBooking}
            onCancelBooking={handleCancelBooking}
            currentUser={activeUser}
          />
        )}

        {activeTab === 'agendas' && (
          <AgendaView
            agendas={agendas}
            onAddAgenda={handleAddAgenda}
            onDeleteAgenda={handleDeleteAgenda}
            currentUser={activeUser}
          />
        )}

        {activeTab === 'recap' && (
          <RecapView
            works={works}
            bookings={bookings}
            currentUser={activeUser}
          />
        )}
      </main>

      {/* User Login & Register Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Clean School Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-900">Sekolah Cendekia BAZNAS</span>
            <span>·</span>
            <span>Sistem Koordinasi Media & Studio Multimedia</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Kalender Kerja & Fasilitas Santri</span>
            <span>·</span>
            <span>Sistem Autentikasi Pengguna Aktif</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
