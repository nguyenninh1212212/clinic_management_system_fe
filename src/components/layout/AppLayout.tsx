// src/components/layout/AppLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Drawer, Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FeedbackSnackbar } from '@/components/common/FeedbackSnackbar';

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 256, bgcolor: '#0f172a' },
        }}
      >
        <Sidebar onCloseMobile={handleDrawerToggle} />
      </Drawer>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={handleDrawerToggle} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <FeedbackSnackbar />
    </div>
  );
};
