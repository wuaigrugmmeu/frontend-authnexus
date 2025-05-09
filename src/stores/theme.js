import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const darkMode = ref(localStorage.getItem('darkMode') === 'true')
  
  // Actions
  function setDarkMode(isDark) {
    darkMode.value = isDark
    localStorage.setItem('darkMode', isDark)
  }
  
  return {
    darkMode,
    setDarkMode
  }
})
