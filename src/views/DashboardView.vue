<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ backgroundColor: card.color }">
            <el-icon :size="24"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-value">{{ card.value }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <!-- 最近活动 -->
      <el-col :span="16">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>系统活动</span>
              <el-button class="button" type="text">查看全部</el-button>
            </div>
          </template>
          <div class="activity-list">
            <div class="activity-item" v-for="(activity, index) in recentActivities" :key="index">
              <el-avatar :size="32" :src="activity.avatar"></el-avatar>
              <div class="activity-content">
                <div class="activity-title">
                  <span class="username">{{ activity.username }}</span>
                  <span class="action">{{ activity.action }}</span>
                </div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 快捷入口 -->
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>快捷入口</span>
            </div>
          </template>
          <div class="quick-links">
            <el-button 
              v-for="link in quickLinks" 
              :key="link.title"
              class="quick-link-btn" 
              @click="navigateTo(link.route)"
            >
              <el-icon><component :is="link.icon" /></el-icon>
              <span>{{ link.title }}</span>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Grid, Setting, Key } from '@element-plus/icons-vue'

const router = useRouter()

// 统计卡片数据
const statCards = ref([
  { title: '用户总数', value: '2,458', icon: 'User', color: '#409eff' },
  { title: '角色总数', value: '12', icon: 'Lock', color: '#67c23a' },
  { title: '应用总数', value: '32', icon: 'Grid', color: '#e6a23c' },
  { title: '权限总数', value: '245', icon: 'Key', color: '#f56c6c' }
])

// 最近活动数据
const recentActivities = ref([
  {
    username: '管理员',
    action: '创建了新用户 "张三"',
    time: '10分钟前',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    username: '系统',
    action: '更新了权限配置',
    time: '1小时前',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    username: 'user1',
    action: '登录系统',
    time: '2小时前',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    username: '管理员',
    action: '创建了新应用 "测试应用"',
    time: '昨天 14:35',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    username: 'user2',
    action: '修改了个人资料',
    time: '昨天 09:12',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
])

// 快捷入口
const quickLinks = ref([
  { title: '用户管理', icon: 'User', route: '/iam/users' },
  { title: '角色管理', icon: 'Lock', route: '/iam/roles' },
  { title: '应用管理', icon: 'Grid', route: '/applications/list' },
  { title: '系统设置', icon: 'Setting', route: '/settings' }
])

// 导航方法
const navigateTo = (route) => {
  router.push(route)
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  .stat-icon {
    width: 52px;
    height: 52px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    color: white;
    margin-right: 12px;
  }
  
  .stat-info {
    flex: 1;
    
    .stat-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.chart-row {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.activity-list {
  .activity-item {
    display: flex;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #ebeef5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .activity-content {
      margin-left: 12px;
      flex: 1;
      
      .activity-title {
        font-size: 14px;
        margin-bottom: 4px;
        
        .username {
          font-weight: 500;
          margin-right: 5px;
        }
        
        .action {
          color: #606266;
        }
      }
      
      .activity-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .quick-link-btn {
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    .el-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
  }
}
</style>
