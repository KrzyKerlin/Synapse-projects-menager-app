<script setup>
import { useToastStore } from "../stores/toast";
import TheTaskbar from "../components/layout/TheTaskbar.vue";

const toast = useToastStore();

function notImplementedYet() {
  toast.show("Ta funkcja pojawi się w kolejnym commicie.", "info");
}
</script>

<template>
  <div class="dashboard">
    <div class="desktop-area">
      <!-- Projekty, katalogi i widgety zostaną dodane w kolejnych commitach -->
    </div>

    <TheTaskbar
      @new-project="notImplementedYet"
      @new-task="notImplementedYet"
      @new-folder="notImplementedYet"
      @all-tasks="notImplementedYet"
      @toggle-calendar="notImplementedYet"
      @toggle-chat="notImplementedYet"
    />
  </div>
</template>

<style scoped>
.dashboard {
  position: relative;
  height: 100vh;
}
.desktop-area {
  position: relative;
  height: calc(100vh - var(--taskbar-h));
  overflow: auto;
}
</style>
