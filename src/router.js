import { createRouter, createWebHashHistory } from "vue-router";

import HelloWorld from "./components/HelloWorld.vue";

const Home = { template: "<h2>Home</h2>" };

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/about", component: HelloWorld },
  ],
});
