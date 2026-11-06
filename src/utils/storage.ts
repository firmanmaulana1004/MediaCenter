import { WorkItem, BookingItem, SchoolAgenda, MonthlyRecap, UserProfile, Role, TeamName } from '../types';
import { INITIAL_WORKS, INITIAL_BOOKINGS, INITIAL_AGENDAS, INITIAL_RECAP, INITIAL_USER_PROFILES } from '../data/sampleData';

const STORAGE_KEYS = {
  WORKS: 'cendekia_works_v2',
  BOOKINGS: 'cendekia_bookings_v2',
  AGENDAS: 'cendekia_agendas_v2',
  RECAPS: 'cendekia_recaps_v2',
  USERS: 'cendekia_users_v2',
  CURRENT_USER: 'cendekia_current_user_v2',
  SUPABASE_CONFIG: 'cendekia_supabase_config_v2',
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredWorks(): WorkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(INITIAL_WORKS));
      return INITIAL_WORKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WORKS;
  }
}

export function saveStoredWorks(works: WorkItem[]): void {
  localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(works));
}

export function getStoredBookings(): BookingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveStoredBookings(bookings: BookingItem[]): void {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

export function getStoredAgendas(): SchoolAgenda[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENDAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AGENDAS, JSON.stringify(INITIAL_AGENDAS));
      return INITIAL_AGENDAS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AGENDAS;
  }
}

export function saveStoredAgendas(agendas: SchoolAgenda[]): void {
  localStorage.setItem(STORAGE_KEYS.AGENDAS, JSON.stringify(agendas));
}

export function getStoredRecap(monthKey: string): MonthlyRecap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECAPS);
    if (raw) {
      const all: Record<string, MonthlyRecap> = JSON.parse(raw);
      if (all[monthKey]) return all[monthKey];
    }
    return {
      ...INITIAL_RECAP,
      monthKey,
    };
  } catch {
    return INITIAL_RECAP;
  }
}

export function saveStoredRecap(recap: MonthlyRecap): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECAPS);
    const all: Record<string, MonthlyRecap> = raw ? JSON.parse(raw) : {};
    all[recap.monthKey] = recap;
    localStorage.setItem(STORAGE_KEYS.RECAPS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save recap', e);
  }
}

export function getStoredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USER_PROFILES));
      return INITIAL_USER_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USER_PROFILES;
  }
}

export function saveStoredUsers(users: UserProfile[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function registerNewUser(newUser: UserProfile): { success: boolean; message?: string } {
  const users = getStoredUsers();
  const exists = users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
  if (exists) {
    return { success: false, message: 'Email tersebut sudah terdaftar di sistem!' };
  }
  const updated = [...users, newUser];
  saveStoredUsers(updated);
  return { success: true };
}

export function authenticateUser(loginId: string, pass: string): { success: boolean; user?: UserProfile; message?: string } {
  const users = getStoredUsers();
  const cleanId = loginId.trim().toLowerCase();
  const cleanPass = pass.trim();

  const user = users.find((u) => {
    const emailMatch = u.email.toLowerCase() === cleanId;
    const teamMatch = u.team.toLowerCase() === cleanId;
    const adminAlias = (cleanId === 'admin' || cleanId === 'firman') && u.role === 'admin';
    return emailMatch || teamMatch || adminAlias;
  });

  if (!user) {
    return { success: false, message: 'Akun tidak ditemukan. Gunakan email atau nama organisasi Anda.' };
  }

  if (user.password && user.password !== cleanPass) {
    return { success: false, message: 'Kata sandi / PIN yang dimasukkan salah.' };
  }

  return { success: true, user };
}

export function getStoredCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_USER_PROFILES[0]; // Default Ustadz Firman
}

export function saveStoredCurrentUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    url: '',
    anonKey: '',
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(INITIAL_WORKS));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  localStorage.setItem(STORAGE_KEYS.AGENDAS, JSON.stringify(INITIAL_AGENDAS));
  localStorage.setItem(STORAGE_KEYS.RECAPS, JSON.stringify({ '2026-11': INITIAL_RECAP }));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USER_PROFILES));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USER_PROFILES[0]));
}

/**
 * Cek bentrok jadwal booking ruang media dan laptop
 * Mencegah 2 tim memesan fasilitas yang sama di hari & sesi jam yang sama
 */
export function checkBookingConflict(
  candidate: {
    bookingDate: string;
    session: string;
    resourceType: string;
    ignoreBookingId?: string;
  },
  existingBookings: BookingItem[]
): { hasConflict: boolean; conflictingBooking?: BookingItem; reason?: string } {
  const conflict = existingBookings.find((b) => {
    if (candidate.ignoreBookingId && b.id === candidate.ignoreBookingId) return false;
    if (b.status === 'Ditolak') return false;
    if (b.bookingDate !== candidate.bookingDate) return false;
    if (b.session !== candidate.session) return false;

    // Cek bentrok fasilitas
    if (candidate.resourceType === 'Semua Fasilitas Studio' || b.resourceType === 'Semua Fasilitas Studio') {
      return true;
    }

    return b.resourceType === candidate.resourceType;
  });

  if (conflict) {
    return {
      hasConflict: true,
      conflictingBooking: conflict,
      reason: `Jadwal bentrok! ${conflict.resourceType} pada ${conflict.session} sudah dipesan oleh Tim ${conflict.team} (${conflict.applicantName}) untuk keperluan: "${conflict.purpose}".`,
    };
  }

  return { hasConflict: false };
}

/**
 * Cek apakah karya terlambat (melewati target tanggal tayang dan belum tahap "Tayang")
 */
export function isWorkOverdue(work: WorkItem, referenceDateStr?: string): boolean {
  if (work.stage === 'Tayang') return false;
  const today = referenceDateStr || new Date().toISOString().split('T')[0];
  return work.targetPublishDate < today;
}

/**
 * Download string content as CSV file
 */
export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
