// src/firebaseConfig.ts
// FIX: (line 2) Changed to a namespace import to resolve module loading issues with 'firebase/app'.
import * as firebaseApp from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// --- PASO 2: REEMPLAZA ESTO CON TUS CLAVES DE PRODUCCIÓN ---
// Copia y pega aquí el objeto de configuración de tu NUEVO proyecto de Firebase (el de producción).
// IMPORTANTE: Para este despliegue simplificado, las claves están directamente en el código.
// Esto no es ideal para proyectos de código abierto, ya que expone tus claves.
// En un proyecto más grande, usarías variables de entorno.
const firebaseConfig = {
  apiKey: "AIzaSyDyfjvBPYLBn_x8y5u29J1z8iz63xCvicM",
  authDomain: "control-x-prod.firebaseapp.com",
  projectId: "control-x-prod",
  storageBucket: "control-x-prod.appspot.com",
  messagingSenderId: "965478460447",
  appId: "1:965478460447:web:2cf560dce2886ad194392a"
};


// Check if all required Firebase config values are present and valid strings
export let isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => typeof value === 'string' && value.length > 0 && !value.startsWith("TU_")
);

let app: firebaseApp.FirebaseApp;
let db: Firestore;
let auth: Auth;

if (isFirebaseConfigured) {
  try {
    // Initialize Firebase only if configuration is valid
    app = firebaseApp.initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    // In case of initialization error, ensure the flag is false
    isFirebaseConfigured = false; 
  }
} else {
  console.warn("La configuración de Firebase está incompleta o sigue usando los valores de marcador de posición. La aplicación no se iniciará correctamente. Por favor, verifique el archivo firebaseConfig.ts.");
}

// Export the initialized services. They will be undefined if config is missing.
// The app is guarded in App.tsx to prevent usage of undefined services.
export { app, db, auth };