<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { socket } from "./socket";

const status = ref("connecting...");
const last = ref("");

onMounted(() => {
  const onConnect = () => (status.value = `connected: ${socket.id}`);
  const onDisconnect = () => (status.value = "disconnected");
  const onServerHello = (msg) => (last.value = "server:hello " + JSON.stringify(msg));
  const onAck = (msg) => (last.value = "server:ack " + JSON.stringify(msg));

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  socket.on("server:hello", onServerHello);
  socket.on("server:ack", onAck);

  // send one message
  socket.emit("client:hello", { from: "vue", at: Date.now() });
});

onBeforeUnmount(() => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("server:hello");
  socket.off("server:ack");
});
</script>

<template>
  <router-view />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
