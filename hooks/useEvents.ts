import { useState, useEffect, useCallback } from 'react';
import { Event } from '../types/index.ts';
import * as api from '../services/firebase.ts';
import { useAuth } from './useAuth.tsx';

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const unsubscribe = api.onEventsSnapshot(
      (fetchedEvents) => {
        setEvents(fetchedEvents);
        setIsLoading(false);
      },
    );
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdBy' | 'updatedAt'>) => {
    if (!user) {
      setError("Debes iniciar sesión para añadir un evento.");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newEvent: Event = {
      ...eventData,
      id: tempId,
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
    };
    
    // Optimistic UI update
    setEvents(currentEvents => [newEvent, ...currentEvents]);

    try {
      // The real event will replace the temp one via the snapshot listener
      // FIX: Pass a single object to api.createEvent as expected by its definition.
      await api.createEvent({ ...eventData, createdBy: user.id });
    } catch (err) {
      setError('Error al añadir el evento. Por favor, inténtalo de nuevo.');
      // Rollback
      setEvents(currentEvents => currentEvents.filter(e => e.id !== tempId));
      console.error(err);
    }
  }, [user]);

  const updateEvent = useCallback(async (id: string, updates: Partial<Omit<Event, 'id' | 'createdBy'>>) => {
    const originalEvents = [...events];
    const eventToUpdate = originalEvents.find(e => e.id === id);

    if (!eventToUpdate) return;
    
    // Optimistic UI update
    setEvents(currentEvents =>
      currentEvents.map(e =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
    );

    try {
      await api.updateEvent(id, updates);
    } catch (err) {
      setError('Error al actualizar el evento. Por favor, inténtalo de nuevo.');
      // Rollback
      setEvents(originalEvents);
      console.error(err);
    }
  }, [events]);

  const removeEvent = useCallback(async (id: string) => {
    const originalEvents = [...events];
    
    // Optimistic UI update
    setEvents(currentEvents => currentEvents.filter(e => e.id !== id));

    try {
      await api.deleteEvent(id);
    } catch (err) {
      setError('Error al eliminar el evento. Por favor, inténtalo de nuevo.');
      // Rollback
      setEvents(originalEvents);
      console.error(err);
    }
  }, [events]);

  return { events, isLoading, error, addEvent, updateEvent, removeEvent };
};