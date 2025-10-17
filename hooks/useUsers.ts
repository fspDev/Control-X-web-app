import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.ts';
import * as api from '../services/firebase.ts';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Error al cargar los usuarios.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (userData: Omit<User, 'id' | 'avatarUrl'> & { password?: string }) => {
    setIsLoading(true);
    try {
      await api.createUser(userData);
      await fetchUsers(); // Refetch to get the updated list
    } catch (err) {
      setError('Error al añadir el usuario.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setIsLoading(true);
    try {
      await api.updateUser(id, updates);
      await fetchUsers();
    } catch (err) {
      setError('Error al actualizar el usuario.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (id: string) => {
    setIsLoading(true);
    try {
      await api.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      setError('Error al eliminar el usuario.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { users, isLoading, error, fetchUsers, addUser, updateUser, removeUser };
};