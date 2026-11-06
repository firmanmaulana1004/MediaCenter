export type Role = 'siswa' | 'ketua_tim' | 'admin';

export type TeamName = 
  | 'OCEANS'
  | 'ADIWIYATA'
  | 'ROHIS'
  | 'MUDABIR'
  | 'MEDIA CENTER';

export type WorkType = 
  | 'Video'
  | 'Dokumentasi'
  | 'Podcast'
  | 'Desain'
  | 'Lainnya';

export type WorkStage = 
  | 'Ide'
  | 'Naskah'
  | 'Produksi'
  | 'Editing'
  | 'Review'
  | 'Siap Tayang'
  | 'Tayang';

export interface WorkItem {
  id: string;
  title: string;
  type: WorkType;
  team: TeamName;
  personInCharge: string;
  stage: WorkStage;
  productionDate: string; // YYYY-MM-DD
  editingDate: string; // YYYY-MM-DD
  targetPublishDate: string; // YYYY-MM-DD
  actualPublishDate?: string; // YYYY-MM-DD
  requiredEquipment: string[];
  resultLink?: string;
  notes?: string;
  createdAt: string;
}

export type FacilityType = 
  | 'Ruang Studio Media'
  | 'Laptop Editing A (Asus ROG)'
  | 'Laptop Editing B (MacBook)'
  | 'Ruang Podcast & Voice Over'
  | 'Semua Fasilitas Studio';

export type BookingSession = 
  | 'Sesi 1 (08.00 - 10.00)'
  | 'Sesi 2 (10.15 - 12.00)'
  | 'Sesi 3 (13.30 - 15.30)'
  | 'Sesi 4 (16.00 - 17.30)'
  | 'Sesi Malam Asrama (19.45 - 21.00)';

export interface BookingItem {
  id: string;
  bookingDate: string; // YYYY-MM-DD
  session: BookingSession;
  resourceType: FacilityType;
  team: TeamName;
  applicantName: string;
  purpose: string;
  equipmentNeeded: string[];
  status: 'Disetujui' | 'Menunggu Persetujuan' | 'Ditolak';
  createdAt: string;
}

export interface SchoolAgenda {
  id: string;
  monthKey: string; // e.g. "2026-11"
  monthlyTheme: string;
  title: string;
  eventDate: string; // YYYY-MM-DD
  description: string;
  targetCoverage: string; // e.g. "Highlight Reels & Dokumentasi Foto"
  teamInCharge: TeamName;
}

export interface MonthlyRecap {
  monthKey: string; // "2026-11"
  bestWork: string;
  obstacles: string;
  improvementPlan: string;
  submittedBy: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  team: TeamName;
  email: string;
  password?: string;
}
