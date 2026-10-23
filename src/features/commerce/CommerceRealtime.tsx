import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "@/services/socketService";
import { useAuthStore } from "@/stores/auth.store";

export function CommerceRealtime() {
  const token = useAuthStore((s) => s.accessToken);
  const actorId = useAuthStore((s) => s.user?.id);
  const client = useQueryClient();
  const [notice, setNotice] = useState<{
    id?: number;
    title?: string;
    message: string;
    actorId: string;
  } | null>(null);
  useEffect(() => {
    if (!token || !actorId) return;
    const socket = connectSocket({ token });
    const seen = new Set<string>();
    const refresh = (payload?: { eventId?: string }) => {
      if (useAuthStore.getState().user?.id !== actorId) return;
      if (payload?.eventId && seen.has(payload.eventId)) return;
      if (payload?.eventId) seen.add(payload.eventId);
      if (seen.size > 1000) seen.clear();
      void client.invalidateQueries({ queryKey: ["commerce", actorId] });
    };
    const onNotification = (payload: {
      id?: number;
      title?: string;
      message?: string;
      type?: string;
    }) => {
      if (useAuthStore.getState().user?.id !== actorId) return;
      void client.invalidateQueries({ queryKey: ["notifications"] });
      if (payload.type === "APPOINTMENT")
        void client.invalidateQueries({ queryKey: ["appointments"] });
      if (payload.type === "PHARMACY") refresh();
      if (payload.message)
        setNotice({ ...payload, message: payload.message, actorId });
    };
    const onConnect = () => {
      refresh();
      void client.invalidateQueries({ queryKey: ["notifications"] });
      void client.invalidateQueries({ queryKey: ["appointments"] });
    };
    const names = [
      "INVOICE.CREATED",
      "INVOICE.PAID",
      "INVOICE.CANCELLED",
      "PHARMACY.DISPENSING_REQUESTED",
      "PHARMACY.DISPENSING_READY",
      "PHARMACY.DISPENSING_COMPLETED",
    ];
    for (const name of names) socket.on(name, refresh);
    socket.on("connect", onConnect);
    socket.on("notification", onNotification);
    return () => {
      for (const name of names) socket.off(name, refresh);
      socket.off("connect", onConnect);
      socket.off("notification", onNotification);
      if (useAuthStore.getState().accessToken !== token) disconnectSocket();
    };
  }, [token, actorId, client]);
  return (
    <Snackbar
      open={Boolean(notice && notice.actorId === actorId)}
      autoHideDuration={7000}
      onClose={() => setNotice(null)}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        severity="info"
        variant="filled"
        onClose={() => setNotice(null)}
        sx={{ maxWidth: 420 }}
      >
        {notice?.title && <AlertTitle>{notice.title}</AlertTitle>}
        {notice?.message}
      </Alert>
    </Snackbar>
  );
}
