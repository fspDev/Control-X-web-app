
import React, { ReactNode } from 'react';

interface NotionCardProps {
  title: string;
  children: ReactNode;
}

const NotionCard: React.FC<NotionCardProps> = ({ title, children }) => {
  return (
    <div className="bg-notion-bg rounded-lg border border-notion-border">
      <div className="p-4 border-b border-notion-border">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default NotionCard;