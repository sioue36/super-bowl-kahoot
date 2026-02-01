<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { username } from "../sessionHelper";
import { userEmit, socket } from "../socket";

const gameState = ref(null);
const name = ref(username.value);
const isHost = computed(() => gameState.value?.hostName === name.value);



function lockPicks() {
    userEmit("host:lock-picks");
    console.log("lock sent!", name.value);
}

function start() {
    userEmit("host:start");
    console.log("start sent!", name.value);
}

function pick(outcome) {
    console.log("pick sent!", outcome, name.value);
    userEmit("client:pick", { outcome });
}

function outcome(outcome) {
    userEmit("host:outcome", { outcome });
}

function onState(state) {
    gameState.value = state;
    console.log("Game state updated:", state);
}

onMounted(() => {
    socket.on("server:state", onState);
});

onBeforeUnmount(() => {
    socket.off("server:state", onState);
});
</script>

<template>
    <h2>{{ name }}{{ isHost ? " (Host)" : "" }}</h2>
    <div v-if="isHost && gameState">
        <div v-if="gameState?.phase == 'BeforeStart'">
            <button @click="start">Start Game</button>
        </div>
        <div v-if="gameState?.phase == 'PickOutcome'">
            <button @click="lockPicks">Lock Picks</button>
        </div>
        <div v-if="gameState?.phase == 'SeeWhoPickWhat'">
            <button @click="outcome('Touchdown')">Touchdown</button>
            <button @click="outcome('FieldGoal')">Field Goal Attempt</button>
            <button @click="outcome('Punt')">Punt</button>
            <button @click="outcome('Turnover')">Turnover (Interception/Fumble/Failed 4th Down/Safety)</button>
            <button @click="outcome('EndOfTime')">End of Half/Game</button>
        </div>

    </div>
    <div v-if="gameState?.phase === 'BeforeStart'">Waiting…</div>
    <div v-else-if="gameState?.phase === 'PickOutcome'">
        <button @click="pick('Touchdown')">Touchdown</button>
        <button @click="pick('FieldGoal')">Field Goal Attempt</button>
        <button @click="pick('Punt')">Punt</button>
        <button @click="pick('Turnover')">Turnover (Interception/Fumble/Failed 4th Down/Safety)</button>
        <button @click="pick('EndOfTime')">End of Half/Game</button>
    </div>
    <div v-else-if="gameState?.phase === 'SeeWhoPickWhat'">SeeWhoPickWhat UI</div>
</template>
