import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'

// 全局设置 Vue Test Utils
config.global.plugins = [ElementPlus]

// 模拟 window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// 清除所有模拟
afterEach(() => {
  vi.resetAllMocks()
})

// 恢复所有模拟
afterAll(() => {
  vi.restoreAllMocks()
})
