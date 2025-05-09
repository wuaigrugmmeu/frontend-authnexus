<template>
  <div class="mobile-nav">
    <!-- 移动端导航按钮 -->
    <el-button
      v-if="isMobile"
      class="mobile-nav-button"
      type="text"
      @click="drawerVisible = true"
    >
      <el-icon :size="24"><Menu /></el-icon>
    </el-button>
    
    <!-- 侧边抽屉导航 -->
    <el-drawer
      v-model="drawerVisible"
      title="菜单"
      direction="ltr"
      size="80%"
      :destroy-on-close="false"
      :with-header="true"
    >
      <div class="drawer-logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="drawer-logo" />
        <h2 class="drawer-app-name">{{ t('app.title') }}</h2>
      </div>
      
      <el-divider />
      
      <el-menu
        :default-active="activeMenu"
        class="drawer-menu"
        router
        @select="handleSelect"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Monitor /></el-icon>
          <template #title>{{ t('menu.dashboard') }}</template>
        </el-menu-item>
        
        <el-sub-menu index="/iam">
          <template #title>
            <el-icon><User /></el-icon>
            <span>{{ t('menu.iam') }}</span>
          </template>
          <el-menu-item index="/iam/users">{{ t('menu.users') }}</el-menu-item>
          <el-menu-item index="/iam/roles">{{ t('menu.roles') }}</el-menu-item>
          <el-menu-item index="/iam/permissions">{{ t('menu.permissions') }}</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/applications">
          <el-icon><Grid /></el-icon>
          <template #title>{{ t('menu.applications') }}</template>
        </el-menu-item>
        
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>{{ t('menu.settings') }}</template>
        </el-menu-item>
      </el-menu>
      
      <template #footer>
        <div class="drawer-footer">
          <div class="theme-language-container">
            <theme-switch />
            <language-switch />
          </div>
          
          <el-divider />
          
          <div class="user-container">
            <el-avatar :size="36" :src="userAvatar" />
            <span class="user-name">{{ userName }}</span>
          </div>
          
          <div class="action-buttons">
            <el-button type="primary" plain @click="goToProfile">
              {{ t('app.profile') }}
            </el-button>
            <el-button type="danger" plain @click="handleLogout">
              {{ t('app.logout') }}
            </el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Menu, Monitor, User, Grid, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import ThemeSwitch from '@/components/ui/elements/ThemeSwitch/index.vue'
import LanguageSwitch from '@/components/ui/elements/LanguageSwitch/index.vue'

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  },
  activeMenu: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: ''
  },
  userAvatar: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const drawerVisible = ref(false)

// 菜单项选择处理
const handleSelect = () => {
  drawerVisible.value = false
}

// 个人中心
const goToProfile = () => {
  drawerVisible.value = false
  router.push('/profile')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(t('app.logout') + '?', t('common.confirm'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    drawerVisible.value = false
    authStore.logout()
    router.push('/login')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.mobile-nav {
  display: flex;
  align-items: center;
  
  .mobile-nav-button {
    padding: 8px;
    margin-right: 10px;
  }
}

.drawer-logo-container {
  display: flex;
  align-items: center;
  padding: 16px;
  
  .drawer-logo {
    height: 40px;
    margin-right: 10px;
  }
  
  .drawer-app-name {
    font-size: 18px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.drawer-menu {
  border-right: none;
}

.drawer-footer {
  padding: 16px;
  
  .theme-language-container {
    display: flex;
    justify-content: space-around;
    margin-bottom: 16px;
  }
  
  .user-container {
    display: flex;
    align-items: center;
    margin: 16px 0;
    
    .user-name {
      margin-left: 12px;
      font-size: 16px;
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    
    .el-button {
      flex: 1;
      margin: 0 4px;
    }
  }
}

:global(.dark) {
  .drawer-logo-container {
    color: #e0e0e0;
  }
  
  .user-container .user-name {
    color: #e0e0e0;
  }
}
</style>
