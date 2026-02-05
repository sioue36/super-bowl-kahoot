<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { socket } from "../socket";

const gameState = ref(null);

const outcomeShort = {
    Touchdown: "TD",
    FieldGoal: "FG",
    Punt: "P",
    Turnover: "TO",
    EndOfTime: "EOT",
};

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

const leaderboardRows = computed(() => {
    const s = gameState.value;
    if (!s) return [];

    const usernames = s.usernames || [];
    const scores = s.scores || {};
    const streaks = s.streaks || {};
    const pickTable = s.pickTable || {};

    const rows = usernames.map((username) => {
        const score = scores[username] ?? 0;
        const streak = streaks[username] ?? 0;
        const picks = pickTable[username] || [];

        const streakLabel = streak >= 2 ? `+${streak}` : streak <= -3 ? `${streak}` : null;

        const history = picks.map((pick, index) => {
            if (!pick || pick.outcome == null) return `R${index + 1}: -`;

            const short = outcomeShort[pick.outcome] || pick.outcome;
            const resultMark = pick.correct === true ? "*" : pick.correct === false ? "x" : "";
            const earned = pick.pointsEarned ?? 0;
            const total = pick.totalScore ?? 0;

            return `R${index + 1}: ${short}${resultMark} | +${Number(earned).toFixed(2)} | ${Number(total).toFixed(2)}`;
        });

        return {
            username,
            score,
            streakLabel,
            history,
        };
    });

    rows.sort((a, b) => b.score - a.score);
    return rows;
});
</script>

<template>
    <div>
        <h2>Leaderboard</h2>

        <div v-if="!gameState">Waiting for game state...</div>

        <div v-else>
            <p>Phase: {{ gameState.phase }}</p>
            <p>Round: {{ gameState.round }}</p>
            <p>Picked this round: {{ gameState.whoPickedThisRound?.length || 0 }} / {{ gameState.usernames?.length || 0 }}</p>

            <ul>
                <li v-for="row in leaderboardRows" :key="row.username">
                    <div>
                        <strong>{{ row.username }}</strong>
                        <span> | Score: {{ Number(row.score).toFixed(2) }}</span>
                        <span v-if="row.streakLabel"> | Streak: {{ row.streakLabel }}</span>
                    </div>
                    <div>History: {{ row.history.join(" | ") || "-" }}</div>
                </li>
            </ul>
        </div>
    </div>
</template>
