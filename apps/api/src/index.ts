import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { Server as SocketIOServer } from "socket.io";

import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { createContext, Context } from "./graphql/context.js";
import { setupSocketHandlers } from "./socket/index.js";
import { prisma } from "./lib/prisma.js";
import { redis } from "./lib/redis.js";

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

async function main() {
  const app = express();
  const httpServer = createServer(app);

  // Socket.IO setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  setupSocketHandlers(io);

  // Apollo Server setup
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // Middleware
  app.use(
    "/graphql",
    cors<cors.CorsRequest>({ origin: CORS_ORIGIN }),
    express.json(),
    expressMiddleware(server, {
      context: createContext,
    })
  );

  // Health check
  app.get("/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🔌 WebSocket server ready`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await server.stop();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
