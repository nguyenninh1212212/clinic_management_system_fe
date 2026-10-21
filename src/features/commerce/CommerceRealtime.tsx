import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "@/services/socketService";
import { useAuthStore } from "@/stores/auth.store";

export function CommerceRealtime() {
  const token = useAuthStore((s) => s.accessToken);
  const actorId = useAuthStore((s) => s.user?.id);
  const client = useQueryClient();
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
    const onConnect = () => refresh();
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
    return () => {
      for (const name of names) socket.off(name, refresh);
      socket.off("connect", onConnect);
      if (useAuthStore.getState().accessToken !== token) disconnectSocket();
    };
  }, [token, actorId, client]);
  return null;
}
