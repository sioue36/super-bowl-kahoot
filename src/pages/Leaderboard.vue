<script setup>
import { computed } from "vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { socket } from "../socket";

const gameState = ref(null);

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

const scores = computed(() => {
    const s = gameState.value;
    if (!s) return [];

    const usernames = s.usernames || [];
    const pickTable = s.pickTable || {};

    // build [{ username, score }]
    const rows = usernames.map((u) => {
        const picks = pickTable[u] || [];
        const score = picks.reduce((total, p) => total + (p?.correct === true ? 1 : 0), 0);
        return { username: u, score };
    });

    // sort highest first
    rows.sort((a, b) => b.score - a.score);

    return rows;
});
</script>

<template>
    <div>
        <h2>Leaderboard</h2>

        <div v-if="!gameState">Waiting for game state...</div>

        <ul v-else>
            <li v-for="row in scores" :key="row.username">
                {{ row.username }}: {{ row.score }}
            </li>
        </ul>
    </div>
</template>
