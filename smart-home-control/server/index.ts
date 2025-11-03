import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // WebSocket signaling for WebRTC video calls
  const rooms = new Map<string, Set<any>>();
  
  wss.on('connection', (ws) => {
    console.log('[WebSocket] New connection established');
    let currentRoom: string | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('[WebSocket] Received message:', data.type, 'from room:', currentRoom);
        
        switch (data.type) {
          case 'register':
            currentRoom = data.roomId;
            console.log('[WebSocket] Registering room:', currentRoom);
            if (currentRoom && !rooms.has(currentRoom)) {
              rooms.set(currentRoom, new Set());
            }
            if (currentRoom) {
              rooms.get(currentRoom)!.add(ws);
              ws.send(JSON.stringify({ type: 'registered', roomId: currentRoom }));
              console.log('[WebSocket] Room registered:', currentRoom, 'Total rooms:', rooms.size);
            }
            break;
            
          case 'call':
            const targetRoom = data.targetRoom;
            console.log('[WebSocket] Call from', currentRoom, 'to', targetRoom);
            console.log('[WebSocket] Target room exists:', rooms.has(targetRoom));
            if (rooms.has(targetRoom)) {
              const clients = rooms.get(targetRoom)!;
              console.log('[WebSocket] Clients in target room:', clients.size);
              rooms.get(targetRoom)!.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                  console.log('[WebSocket] Sending incoming-call to target room');
                  client.send(JSON.stringify({
                    type: 'incoming-call',
                    from: currentRoom,
                    offer: data.offer
                  }));
                }
              });
            }
            break;
            
          case 'answer':
            if (rooms.has(data.targetRoom)) {
              rooms.get(data.targetRoom)!.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: 'call-answered',
                    from: currentRoom,
                    answer: data.answer
                  }));
                }
              });
            }
            break;
            
          case 'ice-candidate':
            if (rooms.has(data.targetRoom)) {
              rooms.get(data.targetRoom)!.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: 'ice-candidate',
                    from: currentRoom,
                    candidate: data.candidate
                  }));
                }
              });
            }
            break;
            
          case 'hang-up':
            if (rooms.has(data.targetRoom)) {
              rooms.get(data.targetRoom)!.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: 'call-ended',
                    from: currentRoom
                  }));
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (currentRoom && rooms.has(currentRoom)) {
        rooms.get(currentRoom)!.delete(ws);
        if (rooms.get(currentRoom)!.size === 0) {
          rooms.delete(currentRoom);
        }
      }
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  httpServer.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
