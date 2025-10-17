import { auth, db } from '../firebaseConfig.ts';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

import { User, Event, Note } from '../types/index.ts';

// A dummy domain to append to usernames to make them valid emails for Firebase Auth.
// This is not exposed to the end-user.
const AUTH_DOMAIN_SUFFIX = '@controlx.app';

// --- Authentication ---
export { onAuthStateChanged, firebaseSignOut as signOut };

export const signIn = async (username: string, pass: string) => {
  const email = `${username}${AUTH_DOMAIN_SUFFIX}`;
  return await signInWithEmailAndPassword(auth, email, pass);
};

// --- User Data CRUD ---
const usersCollection = collection(db, 'users');
const getUserDocRef = (id: string) => doc(db, 'users', id);

export const getUserById = async (id: string): Promise<User | null> => {
  const docSnap = await getDoc(getUserDocRef(id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
};

export const getUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const createUser = async (userData: Omit<User, 'id' | 'avatarUrl'> & { password?: string }) => {
  if (!userData.password) throw new Error("La contraseña es requerida para crear un usuario.");
  
  // 1. Create user in Firebase Auth using the username as the email's local part
  const email = `${userData.username}${AUTH_DOMAIN_SUFFIX}`;
  const { user: authUser } = await createUserWithEmailAndPassword(auth, email, userData.password);

  // 2. Create user document in Firestore with only the username, not the fake email
  const newUser: Omit<User, 'id'> = {
    username: userData.username,
    role: userData.role,
  };
  await setDoc(getUserDocRef(authUser.uid), newUser);

  return { id: authUser.uid, ...newUser } as User;
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  await updateDoc(getUserDocRef(id), updates);
};

export const deleteUser = async (id: string) => {
  // Note: Deleting a user from Firestore does not delete them from Firebase Auth.
  // A cloud function is recommended for this in a real production environment.
  await deleteDoc(getUserDocRef(id));
};

// --- Event Data CRUD & Real-time ---
const eventsCollection = collection(db, 'events');
const getEventDocRef = (id: string) => doc(db, 'events', id);

export const onEventsSnapshot = (callback: (events: Event[]) => void) => {
  const q = query(eventsCollection, orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Event));
    callback(events);
  });
};

export const getEventsPaginated = async (options: {
  status?: string;
  client?: string;
  limitNum?: number;
  lastVisible?: QueryDocumentSnapshot<DocumentData>;
}) => {
  const { status, client, limitNum = 20, lastVisible } = options;
  const constraints: QueryConstraint[] = [];

  if (status && status !== 'All') {
    constraints.push(where('estado', '==', status));
  }
  if (client && client !== 'All') {
    constraints.push(where('cliente', '==', client));
  }
  
  constraints.push(orderBy('fechaEvento.start', 'asc'));

  if (lastVisible) {
    constraints.push(startAfter(lastVisible));
  }

  constraints.push(limit(limitNum));

  const q = query(eventsCollection, ...constraints);
  
  const documentSnapshots = await getDocs(q);

  const events = documentSnapshots.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Event));
  
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

  return { events, lastVisible: newLastVisible, hasMore: events.length === limitNum };
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'updatedAt'>) => {
  return await addDoc(eventsCollection, {
    ...eventData,
    updatedAt: serverTimestamp(),
  });
};

export const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id' | 'updatedAt'>>) => {
  await updateDoc(getEventDocRef(id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteEvent = async (id: string) => {
  await deleteDoc(getEventDocRef(id));
};


// --- Notes Data ---
const notesCollection = collection(db, 'notes');
const getNoteDocRef = (date: string) => doc(db, 'notes', date);

export const onAllNotesSnapshot = (callback: (notes: Record<string, Note>) => void) => {
  return onSnapshot(notesCollection, (snapshot) => {
    const notes: Record<string, Note> = {};
    snapshot.forEach(doc => {
      notes[doc.id] = doc.data() as Note;
    });
    callback(notes);
  });
};

export const onNoteSnapshot = (date: string, callback: (note: Note | null) => void) => {
  return onSnapshot(getNoteDocRef(date), (doc) => {
    callback(doc.exists() ? doc.data() as Note : null);
  });
};

export const updateNote = async (date: string, content: string) => {
    const noteData: Note = {
        content,
        updatedAt: new Date().toISOString()
    };
    await setDoc(getNoteDocRef(date), noteData, { merge: true });
};