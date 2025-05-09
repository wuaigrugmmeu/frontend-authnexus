<template>
  <div class="app-container">
    <el-container class="app-layout">
      <!-- 侧边栏 - 仅在非移动端显示 -->
      <el-aside v-if="!isMobile" :width="isCollapse ? '64px' : '240px'" class="sidebar">
        <div class="logo-container">
          <img v-if="!isCollapse" src="@/assets/logo.svg" alt="Logo" class="logo" />
          <img v-else src="@/assets/logo.svg" alt="Logo" class="logo-small" />
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :collapse="isCollapse"
          background-color="#304156"
          text-color="#fff"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><Monitor /></el-icon>
            <template #title>{{ t('menu.dashboard') }}</template>
          </el-menu-item>
          
          <!-- 用户管理 -->
          <el-sub-menu index="/iam">
            <template #title>
              <el-icon><User /></el-icon>
              <span>{{ t('menu.iam') }}</span>
            </template>
            <el-menu-item index="/iam/users">{{ t('menu.users') }}</el-menu-item>
            <el-menu-item index="/iam/roles">{{ t('menu.roles') }}</el-menu-item>
            <el-menu-item index="/iam/permissions">{{ t('menu.permissions') }}</el-menu-item>
          </el-sub-menu>
          
          <!-- 应用管理 -->
          <el-menu-item index="/applications">
            <el-icon><Grid /></el-icon>
            <template #title>{{ t('menu.applications') }}</template>
          </el-menu-item>
          
          <!-- 系统设置 -->
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <template #title>{{ t('menu.settings') }}</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 右侧内容 -->
      <el-container class="main-container">
        <!-- 顶部导航 -->
        <el-header class="app-header">
          <div class="header-left">
            <!-- 移动导航 -->
            <mobile-nav 
              v-if="isMobile"
              :is-mobile="isMobile"
              :active-menu="activeMenu"
              :user-name="userName"
              :user-avatar="userAvatar"
            />
            
            <!-- 桌面端折叠按钮 -->
            <el-button
              v-else
              type="text"
              @click="toggleSidebar"
              class="toggle-btn"
            >
              <el-icon :size="24">
                <Fold v-if="!isCollapse" />
                <Expand v-else />
              </el-icon>
            </el-button>
            <breadcrumb />
          </div>
          
          <div class="header-right">
            <!-- 主题切换 -->
            <theme-switch />
            
            <!-- 语言切换 -->
            <language-switch />
            
            <!-- 头像和下拉菜单 -->
            <el-dropdown trigger="click">
              <div class="avatar-container">
                <el-avatar :size="32" :src="userAvatar" />
                <span class="user-name">{{ userName }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToProfile">{{ t('app.profile') }}</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">{{ t('app.logout') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 主要内容区域 -->
        <el-main class="app-main">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, Expand, Fold, Grid, Monitor, Setting, User } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import Breadcrumb from '@/components/ui/elements/Breadcrumb/index.vue'
import ThemeSwitch from '@/components/ui/elements/ThemeSwitch/index.vue'
import LanguageSwitch from '@/components/ui/elements/LanguageSwitch/index.vue'
import MobileNav from '@/components/ui/elements/MobileNav/index.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 是否为移动端视图
const isMobile = ref(false)

// 监听窗口大小变化
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

// 组件挂载时添加窗口大小变化监听
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

// 组件卸载前移除监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

// 监听移动端状态变化
watch(isMobile, (val) => {
  if (val) {
    isCollapse.value = true
  }
})

// 获取用户信息
const userName = computed(() => authStore.user?.name || '用户')
const userAvatar = computed(() => authStore.user?.avatar || '')

// 获取当前激活的菜单
const activeMenu = computed(() => {
  const route = router.currentRoute.value
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 个人中心
const goToProfile = () => {
  router.push('/profile')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(t('app.logout') + '?', t('common.confirm'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    authStore.logout()
    router.push('/login')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%;
}

.app-layout {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  .logo-container {
    height: 60px;
    padding: 10px;
    text-align: center;
    background-color: #263445;
    
    .logo {
      height: 40px;
      display: inline-block;
    }
    
    .logo-small {
      height: 40px;
      width: 40px;
    }
  }
  
  .el-menu-vertical {
    border-right: none;
    
    &:not(.el-menu--collapse) {
      width: 240px;
    }
  }
}

.main-container {
  background-color: var(--el-bg-color);
}

.app-header {
  background-color: var(--el-bg-color);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .toggle-btn {
      margin-right: 20px;
      padding: 0;
    }

    // 在移动设备上调整面包屑样式
    @media screen and (max-width: 768px) {
      .app-breadcrumb {
        max-width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    
    .avatar-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .user-name {
        margin: 0 5px;
        color: var(--el-text-color-regular);

        // 在移动设备上隐藏用户名
        @media screen and (max-width: 768px) {
          display: none;
        }
      }
    }

    // 在移动设备上调整右侧工具栏间距
    @media screen and (max-width: 768px) {
      .theme-switch-container, .language-switch-container {
        margin: 0 5px;
      }
    }
  }
}

.app-main {
  padding: 20px;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
  
  // 在移动设备上减小内边距
  @media screen and (max-width: 768px) {
    padding: 10px;
  }
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 深色模式适配
:global(.dark) {
  .app-header {
    background-color: #1e1e1e;
    color: #e0e0e0;
  }
  
  .main-container {
    background-color: #121212;
  }
  
  .app-main {
    background-color: #1e1e1e;
  }
}
</style>
