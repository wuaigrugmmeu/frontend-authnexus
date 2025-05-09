<template>
  <div class="theme-switch-container">
    <el-tooltip content="切换主题" placement="bottom">
      <div class="theme-switch" @click="toggleTheme">
        <el-icon v-if="isDarkMode"><Moon /></el-icon>
        <el-icon v-else><Sunny /></el-icon>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isDarkMode = ref(false)

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  themeStore.setDarkMode(isDarkMode.value)
}

// 应用主题设置
const applyTheme = (darkMode) => {
  const htmlEl = document.documentElement
  
  if (darkMode) {
    htmlEl.classList.add('dark')
    htmlEl.setAttribute('data-theme', 'dark')
  } else {
    htmlEl.classList.remove('dark')
    htmlEl.setAttribute('data-theme', 'light')
  }
}

// 监听主题变化
watch(
  () => isDarkMode.value,
  (newVal) => {
    applyTheme(newVal)
  }
)

// 组件挂载时初始化主题
onMounted(() => {
  isDarkMode.value = themeStore.darkMode
  applyTheme(isDarkMode.value)
})
</script>

<style lang="scss" scoped>
.theme-switch-container {
  margin: 0 15px;
}

.theme-switch {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #f2f2f2;
  }
  
  .el-icon {
    font-size: 20px;
    color: #606266;
  }
}

:global(.dark) {
  .theme-switch {
    &:hover {
      background-color: #363636;
    }
    
    .el-icon {
      color: #e0e0e0;
    }
  }
}
</style>
