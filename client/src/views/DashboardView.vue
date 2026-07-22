<script setup>
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
</script>

<template>
  <div style="padding: 40px; color: var(--text)">
    <h1>Witaj, {{ auth.user?.username }}!</h1>
  </div>
</template>
