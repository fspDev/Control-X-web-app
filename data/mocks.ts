import { User, Event } from '../types';

// Extended internal user type for mock data, including password
export interface MockUser extends User {
  password?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    username: 'jane.doe',
    role: 'user',
    password: 'password',
  },
  {
    id: 'user-2',
    username: 'john.smith',
    role: 'user',
    password: 'password',
  },
  {
    id: 'user-3',
    username: 'admin',
    role: 'admin',
    password: 'adminpass',
  },
];

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    titulo: 'Boda en Viñedo',
    estado: 'Confirmado',
    lugar: 'Viñedo Santa Rita',
    armado: { start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
    fechaEvento: { start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
    desarme: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    cliente: 'Familia González',
    fabricacion: 'Estructuras de madera personalizadas',
    createdBy: 'user-3',
    updatedAt: new Date().toISOString(),
    notes: 'Confirmar lista de invitados con el cliente.\nRevisar el pronóstico del tiempo una semana antes.\nCoordinar con el proveedor de flores.',
  },
  {
    id: 'event-2',
    titulo: 'Lanzamiento de Producto TechCorp',
    estado: 'Confirmado',
    lugar: 'Centro de Convenciones Metropolitano',
    armado: { start: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString() },
    fechaEvento: { start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    desarme: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    cliente: 'TechCorp Inc.',
    fabricacion: 'Escenario con pantallas LED',
    createdBy: 'user-3',
    updatedAt: new Date().toISOString(),
    notes: 'El CEO de TechCorp dará el discurso de apertura. Asegurar que el teleprompter esté funcionando correctamente. Se necesitan 3 micrófonos de solapa.',
  },
  {
    id: 'event-3',
    titulo: 'Conferencia Anual de Marketing',
    estado: 'Finalizado',
    lugar: 'Hotel Grand Hyatt',
    armado: { start: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() },
    fechaEvento: { start: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    desarme: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    cliente: 'Asociación de Marketing Digital',
    fabricacion: 'Stands y material gráfico',
    createdBy: 'user-1',
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'event-4',
    titulo: 'Festival de Música Indie',
    estado: 'Negociación',
    lugar: 'Parque Bicentenario',
    armado: { start: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString() },
    fechaEvento: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    desarme: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    cliente: 'Producciones Musicales Sonido Libre',
    fabricacion: 'Montaje de escenario principal',
    createdBy: 'user-1',
    updatedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
