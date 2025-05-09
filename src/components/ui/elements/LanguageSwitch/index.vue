<template>
  <div class="language-switch-container">
    <el-dropdown trigger="click" @command="handleLanguageChange">
      <span class="el-dropdown-link">
        <el-icon><Globe /></el-icon>
        <span class="language-name">{{ languageName }}</span>
        <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="zh-CN" :disabled="locale === 'zh-CN'">
            <span>简体中文</span>
          </el-dropdown-item>
          <el-dropdown-item command="en-US" :disabled="locale === 'en-US'">
            <span>English</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, Globe } from '@element-plus/icons-vue'

const { locale } = useI18n()

// 根据当前语言显示对应的名称
const languageName = computed(() => {
  return locale.value === 'zh-CN' ? '简体中文' : 'English'
})

// 切换语言
const handleLanguageChange = (language) => {
  locale.value = language
  localStorage.setItem('locale', language)
}
</script>

<style lang="scss" scoped>
.language-switch-container {
  margin: 0 10px;
  
  .el-dropdown-link {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 5px;
    
    .language-name {
      margin: 0 5px;
      font-size: 14px;
      color: #606266;
    }
  }
}

:global(.dark) {
  .language-switch-container {
    .el-dropdown-link {
      .language-name {
        color: #e0e0e0;
      }
    }
  }
}
</style>
