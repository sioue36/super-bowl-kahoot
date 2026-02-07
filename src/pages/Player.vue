<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { username } from "../sessionHelper";
import { userEmit, socket } from "../socket";

const gameState = ref(null);
const name = ref(username.value);
const isHost = computed(() => gameState.value?.hostName === name.value);



const selectedOutcome = ref(null);

watch(
    () => gameState.value?.phase,
    (newPhase, oldPhase) => {
        if (oldPhase === "PickOutcome" && newPhase !== "PickOutcome") {
            selectedOutcome.value = null;
        }
    }
);

const leaderboard = computed(() => {
    const s = gameState.value;
    if (!s) return [];

    const scores = s.scores ?? {};

    return (s.usernames ?? [])
        .map((u) => ({ username: u, score: scores[u] ?? 0 }))
        .sort((a, b) => b.score - a.score);
});

const myIndex = computed(() => {
    const i = leaderboard.value.findIndex((r) => r.username === name.value);
    return i; // -1 if not found
});

const aboveMe = computed(() => (myIndex.value > 0 ? leaderboard.value[myIndex.value - 1] : null));
const meRow = computed(() => (myIndex.value >= 0 ? leaderboard.value[myIndex.value] : null));
const belowMe = computed(() => {
    const i = myIndex.value;
    return i >= 0 && i < leaderboard.value.length - 1 ? leaderboard.value[i + 1] : null;
});

function formatRow(row) {
    if (!row) return "—";

    const idx = leaderboard.value.findIndex((r) => r.username === row.username);
    const rank = idx >= 0 ? idx + 1 : "?";

    return `${rank}. ${row.username} • ${Number(row.score)} pts`;
}

const totalPlayers = computed(() => (gameState.value?.usernames ?? []).length);
console.log("Total players:", totalPlayers.value);
const pickedCount = computed(() => (gameState.value?.whoPickedThisRound ?? []).length);
console.log("Picked count:", pickedCount.value);
const shouldLockPicks = computed(() => pickedCount.value === totalPlayers.value);
console.log("Should lock picks?", shouldLockPicks.value, pickedCount.value, totalPlayers.value);


function lockPicks() {
    userEmit("host:lock-picks");
    console.log("lock sent!", name.value);
}

function start() {
    userEmit("host:start");
    console.log("start sent!", name.value);
}

function pick(outcome) {
    selectedOutcome.value = outcome;
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
    <div v-if="isHost && gameState">
        <div v-if="gameState?.phase == 'BeforeStart'">
            <button @click="start">Start Game</button>
        </div>
        <div v-if="gameState?.phase == 'PickOutcome'">
            <button @click="lockPicks" class="host-action"
                :class="{ ready: shouldLockPicks, notReady: !shouldLockPicks }">Lock Picks</button>
        </div>
        <div v-if="gameState?.phase == 'SeeWhoPickWhat'">
            <button @click="outcome('Touchdown')">Touchdown</button>
            <button @click="outcome('FieldGoal')">Field Goal Attempt</button>
            <button @click="outcome('Punt')">Punt</button>
            <button @click="outcome('Turnover')">Turnover (Interception/Fumble/Failed 4th Down/Safety)</button>
            <button @click="outcome('EndOfTime')">End of Half/Game</button>
        </div>

    </div>
    <div v-if="gameState?.phase === 'BeforeStart'">Waiting for the game to start…</div>
    <div v-else-if="gameState?.phase === 'PickOutcome'" class="pick-screen">
        <!-- Top banner -->
        <div class="banner">
            <div class="banner-row other">{{ formatRow(aboveMe) }}</div>
            <div class="banner-row me">{{ formatRow(meRow || { username: name, score: 0 }) }}</div>
            <div class="banner-row other">{{ formatRow(belowMe) }}</div>
        </div>

        <!-- Buttons fill the rest -->
        <div class="choices">
            <button class="choice" :class="{ active: selectedOutcome === 'Touchdown' }" @click="pick('Touchdown')">
                Touchdown
            </button>

            <button class="choice" :class="{ active: selectedOutcome === 'FieldGoal' }" @click="pick('FieldGoal')">
                Field Goal Attempt
            </button>

            <button class="choice" :class="{ active: selectedOutcome === 'Punt' }" @click="pick('Punt')">
                Punt
            </button>

            <button class="choice" :class="{ active: selectedOutcome === 'Turnover' }" @click="pick('Turnover')">
                Turnover
            </button>

            <button class="choice" :class="{ active: selectedOutcome === 'EndOfTime' }" @click="pick('EndOfTime')">
                End of Half/Game
            </button>
        </div>
    </div>
    <div v-else-if="gameState?.phase === 'SeeWhoPickWhat'">SeeWhoPickWhat UI</div>
</template>

<style scoped>
.pick-screen {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    position: relative;
}

.host-action {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;

    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.25);

    background: rgba(0, 0, 0, 0.45);
    color: white;
    font-weight: 700;
    font-size: 14px;
}

/* top banner */
.banner {
    height: 18vh;
    padding: 10px 12px;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    justify-content: space-around;

    background: black;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.banner-row {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 2.2vh;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.banner-row.other {
    opacity: 0.75;
}

.banner-row.me {
    font-weight: 700;
    font-size: 3vh;
}

/* buttons fill remaining space */
.choices {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.choice {
    flex: 1;
    /* 5 equal slices */
    width: 100%;
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.12);

    font-size: 3.2vh;
    font-weight: 700;

    background: rgba(255, 255, 255, 0.03);
    color: white;

    padding: 0 16px;
}

/* active (last tapped) */
.choice.active {
    background: rgba(105, 190, 40, 0.25);
    outline: 2px solid rgba(105, 190, 40, 0.8);
    outline-offset: -2px;
}

.choice:active {
    transform: translateY(1px);
}

.host-action.ready {
    background: rgba(105, 190, 40, 0.25);
    outline: 2px solid rgba(105, 190, 40, 0.8);
    outline-offset: -2px;
}

.host-action.notReady {
    background: black;
}
</style>
