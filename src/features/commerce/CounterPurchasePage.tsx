import { PageHeader } from "@/components/common/PageHeader";
import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/axios";
import {
  commerceApi,
  type PurchasePrescription,
} from "@/api/endpoints/commerce.api";
import { useAuthStore } from "@/stores/auth.store";
import { isAxiosError } from "axios";

type PatientOption = { id: string; fullName: string; patientCode?: string };
export function CounterPurchasePage() {
  const actorId = useAuthStore((s) => s.user?.id);
  const navigate = useNavigate();
  const [search, setSearch] = useState(""),
    [patient, setPatient] = useState<PatientOption | null>(null),
    [prescription, setPrescription] = useState<PurchasePrescription | null>(
      null,
    ),
    [confirmed, setConfirmed] = useState(false);
  const capabilities = useQuery({
    queryKey: ["commerce", actorId, "capabilities"],
    queryFn: commerceApi.capabilities,
  });
  const patients = useQuery({
    queryKey: ["commerce", actorId, "patient-options", search],
    queryFn: async () => {
      const r = await api.get("/patients", {
        params: { page: 1, limit: 20, search: search || undefined },
      });
      const value = r.data.data;
      return (
        Array.isArray(value) ? value : value?.data || []
      ) as PatientOption[];
    },
    enabled: !!capabilities.data?.invoiceCreate,
  });
  const prescriptions = useQuery({
    queryKey: ["commerce", actorId, "purchase-prescriptions", patient?.id],
    queryFn: () => commerceApi.prescriptions(patient!.id),
    enabled: !!patient && !!capabilities.data?.invoiceCreate,
  });
  const purchase = useMutation({
    mutationFn: () => commerceApi.purchase(prescription!.id, "COUNTER"),
    onSuccess: (invoice) => navigate(`/invoices/${invoice.id}`),
  });
  const error = patients.error || prescriptions.error || purchase.error;
  if (capabilities.isPending) return <CircularProgress />;
  if (capabilities.isError || !capabilities.data?.invoiceCreate)
    return <Alert severity="error">Không có quyền tạo hóa đơn tại quầy.</Alert>;
  return (
    <div className="space-y-4">
      <PageHeader
        title="Tạo hóa đơn"
        subtitle="Mua thuốc tại quầy"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Hóa đơn", href: "/invoices" },
          { label: "Tạo hóa đơn" },
        ]}
      />
      <Paper
        className="rounded-xl border border-slate-200 bg-white"
        sx={{ p: 3 }}
      >
        <Stack spacing={2}>
          <Typography variant="h5">Mua thuốc tại quầy</Typography>
          <Typography>
            Chỉ tạo hóa đơn khi bệnh nhân xác nhận mua toàn bộ đơn. Giá bán và
            tồn kho được kiểm tra từ hệ thống.
          </Typography>
          {error && (
            <Alert severity="error">
              {isAxiosError(error)
                ? error.response?.data?.message ||
                  "Không thể tải thông tin mua thuốc."
                : String(error)}
            </Alert>
          )}
          <Autocomplete
            options={patients.data || []}
            filterOptions={(options) => options}
            value={patient}
            getOptionLabel={(p) =>
              `${p.fullName}${p.patientCode ? ` · ${p.patientCode}` : ""}`
            }
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onInputChange={(_, value) => setSearch(value)}
            onChange={(_, value) => {
              setPatient(value);
              setPrescription(null);
              setConfirmed(false);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Tìm bệnh nhân theo tên / mã" />
            )}
          />
          <Autocomplete
            options={
              prescriptions.data?.data.filter((p) => p.status === "ISSUED") ||
              []
            }
            value={prescription}
            getOptionLabel={(p) =>
              `Đơn ngày ${p.issuedAt ? new Date(p.issuedAt).toLocaleDateString("vi-VN") : "—"} · ${p.id.slice(0, 8)}`
            }
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, value) => {
              setPrescription(value);
              setConfirmed(false);
            }}
            disabled={!patient}
            renderInput={(params) => (
              <TextField {...params} label="Đơn thuốc đã phát hành" />
            )}
          />
          {prescription?.items.map((item) => (
            <Typography key={item.id}>
              {item.medicine.name} · {item.quantity} {item.medicine.unit} ·{" "}
              {item.dosage}, {item.frequency}, {item.duration}
            </Typography>
          ))}
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
            }
            label="Bệnh nhân đã xác nhận mua toàn bộ đơn thuốc"
          />
          <Button
            variant="contained"
            disabled={!prescription || !confirmed || purchase.isPending}
            onClick={() => purchase.mutate()}
          >
            Tạo hóa đơn chờ thanh toán
          </Button>
          <Button onClick={() => navigate("/invoices")}>
            Quay lại hóa đơn
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}
