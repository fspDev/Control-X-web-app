import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={`animate-pulse bg-notion-hover rounded-md ${className}`} />;
};

export default Skeleton;