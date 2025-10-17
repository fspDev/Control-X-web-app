export interface User {
  id: string;
  username: string;
  avatarUrl?: string | null;
  role: 'admin' | 'user';
}

export interface Event {
  id: string;
  estado: 'Negociación' | 'Confirmado' | 'Armado' | 'Finalizado';
  titulo: string;
  lugar: string;
  armado: { start: string; end?: string };
  fechaEvento: { start: string; end?: string };
  desarme: string;
  cliente: string;
  fabricacion: string;
  createdBy: string; // User ID
  updatedAt: string;
  notes?: string;
}

export interface Note {
  content: string;
  updatedAt: string;
}
