import React, { useState, useEffect } from 'react';
import { Event } from '../../types/index.ts';
import Modal from '../ui/Modal.tsx';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<Event, 'id' | 'createdBy' | 'updatedAt'>, id?: string) => void;
  eventToEdit: Event | null;
  defaultStartDate?: string | null;
}

// Helper to format ISO date string to YYYY-MM-DD for input[type=date]
const toDateInput = (isoString?: string) => {
    if (!isoString) return '';
    // The date from the DB is an ISO string (UTC). Convert to Date object.
    const date = new Date(isoString);
    // Get year, month, day in UTC to avoid timezone shifts when converting.
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, eventToEdit, defaultStartDate }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    lugar: '',
    cliente: '',
    fabricacion: '',
    notes: '',
    estado: 'Negociación' as Event['estado'],
    armadoStart: '',
    armadoEnd: '',
    fechaEventoStart: '',
    fechaEventoEnd: '',
    desarme: '',
  });

  const isEditing = !!eventToEdit;

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setFormData({
          titulo: eventToEdit.titulo,
          lugar: eventToEdit.lugar,
          cliente: eventToEdit.cliente,
          fabricacion: eventToEdit.fabricacion,
          notes: eventToEdit.notes || '',
          estado: eventToEdit.estado,
          armadoStart: toDateInput(eventToEdit.armado.start),
          armadoEnd: toDateInput(eventToEdit.armado.end),
          fechaEventoStart: toDateInput(eventToEdit.fechaEvento.start),
          fechaEventoEnd: toDateInput(eventToEdit.fechaEvento.end),
          desarme: toDateInput(eventToEdit.desarme),
        });
      } else {
        // Reset form for new event, using default date if provided
        const defaultDateValue = defaultStartDate ? toDateInput(defaultStartDate) : '';
        setFormData({
          titulo: '',
          lugar: '',
          cliente: '',
          fabricacion: '',
          notes: '',
          estado: 'Negociación',
          armadoStart: defaultDateValue,
          armadoEnd: '',
          fechaEventoStart: defaultDateValue,
          fechaEventoEnd: '',
          desarme: '',
        });
      }
    }
  }, [eventToEdit, isOpen, defaultStartDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
        const newState = { ...prev, [name]: value };

        // Do not proceed if value is cleared or invalid
        const isDateField = ['armadoStart', 'armadoEnd', 'fechaEventoStart', 'fechaEventoEnd'].includes(name);
        if (!isDateField || !value || isNaN(new Date(value).getTime())) {
            return newState;
        }
        
        // --- Cascade Date Logic ---
        let { armadoStart, armadoEnd, fechaEventoStart, fechaEventoEnd, desarme } = newState;

        // Cascade from armadoStart
        if (name === 'armadoStart') {
            if (!armadoEnd || new Date(armadoEnd) < new Date(armadoStart)) {
                armadoEnd = armadoStart;
            }
        }

        // Cascade from armadoEnd (which might have just been updated)
        if (['armadoStart', 'armadoEnd'].includes(name)) {
            const effectiveArmadoEnd = armadoEnd || armadoStart;
            if (!fechaEventoStart || new Date(fechaEventoStart) < new Date(effectiveArmadoEnd)) {
                fechaEventoStart = effectiveArmadoEnd;
            }
        }

        // Cascade from fechaEventoStart (which might have just been updated)
        if (['armadoStart', 'armadoEnd', 'fechaEventoStart'].includes(name)) {
            const effectiveEventoStart = fechaEventoStart;
            if (!fechaEventoEnd || new Date(fechaEventoEnd) < new Date(effectiveEventoStart)) {
                fechaEventoEnd = effectiveEventoStart;
            }
        }

        // Cascade from fechaEventoEnd (which might have just been updated)
        if (['armadoStart', 'armadoEnd', 'fechaEventoStart', 'fechaEventoEnd'].includes(name)) {
            const effectiveEventoEnd = fechaEventoEnd || fechaEventoStart;
            if (!desarme || new Date(desarme) < new Date(effectiveEventoEnd)) {
                desarme = effectiveEventoEnd;
            }
        }

        // Return the fully cascaded new state
        return {
            ...newState,
            armadoEnd,
            fechaEventoStart,
            fechaEventoEnd,
            desarme,
        };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // A date string 'YYYY-MM-DD' is parsed by `new Date()` as midnight UTC.
    // This is the desired behavior to keep dates consistent across timezones.
    const eventData = {
        titulo: formData.titulo,
        lugar: formData.lugar,
        cliente: formData.cliente,
        fabricacion: formData.fabricacion,
        notes: formData.notes,
        estado: formData.estado,
        armado: {
            start: new Date(formData.armadoStart).toISOString(),
            end: formData.armadoEnd ? new Date(formData.armadoEnd).toISOString() : undefined,
        },
        fechaEvento: {
            start: new Date(formData.fechaEventoStart).toISOString(),
            end: formData.fechaEventoEnd ? new Date(formData.fechaEventoEnd).toISOString() : undefined,
        },
        desarme: new Date(formData.desarme).toISOString(),
    };
    onSave(eventData, eventToEdit?.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Evento' : 'Añadir Nuevo Evento'}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <label htmlFor="titulo">Título</label>
          <input id="titulo" name="titulo" type="text" required value={formData.titulo} onChange={handleChange} className="mt-1 w-full input-style" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lugar">Lugar</label>
              <input id="lugar" name="lugar" type="text" required value={formData.lugar} onChange={handleChange} className="mt-1 w-full input-style" />
            </div>
            <div>
              <label htmlFor="cliente">Cliente</label>
              <input id="cliente" name="cliente" type="text" required value={formData.cliente} onChange={handleChange} className="mt-1 w-full input-style" />
            </div>
        </div>
        <div>
          <label htmlFor="fabricacion">Fabricación</label>
          <input id="fabricacion" name="fabricacion" type="text" required value={formData.fabricacion} onChange={handleChange} className="mt-1 w-full input-style" />
        </div>
        <div>
            <label htmlFor="notes">Notas</label>
            <textarea id="notes" name="notes" rows={4} value={formData.notes} onChange={handleChange} className="mt-1 w-full input-style resize-y placeholder:text-notion-text-subtle" placeholder="Añadir notas internas sobre el evento..." />
        </div>
        <div>
            <label htmlFor="estado">Estado</label>
            <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className="mt-1 w-full input-style">
                <option value="Negociación">Negociación</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Armado">Armado</option>
                <option value="Finalizado">Finalizado</option>
            </select>
        </div>
        <fieldset className="border border-notion-border rounded p-3">
            <legend className="text-sm font-medium px-1">Armado</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="armadoStart">Inicio</label>
                    <input id="armadoStart" name="armadoStart" type="date" required value={formData.armadoStart} onChange={handleChange} className="mt-1 w-full input-style" />
                </div>
                <div>
                    <label htmlFor="armadoEnd">Fin (Opcional)</label>
                    <input id="armadoEnd" name="armadoEnd" type="date" value={formData.armadoEnd} onChange={handleChange} className="mt-1 w-full input-style" />
                </div>
            </div>
        </fieldset>
         <fieldset className="border border-notion-border rounded p-3">
            <legend className="text-sm font-medium px-1">Fecha del Evento</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fechaEventoStart">Inicio</label>
                    <input id="fechaEventoStart" name="fechaEventoStart" type="date" required value={formData.fechaEventoStart} onChange={handleChange} className="mt-1 w-full input-style" />
                </div>
                <div>
                    <label htmlFor="fechaEventoEnd">Fin (Opcional)</label>
                    <input id="fechaEventoEnd" name="fechaEventoEnd" type="date" value={formData.fechaEventoEnd} onChange={handleChange} className="mt-1 w-full input-style" />
                </div>
            </div>
        </fieldset>
         <div>
          <label htmlFor="desarme">Desarme</label>
          <input id="desarme" name="desarme" type="date" required value={formData.desarme} onChange={handleChange} className="mt-1 w-full input-style" />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
       <style>{`
        .input-style {
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            background-color: transparent;
            border: 1px solid;
            border-color: #2F2F2F; /* notion-border */
        }
        .input-style:focus {
            outline: 2px solid transparent;
            outline-offset: 2px;
            box-shadow: 0 0 0 2px #2563EB; /* notion-accent */
        }
        .btn-primary {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 0.375rem;
            color: white;
            background-color: #2563EB; /* notion-accent */
        }
         .btn-primary:hover {
            background-color: #1D4ED8; /* a bit darker */
         }
        .btn-secondary {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 0.375rem;
            border: 1px solid;
            border-color: #2F2F2F; /* notion-border */
        }
        .btn-secondary:hover {
            background-color: #2F2F2F; /* notion-hover */
        }
        label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.25rem;
        }
      `}</style>
    </Modal>
  );
};

export default EventFormModal;