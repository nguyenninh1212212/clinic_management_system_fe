import { Column, DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { useListFilters } from "@/hooks/useListFilters";
import { AuditAction, AuditLog, AuditLogQueryParams } from "@/types";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useAuditLogs } from "../hooks/useAuditLogs";

export const AuditLogListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { filters, replaceFilters } =
    useListFilters<Omit<AuditLogQueryParams, "page" | "limit">>();

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading } = useAuditLogs({
    page,
    limit,
    ...filters,
  });

  const getActorName = (log: AuditLog) =>
    log.user?.fullName || log.user?.email || "Hệ thống";

  const formatAuditValue = (
    value: AuditLog["oldValue"] | AuditLog["newValue"],
  ): string => {
    if (value == null) return "Không có dữ liệu";

    if (typeof value === "string") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }

    return JSON.stringify(value, null, 2) ?? String(value);
  };

  const getActionColor = (
    action: string,
  ): "success" | "info" | "error" | "default" => {
    const actionUpper = action.toUpperCase();

    if (actionUpper.includes("CREATE") || actionUpper.includes("POST")) {
      return "success";
    }

    if (
      actionUpper.includes("UPDATE") ||
      actionUpper.includes("PATCH") ||
      actionUpper.includes("PUT")
    ) {
      return "info";
    }

    if (actionUpper.includes("DELETE")) {
      return "error";
    }

    return "default";
  };

  const columns: Column<AuditLog>[] = [
    {
      id: "id",
      label: "Mã log",
      minWidth: 70,
      render: (row) => (
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            color: "text.secondary",
            whiteSpace: "nowrap",
          }}
        >
          #{row.id}
        </Typography>
      ),
    },
    {
      id: "user",
      label: "Người thao tác",
      filterFields: [{ key: "userId", label: "Mã người dùng", type: "input" }],
      minWidth: 180,
      render: (row) => (
        <Stack spacing={0.5}>
          {row.ipAddress && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: "monospace" }}
            >
              IP: {row.ipAddress}
            </Typography>
          )}

          {row.user && (
            <Typography variant="caption" color="text.secondary">
              {row.user.fullName}
              {row.user.email ? ` · ${row.user.email}` : ""}
            </Typography>
          )}
          {row.userAgent && (
            <Tooltip title={row.userAgent} arrow placement="top">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  maxWidth: 220,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "help",
                }}
              >
                {row.userAgent}
              </Typography>
            </Tooltip>
          )}
        </Stack>
      ),
    },
    {
      id: "action",
      label: "Hành động",
      filterFields: [
        {
          key: "action",
          label: "Hành động",
          type: "select",
          filters: Object.values(AuditAction).map((value) => ({
            text: value,
            value,
          })),
        },
      ],
      minWidth: 140,
      render: (row) => (
        <Chip
          label={row.action}
          color={getActionColor(row.action)}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderRadius: 1,
            maxWidth: "100%",
          }}
        />
      ),
    },
    {
      id: "entity",
      label: "Đối tượng thực thể",
      filterFields: [
        { key: "entityName", label: "Tên thực thể", type: "input" },
        { key: "entityId", label: "Mã thực thể", type: "input" },
      ],
      minWidth: 150,
      render: (row) => (
        <Stack spacing={0.5}>
          <Typography
            variant="body2"
            style={{ fontWeight: 600 }}
            sx={{ overflowWrap: "anywhere" }}
          >
            {row.entityName || "—"}
          </Typography>

          {row.entityId && (
            <Typography variant="caption" color="text.secondary">
              ID: {row.entityId}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      id: "createdAt",
      label: "Thời gian",
      filterFields: [
        { key: "dateFrom", label: "Từ ngày", type: "date" },
        { key: "dateTo", label: "Đến ngày", type: "date" },
      ],
      minWidth: 155,
      render: (row) => (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontFamily: "monospace",
            whiteSpace: "nowrap",
          }}
        >
          {dayjs(row.createdAt).format("HH:mm:ss DD/MM/YYYY")}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: "Chi tiết",
      align: "right",
      minWidth: 100,
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => setSelectedLog(row)}
          sx={{ whiteSpace: "nowrap" }}
        >
          Xem log
        </Button>
      ),
    },
  ];

  const renderAuditValue = (title: string, value: string, color: string) => (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="subtitle2"
        style={{ fontWeight: 700 }}
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          bgcolor: "grey.900",
          color,
          borderColor: "grey.800",
          borderRadius: 2,
          overflow: "auto",
          maxHeight: 360,
          minHeight: 160,
        }}
      >
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            fontFamily: "monospace",
            fontSize: 12,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {value}
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Nhật ký Kiểm toán & Bảo mật (Audit Logs)"
        subtitle="Ghi nhận vết can thiệp dữ liệu, phân quyền và các thao tác nhạy cảm trên hệ thống"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Nhật ký kiểm toán" },
        ]}
      />

      <DataTable
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        pagination={data?.pagination}
        filters={filters}
        onFilterChange={(nextFilters) => {
          replaceFilters(nextFilters);
          setPage(1);
        }}
        onPageChange={(nextPage) => setPage(nextPage)}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        emptyTitle="Chưa có bản ghi nhật ký kiểm toán nào"
        emptyDescription="Các thao tác cập nhật, thêm mới và xóa sẽ được ghi nhận tự động tại đây."
      />

      <Dialog
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" style={{ fontWeight: 700 }}>
            Chi tiết vết kiểm toán
            {selectedLog ? ` #${selectedLog.id}` : ""}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ py: 3 }}>
          {selectedLog && (
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Người thực hiện
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontWeight: 600 }}
                    sx={{ mt: 0.5, overflowWrap: "anywhere" }}
                  >
                    {getActorName(selectedLog)}
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Hành động
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedLog.action}
                      color={getActionColor(selectedLog.action)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Thực thể & ID
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontWeight: 600 }}
                    sx={{
                      mt: 0.5,
                      fontFamily: "monospace",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {selectedLog.entityName || "—"}
                    {selectedLog.entityId ? ` · #${selectedLog.entityId}` : ""}
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Thời gian
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{
                      fontWeight: 600,
                    }}
                    sx={{
                      mt: 0.5,
                      fontFamily: "monospace",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {dayjs(selectedLog.createdAt).format("HH:mm:ss DD/MM/YYYY")}
                  </Typography>
                </Paper>
              </Box>

              {selectedLog.ipAddress && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Địa chỉ IP
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {selectedLog.ipAddress}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                {renderAuditValue(
                  "Dữ liệu trước thao tác",
                  formatAuditValue(selectedLog.oldValue),
                  "#f1f5f9",
                )}

                {renderAuditValue(
                  "Dữ liệu sau thao tác",
                  formatAuditValue(selectedLog.newValue),
                  "#6ee7b7",
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setSelectedLog(null)}
            color="inherit"
            variant="outlined"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
