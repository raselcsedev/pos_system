/**
 * Socket.IO server for real-time POS updates.
 * Run: npx tsx server/socket-server.ts
 */
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = Number(process.env.SOCKET_PORT ?? 3001);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000" },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-branch", (branchId: string) => {
    socket.join(`branch:${branchId}`);
  });

  socket.on("sale-completed", (data) => {
    socket.broadcast.emit("sale:new", data);
  });

  socket.on("stock-updated", (data) => {
    io.emit("inventory:update", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
