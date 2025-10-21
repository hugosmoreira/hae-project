import React from 'react';
import Breadcrumb from './Breadcrumb';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string; current?: boolean }>;
  className?: string;
  showBreadcrumb?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  className,
  showBreadcrumb = true
}) => {
  return (
    <div className={cn("mb-8", className)}>
      {showBreadcrumb && (
        <div className="mb-4">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}
      
      <div className="fade-in">
        <h1 className="text-heading text-4xl mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-body text-lg">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
