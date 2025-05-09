import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import errorHandler from '@/utils/errorHandler'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`
    }
    return config
  },
  error => {
    console.error('请求错误', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果是文件下载类型的响应，直接返回
    if (response.request.responseType === 'blob') {
      return response
    }
    
    // 根据AuthNexus后端API约定，检查响应状态
    if (res.code !== 200) {
      // 使用错误处理器处理错误
      errorHandler.showMessage({
        status: res.code,
        message: res.message || '接口请求错误',
        code: res.code
      })
      
      // 处理401未授权情况
      if (res.code === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '接口请求错误'))
    } else {
      return res.data
    }
  },
  error => {
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
