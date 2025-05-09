import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 布局
import AppLayout from '@/layouts/AppLayout.vue'

// 公共路由 - 不需要登录
const publicRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { title: '忘记密码', requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { title: '重置密码', requiresAuth: false }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404View.vue'),
    meta: { title: '页面未找到', requiresAuth: false }
  }
]

// 私有路由 - 需要登录
const privateRoutes = [
  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '控制台', icon: 'Monitor' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  },
  // IAM 模块路由
  {
    path: '/iam',
    component: AppLayout,
    redirect: '/iam/users',
    meta: { title: '用户权限管理', icon: 'User' },
    children: [
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/modules/iam/users/views/UserList.vue'),
        meta: { title: '用户管理', permission: 'user:list' }
      },
      {
        path: 'users/create',
        name: 'CreateUser',
        component: () => import('@/modules/iam/users/views/UserForm.vue'),
        meta: { title: '创建用户', activeMenu: '/iam/users', permission: 'user:create' }
      },
      {
        path: 'users/edit/:id',
        name: 'EditUser',
        component: () => import('@/modules/iam/users/views/UserForm.vue'),
        meta: { title: '编辑用户', activeMenu: '/iam/users', permission: 'user:update' }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/modules/iam/roles/views/RoleList.vue'),
        meta: { title: '角色管理', permission: 'role:list' }
      },
      {
        path: 'roles/create',
        name: 'CreateRole',
        component: () => import('@/modules/iam/roles/views/RoleForm.vue'),
        meta: { title: '创建角色', activeMenu: '/iam/roles', permission: 'role:create' }
      },
      {
        path: 'roles/edit/:id',
        name: 'EditRole',
        component: () => import('@/modules/iam/roles/views/RoleForm.vue'),
        meta: { title: '编辑角色', activeMenu: '/iam/roles', permission: 'role:update' }
      },
      {
        path: 'permissions',
        name: 'Permissions',
        component: () => import('@/modules/iam/permissions/views/PermissionList.vue'),
        meta: { title: '权限管理', permission: 'permission:list' }
      }
    ]
  },
  // 应用管理
  {
    path: '/applications',
    component: AppLayout,
    redirect: '/applications/list',
    meta: { title: '应用管理', icon: 'Grid' },
    children: [
      {
        path: 'list',
        name: 'ApplicationList',
        component: () => import('@/modules/applications/views/ApplicationList.vue'),
        meta: { title: '应用列表', permission: 'application:list' }
      },
      {
        path: 'create',
        name: 'CreateApplication',
        component: () => import('@/modules/applications/views/ApplicationForm.vue'),
        meta: { title: '创建应用', activeMenu: '/applications/list', permission: 'application:create' }
      },
      {
        path: 'edit/:id',
        name: 'EditApplication',
        component: () => import('@/modules/applications/views/ApplicationForm.vue'),
        meta: { title: '编辑应用', activeMenu: '/applications/list', permission: 'application:update' }
      },
      {
        path: 'detail/:id',
        name: 'ApplicationDetail',
        component: () => import('@/modules/applications/views/ApplicationDetail.vue'),
        meta: { title: '应用详情', activeMenu: '/applications/list', permission: 'application:read' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...privateRoutes],
  scrollBehavior() {
    return { top: 0 }
  }
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - AuthNexus` : 'AuthNexus'
  
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  
  // 获取权限验证状态
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isLoggedIn
  
  // 如果路由需要认证且用户未登录，重定向到登录页
  if (requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // 如果用户已登录但访问登录页，重定向到首页
  if (isLoggedIn && to.path === '/login') {
    next({ path: '/dashboard' })
    return
  }
  
  // 检查用户是否有访问该路由的权限
  const requiredPermission = to.meta.permission
  if (requiredPermission && isLoggedIn) {
    try {
      // 如果用户信息不存在，获取用户信息
      if (!authStore.user) {
        await authStore.fetchUserInfo()
      }
      
      const hasPermission = authStore.hasPermission(requiredPermission)
      if (!hasPermission) {
        next({ name: '404' })
        return
      }
    } catch (error) {
      // 获取用户信息失败，重新登录
      authStore.resetState()
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  next()
})

export default router
