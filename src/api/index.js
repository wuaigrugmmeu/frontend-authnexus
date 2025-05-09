import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import errorHandler from '@/utils/errorHandler'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    
    // 如果有token，添加到请求头
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 如果是文件下载类型的响应，直接返回
    if (response.request.responseType === 'blob') {
      return response
    }
    
    // 如果后端返回的数据中包含code字段，可以进行统一处理
    if (res.code !== undefined && res.code !== 200) {
      errorHandler.showMessage({
        status: res.code,
        message: res.message || '请求失败'
      })
      
      // 处理特定错误码
      if (res.code === 401) {
        // 未授权，清空用户信息并跳转到登录页
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  (error) => {
    // 如果是401状态码，跳转到登录页
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
    
    // 使用错误处理器处理错误
    return errorHandler.handleApiError(error)
  }
)

export default service
