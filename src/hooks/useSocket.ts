import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { connectSocket } from "@/services/socketService";

export function useAppSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) return;
    const instance = connectSocket({ token });
    setSocket(instance);
    // Connection lifetime belongs to the app, not this local booking form.
  }, []);
  return socket;
}
