import React from 'react';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { SearchIcon } from '../../assets/icons.tsx';
import Avatar from '../ui/Avatar.tsx';

const Topbar: React.FC = () => {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <header className="flex-shrink-0 bg-notion-bg border-b border-notion-border px-4 md:px-8 py-3 flex items-center justify-between">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-notion-text-subtle" />
        <input
          type="text"
          placeholder="Buscar eventos por título, cliente o lugar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-notion-sidebar pl-10 pr-4 py-1.5 rounded-md text-sm w-80 focus:ring-2 focus:ring-notion-accent focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-4">
        {/* The "Nuevo" button is now handled on the specific pages */}
        {user && (
          <Avatar
            username={user.username}
            avatarUrl={user.avatarUrl}
            className="h-8 w-8"
          />
        )}
      </div>
    </header>
  );
};

export default Topbar;