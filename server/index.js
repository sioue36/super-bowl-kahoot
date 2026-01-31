import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  // same origin when served via Express/ngrok, so no CORS needed
});

const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

//===============================================

const Phase = {
  BeforeStart: "BeforeStart",
  PickOutcome: "PickOutcome",
  SeeWhoPickWhat: "SeeWhoPickWhat",
};

const usernames = new Set();
let host = null;

let gameState = {
  phase: Phase.BeforeStart,
  round: 1,
  // later: picks, scores, timer, etc.
};

function broadcastState(io) {
  io.emit("server:state", gameState);
}

function setPhase(io, nextPhase) {
  gameState = { ...gameState, phase: nextPhase };
  broadcastState(io);
}

io.on("connection", (socket) => {
  socket.emit("server:state", gameState);

  socket.on("client:login", ({ username, isHost }) => {
    if (!username || typeof username !== "string") return;

    username = username.trim();
    if (!username) return;

    if (usernames.has(username) == false) {
      console.log("New user logged in:", username);
      usernames.add(username);

      io.emit("server:new-user", Array.from(usernames));
    } else {
      console.log("Current users (no one added):", Array.from(usernames));
    }
    if (isHost) {
      console.log("Host set to:", username);
      io.emit("server:new-host", username);
    }

    socket.emit("server:state", gameState);
  });

  socket.on("host:start", () => {
    setPhase(io, Phase.PickOutcome);
  });

  socket.on("host:lock-picks", () => {
    setPhase(io, Phase.SeeWhoPickWhat);
  });

  // example of "every message includes username"
  //   socket.on("client:ping", (payload = {}) => {
  //     console.log("ping user : ", payload.username);

  //     let username = payload.username;
  //     if (!username) return;
  //     // do something...
  //     socket.emit("server:pong", { ok: true, username });
  //   });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
