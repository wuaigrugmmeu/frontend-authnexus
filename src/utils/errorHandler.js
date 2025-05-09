import { ElMessage, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'

// 创建一个错误处理类
class ErrorHandler {
  constructor() {
    this.i18n = null
  }
  
  // 初始化i18n引用
  initialize() {
    try {
      // 在组件外使用i18n需要动态获取
      const { t } = useI18n()
      this.i18n = t
    } catch (error) {
      console.error('Failed to initialize i18n in error handler', error)
    }
  }
  
  // 获取错误消息
  getErrorMessage(error) {
    // 如果i18n未初始化，尝试初始化
    if (!this.i18n) {
      this.initialize()
    }
    
    // 标准化错误对象
    const err = this.normalizeError(error)
    
    // 使用i18n翻译错误消息（如果可用）
    if (this.i18n) {
      if (err.code && this.i18n(`error.${err.code}`)) {
        return this.i18n(`error.${err.code}`)
      }
      
      // 处理通用错误类型
      switch (err.status) {
        case 401:
          return this.i18n('error.unauthorized')
        case 403:
          return this.i18n('error.forbidden')
        case 404:
          return this.i18n('error.notFound')
        case 500:
          return this.i18n('error.serverError')
        case 'NETWORK_ERROR':
          return this.i18n('error.networkError')
        case 'TIMEOUT_ERROR':
          return this.i18n('error.timeout')
        default:
          return err.message || this.i18n('error.unknown')
      }
    }
    
    // i18n不可用时的默认错误消息
    switch (err.status) {
      case 401:
        return '未授权，请先登录'
      case 403:
        return '权限不足，无法访问'
      case 404:
        return '资源不存在'
      case 500:
        return '服务器错误，请稍后再试'
      case 'NETWORK_ERROR':
        return '网络错误，请检查您的网络连接'
      case 'TIMEOUT_ERROR':
        return '请求超时，请稍后再试'
      default:
        return err.message || '未知错误'
    }
  }
  
  // 标准化错误对象
  normalizeError(error) {
    // 已经是标准格式的错误对象
    if (error.status && error.message) {
      return error
    }
    
    // Axios 错误响应
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || error.message,
        code: error.response.data?.code
      }
    }
    
    // Axios 请求设置错误
    if (error.request) {
      if (error.code === 'ECONNABORTED') {
        return { status: 'TIMEOUT_ERROR', message: '请求超时' }
      }
      return { status: 'NETWORK_ERROR', message: '网络错误' }
    }
    
    // 其他未知错误
    return {
      status: 'UNKNOWN_ERROR',
      message: error.message || '未知错误'
    }
  }
  
  // 显示消息提示
  showMessage(error, type = 'error') {
    const message = this.getErrorMessage(error)
    
    ElMessage({
      message,
      type,
      showClose: true,
      duration: 3000
    })
  }
  
  // 显示通知提示
  showNotification(error, title = '错误', type = 'error') {
    const message = this.getErrorMessage(error)
    
    ElNotification({
      title: title,
      message,
      type,
      duration: 4500
    })
  }
  
  // 处理API错误
  handleApiError(error) {
    console.error('API Error:', error)
    this.showMessage(error)
    return Promise.reject(error)
  }
}

// 创建单例实例
const errorHandler = new ErrorHandler()

export default errorHandler
