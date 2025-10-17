import { useState, useEffect } from 'react';
import { Note } from '../types/index.ts';
import * as api from '../services/firebase.ts';

export const useNote = (date: string) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!date) return;

    setIsLoading(true);
    const unsubscribe = api.onNoteSnapshot(date, (fetchedNote) => {
      setNote(fetchedNote);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [date]);

  const updateNoteContent = async (content: string) => {
    if (!date) return;
    try {
      await api.updateNote(date, content);
    } catch (e) {
      console.error("Error al actualizar la nota:", e);
      // Here you might want to add some error handling state
    }
  };

  return { note, isLoading, updateNoteContent };
};