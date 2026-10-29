import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { commerceApi, type Dispensing } from "@/api/endpoints/commerce.api";
import { useAuthStore } from "@/stores/auth.store";
import { connectSocket } from "@/services/socketService";
import { ConnectionStatus } from "../components/ConnectionStatus";
import type { PharmacySocketStatus } from "@/types";

const statusText: Record<Dispensing["status"], string> = {
  PENDING: "Đơn mới",
  PREPARING: "Đang chuẩn bị",
  READY: "Sẵn sàng",
  DISPENSED: "Đã giao",
  CANCELLED: "Đã hủy",
};
const statusStyle: Record<Dispensing["status"], string> = {
  PENDING: "bg-sky-50 text-sky-700 border-sky-200",
  PREPARING: "bg-amber-50 text-amber-700 border-amber-200",
  READY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DISPENSED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};
const nextAction = {
  PENDING: "prepare",
  PREPARING: "ready",
  READY: "complete",
} as const;
const actionText = {
  PENDING: "Bắt đầu chuẩn bị",
  PREPARING: "Đã chuẩn bị xong",
  READY: "Xác nhận đã giao thuốc",
};
const errorText = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;
  return message || "Không thể xử lý yêu cầu cấp phát. Vui lòng thử lại.";
};
export function PharmacyDashboard() {
  const actorId = useAuthStore((s) => s.user?.id);
  const token = useAuthStore((s) => s.accessToken);
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [socketStatus, setSocketStatus] =
    useState<PharmacySocketStatus>("disconnected");
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const previous = useRef<Set<string> | null>(null);
  const caps = useQuery({
    queryKey: ["commerce", actorId, "capabilities"],
    queryFn: commerceApi.capabilities,
  });
  const query = useQuery({
    queryKey: ["commerce", actorId, "dispensings", page],
    queryFn: () => commerceApi.dispensings(page),
    enabled: !!caps.data?.pharmacyRead,
    refetchInterval: 10000,
  });
  useEffect(() => {
    if (!token) return;
    const socket = connectSocket({ token });
    const connected = () => setSocketStatus("connected");
    const disconnected = () => setSocketStatus("disconnected");
    setSocketStatus(socket.connected ? "connected" : "connecting");
    socket.on("connect", connected);
    socket.on("disconnect", disconnected);
    socket.on("connect_error", disconnected);
    return () => {
      socket.off("connect", connected);
      socket.off("disconnect", disconnected);
      socket.off("connect_error", disconnected);
    };
  }, [token]);
  useEffect(() => {
    previous.current = null;
    setHighlightedIds(new Set());
    setSelectedId(null);
  }, [page, actorId]);
  useEffect(() => {
    if (!query.data) return;
    const added = previous.current
      ? query.data.filter((d) => !previous.current!.has(d.id))
      : [];
    previous.current = new Set(query.data.map((d) => d.id));
    if (!added.length) return;
    setHighlightedIds(new Set(added.map((d) => d.id)));
    if (soundEnabled && added.some((d) => d.status === "PENDING")) {
      try {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.frequency.value = 880;
        gain.gain.value = 0.04;
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.onended = () => {
          void audio.close();
        };
        oscillator.start();
        oscillator.stop(audio.currentTime + 0.14);
      } catch {
        /* Browser audio may require a user gesture. */
      }
    }
    const timer = window.setTimeout(() => setHighlightedIds(new Set()), 5000);
    return () => window.clearTimeout(timer);
  }, [query.data, soundEnabled]);
  const move = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "prepare" | "ready" | "complete";
    }) => commerceApi.move(id, action),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["commerce", actorId] }),
  });
  const selected = query.data?.find((d) => d.id === selectedId);
  const visible = useMemo(
    () =>
      (query.data || []).filter(
        (d) =>
          (!search.trim() ||
            `${d.buyer_name} ${d.invoice_number}`
              .toLowerCase()
              .includes(search.trim().toLowerCase())) &&
          (!filter || d.status === filter) &&
          (!date || dayjs(d.created_at).format("YYYY-MM-DD") === date),
      ),
    [query.data, search, filter, date],
  );
  if (caps.isPending) return <CircularProgress />;
  if (caps.isError)
    return <Alert severity="error">{errorText(caps.error)}</Alert>;
  if (!caps.data.pharmacyRead)
    return <Alert severity="error">Không có quyền xem nhà thuốc.</Alert>;
  return (
    <div className="space-y-4">
      <PageHeader
        action={<div className="flex flex-wrap items-center justify-end gap-2">
          <ConnectionStatus status={socketStatus} />
          <Button
            size="small"
            variant={soundEnabled ? "contained" : "outlined"}
            startIcon={soundEnabled ? (
              <VolumeUpOutlinedIcon />
            ) : (
              <VolumeOffOutlinedIcon />
            )}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          </Button>
        </div>} title={""}      />
      {socketStatus === "disconnected" && (
        <Alert severity="warning">
          Mất kết nối realtime. Hệ thống sẽ tự đồng bộ khi kết nối lại.
        </Alert>
      )}
      {query.isError && (
        <Alert severity="error">{errorText(query.error)}</Alert>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["PENDING", "PREPARING", "READY", "open"] as const).map(
          (status, i) => (
            <div
              key={status}
              className={`rounded-xl border p-4 ${["border-sky-200 bg-sky-50 text-sky-900", "border-amber-200 bg-amber-50 text-amber-900", "border-emerald-200 bg-emerald-50 text-emerald-900", "border-slate-200 bg-white "][i]}`}
            >
              <div className="text-xs">
                {status === "open" ? "Tổng hàng đợi" : statusText[status]}
              </div>
              <div className="mt-1 text-2xl font-bold">
                {query.data?.filter((d) =>
                  status === "open"
                    ? ["PENDING", "PREPARING", "READY"].includes(d.status)
                    : d.status === status,
                ).length || 0}
              </div>
            </div>
          ),
        )}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <TextField
            size="small"
            label="Tìm bệnh nhân / mã hóa đơn"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            size="small"
            displayEmpty
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            inputProps={{ "aria-label": "Trạng thái" }}
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            {Object.entries(statusText).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            size="small"
            type="date"
            label="Ngày yêu cầu"
            slotProps={{ inputLabel: { shrink: true } }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="lg:ml-auto text-xs text-slate-500">
            Hiển thị {visible.length} đơn trên trang {page}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LocalPharmacyOutlinedIcon className="text-sky-600" />
        <h2 className="text-lg font-bold ">Hàng đợi đơn thuốc</h2>
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
          Realtime
        </span>
      </div>
      {query.isPending ? (
        <CircularProgress />
      ) : !visible.length ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          Chưa có đơn thuốc phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {visible.map((d) => (
            <article
              key={d.id}
              className={`rounded-xl border bg-white p-4 shadow-sm ${highlightedIds.has(d.id) ? "border-sky-400 ring-2 ring-sky-100" : "border-slate-200 hover:border-sky-300"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold ">
                    {d.buyer_name || "Bệnh nhân"}
                  </h3>
                  <div className="mt-1 text-xs text-slate-500">
                    {d.invoice_number} ·{" "}
                    {dayjs(d.created_at).format("HH:mm DD/MM/YYYY")}
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusStyle[d.status]}`}
                >
                  {statusText[d.status]}
                </span>
              </div>
              <div className="mt-4 divide-y divide-slate-100 rounded-lg bg-slate-50">
                {d.items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between px-3 py-2.5 text-sm"
                  >
                    <span className="font-semibold ">
                      {item.name}
                    </span>
                    <span className="font-bold tabular-nums">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedId(d.id);
                    move.reset();
                  }}
                >
                  Xem chi tiết
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Số lượng và bộ lọc áp dụng cho trang hiện tại.</span>
        <Pagination
          page={page}
          count={page + ((query.data?.length || 0) === 20 ? 1 : 0)}
          onChange={(_, value) => setPage(value)}
        />
      </div>
      <Drawer
        anchor="right"
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
      >
        <div className="w-screen max-w-xl space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold ">
                Chi tiết đơn thuốc
              </h2>
              <div className="text-xs text-slate-500">
                {selected?.invoice_number}
              </div>
            </div>
            <IconButton aria-label="Đóng" onClick={() => setSelectedId(null)}>
              <CloseIcon />
            </IconButton>
          </div>
          {selected ? (
            <>
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Bệnh nhân</div>
                <div className="mt-1 text-lg font-bold text-slate-800">
                  {selected.buyer_name}
                </div>
              </div>
              <span
                className={`inline-block rounded-full border px-2 py-1 text-xs ${statusStyle[selected.status]}`}
              >
                {statusText[selected.status]}
              </span>
              <h3 className="font-bold">Danh sách thuốc</h3>
              {selected.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between rounded-lg border border-slate-200 p-3"
                >
                  <span>{item.name}</span>
                  <strong>x{item.quantity}</strong>
                </div>
              ))}
              {move.isError && (
                <Alert severity="error">{errorText(move.error)}</Alert>
              )}
              {caps.data.pharmacyWrite && selected.status in nextAction && (
                <Button
                  fullWidth
                  variant="contained"
                  disabled={move.isPending}
                  onClick={() =>
                    move.mutate({
                      id: selected.id,
                      action:
                        nextAction[selected.status as keyof typeof nextAction],
                    })
                  }
                >
                  {actionText[selected.status as keyof typeof actionText]}
                </Button>
              )}
            </>
          ) : (
            <Alert severity="info">
              Yêu cầu không còn trong danh sách. Vui lòng tải lại.
            </Alert>
          )}
        </div>
      </Drawer>
    </div>
  );
}
