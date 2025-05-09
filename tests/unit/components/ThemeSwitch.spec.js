import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeSwitch from '@/components/ui/elements/ThemeSwitch/index.vue'
import { createPinia, setActivePinia } from 'pinia'

// 模拟 useThemeStore
vi.mock('@/stores/theme', () => ({
  useThemeStore: () => ({
    darkMode: false,
    setDarkMode: vi.fn()
  })
}))

describe('ThemeSwitch.vue', () => {
  beforeEach(() => {
    // 创建一个新的 Pinia 实例
    setActivePinia(createPinia())
    
    // 模拟 document.documentElement 操作
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        },
        setAttribute: vi.fn()
      }
    })
  })
  
  it('renders correctly', () => {
    const wrapper = mount(ThemeSwitch)
    expect(wrapper.find('.theme-switch-container').exists()).toBe(true)
  })
  
  it('toggles theme on click', async () => {
    const wrapper = mount(ThemeSwitch)
    const themeButton = wrapper.find('.theme-switch')
    
    // 初始状态应该显示太阳图标（亮色主题）
    expect(wrapper.find('.theme-switch').exists()).toBe(true)
    
    // 点击切换按钮
    await themeButton.trigger('click')
    
    // 验证调用了正确的 DOM 操作
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
  })
})
