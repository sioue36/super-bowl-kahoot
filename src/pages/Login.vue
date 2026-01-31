<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { setUsername, username } from "../sessionHelper";
import { userEmit } from "../socket";

const router = useRouter();
const name = ref(username.value);
function login() {
    let isHost = false;
    if (name.value.startsWith("host-")) {
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
    <div>
        <h2>Login</h2>

        <input v-model="name" placeholder="Username" @keyup.enter="login" />
        <button @click="login">Enter</button>
    </div>
</template>
