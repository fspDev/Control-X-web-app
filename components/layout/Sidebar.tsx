import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../contexts/SidebarContext';
import { CalendarIcon, DashboardIcon, TableIcon, AdminIcon, LogoutIcon, LogoIcon, ChevronDoubleLeftIcon } from '../../assets/icons';

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  isCollapsed: boolean;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed, end }) => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 group relative ${
      isActive
        ? 'bg-notion-hover text-notion-text'
        : 'text-notion-text-secondary hover:bg-notion-hover hover:text-notion-text'
    } ${isCollapsed ? 'justify-center' : ''}`;

  return (
    <NavLink to={to} end={end} className={navLinkClasses}>
      {icon}
      <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>
        {label}
      </span>
      {isCollapsed && (
        <span className="absolute left-full ml-4 w-auto p-2 text-xs font-medium text-white bg-notion-bg border border-notion-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
          {label}
        </span>
      )}
    </NavLink>
  );
};


const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={`flex-shrink-0 bg-notion-sidebar border-r border-notion-border flex flex-col p-4 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center gap-2 px-4 mb-8 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
        <LogoIcon className="h-8 w-8 text-notion-accent flex-shrink-0" />
        <span className={`text-lg font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          Control X
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem to="/dashboard" end label="Dashboard" isCollapsed={isCollapsed} icon={<DashboardIcon className="h-5 w-5 flex-shrink-0" />} />
        <NavItem to="/dashboard/table" label="Proyectos" isCollapsed={isCollapsed} icon={<TableIcon className="h-5 w-5 flex-shrink-0" />} />
        <NavItem to="/dashboard/calendar" label="Calendario" isCollapsed={isCollapsed} icon={<CalendarIcon className="h-5 w-5 flex-shrink-0" />} />
        {user?.role === 'admin' && (
           <NavItem to="/admin" label="Admin" isCollapsed={isCollapsed} icon={<AdminIcon className="h-5 w-5 flex-shrink-0" />} />
        )}
      </nav>

      <div className="mt-auto space-y-2">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-notion-text-secondary rounded-md hover:bg-notion-hover hover:text-notion-text"
        >
          <ChevronDoubleLeftIcon className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        
        <div className="relative group">
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-2 text-sm font-medium text-notion-text-secondary rounded-md hover:bg-notion-hover ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogoutIcon className="h-5 w-5 flex-shrink-0" />
              <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>
                Cerrar Sesión
              </span>
            </button>
            {isCollapsed && (
               <span className="absolute left-full ml-4 w-auto p-2 text-xs font-medium text-white bg-notion-bg border border-notion-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                 Cerrar Sesión
               </span>
            )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;