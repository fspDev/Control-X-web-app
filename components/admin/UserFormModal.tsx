import React, { useState, useEffect } from 'react';
import { User } from '../../types/index.ts';
import Modal from '../ui/Modal.tsx';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: { id?: string; username: string; role: 'admin' | 'user'; password?: string; }) => void;
  userToEdit: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [password, setPassword] = useState('');
  
  const isEditing = !!userToEdit;

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setRole(userToEdit.role);
      setPassword(''); // Clear password on open
    } else {
      // Reset form for new user
      setUsername('');
      setRole('user');
      setPassword('');
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = {
      id: userToEdit?.id,
      username,
      role,
      password: password || undefined, // Only include password if it's set
    };
    onSave(userData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">Usuario</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isEditing} // Prevent changing username on edit
            className="mt-1 w-full px-3 py-2 border border-notion-border rounded-md bg-transparent focus:ring-2 focus:ring-notion-accent focus:outline-none disabled:bg-notion-sidebar disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium">Rol</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            className="mt-1 w-full px-3 py-2 border border-notion-border rounded-md bg-notion-bg focus:ring-2 focus:ring-notion-accent focus:outline-none"
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div>
          <label htmlFor="password">{isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
          <input
            id="password"
            type="password"
            required={!isEditing}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-notion-border rounded-md bg-transparent focus:ring-2 focus:ring-notion-accent focus:outline-none placeholder:text-notion-text-subtle"
            placeholder={isEditing ? "Dejar en blanco para no cambiar" : ""}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border border-notion-border hover:bg-notion-hover"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-md bg-notion-accent text-white hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;