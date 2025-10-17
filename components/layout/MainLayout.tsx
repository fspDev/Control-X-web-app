import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../hooks/useAuth';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-notion-bg">
        {/* You can replace this with a more sophisticated spinner */}
        <svg className="animate-spin h-8 w-8 text-notion-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Define which paths should have a wider layout
  const wideLayoutPaths = ['/dashboard/table', '/dashboard/calendar'];
  const isWideLayout = wideLayoutPaths.includes(location.pathname);

  const contentContainerClasses = isWideLayout
    ? "max-w-7xl mx-auto"
    : "max-w-4xl mx-auto";

  return (
    <div className="flex h-screen bg-notion-bg font-sans text-notion-text">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className={contentContainerClasses}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
