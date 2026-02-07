<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { socket } from "../socket";

const gameState2 = ref(null);

const gameState = ref({
    phase: "SeeWhoPickWhat",
    round: 4,
    hostName: "Host",
    usernames: ["Martin", "Simon", "Julie", "Alex", "Martin", "Simon", "Julie", "Alex", "Martin", "Simon", "Julie", "Alex"],
    whoPickedThisRound: ["Martin", "Julie"],
    scores: {
        Martin: 33,
        Simon: 20,
        Julie: 45,
        Alex: 10,
        Martin: 33,
        Simon: 20,
        Julie: 45,
        Alex: 10,
        Martin: 33,
        Simon: 20,
        Julie: 45,
        Alex: 10,
    },
    streaks: {
        Martin: 2,   // shows +2
        Simon: -3,   // shows -3
        Julie: 3,    // shows +4
        Alex: 1,     // hidden by your logic (needs >=2 or <=-3)
    },
    pickTable: {
        Martin: [
            { outcome: "FieldGoal", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Punt", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "FieldGoal", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "FieldGoal", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "Punt" }, // current round: no result yet
        ],
        Simon: [
            { outcome: "EndOfTime", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 0.0 },
            { outcome: "EndOfTime", correct: true, pointsEarned: 2.0, bonusPct: 0, totalScore: 2.0 },
            { outcome: "FieldGoal", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "FieldGoal", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "Punt", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 2.0 },
            { outcome: "Turnover" },
        ],
        Julie: [
            { outcome: "Touchdown", correct: true, pointsEarned: 2.5, bonusPct: 0, totalScore: 2.5 },
            { outcome: "Punt", correct: true, pointsEarned: 1.25, bonusPct: 25, totalScore: 3.75 },
            { outcome: "FieldGoal", correct: true, pointsEarned: 0.75, bonusPct: 50, totalScore: 4.5 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "FieldGoal", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "FieldGoal", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "FieldGoal" },
        ],
        Alex: [
            { outcome: null }, // shows "-"
            { outcome: "Punt", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 0.0 },
            { outcome: "Turnover", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "EndOfTime", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "FieldGoal", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Turnover", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "Punt", correct: true, pointsEarned: 1.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "EndOfTime", correct: false, pointsEarned: 0.0, bonusPct: 0, totalScore: 1.0 },
            { outcome: "Punt", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "Touchdown", correct: true, pointsEarned: 2.25, bonusPct: 25, totalScore: 3.25 },
            { outcome: "Punt" },
        ],
    },
});

const Phase = {
    BeforeStart: "BeforeStart",
    PickOutcome: "PickOutcome",
    SeeWhoPickWhat: "SeeWhoPickWhat",
};

const outcomeShort = {
    Touchdown: "TD",
    FieldGoal: "FG",
    Punt: "PUNT",
    Turnover: "TO",
    EndOfTime: "END",
};

function onState(state) {
    gameState2.value = state;
    console.log("Game state updated:", state);
}

onMounted(() => {
    socket.on("server:state", onState);
});

onBeforeUnmount(() => {
    socket.off("server:state", onState);
});

const totalPlayers = computed(() => (gameState.value?.usernames ?? []).length);

const pickedCount = computed(() => (gameState.value?.whoPickedThisRound ?? []).length);

const notPickedYet = computed(() => {
    const state = gameState.value;
    if (!state) return [];

    const usersWhoPicked = new Set(state.whoPickedThisRound ?? []);
    return gameState.value?.usernames.filter((u) => !usersWhoPicked.has(u));
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
        const allUserPicks = pickTable[username] || [];

        const picks =
            s.phase === Phase.PickOutcome && allUserPicks.length > 0 && s.round === allUserPicks.length
                ? allUserPicks.slice(0, -1) // hide current round pick
                : allUserPicks;


        const streakEmoji = streak >= 2 ? "🔥" : streak <= -3 ? "⛄" : null;
        const streakNumber = streak >= 3 || streak <= -3 ? Math.abs(streak) : "";
        const streakLabel = streakEmoji ? `${streakNumber}${streakEmoji}` : "";

        const history = picks.map((pick) => {
            if (!pick || pick.outcome == null) {
                return { short: "-", correct: null, earned: null, total: null, bonusPct: null };
            }

            return {
                short: outcomeShort[pick.outcome] || pick.outcome,
                correct: pick.correct === true ? true : pick.correct === false ? false : null,
                earned: pick.pointsEarned ?? null,
                total: pick.totalScore ?? null,
                bonusPct: pick.bonusPct ?? null, // this is your streak-based bonus per pick
            };
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
    <div class="page">
        <div v-if="!gameState">Waiting for game state...</div>

        <div v-else>
            <div class="extra-info">
                <div v-if="gameState.phase === Phase.BeforeStart" class="extra-info-waiting">
                    Waiting for the game to start...
                </div>

                <div v-else-if="gameState.phase === Phase.PickOutcome" class="extra-info-picking">
                    <div>Make your picks! ({{ pickedCount }} / {{ totalPlayers }})</div>

                    <div v-if="notPickedYet.length" class="waiting-for-picks">
                        Waiting for: {{ notPickedYet.join(", ") }}
                    </div>
                    <div v-else class="waiting-for-picks">
                        Everyone has picked ✅
                    </div>
                </div>

                <div v-else-if="gameState.phase === Phase.SeeWhoPickWhat" class="extra-info-locked">
                    <div>Picks are locked in!</div>
                    <div class="waiting-for-picks">
                        Watch the game and hope for the best!
                    </div>
                </div>

                <div v-else>
                    Phase: {{ gameState.phase }}
                </div>
            </div>

            <div class="players">
                <div v-for="(row, idx) in leaderboardRows" :key="row.username" class="player">
                    <div class="cell rank">{{ idx + 1 }}</div>
                    <div class="cell name"><strong>{{ row.username }}</strong></div>
                    <div class="cell score">{{ Number(row.score) + " pts" }}</div>
                    <div class="cell streak">{{ row.streakLabel || " " }}</div>
                    <div class="cell history">
                        <div class="box-row">
                            <div v-for="(box, index) in row.history.slice(-9)" :key="index" class="box">
                                <div class="inner-box-top">
                                    <div class="outcome"
                                        :class="box.correct === true ? 'ok' : box.correct === false ? 'miss' : 'pending'">
                                        {{ box.short }}
                                    </div>
                                    <div class="bonus" v-if="box.bonusPct > 0">
                                        {{ "(+" + box.bonusPct + "% 🔥)" }}
                                    </div>
                                    <div class="bonus" v-else>&nbsp;</div>
                                </div>

                                <div class="inner-box-bottom">
                                    <div class="earned" v-if="box.earned != null && box.earned > 0">
                                        +{{ Number(box.earned) }}
                                    </div>
                                    <div class="earned" v-else>&nbsp;</div>
                                    <div class="total">
                                        {{ box.total != null ? box.total + ' pts' : ' ' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* optional: keep page from having default margins */
.page {
    margin: 0;
}

.extra-info {
    height: 10vh;
    width: 100vw;
}

.extra-info-waiting {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    font-size: 4vh;
    font-weight: 500;
}

@keyframes blinkBg {

    0%,
    49% {
        background-color: transparent;
    }

    50%,
    100% {
        background-color: rgba(255, 2, 2, 0.30);
    }
}

.extra-info-picking {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    width: 100%;
    font-size: 4vh;
    font-weight: 500;
    animation: blinkBg 1.5s step-end infinite;
}

.waiting-for-picks {
    font-size: 2vh;
    opacity: 0.8;
    margin-bottom: 10px;
}

.extra-info-locked {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    width: 100%;
    font-size: 4vh;
    font-weight: 500;
}

/* container that takes the full screen height */
.players {
    height: 90vh;
    width: 100vw;

    display: flex;
    flex-direction: column;
}

.player {
    flex: 1;
    width: 100%;
    border-top: 2px solid rgb(255, 255, 255, 0.2);

    display: flex;
    align-items: center;
    /* vertical alignment */
    gap: 12px;
    padding: 0px;
    box-sizing: border-box;

    overflow: hidden;
    /* keep row clean */
}

.cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.rank {
    width: 30px;
    text-align: right;
    font-size: larger;
}

.name {
    width: 160px;
    font-size: larger;
}

.streak {
    width: 70px;
    text-align: center;
    font-size: larger;
}

.score {
    width: 70px;
    text-align: right;
    font-size: larger;
}

/* history grows */
.history {
    flex: 1;
    min-width: 0;
    height: 100%;
    /* IMPORTANT so ellipsis works in flex */
}

.box-row {
    display: flex;
    overflow: hidden;
    height: 100%;
}

.box {
    width: 14%;
    /* adjust */
    border-left: 2px solid rgb(255, 255, 255, 0.20);

    border-radius: 0px;
    margin: 0px;
    padding: 2px 6px;
    box-sizing: border-box;


    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.outcome {
    font-weight: 700;
    font-size: 16px;
}

.outcome.ok {
    color: #2ecc71;
}

/* green */
.outcome.miss {
    color: #e74c3c;
}

/* red */
.outcome.pending {
    color: rgba(255, 255, 255, 0.7);
}

.inner-box-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.inner-box-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.total {
    font-size: 13px;
}

.earned {
    font-size: 12px;
    opacity: 0.9;
}

.bonus {
    font-size: 11px;
    opacity: 0.9;
}
</style>
