import { CommerceRealtime } from '@/features/commerce/CommerceRealtime';
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Drawer, useMediaQuery, useTheme } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FeedbackSnackbar } from "@/components/common/FeedbackSnackbar";

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => !prev);
  };
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  useEffect(() => {
    if (isDesktop) {
      setMobileOpen(false);
    }
  }, [isDesktop]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      <div
        className={`hidden md:flex shrink-0 h-full transition-all duration-300 ${
          sidebarCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarCollapse}
        />
      </div>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 256,
            bgcolor: "#0f172a",
          },
        }}
      >
        <Sidebar onCloseMobile={handleDrawerToggle} />
      </Drawer>

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <TopBar
          onToggleSidebar={handleDrawerToggle}
          onToggleDesktopSidebar={handleSidebarCollapse}
          isDesktop={isDesktop}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <CommerceRealtime/>
      <FeedbackSnackbar />
    </div>
  );
};
