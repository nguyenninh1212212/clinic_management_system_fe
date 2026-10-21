import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useListFilters } from "@/hooks/useListFilters";
import type {
  PatientAccount,
  PatientAccountQuery,
  PatientLoginMethod,
} from "@/types/patient-account.types";
import {
  usePatientAccountList,
  useRevokePatientSessions,
  useUpdatePatientAccount,
} from "../hooks/usePatientAccounts";
import { accountError, loginLabels } from "../account-presentation";

export function PatientAccountListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { filters, replaceFilters } =
    useListFilters<Omit<PatientAccountQuery, "page" | "limit">>();
  const list = usePatientAccountList({ page, limit, ...filters });
  useEffect(() => {
    if (
      list.data &&
      !list.isFetching &&
      page > Math.max(1, list.data.pagination.totalPages)
    ) {
      setPage(Math.max(1, list.data.pagination.totalPages));
    }
  }, [list.data, list.isFetching, page]);
  const update = useUpdatePatientAccount();
  const revoke = useRevokePatientSessions();
  const [editing, setEditing] = useState<PatientAccount | null>(null);
  const [fullName, setFullName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    account: PatientAccount;
    action: "status" | "sessions";
  } | null>(null);
  const busy = update.isPending || revoke.isPending;
  const saveName = async () => {
    if (!editing || !fullName.trim()) return;
    setEditError(null);
    try {
      await update.mutateAsync({
        id: editing.id,
        dto: { fullName: fullName.trim() },
      });
      setEditing(null);
    } catch (error) {
      setEditError(accountError(error));
    }
  };
  const confirmAction = async () => {
    if (!confirmation) return;
    setActionError(null);
    try {
      if (confirmation.action === "status")
        await update.mutateAsync({
          id: confirmation.account.id,
          dto: { isActive: !confirmation.account.isActive },
        });
      else await revoke.mutateAsync(confirmation.account.id);
      setConfirmation(null);
    } catch (error) {
      setActionError(accountError(error));
      setConfirmation(null);
    }
  };
  const columns: Column<PatientAccount>[] = [
    {
      id: "fullName",
      label: "Tài khoản bệnh nhân",
      minWidth: 220,
      filterFields: [
        {
          key: "search",
          label: "Tên, email hoặc số điện thoại",
          type: "input",
        },
      ],
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar ?? undefined} sx={{ width: 34, height: 34 }}>
            {row.fullName?.charAt(0) || "BN"}
          </Avatar>
          <div>
            <div className="font-semibold text-slate-800 text-sm">
              {row.fullName}
            </div>
            <div className="text-xs text-slate-400">
              {row.email || "Chưa có email"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      label: "Số điện thoại",
      minWidth: 140,
      render: (row) => row.phone || "—",
    },
    {
      id: "loginMethods",
      label: "Phương thức đăng nhập",
      minWidth: 210,
      filterFields: [
        {
          key: "provider",
          label: "Phương thức đăng nhập",
          type: "select",
          filters: (Object.keys(loginLabels) as PatientLoginMethod[]).map(
            (value) => ({ value, text: loginLabels[value] }),
          ),
        },
      ],
      render: (row) => (
        <Stack
          direction="row"
          spacing={0.5}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          {row.loginMethods.map((method) => (
            <Chip
              key={method}
              label={loginLabels[method]}
              size="small"
              variant="outlined"
            />
          ))}
          {!row.loginMethods.length && "—"}
        </Stack>
      ),
    },
    {
      id: "isActive",
      label: "Trạng thái",
      minWidth: 120,
      filterFields: [
        { key: "isActive", label: "Đang hoạt động", type: "boolean" },
      ],
      render: (row) => (
        <Chip
          size="small"
          label={row.isActive ? "Hoạt động" : "Tạm khóa"}
          color={row.isActive ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      id: "createdAt",
      label: "Ngày đăng ký",
      minWidth: 150,
      render: (row) => dayjs(row.createdAt).format("DD/MM/YYYY HH:mm"),
    },
    {
      id: "actions",
      label: "Thao tác",
      align: "right",
      minWidth: 210,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="small"
            onClick={() => navigate(`/patient-accounts/${row.id}`)}
          >
            Chi tiết
          </Button>
          <Tooltip title="Sửa tên hiển thị">
            <span>
              <IconButton
                size="small"
                aria-label={`Sửa tên ${row.fullName}`}
                disabled={busy}
                onClick={() => {
                  setEditing(row);
                  setFullName(row.fullName);
                  setEditError(null);
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            title={row.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          >
            <span>
              <IconButton
                size="small"
                aria-label={
                  row.isActive
                    ? `Khóa ${row.fullName}`
                    : `Mở khóa ${row.fullName}`
                }
                disabled={busy}
                onClick={() =>
                  setConfirmation({ account: row, action: "status" })
                }
              >
                {row.isActive ? (
                  <BlockIcon fontSize="small" />
                ) : (
                  <LockOpenIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Thu hồi phiên đăng nhập">
            <span>
              <IconButton
                size="small"
                aria-label={`Thu hồi phiên ${row.fullName}`}
                disabled={busy}
                onClick={() =>
                  setConfirmation({ account: row, action: "sessions" })
                }
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản trị Tài khoản bệnh nhân"
        subtitle="Tra cứu tài khoản, phương thức đăng nhập và quản lý trạng thái truy cập"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Tài khoản bệnh nhân" },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={list.isFetching}
            onClick={() => {
              void list.refetch();
            }}
          >
            Làm mới
          </Button>
        }
      />
      {list.isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                void list.refetch();
              }}
            >
              Thử lại
            </Button>
          }
        >
          {accountError(list.error)}
        </Alert>
      )}
      {actionError && (
        <Alert severity="error" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}
      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
        Tổng số:{" "}
        <strong className="text-slate-800">
          {list.data?.pagination.total ?? 0}
        </strong>{" "}
        tài khoản
      </div>
      <DataTable
        columns={columns}
        rows={list.data?.data ?? []}
        loading={list.isLoading}
        serverSide
        pagination={list.data?.pagination}
        filters={filters}
        onChange={(pagination, nextFilters) => {
          setPage(pagination.page);
          setLimit(pagination.limit);
          replaceFilters(nextFilters);
        }}
        emptyTitle="Chưa có tài khoản phù hợp"
        emptyDescription="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
      />
      <Dialog
        open={!!editing}
        onClose={busy ? undefined : () => setEditing(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Sửa tài khoản bệnh nhân</DialogTitle>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!busy) void saveName();
          }}
        >
          <DialogContent>
            <Stack spacing={2}>
              {editError && <Alert severity="error">{editError}</Alert>}
              <TextField
                label="Họ và tên hiển thị"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                disabled={busy}
                slotProps={{ htmlInput: { maxLength: 160 } }}
              />
              <TextField
                label="Email"
                value={editing?.email ?? "Chưa có email"}
                disabled
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={busy} onClick={() => setEditing(null)}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={busy || !fullName.trim()}
            >
              {busy ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <ConfirmDialog
        open={!!confirmation}
        title={
          confirmation?.action === "sessions"
            ? "Thu hồi phiên đăng nhập"
            : confirmation?.account.isActive
              ? "Khóa tài khoản bệnh nhân"
              : "Mở khóa tài khoản bệnh nhân"
        }
        content={
          confirmation?.action === "sessions"
            ? `Thu hồi phiên đăng nhập hiện tại của ${confirmation.account.fullName}?`
            : confirmation?.account.isActive
              ? `Khóa tài khoản ${confirmation.account.fullName}? Các phiên đăng nhập hiện tại sẽ bị thu hồi.`
              : `Cho phép tài khoản ${confirmation?.account.fullName ?? ""} đăng nhập trở lại?`
        }
        confirmText="Xác nhận"
        confirmColor={
          confirmation?.action === "status" && !confirmation.account.isActive
            ? "primary"
            : "warning"
        }
        isLoading={busy}
        onConfirm={() => {
          if (!busy) void confirmAction();
        }}
        onClose={() => setConfirmation(null)}
      />
    </div>
  );
}
