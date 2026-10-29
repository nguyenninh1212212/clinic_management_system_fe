import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { PharmacyDashboard } from "@/features/pharmacy/pages/PharmacyDashboard";
import { InvoiceListPage as InvoicesPage } from "@/features/invoices/pages/InvoiceListPage";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import {
  commerceApi,
  type PurchaseInvoice,
} from "@/api/endpoints/commerce.api";
import { useAuthStore } from "@/stores/auth.store";

const money = (value: string | number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value),
  );
const labels: Record<string, string> = {
  DRAFT: "Bản nháp",
  ISSUED: "Đã phát hành",
  PENDING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy",
  REFUND_PENDING: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  PENDING: "Chờ chuẩn bị",
  PREPARING: "Đang chuẩn bị",
  READY: "Sẵn sàng nhận",
  DISPENSED: "Đã bàn giao",
  SUCCESS: "Thành công",
  PROCESSING: "Đang xử lý",
  EXPIRED: "Hết hạn",
  FAILED: "Thất bại",
};
const errorText = (error: unknown) =>
  isAxiosError(error)
    ? Array.isArray(error.response?.data?.message)
      ? error.response.data.message.join(", ")
      : error.response?.data?.message ||
        "Không thể thực hiện. Vui lòng thử lại."
    : error instanceof Error
      ? error.message
      : "Không thể thực hiện";
const State = ({ value }: { value: string | null }) => (
  <Chip
    size="small"
    label={value ? labels[value] || value : "Hóa đơn lịch sử"}
  />
);
function useRefresh() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["commerce"] });
}

function InvoiceDialog({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const actorId = useAuthStore((s) => s.user?.id);
  const refresh = useRefresh();
  const [cashConfirmation, setCashConfirmation] = useState(false);
  const [reason, setReason] = useState("");
  const capabilities = useQuery({
    queryKey: ["commerce", actorId, "capabilities"],
    queryFn: commerceApi.capabilities,
  });
  const detail = useQuery({
    queryKey: ["commerce", actorId, "invoice", id],
    queryFn: () => commerceApi.invoice(id!),
    enabled: !!id,
  });
  const history = useQuery({
    queryKey: ["commerce", actorId, "payments", id],
    queryFn: () => commerceApi.payments(id!),
    enabled: !!id,
  });
  const action = useMutation({
    mutationFn: (command: "cash" | "zalopay" | "cancel" | "refund") =>
      command === "refund"
        ? commerceApi.refund(id!, reason)
        : commerceApi[command](id!),
    onSuccess: () => {
      setCashConfirmation(false);
      void refresh();
    },
  });
  const invoice = detail.data;
  const checkout = history.data?.find(
    (p) =>
      p.method === "ZALOPAY" &&
      ["PENDING", "PROCESSING"].includes(p.status) &&
      p.checkout_url,
  );
  return (
    <Dialog open={!!id} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết hóa đơn</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {detail.isPending && <CircularProgress />}
          {detail.isError && (
            <Alert severity="error">{errorText(detail.error)}</Alert>
          )}
          {action.isError && (
            <Alert severity="error">{errorText(action.error)}</Alert>
          )}
          {invoice && (
            <>
              <Typography>{invoice.invoice_number}</Typography>
              <State value={invoice.status} />
              <Typography>Tổng tiền: {money(invoice.total_amount)}</Typography>
              {invoice.items?.map((item) => (
                <Typography key={item.id}>
                  {item.description} · {item.quantity} ×{" "}
                  {money(item.unit_price)} = {money(item.line_total)}
                </Typography>
              ))}
              {invoice.dispensing && (
                <Typography>
                  Nhà thuốc: {labels[invoice.dispensing.status]}
                </Typography>
              )}
              {invoice.status === "PENDING_PAYMENT" && (
                <>
                  <Alert severity="info">
                    Thuốc được giữ trong 15 phút. Nếu quá hạn, hệ thống sẽ kiểm
                    tra lại tồn kho. Kết quả thanh toán được xác nhận bởi
                    backend.
                  </Alert>
                  <Button
                    disabled={action.isPending}
                    onClick={() => action.mutate("zalopay")}
                  >
                    Tạo / xem thanh toán ZaloPay
                  </Button>
                  {checkout?.checkout_url && (
                    <Button
                      href={checkout.checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                    >
                      Mở ZaloPay để thanh toán / xem QR
                    </Button>
                  )}
                  {invoice.purchase_channel === "COUNTER" &&
                    capabilities.data?.cash && (
                      <>
                        <Button
                          disabled={action.isPending}
                          onClick={() => setCashConfirmation(true)}
                        >
                          Xác nhận thu tiền mặt
                        </Button>
                        {cashConfirmation && (
                          <Alert
                            severity="warning"
                            action={
                              <Button
                                disabled={action.isPending}
                                onClick={() => action.mutate("cash")}
                              >
                                Đã thu đủ
                              </Button>
                            }
                          >
                            Xác nhận đã nhận đủ {money(invoice.total_amount)}{" "}
                            tiền mặt?
                          </Alert>
                        )}
                      </>
                    )}
                  <Button
                    disabled={action.isPending}
                    onClick={() => action.mutate("cancel")}
                  >
                    Hủy hóa đơn chưa thanh toán
                  </Button>
                </>
              )}
              {invoice.status === "PAID" &&
                invoice.dispensing?.status !== "DISPENSED" && (
                  <>
                    <TextField
                      label="Lý do yêu cầu hoàn tiền"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 500 } }}
                    />
                    <Button
                      disabled={action.isPending || !reason.trim()}
                      onClick={() => action.mutate("refund")}
                    >
                      Yêu cầu hoàn tiền trước bàn giao
                    </Button>
                  </>
                )}
              <Divider />
              <Typography variant="h6">Lịch sử giao dịch</Typography>
              {history.isError && (
                <Alert severity="error">{errorText(history.error)}</Alert>
              )}
              {history.data?.map((payment) => (
                <Typography key={payment.id}>
                  {payment.method} · {money(payment.amount)} ·{" "}
                  {labels[payment.status] || payment.status}
                </Typography>
              ))}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

const priceSchema = z.object({
  medicineId: z.string().uuid("Mã thuốc phải là UUID"),
  sellingPrice: z.number().int().positive().max(999999999999),
});
function PriceForm() {
  const medicines = useQuery({
    queryKey: ["commerce", "medicine-options"],
    queryFn: commerceApi.medicines,
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof priceSchema>>({
    resolver: zodResolver(priceSchema),
  });
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof priceSchema>) =>
      commerceApi.price(data.medicineId, data.sellingPrice),
  });
  return (
    <Stack
      component="form"
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      spacing={2}
    >
      <Typography variant="h6">Giá bán thuốc</Typography>
      <Autocomplete
        options={medicines.data || []}
        getOptionLabel={(medicine) => medicine.name}
        onChange={(_, medicine) =>
          setValue("medicineId", medicine?.id || "", { shouldValidate: true })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Thuốc cần cập nhật giá"
            error={!!errors.medicineId}
            helperText={errors.medicineId?.message}
          />
        )}
      />
      {medicines.isError && (
        <Alert severity="error">{errorText(medicines.error)}</Alert>
      )}
      <TextField
        label="Giá bán VND"
        type="number"
        {...register("sellingPrice", { valueAsNumber: true })}
        error={!!errors.sellingPrice}
        helperText={errors.sellingPrice?.message}
      />
      <Button type="submit" disabled={mutation.isPending}>
        Lưu giá bán
      </Button>
      {mutation.isSuccess && (
        <Alert severity="success">Đã cập nhật giá bán.</Alert>
      )}
      {mutation.isError && (
        <Alert severity="error">{errorText(mutation.error)}</Alert>
      )}
    </Stack>
  );
}

export function CommerceInvoicesPage({
  initialTab = 0,
  initialInvoiceId,
}: {
  initialTab?: number;
  initialInvoiceId?: string;
}) {
  const user = useAuthStore((s) => s.user);
  const actorId = user?.id;
  const isDemoMode = false;
  const staff = true;
  const patientId = undefined;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const savedTab = searchParams.get("tab");
  const tab =
    savedTab !== null && /^[0-4]$/.test(savedTab)
      ? Number(savedTab)
      : initialTab;
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<string | null>(initialInvoiceId || null);
  const refresh = useRefresh();
  const caps = useQuery({
    queryKey: ["commerce", actorId, "capabilities"],
    queryFn: commerceApi.capabilities,
    enabled: !isDemoMode,
  });
  const invoices = useQuery({
    queryKey: ["commerce", actorId, "invoices", patientId, page, search],
    queryFn: () =>
      commerceApi.invoices({ patientId, page, search: search || undefined }),
    // Keep inactive tabs from requesting data. Returning to this tab reuses
    // the cache for the same queryKey.
    enabled: tab === 0 && !isDemoMode && (staff || !!patientId),
  });
  const refunds = useQuery({
    queryKey: ["commerce", actorId, "refunds"],
    queryFn: commerceApi.refunds,
    enabled: tab === 2 && !!caps.data?.refund && !isDemoMode,
  });
  const refund = useMutation({
    mutationFn: commerceApi.confirmRefund,
    onSuccess: () => void refresh(),
  });
  if (isDemoMode)
    return (
      <Alert severity="info">
        Thanh toán chỉ khả dụng khi đăng nhập hệ thống phòng khám.
      </Alert>
    );
  if (caps.isPending) return <CircularProgress />;
  if (caps.isError)
    return <Alert severity="error">{errorText(caps.error)}</Alert>;
  if (initialTab === 1 && !caps.data.pharmacyRead)
    return <Alert severity="error">Không có quyền xem nhà thuốc.</Alert>;
  return (
    <div className="space-y-4">
      <Stack spacing={2}>
        <PageHeader
          title="Hóa đơn"
          subtitle="Quản lý hóa đơn và thanh toán"
          breadcrumbs={[
            { label: "Trang chủ", href: "/dashboard" },
            { label: "Hóa đơn" },
          ]}
          action={
            caps.data?.invoiceCreate ? (
              <Button
                variant="contained"
                onClick={() => navigate("/invoices/new")}
              >
                Tạo hóa đơn
              </Button>
            ) : undefined
          }
        />
        <Tabs
          value={tab}
          onChange={(_, value) => {
            setSearchParams((params) => {
              params.set("tab", String(value));
              return params;
            });
            setPage(1);
          }}
        >
          <Tab label="Hóa đơn" />
          {caps.data?.pharmacyRead && <Tab value={1} label="Nhà thuốc" />}
          {caps.data?.refund && <Tab value={2} label="Hoàn tiền" />}
          {caps.data?.price && <Tab value={3} label="Giá bán" />}
          {staff && <Tab value={4} label="Chứng từ / Excel" />}
        </Tabs>
        {tab === 0 && (
          <>
            <TextField
              label="Tìm hóa đơn / tên người mua"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {invoices.isFetching && <CircularProgress size={20} />}
            {invoices.isError && (
              <Alert severity="error">{errorText(invoices.error)}</Alert>
            )}
            <DataTable<PurchaseInvoice>
              columns={[
                {
                  id: "invoice_number",
                  label: "Mã hóa đơn",
                  render: (row) => (
                    <span className="font-mono text-xs font-bold text-sky-700">
                      {row.invoice_number}
                    </span>
                  ),
                },
                {
                  id: "buyer_name",
                  label: "Người mua",
                  render: (row) => (
                    <span className="font-semibold ">
                      {row.buyer_name}
                    </span>
                  ),
                },
                {
                  id: "total_amount",
                  label: "Tổng tiền",
                  align: "right",
                  render: (row) => (
                    <span className="font-bold tabular-nums ">
                      {money(row.total_amount)}
                    </span>
                  ),
                },
                {
                  id: "status",
                  label: "Trạng thái",
                  render: (row) => <State value={row.status} />,
                },
                {
                  id: "actions",
                  label: "Thao tác",
                  align: "right",
                  render: (row) => (
                    <Button size="small" onClick={() => setSelected(row.id)}>
                      Chi tiết / thanh toán
                    </Button>
                  ),
                },
              ]}
              rows={invoices.data?.data || []}
              loading={invoices.isPending}
              emptyTitle="Chưa có hóa đơn nào"
              emptyDescription="Hóa đơn sẽ hiển thị khi bệnh nhân xác nhận mua thuốc."
              getRowId={(row) => row.id}
            />
            <Pagination
              page={page}
              count={Math.max(1, invoices.data?.pagination.totalPages || 1)}
              onChange={(_, p) => setPage(p)}
            />
          </>
        )}
        {tab === 1 && caps.data?.pharmacyRead && <PharmacyDashboard />}
        {tab === 2 && (
          <>
            {refunds.isError && (
              <Alert severity="error">{errorText(refunds.error)}</Alert>
            )}
            {refund.isError && (
              <Alert severity="error">{errorText(refund.error)}</Alert>
            )}
            {refunds.data?.map((r) => (
              <Paper key={r.id} sx={{ p: 2 }}>
                <Typography>
                  {r.invoice_id} · {money(r.amount)} · {r.reason}
                </Typography>
                <Button
                  disabled={refund.isPending}
                  onClick={() => refund.mutate(r.id)}
                >
                  {r.method === "CASH"
                    ? "Xác nhận đã trả tiền mặt"
                    : "Gửi / kiểm tra hoàn tiền ZaloPay"}
                </Button>
              </Paper>
            ))}
          </>
        )}
        {tab === 3 && caps.data?.price && <PriceForm />}
        {tab === 4 && staff && <InvoicesPage />}
      </Stack>
      <InvoiceDialog
        key={selected}
        id={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

export function InvoicePaymentPage() {
  const { id } = useParams();
  return <CommerceInvoicesPage key={id} initialInvoiceId={id} />;
}
