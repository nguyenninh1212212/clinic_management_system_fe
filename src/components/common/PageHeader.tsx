// src/components/common/PageHeader.tsx
import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  breadcrumbs,
}) => {
  return (
    <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400">/</span>}
                {b.href ? (
                  <a href={b.href} className="hover:text-sky-700 transition-colors">
                    {b.label}
                  </a>
                ) : (
                  <span className="text-slate-700 font-medium">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <Typography variant="h5" component="h1" className="font-bold text-slate-900 tracking-tight">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" className="text-slate-500 mt-0.5">
            {subtitle}
          </Typography>
        )}
      </div>

      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </Box>
  );
};
