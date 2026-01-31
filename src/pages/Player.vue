<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { username } from "../sessionHelper";
import { userEmit, socket } from "../socket";

const gameState = ref(null);
const hostName = ref(null);
const name = ref(username.value);
const isHost = computed(() => hostName.value === name.value);


function ping() {
    userEmit("client:ping");
    console.log("ping sent!", name.value);
}

onMounted(() => {
    socket.on("server:state", (state) => {
        gameState.value = state;
        console.log("Game state updated:", state);
    });
    socket.on("server:new-host", (newHost) => {
        hostName.value = newHost;
        console.log("New host assigned:", newHost);
    });
});

onBeforeUnmount(() => {
    socket.off("server:state");
    socket.off("server:new-host");
});
</script>

<template>
    <h2>{{ name }}{{ isHost ? " (Host)" : "" }}</h2>
    <div v-if="isHost">
        <button>StartGame</button>
    </div>
    <div v-if="gameState?.phase === 'BeforeStart'">Waiting…</div>
    <div v-else-if="gameState?.phase === 'PickOutcome'"> <button>Touchdown</button>
        <button>Field Goal Attempt</button>
        <button @click="ping">Punt</button>
        <button>Turnover (Interception/Fumble/Failed 4th Down/Safety)</button>
        <button>End of Half/Game</button>
    </div>
    <div v-else-if="gameState?.phase === 'SeeWhoPickWhat'">SeeWhoPickWhat UI</div>
</template>
