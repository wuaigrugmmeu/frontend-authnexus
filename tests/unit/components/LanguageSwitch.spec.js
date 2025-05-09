import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageSwitch from '@/components/ui/elements/LanguageSwitch/index.vue'

// 模拟 vue-i18n
const mockI18n = {
  locale: {
    value: 'zh-CN'
  }
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n
}))

describe('LanguageSwitch.vue', () => {
  it('renders language switch correctly', () => {
    const wrapper = mount(LanguageSwitch)
    
    // 检查语言切换按钮是否存在
    expect(wrapper.find('.language-switch-container').exists()).toBe(true)
    
    // 检查当前语言名称是否正确
    expect(wrapper.find('.language-name').text()).toBe('简体中文')
    
    // 检查下拉菜单触发器是否存在
    expect(wrapper.find('.el-dropdown-link').exists()).toBe(true)
  })
  
  it('changes language when selecting from dropdown', async () => {
    const wrapper = mount(LanguageSwitch)
    
    // 模拟 localStorage
    const localStorageMock = {
      setItem: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })
    
    // 获取处理函数
    const instance = wrapper.vm
    
    // 直接调用语言切换方法
    instance.handleLanguageChange('en-US')
    
    // 验证语言已切换
    expect(mockI18n.locale.value).toBe('en-US')
    
    // 验证已保存到 localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'en-US')
  })
})
