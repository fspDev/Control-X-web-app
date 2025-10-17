import React from 'react';
import { Event, User } from '../../types/index.ts';
import Modal from '../ui/Modal.tsx';
import { ClockIcon, MapPinIcon, UserCircleIcon, WrenchScrewdriverIcon, NotesIcon } from '../../assets/icons.tsx';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  users: User[];
  onEdit?: (event: Event) => void;
}

const DetailRow: React.FC<{ icon: React.ReactNode, label: string, value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start text-sm">
        <div className="flex-shrink-0 w-6 text-notion-text-secondary pt-0.5">{icon}</div>
        <div className="flex-1">
            <p className="font-medium text-notion-text">{label}</p>
            <div className="text-notion-text-secondary">{value}</div>
        </div>
    </div>
);

const EventDetailModal: React.FC<EventDetailModalProps> = ({ isOpen, onClose, event, users, onEdit }) => {
  if (!isOpen || !event) return null;

  const getStatusClass = (status: Event['estado']) => {
    switch (status) {
      case 'Negociación': return 'bg-yellow-900 text-yellow-300';
      case 'Confirmado': return 'bg-blue-900 text-blue-300';
      case 'Armado': return 'bg-purple-900 text-purple-300';
      case 'Finalizado': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const createdByUser = users.find(u => u.id === event.createdBy);

  const formatDate = (dateString?: string, withTime: boolean = false) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (withTime) {
      return date.toLocaleString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    // Dates are stored as midnight UTC. Displaying with UTC timezone prevents date shifts.
    return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.titulo}>
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-notion-text-secondary">Estado</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(event.estado)}`}>
                        {event.estado}
                    </span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
                <DetailRow
                    icon={<UserCircleIcon className="h-5 w-5" />}
                    label="Cliente"
                    value={event.cliente}
                />
                <DetailRow
                    icon={<MapPinIcon className="h-5 w-5" />}
                    label="Lugar"
                    value={event.lugar}
                />
                 <DetailRow
                    icon={<WrenchScrewdriverIcon className="h-5 w-5" />}
                    label="Fabricación"
                    value={event.fabricacion}
                />
                {event.notes && (
                    <DetailRow
                        icon={<NotesIcon className="h-5 w-5" />}
                        label="Notas"
                        value={
                            <div className="text-sm text-notion-text-secondary whitespace-pre-wrap bg-notion-sidebar p-3 rounded-md border border-notion-border">
                                {event.notes}
                            </div>
                        }
                    />
                )}
            </div>
            
            <div className="border-t border-notion-border pt-4 space-y-5">
                 <DetailRow
                    icon={<ClockIcon className="h-5 w-5" />}
                    label="Armado"
                    value={
                        <>
                            <p><strong>Inicio:</strong> {formatDate(event.armado.start)}</p>
                            {event.armado.end && <p><strong>Fin:</strong> {formatDate(event.armado.end)}</p>}
                        </>
                    }
                />
                <DetailRow
                    icon={<ClockIcon className="h-5 w-5" />}
                    label="Fecha del Evento"
                    value={
                         <>
                            <p><strong>Inicio:</strong> {formatDate(event.fechaEvento.start)}</p>
                            {event.fechaEvento.end && <p><strong>Fin:</strong> {formatDate(event.fechaEvento.end)}</p>}
                        </>
                    }
                />
                <DetailRow
                    icon={<ClockIcon className="h-5 w-5" />}
                    label="Desarme"
                    value={<p>{formatDate(event.desarme)}</p>}
                />
            </div>

            <div className="border-t border-notion-border pt-4 text-xs text-notion-text-secondary">
                <p>Creado por: {createdByUser?.username || 'Usuario desconocido'}</p>
                <p>Última actualización: {formatDate(event.updatedAt, true)}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md border border-notion-border hover:bg-notion-hover"
              >
                Cerrar
              </button>
               {onEdit && (
                  <button
                    onClick={() => onEdit(event)}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-notion-accent text-white hover:bg-blue-700"
                  >
                    Editar
                  </button>
              )}
            </div>
        </div>
    </Modal>
  );
};

export default EventDetailModal;