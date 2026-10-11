// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/theme/theme";

// Layout & Route Guards
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { UserRole } from "@/types";

// Auth Pages
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";

// Dashboard
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";

// Patients
import { PatientListPage } from "@/features/patients/pages/PatientListPage";
import { PatientCreatePage } from "@/features/patients/pages/PatientCreatePage";
import { PatientDetailPage } from "@/features/patients/pages/PatientDetailPage";
import { PatientEditPage } from "@/features/patients/pages/PatientEditPage";

// Appointments
import { AppointmentListPage } from "@/features/appointments/pages/AppointmentListPage";
import { AppointmentCreatePage } from "@/features/appointments/pages/AppointmentCreatePage";
import { AppointmentDetailPage } from "@/features/appointments/pages/AppointmentDetailPage";
import { AppointmentEditPage } from "@/features/appointments/pages/AppointmentEditPage";

// Triage
import { TriageListPage } from "@/features/triage/pages/TriageListPage";

// Examinations
import { ExaminationListPage } from "@/features/examinations/pages/ExaminationListPage";
import { ExaminationCreatePage } from "@/features/examinations/pages/ExaminationCreatePage";
import { ExaminationDetailPage } from "@/features/examinations/pages/ExaminationDetailPage";

// Prescriptions
import { PrescriptionListPage } from "@/features/prescriptions/pages/PrescriptionListPage";
import { PrescriptionDetailPage } from "@/features/prescriptions/pages/PrescriptionDetailPage";

// Medicines & Inventory
import { MedicineListPage } from "@/features/medicines/pages/MedicineListPage";
import { InventoryListPage } from "@/features/inventory/pages/InventoryListPage";
import { StockTransactionsPage } from "@/features/inventory/pages/StockTransactionsPage";

// Doctors, Specialties & Positions
import { DoctorListPage } from "@/features/doctors/pages/DoctorListPage";
import { DoctorCreatePage } from "@/features/doctors/pages/DoctorCreatePage";
import { DoctorDetailPage } from "@/features/doctors/pages/DoctorDetailPage";
import { DoctorEditPage } from "@/features/doctors/pages/DoctorEditPage";
import { SpecialtyListPage } from "@/features/specialties/pages/SpecialtyListPage";
import { PositionListPage } from "@/features/positions/pages/PositionListPage";

// System & Security
import { UserListPage } from "@/features/users/pages/UserListPage";
import { PermissionListPage } from "@/features/permissions/pages/PermissionListPage";
import { AuditLogListPage } from "@/features/audit-logs/pages/AuditLogListPage";
import { NotificationsPage } from "@/features/notifications/pages/NotificationsPage";
import { InvoiceListPage } from "@/features/invoices/pages/InvoiceListPage";
import { InvoiceCreatePage } from "@/features/invoices/pages/InvoiceCreatePage";
import { InvoiceDetailPage } from "@/features/invoices/pages/InvoiceDetailPage";
import { PharmacyDashboard } from "@/features/pharmacy/pages/PharmacyDashboard";
import { DoctorShiftManagement } from "@/features/doctors/pages/DoctorShiftManagement";
import { DoctorScheduleCalendar } from "@/features/appointments/pages/DoctorScheduleCalendar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403 ||
          error?.response?.status === 404
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
export const routeElements = (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Protected Routes */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />

      {/* Patients */}
      <Route path="patients" element={<PatientListPage />} />
      <Route path="patients/new" element={<PatientCreatePage />} />
      <Route path="patients/:id" element={<PatientDetailPage />} />
      <Route path="patients/:id/edit" element={<PatientEditPage />} />

      {/* Appointments */}
      <Route path="appointments" element={<AppointmentListPage />} />
      <Route path="appointments/new" element={<AppointmentCreatePage />} />
      <Route path="appointments/:id" element={<AppointmentDetailPage />} />
      <Route path="appointments/:id/edit" element={<AppointmentEditPage />} />
      <Route path="doctor-schedule" element={<DoctorScheduleCalendar />} />
      <Route
        path="doctor-shifts"
        element={
          <RoleRoute
            roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER]}
          >
            <DoctorShiftManagement />
          </RoleRoute>
        }
      />

      {/* Triage */}
      <Route path="triage" element={<TriageListPage />} />
      <Route path="triage-results" element={<TriageListPage />} />

      {/* Examinations */}
      <Route path="examinations" element={<ExaminationListPage />} />
      <Route path="examinations/new" element={<ExaminationCreatePage />} />
      <Route path="examinations/:id" element={<ExaminationDetailPage />} />

      {/* Prescriptions */}
      <Route path="prescriptions" element={<PrescriptionListPage />} />
      <Route path="prescriptions/:id" element={<PrescriptionDetailPage />} />

      {/* Invoices */}
      <Route path="invoices" element={<InvoiceListPage />} />
      <Route path="invoices/new" element={<InvoiceCreatePage />} />
      <Route path="invoices/:id" element={<InvoiceDetailPage />} />

      {/* Pharmacy */}
      <Route path="pharmacy" element={<PharmacyDashboard />} />

      {/* Medicines & Inventory */}
      <Route path="medicines" element={<MedicineListPage />} />
      <Route path="inventory" element={<InventoryListPage />} />
      <Route path="stock-transactions" element={<StockTransactionsPage />} />

      <Route path="doctors" element={<DoctorListPage />} />
      <Route path="doctors/new" element={<DoctorCreatePage />} />
      <Route path="doctors/:id" element={<DoctorDetailPage />} />
      <Route path="doctors/:id/edit" element={<DoctorEditPage />} />
      <Route path="specialties" element={<SpecialtyListPage />} />
      <Route path="positions" element={<PositionListPage />} />

      {/* Notifications */}
      <Route path="notifications" element={<NotificationsPage />} />

      {/* Audit Logs */}
      <Route path="audit-logs" element={<AuditLogListPage />} />

      {/* Admin & Security Management (Super Admin & Admin) */}
      <Route
        path="users"
        element={
          <RoleRoute roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
            <UserListPage />
          </RoleRoute>
        }
      />
      <Route
        path="permissions"
        element={
          <RoleRoute roles={[UserRole.SUPER_ADMIN]}>
            <PermissionListPage />
          </RoleRoute>
        }
      />
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </>
);
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {routeElements}
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
