import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, refreshToken } from '@/api/modules/auth'
import { getUserProfile } from '@/api/modules/user'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const refreshTokenValue = ref(localStorage.getItem('refreshToken') || '')
  const user = ref(null)
  const permissions = ref([])
  const roles = ref([])
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userRoles = computed(() => roles.value)
  const userPermissions = computed(() => permissions.value)
  
  // 检查是否有特定权限
  const hasPermission = (permissionCode) => {
    return permissions.value.includes(permissionCode)
  }
  
  // 检查是否有特定角色
  const hasRole = (roleCode) => {
    return roles.value.includes(roleCode)
  }
  
  // Actions
  // 登录
  const loginAction = async (credentials) => {
    try {
      const response = await login(credentials)
      setTokens(response.token, response.refreshToken)
      await fetchUserInfo()
      return response
    } catch (error) {
      resetState()
      throw error
    }
  }
  
  // 登出
  const logoutAction = async () => {
    try {
      await logout()
    } finally {
      resetState()
    }
  }
  
  // 刷新令牌
  const refreshTokenAction = async () => {
    try {
      const response = await refreshToken({ refreshToken: refreshTokenValue.value })
      setTokens(response.token, response.refreshToken)
      return response
    } catch (error) {
      resetState()
      throw error
    }
  }
  
  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const userInfo = await getUserProfile()
      user.value = userInfo
      roles.value = userInfo.roles || []
      permissions.value = userInfo.permissions || []
      return userInfo
    } catch (error) {
      throw error
    }
  }
  
  // 重置状态
  const resetState = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    token.value = ''
    refreshTokenValue.value = ''
    user.value = null
    roles.value = []
    permissions.value = []
  }
  
  // 设置令牌
  const setTokens = (newToken, newRefreshToken) => {
    token.value = newToken
    refreshTokenValue.value = newRefreshToken
    localStorage.setItem('token', newToken)
    localStorage.setItem('refreshToken', newRefreshToken)
  }
  
  return {
    // 状态
    token,
    refreshTokenValue,
    user,
    roles,
    permissions,
    // Getters
    isLoggedIn,
    userRoles,
    userPermissions,
    // 方法
    hasPermission,
    hasRole,
    loginAction,
    logoutAction,
    refreshTokenAction,
    fetchUserInfo,
    resetState
  }
})
