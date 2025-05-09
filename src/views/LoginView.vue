<template>
  <div class="login-view">
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '@/modules/auth/components/LoginForm.vue'
</script>

<style lang="scss" scoped>
.login-view {
  height: 100vh;
  width: 100%;
}
</style>
