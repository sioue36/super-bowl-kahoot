import { io } from "socket.io-client";
import { username } from "./sessionHelper";

// same origin (works locally + via ngrok) because Express serves the UI
export const socket = io();

// helper: always attach username
export function userEmit(event, payload = {}) {
  socket.emit(event, { ...payload, username: username.value });
}
