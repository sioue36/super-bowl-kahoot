import { ref } from "vue";

const KEY = "sbk_username";

export const username = ref(localStorage.getItem(KEY) || "");

export function setUsername(name) {
  username.value = (name || "").trim();
  if (username.value) localStorage.setItem(KEY, username.value);
  else localStorage.removeItem(KEY);
}
