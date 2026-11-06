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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [agendas, setAgendas] = useState<SchoolAgenda[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredCurrentUser());

  // Load initial data from localStorage
  useEffect(() => {
    setWorks(getStoredWorks());
    setBookings(getStoredBookings());
    setAgendas(getStoredAgendas());
    setCurrentUser(getStoredCurrentUser());
  }, []);

  // Sync current user change to storage
  const handleUserChange = (user: UserProfile) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
  };

  // Reset data handler
  const handleResetData = () => {
    resetAllDataToDefault();
    setWorks(getStoredWorks());
    setBookings(getStoredBookings());
    setAgendas(getStoredAgendas());
  };

  // Work Handlers
  const handleAddWork = (newWorkData: Omit<WorkItem, 'id' | 'createdAt'>) => {
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
    const updated = works.filter((w) => w.id !== id);
    setWorks(updated);
    saveStoredWorks(updated);
  };

  // Booking Handlers with conflict prevention logic
  const handleAddBooking = (
    newBookingData: Omit<BookingItem, 'id' | 'createdAt'>
  ): { success: boolean; message?: string } => {
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
    const updated = agendas.filter((a) => a.id !== id);
    setAgendas(updated);
    saveStoredAgendas(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Navigation Header with School Logo & Role Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={handleUserChange}
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
            currentUser={currentUser}
          />
        )}

        {activeTab === 'works' && (
          <WorkBoardView
            works={works}
            onAddWork={handleAddWork}
            onUpdateWork={handleUpdateWork}
            onDeleteWork={handleDeleteWork}
            currentUser={currentUser}
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
            currentUser={currentUser}
          />
        )}

        {activeTab === 'agendas' && (
          <AgendaView
            agendas={agendas}
            onAddAgenda={handleAddAgenda}
            onDeleteAgenda={handleDeleteAgenda}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'recap' && (
          <RecapView
            works={works}
            bookings={bookings}
            currentUser={currentUser}
          />
        )}
      </main>

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
            <span>Desain Bersih & Modern</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
