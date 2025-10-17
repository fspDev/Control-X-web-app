import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearch } from '../contexts/SearchContext.tsx';
import { useUsers } from '../hooks/useUsers.ts';
import * as api from '../services/firebase.ts';
import NotionCard from '../components/ui/NotionCard.tsx';
import Dropdown from '../components/ui/Dropdown.tsx';
import ConfirmationModal from '../components/ui/ConfirmationModal.tsx';
import EventFormModal from '../components/events/EventFormModal.tsx';
import EventDetailModal from '../components/events/EventDetailModal.tsx';
import { Event } from '../types/index.ts';
import { PlusIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon, FilterIcon } from '../assets/icons.tsx';
import Skeleton from '../components/ui/Skeleton.tsx';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';


const EVENTS_PER_PAGE = 20;

const TableViewPage: React.FC = () => {
  const { users } = useUsers();
  const { searchQuery } = useSearch();

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<Event['estado'] | 'All'>('All');
  const [clientFilter, setClientFilter] = useState<string>('All');

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  
  const clients = useMemo(() => ['All', ...Array.from(new Set(events.map(e => e.cliente)))], [events]);
  const statuses: (Event['estado'] | 'All')[] = ['All', 'Negociación', 'Confirmado', 'Armado', 'Finalizado'];

  const fetchEvents = useCallback(async (loadMore = false) => {
    setError(null);
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await api.getEventsPaginated({
        status: statusFilter,
        client: clientFilter,
        limitNum: EVENTS_PER_PAGE,
        lastVisible: loadMore ? lastVisible : undefined,
      });

      setEvents(prev => loadMore ? [...prev, ...result.events] : result.events);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);

    } catch (err) {
      console.error(err);
      setError("Error al cargar los eventos. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [statusFilter, clientFilter, lastVisible]);

  useEffect(() => {
    setLastVisible(null);
    setHasMore(true);
    fetchEvents(false);
  }, [statusFilter, clientFilter]); // Refetch when filters change

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    return events.filter(event => {
      const query = searchQuery.toLowerCase();
      return (
        event.titulo.toLowerCase().includes(query) ||
        event.cliente.toLowerCase().includes(query) ||
        event.lugar.toLowerCase().includes(query)
      );
    });
  }, [events, searchQuery]);

  const handleOpenAddModal = () => {
    setSelectedEvent(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (event: Event) => {
    setSelectedEvent(event);
    setFormModalOpen(true);
  };
  
  const handleOpenDeleteModal = (event: Event) => {
    setSelectedEvent(event);
    setConfirmModalOpen(true);
  };
  
  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'createdBy' | 'updatedAt'>, id?: string) => {
    if (id) {
      await api.updateEvent(id, eventData);
    } else {
      await api.createEvent({ ...eventData, createdBy: users.find(u => u.role === 'admin')?.id || 'admin' }); // Simplification
    }
    fetchEvents(false); // Refetch list
    setFormModalOpen(false);
  };
  
  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      await api.deleteEvent(selectedEvent.id);
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
    }
    setConfirmModalOpen(false);
  };

  const handleStatusChange = async (eventId: string, newStatus: Event['estado']) => {
    await api.updateEvent(eventId, { estado: newStatus });
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, estado: newStatus } : e));
  };

  const getStatusClass = (status: Event['estado']) => {
    switch (status) {
      case 'Negociación': return 'bg-yellow-900 text-yellow-300';
      case 'Confirmado': return 'bg-blue-900 text-blue-300';
      case 'Armado': return 'bg-purple-900 text-purple-300';
      case 'Finalizado': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const handleEditFromDetail = (eventToEdit: Event) => {
    setViewingEvent(null);
    handleOpenEditModal(eventToEdit);
  };
  
  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-notion-border">
          <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
          <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
          <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
          <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
          <td className="px-6 py-4"><Skeleton className="h-5 w-28 rounded-full" /></td>
          <td className="px-6 py-4 text-right"><Skeleton className="h-6 w-6 rounded-full ml-auto" /></td>
        </tr>
      ));
    }
    if (error) {
      return <tr><td colSpan={6} className="text-center py-10 text-notion-error">{error}</td></tr>;
    }
    if (filteredEvents.length === 0) {
      return (
        <tr>
            <td colSpan={6} className="text-center py-10 text-notion-text-secondary">
                <div className="flex flex-col items-center gap-4">
                    <p>No se encontraron eventos que coincidan con tus filtros.</p>
                    <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-3 py-1.5 bg-notion-accent text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                        <PlusIcon className="h-4 w-4" /> Crear Nuevo Evento
                    </button>
                </div>
            </td>
        </tr>
      );
    }
    return filteredEvents.map((event) => (
      <tr key={event.id} onClick={() => setViewingEvent(event)} className="border-b border-notion-border hover:bg-notion-hover cursor-pointer">
        <td className="px-6 py-4 font-medium whitespace-nowrap">{event.titulo}</td>
        <td className="px-6 py-4">{event.cliente}</td>
        <td className="px-6 py-4">{event.lugar}</td>
        <td className="px-6 py-4">{new Date(event.fechaEvento.start).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
          <Dropdown trigger={
            <button className={`px-2 py-1 text-xs font-medium rounded-full w-28 text-center transition-colors ${getStatusClass(event.estado)}`}>
              {event.estado}
            </button>
          }>
             {(statuses.filter(s => s !== 'All' && s !== event.estado) as Event['estado'][]).map(status => (
                <button
                    key={status}
                    onClick={() => handleStatusChange(event.id, status)}
                    className="block w-full text-left px-4 py-2 text-sm text-notion-text hover:bg-notion-hover"
                >
                    {status}
                </button>
            ))}
          </Dropdown>
        </td>
        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
          <Dropdown trigger={<button className="p-2 rounded-full hover:bg-notion-hover"><EllipsisVerticalIcon className="h-5 w-5" /></button>}>
            <button onClick={() => handleOpenEditModal(event)} className="flex items-center w-full px-4 py-2 text-sm text-left text-notion-text hover:bg-notion-hover"><PencilIcon className="h-4 w-4 mr-2" /> Editar</button>
            <button onClick={() => handleOpenDeleteModal(event)} className="flex items-center w-full px-4 py-2 text-sm text-left text-notion-error hover:bg-notion-hover"><TrashIcon className="h-4 w-4 mr-2" /> Eliminar</button>
          </Dropdown>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-3 py-1.5 bg-notion-accent text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          <PlusIcon className="h-4 w-4" /> Nuevo Evento
        </button>
      </div>
      <NotionCard title="Todos los Eventos">
        <div className="p-4 flex items-center gap-4 border-b border-notion-border">
          <FilterIcon className="h-5 w-5 text-notion-text-secondary" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Estado:</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Event['estado'] | 'All')} className="text-sm bg-notion-sidebar rounded-md border-notion-border focus:ring-notion-accent focus:border-notion-accent">
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'Todos' : s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Cliente:</label>
            <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="text-sm bg-notion-sidebar rounded-md border-notion-border focus:ring-notion-accent focus:border-notion-accent">
              {clients.map(c => <option key={c} value={c}>{c === 'All' ? 'Todos' : c}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-notion-text-secondary uppercase bg-notion-sidebar">
              <tr>
                <th scope="col" className="px-6 py-3">Evento</th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Lugar</th>
                <th scope="col" className="px-6 py-3">Fecha Evento</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {renderTableContent()}
            </tbody>
          </table>
        </div>
        {hasMore && (
            <div className="p-4 border-t border-notion-border text-center">
                <button
                    onClick={() => fetchEvents(true)}
                    disabled={isLoadingMore}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-notion-border hover:bg-notion-hover disabled:opacity-50"
                >
                    {isLoadingMore ? 'Cargando...' : 'Cargar más'}
                </button>
            </div>
        )}
      </NotionCard>
      <EventFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setFormModalOpen(false)} 
        onSave={handleSaveEvent} 
        eventToEdit={selectedEvent} 
        defaultStartDate={null}
      />
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={handleDeleteEvent} title="Eliminar Evento" message={`¿Estás seguro de que quieres eliminar "${selectedEvent?.titulo}"? Esta acción no se puede deshacer.`} />
      <EventDetailModal
        isOpen={!!viewingEvent}
        onClose={() => setViewingEvent(null)}
        event={viewingEvent}
        users={users}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
};

export default TableViewPage;