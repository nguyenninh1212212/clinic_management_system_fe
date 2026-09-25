// src/api/queryKeys.ts
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    providers: ['auth', 'providers'] as const,
  },
  patients: {
    all: ['patients'] as const,
    lists: () => [...queryKeys.patients.all, 'list'] as const,
    list: (p: object) => [...queryKeys.patients.lists(), p] as const,
    details: () => [...queryKeys.patients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.patients.details(), id] as const,
  },
  doctors: {
    all: ['doctors'] as const,
    lists: () => [...queryKeys.doctors.all, 'list'] as const,
    list: (p: object) => [...queryKeys.doctors.lists(), p] as const,
    details: () => [...queryKeys.doctors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.doctors.details(), id] as const,
    me: ['doctors', 'me'] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    lists: () => [...queryKeys.appointments.all, 'list'] as const,
    list: (p: object) => [...queryKeys.appointments.lists(), p] as const,
    details: () => [...queryKeys.appointments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.appointments.details(), id] as const,
  },
  specialties: {
    all: ['specialties'] as const,
    lists: () => [...queryKeys.specialties.all, 'list'] as const,
    list: (p: object) => [...queryKeys.specialties.lists(), p] as const,
    dropdown: () => [...queryKeys.specialties.all, 'dropdown'] as const,
    detail: (id: number) => [...queryKeys.specialties.all, 'detail', id] as const,
  },
  examinations: {
    all: ['examinations'] as const,
    lists: () => [...queryKeys.examinations.all, 'list'] as const,
    list: (p: object) => [...queryKeys.examinations.lists(), p] as const,
    detail: (id: string) => [...queryKeys.examinations.all, 'detail', id] as const,
  },
  prescriptions: {
    all: ['prescriptions'] as const,
    lists: () => [...queryKeys.prescriptions.all, 'list'] as const,
    list: (p: object) => [...queryKeys.prescriptions.lists(), p] as const,
    detail: (id: string) => [...queryKeys.prescriptions.all, 'detail', id] as const,
  },
  prescriptionItems: {
    all: ['prescription-items'] as const,
    byPrescription: (prescriptionId: string) =>
      [...queryKeys.prescriptionItems.all, prescriptionId] as const,
    detail: (id: string) => [...queryKeys.prescriptionItems.all, 'detail', id] as const,
  },
  medicines: {
    all: ['medicines'] as const,
    lists: () => [...queryKeys.medicines.all, 'list'] as const,
    list: (p: object) => [...queryKeys.medicines.lists(), p] as const,
    detail: (id: string) => [...queryKeys.medicines.all, 'detail', id] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    lists: () => [...queryKeys.inventory.all, 'list'] as const,
    list: (p: object) => [...queryKeys.inventory.lists(), p] as const,
    detail: (id: string) => [...queryKeys.inventory.all, 'detail', id] as const,
  },
  stockTransactions: {
    all: ['stock-transactions'] as const,
    lists: () => [...queryKeys.stockTransactions.all, 'list'] as const,
    list: (p: object) => [...queryKeys.stockTransactions.lists(), p] as const,
    detail: (id: number) => [...queryKeys.stockTransactions.all, 'detail', id] as const,
  },
  triageResults: {
    all: ['triage-results'] as const,
    lists: () => [...queryKeys.triageResults.all, 'list'] as const,
    list: (p: object) => [...queryKeys.triageResults.lists(), p] as const,
    detail: (id: number) => [...queryKeys.triageResults.all, 'detail', id] as const,
  },
  positions: {
    all: ['positions'] as const,
    lists: () => [...queryKeys.positions.all, 'list'] as const,
    list: (p: object) => [...queryKeys.positions.lists(), p] as const,
    active: () => [...queryKeys.positions.all, 'active'] as const,
    detail: (id: number) => [...queryKeys.positions.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (p: object) => [...queryKeys.users.lists(), p] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    permissions: (id: string) => [...queryKeys.users.all, 'permissions', id] as const,
  },
  permissions: {
    all: ['permissions'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (p: object) => [...queryKeys.notifications.all, 'list', p] as const,
  },
  auditLogs: {
    all: ['audit-logs'] as const,
    list: (p: object) => [...queryKeys.auditLogs.all, 'list', p] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (params: object) => [...queryKeys.invoices.lists(), params] as const,
    detail: (id: string) => [...queryKeys.invoices.all, 'detail', id] as const,
  },
};
