import { useState, useEffect } from 'react';
import { Note } from '../types/index.ts';
import * as api from '../services/firebase.ts';

export const useNotes = () => {
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = api.onAllNotesSnapshot((fetchedNotes) => {
      setNotes(fetchedNotes);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { notes, isLoading };
};