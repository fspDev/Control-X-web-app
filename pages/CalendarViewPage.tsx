import React, { useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useNotes } from '../hooks/useNotes';
import { Event } from '../types';
import EventFormModal from '../components/events/EventFormModal';
import { ChevronLeftIcon, ChevronRightIcon } from '../assets/icons';
import { useUsers } from '../hooks/useUsers';
import EventDetailModal from '../components/events/EventDetailModal';
import DayDetailModal from '../components/ui/DayDetailModal';

// --- Date Helper Functions (no external dependencies) ---
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // for Sunday as first day of week
    return new Date(d.setDate(diff));
};
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isSameMonth = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
// ---

type EventOccurrence = {
  event: Event;
  type: 'armado' | 'evento' | 'desarme';
};

// --- Color Logic for Events ---
const eventColors = [
    { border: 'border-blue-500', bg: 'bg-blue-500' },
    { border: 'border-green-500', bg: 'bg-green-500' },
    { border: 'border-red-500', bg: 'bg-red-500' },
    { border: 'border-yellow-500', bg: 'bg-yellow-500' },
    { border: 'border-purple-500', bg: 'bg-purple-500' },
    { border: 'border-pink-500', bg: 'bg-pink-500' },
    { border: 'border-indigo-500', bg: 'bg-indigo-500' },
    { border: 'border-teal-500', bg: 'bg-teal-500' },
];

const getEventColor = (eventId: string) => {
    let hash = 0;
    for (let i = 0; i < eventId.length; i++) {
        const char = eventId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % eventColors.length;
    return eventColors[index];
};
// ---

const CalendarViewPage: React.FC = () => {
  const { events, isLoading: eventsLoading, error, addEvent, updateEvent } = useEvents();
  const { users } = useUsers();
  const { notes, isLoading: notesLoading } = useNotes();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [defaultStartDate, setDefaultStartDate] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [isDayDetailModalOpen, setDayDetailModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewOptions, setViewOptions] = useState({
    armado: true,
    evento: true,
    desarme: true,
  });

  const firstDayOfMonth = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const calendarStartDay = useMemo(() => startOfWeek(firstDayOfMonth), [firstDayOfMonth]);
  
  const calendarDays = useMemo(() => {
    const days = [];
    let day = calendarStartDay;
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    return days;
  }, [calendarStartDay]);

  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: EventOccurrence[] } = {};
    
    const addOccurrence = (date: Date, event: Event, type: EventOccurrence['type']) => {
      const dateKey = date.toLocaleDateString('en-CA', { timeZone: 'UTC' });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push({ event, type });
    };

    events.forEach(event => {
      // Handle Armado
      if (event.armado && event.armado.start) {
        let currentDay = new Date(event.armado.start);
        const endDate = event.armado.end ? new Date(event.armado.end) : new Date(event.armado.start);
        while (currentDay <= endDate) {
          addOccurrence(currentDay, event, 'armado');
          currentDay = addDays(currentDay, 1);
        }
      }
      // Handle Fecha Evento
      if (event.fechaEvento && event.fechaEvento.start) {
        let currentDay = new Date(event.fechaEvento.start);
        const endDate = event.fechaEvento.end ? new Date(event.fechaEvento.end) : new Date(event.fechaEvento.start);
        while (currentDay <= endDate) {
          addOccurrence(currentDay, event, 'evento');
          currentDay = addDays(currentDay, 1);
        }
      }
      // Handle Desarme
      if (event.desarme) {
        addOccurrence(new Date(event.desarme), event, 'desarme');
      }
    });
    return grouped;
  }, [events]);
  
  const filteredEventsByDate = useMemo(() => {
    const filtered: { [key: string]: EventOccurrence[] } = {};
    for (const dateKey in eventsByDate) {
        filtered[dateKey] = eventsByDate[dateKey].filter(occurrence => viewOptions[occurrence.type]);
    }
    return filtered;
  }, [eventsByDate, viewOptions]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setDayDetailModalOpen(true);
  };

  const handleOpenAddModal = (date: Date) => {
    setDayDetailModalOpen(false); // Close day detail if open
    setSelectedEvent(null);
    setDefaultStartDate(date.toISOString());
    setFormModalOpen(true);
  };
  
  const handleOpenEditModal = (event: Event) => {
    setSelectedEvent(event);
    setDefaultStartDate(null);
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
  
  const handleViewEventFromDay = (event: Event) => {
    setDayDetailModalOpen(false);
    setViewingEvent(event);
  };

  const handleEditFromDetail = (eventToEdit: Event) => {
    setViewingEvent(null);
    handleOpenEditModal(eventToEdit);
  };

  const handleViewOptionChange = (option: keyof typeof viewOptions) => {
    setViewOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const typeInfo: { [key in EventOccurrence['type']]: { label: string } } = {
    armado: { label: 'A' },
    evento: { label: 'E' },
    desarme: { label: 'D' },
  };

  const isLoading = eventsLoading || notesLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendario</h1>
      <div className="bg-notion-bg rounded-lg border border-notion-border">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-notion-border flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={handleToday} className="px-3 py-1 text-sm font-medium rounded-md border border-notion-border hover:bg-notion-hover">
              Hoy
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-notion-hover">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-notion-hover">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            <h2 className="text-lg font-semibold w-48 text-center capitalize">
              {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Ver:</span>
            {Object.keys(viewOptions).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={viewOptions[key as keyof typeof viewOptions]}
                  onChange={() => handleViewOptionChange(key as keyof typeof viewOptions)}
                  className="w-4 h-4 rounded bg-notion-sidebar border-notion-border text-notion-accent focus:ring-notion-accent"
                />
                <span className="capitalize">{key}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-4">
           {isLoading ? (
             <div className="h-96 flex items-center justify-center">
               <svg className="animate-spin h-8 w-8 text-notion-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
             </div>
           ) : error ? (
             <div className="h-96 flex items-center justify-center text-notion-error">{error}</div>
           ) : (
            <div className="grid grid-cols-7">
              {/* Day headers */}
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-notion-text-secondary pb-2 border-b border-notion-border">
                  {day}
                </div>
              ))}
              {/* Day cells */}
              {calendarDays.map((day, index) => {
                const dayKey = day.toLocaleDateString('en-CA', { timeZone: 'UTC' });
                const dayOccurrences = filteredEventsByDate[dayKey] || [];
                const dayNote = notes[dayKey];
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`h-32 border-t border-l border-notion-border p-1.5 flex flex-col cursor-pointer hover:bg-notion-hover transition-colors duration-150
                      ${(index + 1) % 7 === 0 ? 'border-r' : ''} 
                      ${index >= 35 ? 'border-b' : ''}
                      ${!isCurrentMonth ? 'text-notion-text-subtle' : ''}`}
                  >
                     <div className="flex justify-end items-start h-6">
                        <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-notion-accent text-white' : ''}`}>
                          {day.getDate()}
                        </span>
                    </div>
                    <div className="flex-1 overflow-hidden space-y-1 mt-1">
                      {/* Note Preview */}
                      {dayNote && dayNote.content.trim() && (
                          <div className="text-xs text-notion-text-secondary leading-tight note-preview max-h-8 overflow-hidden">
                              {dayNote.content.split('\n').slice(0, 2).map((line, i) => (
                                  <p key={i} className="truncate">{line.replace(/^[#-\s*]+/, '')}</p>
                              ))}
                          </div>
                      )}
                      {/* Events List */}
                      <div className="space-y-1">
                        {dayOccurrences.slice(0,2).map(({ event, type }, idx) => {
                           const info = typeInfo[type];
                           const color = getEventColor(event.id);
                           return (
                              <div
                                key={`${event.id}-${type}-${idx}`}
                                onClick={(e) => { e.stopPropagation(); setViewingEvent(event); }}
                                className={`text-xs px-2 py-0.5 rounded-r-md truncate bg-notion-sidebar border-y border-r border-notion-border flex items-center border-l-4 ${color.border}`}
                              >
                                <span className={`w-4 h-4 text-[10px] font-bold rounded-sm mr-1.5 flex-shrink-0 flex items-center justify-center text-white ${color.bg}`}>
                                    {info.label}
                                </span>
                                <span className="truncate">{event.titulo}</span>
                              </div>
                           );
                        })}
                         {dayOccurrences.length > 2 && (
                          <p className="text-[10px] text-notion-text-secondary pl-2">...{dayOccurrences.length - 2} más</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
           )}
        </div>
      </div>
      <DayDetailModal
        isOpen={isDayDetailModalOpen}
        onClose={() => setDayDetailModalOpen(false)}
        date={selectedDate}
        events={selectedDate ? (eventsByDate[selectedDate.toLocaleDateString('en-CA', { timeZone: 'UTC' })]?.map(o => o.event) || []) : []}
        onAddEvent={handleOpenAddModal}
        onViewEvent={handleViewEventFromDay}
      />
      <EventFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveEvent}
        eventToEdit={selectedEvent}
        defaultStartDate={defaultStartDate}
      />
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

export default CalendarViewPage;