"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

export function useSocket(branchId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!url) return;

    const socket = io(url, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (branchId) socket.emit("join-branch", branchId);
    });

    return () => {
      socket.disconnect();
    };
  }, [branchId]);

  return socketRef;
}
