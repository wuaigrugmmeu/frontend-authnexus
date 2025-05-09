<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
        <span 
          v-if="index === breadcrumbs.length - 1" 
          class="no-redirect"
        >{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const breadcrumbs = ref([])

// 从路由获取面包屑数据
const getBreadcrumbs = () => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 如果没有匹配的路由，显示首页
  if (!matched.length) {
    matched.push({
      path: '/dashboard',
      meta: { title: '首页' }
    })
  }
  
  breadcrumbs.value = matched.filter(item => item.meta && item.meta.title)
}

// 监听路由变化，更新面包屑
watch(
  () => route.path,
  () => {
    getBreadcrumbs()
  },
  { immediate: true }
)

// 处理面包屑点击
const handleLink = (item) => {
  router.push(item.path)
}
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: inline-block;
  line-height: 50px;
  font-size: 14px;
  
  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}

// 面包屑过渡动画
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter-from,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all 0.5s;
}

.breadcrumb-leave-active {
  position: absolute;
}
</style>
