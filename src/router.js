import { createRouter, createWebHashHistory } from "vue-router";

import Login from "./pages/Login.vue";
import Player from "./pages/Player.vue";
import Leaderboard from "./pages/Leaderboard.vue";

const Home = { template: "<h2>Home</h2>" };

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: Login },
    { path: "/player", component: Player },
    { path: "/leaderboard", component: Leaderboard },
  ],
});
