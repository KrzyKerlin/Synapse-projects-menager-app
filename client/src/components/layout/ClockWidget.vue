<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const days = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
const months = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

const timeText = ref("");
const dateText = ref("");
let timer = null;

function update() {
  const now = new Date();
  timeText.value = now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  dateText.value = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
}

onMounted(() => {
  update();
  timer = setInterval(update, 1000);
});

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="clock-widget">
    <div class="clock-time">{{ timeText }}</div>
    <div class="clock-date">{{ dateText }}</div>
  </div>
</template>

<style scoped>
.clock-widget {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 4px 10px;
  flex-shrink: 0;
}
.clock-time {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}
.clock-date {
  font-size: 0.65rem;
  color: var(--text-muted);
}
</style>
