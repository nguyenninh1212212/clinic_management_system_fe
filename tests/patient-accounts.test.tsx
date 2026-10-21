import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const storage = new Map<string, string>();
Object.assign(globalThis, {
  sessionStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
  window: { location: { pathname: "/login", href: "/login" } },
});

test("patient account administration frontend", async (suite) => {
  const { api } = await import("../src/api/axios");
  const { patientAccountsApi } =
    await import("../src/api/endpoints/patient-accounts.api");
  const { Sidebar } = await import("../src/components/layout/Sidebar");
  const { useAuthStore } = await import("../src/stores/auth.store");
  const { UserRole } = await import("../src/types");
  const oldAdapter = api.defaults.adapter;
  const account = {
    id: "patient-id",
    accountType: "PATIENT",
    fullName: "Patient",
    isActive: true,
    email: null,
    phone: null,
    loginMethods: ["GOOGLE"],
    profiles: [],
    providers: [],
    avatar: null,
    emailVerifiedAt: null,
    phoneVerifiedAt: null,
    createdAt: "2026-10-21T10:00:00Z",
    updatedAt: "2026-10-21T10:00:00Z",
  };
  try {
    await suite.test(
      "lists patient accounts through the administration API with server filters",
      async () => {
        api.defaults.adapter = async (config) => {
          assert.equal(config.url, "/patient-accounts");
          assert.deepEqual(config.params, {
            page: 2,
            limit: 10,
            search: "patient",
            isActive: false,
            provider: "GOOGLE",
          });
          return {
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            data: {
              data: [account],
              pagination: { page: 2, limit: 10, total: 11, totalPages: 2 },
            },
          };
        };
        const result = await patientAccountsApi.findAll({
          page: 2,
          limit: 10,
          search: "patient",
          isActive: false,
          provider: "GOOGLE",
        });
        assert.equal(result.data[0].id, "patient-id");
        assert.equal(result.pagination.total, 11);
      },
    );
    await suite.test(
      "unwraps account details without confusing them with clinical patient records",
      async () => {
        api.defaults.adapter = async (config) => {
          assert.equal(config.url, "/patient-accounts/patient-id");
          return {
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            data: { data: account },
          };
        };
        assert.deepEqual(
          await patientAccountsApi.findById("patient-id"),
          account,
        );
      },
    );
    await suite.test(
      "locks an account with a targeted PATCH instead of changing staff users",
      async () => {
        api.defaults.adapter = async (config) => {
          assert.equal(config.url, "/patient-accounts/patient-id");
          assert.equal(config.method, "patch");
          assert.deepEqual(JSON.parse(config.data), { isActive: false });
          return {
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            data: { data: { ...account, isActive: false } },
          };
        };
        assert.equal(
          (await patientAccountsApi.update("patient-id", { isActive: false }))
            .isActive,
          false,
        );
      },
    );
    await suite.test(
      "revokes sessions through the dedicated endpoint with no client identity override",
      async () => {
        api.defaults.adapter = async (config) => {
          assert.equal(
            config.url,
            "/patient-accounts/patient-id/revoke-sessions",
          );
          assert.equal(config.method, "post");
          assert.deepEqual(JSON.parse(config.data), {});
          return {
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            data: { data: { message: "Revoked" } },
          };
        };
        await patientAccountsApi.revokeSessions("patient-id");
      },
    );
    await suite.test(
      "renders the administration list and account detail using cached API data",
      async () => {
        const { PatientAccountListPage } =
          await import("../src/features/patient-accounts/pages/PatientAccountListPage");
        const { PatientAccountDetailPage } =
          await import("../src/features/patient-accounts/pages/PatientAccountDetailPage");
        const { patientAccountKeys } =
          await import("../src/features/patient-accounts/hooks/usePatientAccounts");
        const client = new QueryClient({
          defaultOptions: {
            queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
          },
        });
        try {
          client.setQueryData(patientAccountKeys.list({ page: 1, limit: 10 }), {
            data: [account],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
          });
          client.setQueryData(patientAccountKeys.detail(account.id), account);
          const listMarkup = renderToStaticMarkup(
            <QueryClientProvider client={client}>
              <MemoryRouter>
                <PatientAccountListPage />
              </MemoryRouter>
            </QueryClientProvider>,
          );
          assert.ok(listMarkup.includes("Quản trị Tài khoản bệnh nhân"));
          assert.ok(listMarkup.includes("Patient"));
          assert.ok(listMarkup.includes("Google"));
          const detailMarkup = renderToStaticMarkup(
            <QueryClientProvider client={client}>
              <MemoryRouter initialEntries={["/patient-accounts/patient-id"]}>
                <Routes>
                  <Route
                    path="/patient-accounts/:id"
                    element={<PatientAccountDetailPage />}
                  />
                </Routes>
              </MemoryRouter>
            </QueryClientProvider>,
          );
          assert.ok(detailMarkup.includes("Chi tiết Tài khoản bệnh nhân"));
          assert.ok(detailMarkup.includes("Chưa có email"));
          assert.ok(detailMarkup.includes("Google"));
          assert.ok(
            detailMarkup.includes(
              "Tài khoản chưa có liên kết hồ sơ bệnh nhân.",
            ),
          );
        } finally {
          client.clear();
        }
      },
    );
    await suite.test(
      "only ADMIN and SUPER_ADMIN can see patient account management",
      () => {
        const initial = useAuthStore.getInitialState();
        const originalUser = initial.user;
        try {
          // Zustand uses getInitialState during SSR; seed that snapshot to exercise the actual menu.
          for (const [role, visible] of [
            [UserRole.ADMIN, true],
            [UserRole.SUPER_ADMIN, true],
            [UserRole.MANAGER, false],
            [UserRole.STAFF, false],
            [UserRole.USER, false],
          ] as const) {
            initial.user = {
              id: "staff",
              role,
              accountType: role === UserRole.USER ? "PATIENT" : "STAFF",
            } as never;
            const markup = renderToStaticMarkup(
              <MemoryRouter>
                <Sidebar />
              </MemoryRouter>,
            );
            assert.equal(
              markup.includes('href="/patient-accounts"'),
              visible,
              role,
            );
          }
        } finally {
          initial.user = originalUser;
        }
      },
    );
  } finally {
    api.defaults.adapter = oldAdapter;
    useAuthStore.getState().clearAuth();
  }
});
