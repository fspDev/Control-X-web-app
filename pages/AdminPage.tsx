import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { User } from '../types';

import NotionCard from '../components/ui/NotionCard';
import Dropdown from '../components/ui/Dropdown';
import UserFormModal from '../components/admin/UserFormModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { EllipsisVerticalIcon, PencilIcon, PlusIcon, TrashIcon } from '../assets/icons';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';

const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, isLoading, error, addUser, updateUser, removeUser } = useUsers();

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFormModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setConfirmModalOpen(true);
  };

  const handleSaveUser = async (userData: Omit<User, 'id' | 'avatarUrl'> & { id?: string; password?: string }) => {
    if (userData.id) {
      const { password, ...userUpdates } = userData;
      await updateUser(userData.id, userUpdates);
    } else {
      await addUser(userData);
    }
    setFormModalOpen(false);
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      await removeUser(selectedUser.id);
    }
    setConfirmModalOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
       return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-notion-border">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Skeleton className="h-6 w-6 rounded-full ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
       );
    }
    if (error) {
      return <p className="text-notion-error">Error al cargar usuarios: {error}</p>;
    }
    if (users.length === 0) {
      return (
        <div className="text-center py-10 text-notion-text-secondary">
          <p className="mb-4">No hay usuarios registrados.</p>
           <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-notion-accent text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors mx-auto"
          >
            <PlusIcon className="h-4 w-4" />
            Añadir Primer Usuario
          </button>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-notion-text-secondary uppercase bg-notion-sidebar">
            <tr>
              <th scope="col" className="px-6 py-3">Usuario</th>
              <th scope="col" className="px-6 py-3">Rol</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-notion-border">
                <td className="px-6 py-4 font-medium whitespace-nowrap flex items-center gap-3">
                  <Avatar username={u.username} avatarUrl={u.avatarUrl} className="h-8 w-8" />
                  {u.username}
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    u.role === 'admin' ? 'bg-purple-900 text-purple-300' : 
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Dropdown trigger={
                    <button className="p-2 rounded-full hover:bg-notion-hover">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                  }>
                    <button onClick={() => handleOpenEditModal(u)} className="flex items-center w-full px-4 py-2 text-sm text-left text-notion-text hover:bg-notion-hover">
                      <PencilIcon className="h-4 w-4 mr-2" /> Editar
                    </button>
                    <button onClick={() => handleOpenDeleteModal(u)} className="flex items-center w-full px-4 py-2 text-sm text-left text-notion-error hover:bg-notion-hover">
                      <TrashIcon className="h-4 w-4 mr-2" /> Eliminar
                    </button>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-3 py-1.5 bg-notion-accent text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Añadir Usuario
        </button>
      </div>
      <NotionCard title="Gestión de Usuarios">
        {renderContent()}
      </NotionCard>

      <UserFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={selectedUser}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar a ${selectedUser?.username}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default AdminPage;