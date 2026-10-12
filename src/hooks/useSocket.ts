import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { connectSocket } from "@/services/socketService";

export function useAppSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      console.error("[Socket] Không tìm thấy access token");
      return;
    }

    const socketInstance = connectSocket({ token });
    socketInstance.on("connect", () => {
      console.log("[Socket] Kết nối thành công:", socketInstance.id);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[Socket] Kết nối thất bại:", error.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("[Socket] Đã ngắt kết nối:", reason);
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
}
