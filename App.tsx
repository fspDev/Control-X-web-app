import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { SearchProvider } from './contexts/SearchContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { isFirebaseConfigured } from './firebaseConfig';

// --- Lazy Loaded Components ---
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TableViewPage = lazy(() => import('./pages/TableViewPage'));
const CalendarViewPage = lazy(() => import('./pages/CalendarViewPage'));

const FullPageLoader: React.FC = () => (
  <div className="flex h-screen w-full items-center justify-center bg-notion-bg">
    <svg className="animate-spin h-8 w-8 text-notion-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);


function App() {
  // Guard clause to prevent app crash on missing Firebase config
  if (!isFirebaseConfigured) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-notion-bg text-notion-text font-sans">
        <div className="w-full max-w-md p-8 space-y-4 bg-notion-sidebar rounded-lg border border-notion-border text-center">
          <h1 className="text-2xl font-bold text-notion-error">Error de Configuración</h1>
          <p>La aplicación no pudo conectarse a los servicios de backend.</p>
          <p className="text-sm text-notion-text-secondary">
            Por favor, asegúrese de que las variables de entorno de Firebase estén configuradas correctamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <SearchProvider>
            <HashRouter>
              <Suspense fallback={<FullPageLoader />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard">
                      <Route index element={<DashboardPage />} />
                      <Route path="table" element={<TableViewPage />} />
                      <Route path="calendar" element={<CalendarViewPage />} />
                    </Route>
                    <Route path="admin" element={<AdminPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </HashRouter>
          </SearchProvider>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;