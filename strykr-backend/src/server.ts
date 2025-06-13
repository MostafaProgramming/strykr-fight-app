// =============================================
// 🔄 src/server.ts - WebSocket Integration
// =============================================

import express from "express";
import { createServer } from "http";
import { SocketConfig } from "./config/socket";
import { SocketHandler } from "./realtime/socket.handler";

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
const socketConfig = new SocketConfig(httpServer);
const socketHandler = new SocketHandler(socketConfig);

// Export for use in other parts of the app
export { socketConfig };

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔄 WebSocket server ready`);
});
