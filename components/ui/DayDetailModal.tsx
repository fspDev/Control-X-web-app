import React, { useState, useEffect, useMemo } from 'react';
import { Event } from '../../types';
import { useNote } from '../../hooks/useNote';
import { useDebounce } from '../../hooks/useDebounce';
import Modal from './Modal';
import { PlusIcon } from '../../assets/icons';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: Event[];
  onAddEvent: (date: Date) => void;
  onViewEvent: (event: Event) => void;
}

const formatDate = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

const DayDetailModal: React.FC<DayDetailModalProps> = ({ isOpen, onClose, date, events, onAddEvent, onViewEvent }) => {
  const formattedDate = useMemo(() => formatDate(date), [date]);
  const { note, isLoading, updateNoteContent } = useNote(formattedDate);

  const [localContent, setLocalContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<'synced' | 'syncing' | 'unsynced'>('synced');

  const debouncedContent = useDebounce(localContent, 1000);

  useEffect(() => {
    if (note?.content && !isTyping) {
      setLocalContent(note.content);
      setStatus('synced');
    } else if (!note && !isTyping) {
      setLocalContent('');
      setStatus('synced');
    }
  }, [note, isTyping, isOpen]);

  useEffect(() => {
    const hasChanged = debouncedContent !== (note?.content ?? '');
    const isReadyToSave = !isLoading && (note !== null || debouncedContent !== '');

    if (isTyping && hasChanged && isReadyToSave) {
      setStatus('syncing');
      updateNoteContent(debouncedContent).then(() => {
        setStatus('synced');
        setIsTyping(false);
      });
    }
  }, [debouncedContent, note, updateNoteContent, isTyping, isLoading]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsTyping(true);
    setStatus('unsynced');
    setLocalContent(e.target.value);
  };
  
  const getStatusText = () => {
    if (isLoading && status !== 'unsynced') return 'Cargando...';
    if (status === 'syncing') return 'Guardando...';
    if (status === 'synced') return 'Guardado';
    return 'Cambios sin guardar';
  };
  
  if (!isOpen || !date) return null;

  const title = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 max-h-[70vh] flex flex-col">
        {/* Notes Section */}
        <div className="flex-grow flex flex-col border border-notion-border rounded-md p-2">
            <textarea
                value={localContent}
                onChange={handleContentChange}
                placeholder="Añade una nota para este día..."
                className="w-full h-full min-h-[100px] bg-transparent focus:outline-none resize-none text-sm leading-relaxed placeholder:text-notion-text-subtle"
            />
            <span className="text-right text-xs text-notion-text-secondary mt-1">{getStatusText()}</span>
        </div>

        {/* Events Section */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold">Eventos</h3>
                <button
                    onClick={() => onAddEvent(date)}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-notion-hover text-notion-text rounded-md hover:bg-notion-border"
                >
                    <PlusIcon className="h-3 w-3" /> Añadir Evento
                </button>
            </div>
            <div className="space-y-2">
                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} onClick={() => onViewEvent(event)} className="p-2 bg-notion-sidebar rounded-md cursor-pointer hover:bg-notion-hover">
                            <p className="font-medium text-sm truncate">{event.titulo}</p>
                            <p className="text-xs text-notion-text-secondary">{event.cliente}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-notion-text-secondary text-center py-2">No hay eventos para este día.</p>
                )}
            </div>
        </div>

      </div>
    </Modal>
  );
};

export default DayDetailModal;