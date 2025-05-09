import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Breadcrumb from '@/components/ui/elements/Breadcrumb/index.vue'

// 模拟 vue-router
const mockRoute = {
  matched: [
    {
      path: '/dashboard',
      meta: { title: '首页' }
    },
    {
      path: '/iam',
      meta: { title: '用户权限' }
    },
    {
      path: '/iam/users',
      meta: { title: '用户管理' }
    }
  ],
  path: '/iam/users'
}

const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

describe('Breadcrumb.vue', () => {
  it('renders breadcrumb items correctly', () => {
    const wrapper = mount(Breadcrumb)
    
    // 检查面包屑项的数量是否正确
    const breadcrumbItems = wrapper.findAll('.el-breadcrumb__item')
    expect(breadcrumbItems.length).toBe(3)
    
    // 检查最后一项是否为当前路径
    const lastItem = breadcrumbItems[2]
    expect(lastItem.find('.no-redirect').exists()).toBe(true)
    expect(lastItem.find('.no-redirect').text()).toBe('用户管理')
    
    // 检查前两项是否为可点击链接
    const firstItem = breadcrumbItems[0]
    expect(firstItem.find('a').exists()).toBe(true)
    expect(firstItem.find('a').text()).toBe('首页')
    
    const secondItem = breadcrumbItems[1]
    expect(secondItem.find('a').exists()).toBe(true)
    expect(secondItem.find('a').text()).toBe('用户权限')
  })
  
  it('navigates when clicking on breadcrumb item', async () => {
    const wrapper = mount(Breadcrumb)
    
    // 点击第一个面包屑项
    await wrapper.findAll('a')[0].trigger('click')
    
    // 验证路由跳转被调用
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
  })
})
