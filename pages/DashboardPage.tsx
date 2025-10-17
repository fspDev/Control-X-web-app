import React, { useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents.ts';
import { useUsers } from '../hooks/useUsers.ts';
import NotionCard from '../components/ui/NotionCard.tsx';
import { CalendarIcon } from '../assets/icons.tsx';
import { Event } from '../types/index.ts';
import EventDetailModal from '../components/events/EventDetailModal.tsx';
import EventFormModal from '../components/events/EventFormModal.tsx';
import Skeleton from '../components/ui/Skeleton.tsx';

const DashboardPage: React.FC = () => {
  const { events, isLoading, error, addEvent, updateEvent } = useEvents();
  const { users } = useUsers();
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison

    return events
      .filter(e => 
        (e.estado === 'Confirmado' || e.estado === 'Armado') && 
        new Date(e.fechaEvento.start) >= today
      )
      .sort((a, b) => new Date(a.fechaEvento.start).getTime() - new Date(b.fechaEvento.start).getTime());
  }, [events]);

  const handleOpenEditModal = (event: Event) => {
    setSelectedEvent(event);
    setFormModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'createdBy' | 'updatedAt'>, id?: string) => {
    if (id) {
      await updateEvent(id, eventData);
    } else {
      await addEvent(eventData);
    }
    setFormModalOpen(false);
  };

  const handleEditFromDetail = (eventToEdit: Event) => {
    setViewingEvent(null);
    handleOpenEditModal(eventToEdit);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center p-3 -m-2">
              <Skeleton className="h-10 w-10 rounded-lg mr-4" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
        return <p className="text-notion-error">{error}</p>;
    }
    
    if (upcomingEvents.length > 0) {
      return (
        <ul className="space-y-4">
          {upcomingEvents.map(event => (
            <li 
              key={event.id} 
              onClick={() => setViewingEvent(event)}
              className="flex items-center p-3 -m-2 rounded-lg hover:bg-notion-hover cursor-pointer"
            >
              <div className="flex-shrink-0 mr-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-notion-sidebar">
                  <CalendarIcon className="h-5 w-5 text-notion-accent" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium">{event.titulo}</p>
                <p className="text-sm text-notion-text-secondary">
                  {new Date(event.fechaEvento.start).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      );
    }

    return <p className="text-notion-text-secondary">No hay próximos eventos confirmados o en armado.</p>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <NotionCard title="Próximos Eventos">
        {renderContent()}
      </NotionCard>

      <EventDetailModal
        isOpen={!!viewingEvent}
        onClose={() => setViewingEvent(null)}
        event={viewingEvent}
        users={users}
        onEdit={handleEditFromDetail}
      />
      <EventFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setFormModalOpen(false)} 
        onSave={handleSaveEvent} 
        eventToEdit={selectedEvent} 
        defaultStartDate={null}
      />
    </div>
  );
};

export default DashboardPage;