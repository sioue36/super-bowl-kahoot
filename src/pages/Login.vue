<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { setUsername, username } from "../sessionHelper";
import { userEmit } from "../socket";

const router = useRouter();
const name = ref(username.value);
function login() {
    let isHost = false;
    if (name.value.startsWith("host-") || name.value.startsWith("Host-")) {
        name.value = name.value.slice(5);
        isHost = true;
    }
    console.log("login : ", name.value);
    setUsername(name.value);
    if (!username.value) return;

    userEmit("client:login", { isHost });
    router.push("/player");
}
</script>

<template>
    <div class="login-page">
        <h2 class="title">Login</h2>

        <div class="form">
            <input v-model="name" class="input" placeholder="Username" @keyup.enter="login" />

            <button @click="login" class="btn">Enter</button>
        </div>
        <h5 class="top-link">
            <router-link to="/leaderboard">Open leaderboard</router-link>
        </h5>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    gap: 18px;
    padding: 24px;
    box-sizing: border-box;
}

.top-link {
    margin: 0;
    opacity: 0.85;
}

.title {
    margin: 0;
}

.form {
    width: min(420px, 80vw);
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 6px;
}

.input {
    width: 100%;
    padding: 14px 16px;
    border-radius: 12px;

    border: 1px solid rgba(0, 0, 0, 0.15);
    background: #ffffff;
    color: #111;

    font-size: 16px;
    outline: none;
    box-sizing: border-box;
}

.input:focus {
    border-color: rgba(0, 0, 0, 0.35);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.btn {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;

    border: none;
    background-color: #69be28;
    color: white;

    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
}

.btn:active {
    transform: translateY(1px);
}
</style>
