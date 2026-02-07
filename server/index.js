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

let gameState = {
  phase: Phase.BeforeStart,
  round: 1,
  hostName: null,
  usernames: [],
  pickTable: {},
  whoPickedThisRound: [],
  scores: {},
  streaks: {},
};

function updateStreakForUser(username, correct) {
  let previousStreak = gameState.streaks[username];
  if (correct) {
    if (previousStreak < 0) {
      gameState.streaks[username] = 1;
    } else {
      gameState.streaks[username] += 1;
    }
  } else {
    if (previousStreak > 0) {
      gameState.streaks[username] = -1;
    } else {
      gameState.streaks[username] -= 1;
    }
  }
}

function broadcastState(io) {
  io.emit("server:state", gameState);
}

io.on("connection", (socket) => {
  socket.emit("server:state", gameState);

  socket.on("client:login", ({ username, isHost }) => {
    if (!username || typeof username !== "string") return;

    username = username.trim();
    if (!username) return;

    if (!gameState.usernames.includes(username)) {
      console.log("New user logged in:", username);
      // Add to the list of usernames
      gameState.usernames.push(username);
      // Initialize pickTable entry for the new user
      gameState.pickTable[username] ??= [];
      // Initialize scores entry for the new user
      gameState.scores[username] ??= 0;
      // Initialize streaks entry for the new user
      gameState.streaks[username] ??= 0;
    } else {
      console.log("Current users (no one added):", gameState.usernames);
    }
    if (isHost) {
      console.log("Host set to:", username);
      gameState.hostName = username;
    }

    broadcastState(io);
  });

  socket.on("host:start", () => {
    gameState.phase = Phase.PickOutcome;
    broadcastState(io);
  });

  socket.on("client:pick", (payload = {}) => {
    console.log("Received pick from client:", payload);
    const { outcome, username } = payload;
    if (!username || !outcome) return;
    console.log(`User ${username} picked outcome: ${outcome}`);

    while (gameState.pickTable[username].length < gameState.round - 1) {
      // Fill in missing rounds with null picks
      gameState.pickTable[username].push({ outcome: null });
    }

    if (gameState.pickTable[username].length == gameState.round - 1) {
      gameState.pickTable[username].push({ outcome });
    }

    if (gameState.pickTable[username].length == gameState.round) {
      //replace the pick for the current round
      gameState.pickTable[username][gameState.round - 1] = { outcome };
    }

    if (!gameState.whoPickedThisRound.includes(username)) {
      gameState.whoPickedThisRound.push(username);
    }

    console.log(
      "Picks for",
      username,
      "in round",
      gameState.round,
      ":",
      gameState.pickTable[username],
    );

    broadcastState(io);
  });

  socket.on("host:lock-picks", () => {
    gameState.phase = Phase.SeeWhoPickWhat;

    //logging for debugging
    for (let user of gameState.usernames) {
      console.log("Picks for user:", user);
      let picks = gameState.pickTable[user];
      for (let i = 0; i < picks.length; i++) {
        console.log("  Round", i + 1, "picks:", picks[i]);
      }
    }

    broadcastState(io);
  });

  socket.on("host:outcome", (payload = {}) => {
    const { outcome } = payload;
    if (!outcome) return;

    let rightUsers = [];
    let wrongUsers = [];

    // who got it right this round? and who got it wrong?
    for (let user of gameState.usernames) {
      let lastPick = gameState.pickTable[user][gameState.round - 1];
      if (lastPick && lastPick.outcome === outcome) {
        lastPick.correct = true;
        rightUsers.push(user);
        updateStreakForUser(user, true);
      } else if (lastPick) {
        lastPick.correct = false;
        wrongUsers.push(user);
        updateStreakForUser(user, false);
      }
    }

    let goodAnswerCount = rightUsers.length;
    let badAnswerCount = wrongUsers.length;
    let pointsPerRightAnswer = (badAnswerCount / goodAnswerCount) * 10 || 0;

    // puntPct = 0.35;
    // 1;
    // touchdownPct = 0.22;
    // 0.66;
    // fieldGoalPct = 0.16;
    // 50;
    // turnoverPct = 0.17;
    // 50;
    // endofTimePct = 0.7;

    // assign points
    for (let user of rightUsers) {
      let streak = gameState.streaks[user];
      let multiplicator = 1 + Math.max(0, streak - 1) * 0.25;
      let pointsEarned = Math.round(pointsPerRightAnswer * multiplicator);
      gameState.scores[user] += pointsEarned;

      let lastPick = gameState.pickTable[user][gameState.round - 1];
      lastPick.pointsEarned = pointsEarned;
      lastPick.bonusPct = (multiplicator - 1) * 100;
      lastPick.totalScore = gameState.scores[user];
    }

    for (let user of wrongUsers) {
      let lastPick = gameState.pickTable[user][gameState.round - 1];
      lastPick.pointsEarned = 0;
      lastPick.totalScore = gameState.scores[user];
      lastPick.bonusPct = 0;
    }

    // reset for next round
    gameState.whoPickedThisRound = [];

    // increment round
    gameState.round++;

    // go back to pick phase
    gameState.phase = Phase.PickOutcome;

    console.log(
      "Scores after round",
      gameState.round - 1,
      ":",
      gameState.scores,
    );

    broadcastState(io);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
