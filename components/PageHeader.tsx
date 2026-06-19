import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => {
  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm sm:text-base">{subtitle}</p>}
      </div>
      {children && <div className="w-full sm:w-auto">{children}</div>}
    </div>
  );
};

export default PageHeader;
