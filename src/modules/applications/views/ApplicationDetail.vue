<template>
  <div class="application-detail-container">
    <div class="page-header">
      <div class="left">
        <h2 class="page-title">应用详情</h2>
        <el-tag v-if="applicationDetail.status === 1" type="success">已启用</el-tag>
        <el-tag v-else type="info">已禁用</el-tag>
      </div>
      <div class="actions">
        <el-button type="primary" @click="handleEdit" v-if="hasUpdatePermission">
          <el-icon><Edit /></el-icon>
          <span>编辑</span>
        </el-button>
        <el-button type="danger" @click="handleDelete" v-if="hasDeletePermission">
          <el-icon><Delete /></el-icon>
          <span>删除</span>
        </el-button>
        <el-button @click="goBack">
          <el-icon><Back /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
    </div>
    
    <el-row :gutter="20">
      <!-- 基本信息 -->
      <el-col :span="24">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h3>基本信息</h3>
              <el-tag type="primary" effect="plain">{{applicationDetail.appId}}</el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="应用名称">{{applicationDetail.name}}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{formatDate(applicationDetail.createdAt)}}</el-descriptions-item>
            <el-descriptions-item label="回调地址" :span="2">{{applicationDetail.redirectUri}}</el-descriptions-item>
            <el-descriptions-item label="授权类型" :span="2">
              <el-tag size="small" v-for="type in applicationDetail.allowedGrantTypes" :key="type" class="grant-type-tag">
                {{formatGrantType(type)}}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="访问令牌有效期">{{formatDuration(applicationDetail.accessTokenValidity)}}</el-descriptions-item>
            <el-descriptions-item label="刷新令牌有效期">{{formatDuration(applicationDetail.refreshTokenValidity)}}</el-descriptions-item>
            <el-descriptions-item label="应用描述" :span="2">{{applicationDetail.description || '暂无描述'}}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 标签页 -->
    <el-card class="tab-card">
      <el-tabs v-model="activeTab">
        <!-- 用户授权 -->
        <el-tab-pane label="用户授权" name="users">
          <div class="tab-header">
            <el-input
              v-model="userSearchKeyword"
              placeholder="搜索用户名/姓名/邮箱"
              prefix-icon="Search"
              clearable
              @input="handleUserSearch"
              style="width: 250px"
            />
            <el-button type="primary" @click="openAssignUsers" v-if="hasAssignPermission">
              <el-icon><UserFilled /></el-icon>
              <span>授权用户</span>
            </el-button>
          </div>
          
          <el-table
            v-loading="userLoading"
            :data="userList"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="username" label="用户名" min-width="120" />
            <el-table-column prop="name" label="姓名" min-width="120" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column prop="department" label="部门" min-width="120" />
            <el-table-column prop="authorizedAt" label="授权时间" min-width="160">
              <template #default="{ row }">
                {{ formatDate(row.authorizedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" v-if="hasAssignPermission">
              <template #default="{ row }">
                <el-button type="danger" link size="small" @click="removeUserAuth(row)">
                  <el-icon><Remove /></el-icon>
                  <span>移除</span>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="userPagination.currentPage"
              v-model:page-size="userPagination.pageSize"
              :page-sizes="userPagination.pageSizes"
              :total="userPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleUserSizeChange"
              @current-change="handleUserCurrentChange"
            />
          </div>
        </el-tab-pane>
        
        <!-- 使用统计 -->
        <el-tab-pane label="使用统计" name="statistics">
          <div class="statistics-container">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="6">
                <el-card shadow="hover" class="stat-card">
                  <div class="stat-number">{{statistics.totalRequests}}</div>
                  <div class="stat-name">总请求数</div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-card shadow="hover" class="stat-card">
                  <div class="stat-number">{{statistics.activeUsers}}</div>
                  <div class="stat-name">活跃用户数</div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-card shadow="hover" class="stat-card">
                  <div class="stat-number">{{statistics.avgResponseTime}}ms</div>
                  <div class="stat-name">平均响应时间</div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-card shadow="hover" class="stat-card">
                  <div class="stat-number">{{statistics.errorRate}}%</div>
                  <div class="stat-name">错误率</div>
                </el-card>
              </el-col>
            </el-row>
            
            <div class="chart-placeholder">
              <p class="chart-title">过去7天请求量趋势</p>
              <div class="mock-chart">
                <div class="mock-bar" v-for="(value, index) in mockChartData" :key="index" :style="{ height: value + '%' }"></div>
              </div>
              <div class="chart-dates">
                <div v-for="(date, index) in chartDates" :key="index">{{date}}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 访问日志 -->
        <el-tab-pane label="访问日志" name="logs">
          <div class="log-filter">
            <el-form :inline="true" :model="logFilterForm">
              <el-form-item label="操作类型">
                <el-select v-model="logFilterForm.action" placeholder="选择操作类型" clearable>
                  <el-option label="认证" value="AUTH" />
                  <el-option label="API调用" value="API_CALL" />
                </el-select>
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="logFilterForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="fetchLogs">查询</el-button>
                <el-button @click="resetLogFilter">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <el-table
            v-loading="logLoading"
            :data="logList"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="timestamp" label="时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="action" label="操作" width="100">
              <template #default="{ row }">
                <el-tag :type="row.action === 'AUTH' ? 'success' : 'primary'" size="small">
                  {{ row.action === 'AUTH' ? '认证' : 'API调用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="用户" width="120" />
            <el-table-column prop="ipAddress" label="IP地址" width="130" />
            <el-table-column prop="userAgent" label="用户代理" min-width="200" show-overflow-tooltip />
            <el-table-column prop="resource" label="资源" min-width="150" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'SUCCESS' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'SUCCESS' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="消息" min-width="200" show-overflow-tooltip />
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="logPagination.currentPage"
              v-model:page-size="logPagination.pageSize"
              :page-sizes="logPagination.pageSizes"
              :total="logPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleLogSizeChange"
              @current-change="handleLogCurrentChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 授权用户弹窗 -->
    <el-dialog
      v-model="userDialogVisible"
      title="授权用户"
      width="700px"
    >
      <div class="dialog-search">
        <el-input
          v-model="dialogUserKeyword"
          placeholder="搜索用户名/姓名/邮箱"
          prefix-icon="Search"
          clearable
          @input="searchDialogUsers"
          style="width: 250px"
        />
      </div>
      
      <el-table
        v-loading="dialogUserLoading"
        :data="allUserList"
        border
        height="350px"
        @selection-change="handleUserSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="department" label="部门" />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="dialogPagination.currentPage"
          v-model:page-size="dialogPagination.pageSize"
          :page-sizes="dialogPagination.pageSizes"
          :total="dialogPagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleDialogSizeChange"
          @current-change="handleDialogCurrentChange"
        />
      </div>
      
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssignUsers" :loading="assignUserLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Back, 
  Delete, 
  Edit, 
  Remove, 
  Search, 
  UserFilled 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { 
  getApplicationDetail, 
  deleteApplication, 
  getApplicationUsers,
  assignApplicationUsers,
  getApplicationLogs
} from '@/api/modules/application'
import { getUserList } from '@/api/modules/user'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 应用ID
const applicationId = computed(() => route.params.id)

// 应用详情数据
const applicationDetail = ref({
  id: '',
  name: '',
  appId: '',
  description: '',
  redirectUri: '',
  status: 1,
  allowedGrantTypes: [],
  accessTokenValidity: 3600,
  refreshTokenValidity: 86400,
  createdAt: '',
  updatedAt: ''
})

// 统计数据
const statistics = reactive({
  totalRequests: 15284,
  activeUsers: 427,
  avgResponseTime: 125,
  errorRate: 0.8
})

// 模拟图表数据
const mockChartData = ref([30, 45, 60, 35, 55, 70, 50])
const chartDates = ref([])

// 标签页相关
const activeTab = ref('users')

// 用户列表相关
const userList = ref([])
const userLoading = ref(false)
const userSearchKeyword = ref('')
const userPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  total: 0
})

// 日志列表相关
const logList = ref([])
const logLoading = ref(false)
const logFilterForm = reactive({
  action: '',
  dateRange: []
})
const logPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  total: 0
})

// 授权用户弹窗相关
const userDialogVisible = ref(false)
const dialogUserLoading = ref(false)
const dialogUserKeyword = ref('')
const allUserList = ref([])
const selectedUsers = ref([])
const assignUserLoading = ref(false)
const dialogPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50],
  total: 0
})

// 权限控制
const hasUpdatePermission = computed(() => authStore.hasPermission('application:update'))
const hasDeletePermission = computed(() => authStore.hasPermission('application:delete'))
const hasAssignPermission = computed(() => authStore.hasPermission('application:assign-user'))

// 获取应用详情
const fetchApplicationDetail = async () => {
  try {
    const data = await getApplicationDetail(applicationId.value)
    applicationDetail.value = data
  } catch (error) {
    console.error('获取应用详情失败:', error)
    ElMessage.error('获取应用详情失败')
    goBack()
  }
}

// 获取用户授权列表
const fetchUserList = async () => {
  try {
    userLoading.value = true
    const params = {
      page: userPagination.currentPage,
      pageSize: userPagination.pageSize,
      keyword: userSearchKeyword.value
    }
    
    const { list, total } = await getApplicationUsers(applicationId.value, params)
    userList.value = list
    userPagination.total = total
  } catch (error) {
    console.error('获取用户授权列表失败:', error)
    ElMessage.error('获取用户授权列表失败')
  } finally {
    userLoading.value = false
  }
}

// 获取访问日志
const fetchLogs = async () => {
  try {
    logLoading.value = true
    const params = {
      page: logPagination.currentPage,
      pageSize: logPagination.pageSize,
      action: logFilterForm.action,
      startDate: logFilterForm.dateRange?.[0],
      endDate: logFilterForm.dateRange?.[1]
    }
    
    const { list, total } = await getApplicationLogs(applicationId.value, params)
    logList.value = list
    logPagination.total = total
  } catch (error) {
    console.error('获取访问日志失败:', error)
    ElMessage.error('获取访问日志失败')
  } finally {
    logLoading.value = false
  }
}

// 重置日志筛选
const resetLogFilter = () => {
  logFilterForm.action = ''
  logFilterForm.dateRange = []
  fetchLogs()
}

// 获取所有用户列表(用于弹窗)
const fetchAllUsers = async () => {
  try {
    dialogUserLoading.value = true
    const params = {
      page: dialogPagination.currentPage,
      pageSize: dialogPagination.pageSize,
      keyword: dialogUserKeyword.value
    }
    
    const { list, total } = await getUserList(params)
    allUserList.value = list
    dialogPagination.total = total
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    dialogUserLoading.value = false
  }
}

// 用户搜索
const handleUserSearch = () => {
  userPagination.currentPage = 1
  fetchUserList()
}

// 弹窗用户搜索
const searchDialogUsers = () => {
  dialogPagination.currentPage = 1
  fetchAllUsers()
}

// 用户列表分页变化
const handleUserSizeChange = (size) => {
  userPagination.pageSize = size
  fetchUserList()
}

const handleUserCurrentChange = (page) => {
  userPagination.currentPage = page
  fetchUserList()
}

// 日志列表分页变化
const handleLogSizeChange = (size) => {
  logPagination.pageSize = size
  fetchLogs()
}

const handleLogCurrentChange = (page) => {
  logPagination.currentPage = page
  fetchLogs()
}

// 弹窗分页变化
const handleDialogSizeChange = (size) => {
  dialogPagination.pageSize = size
  fetchAllUsers()
}

const handleDialogCurrentChange = (page) => {
  dialogPagination.currentPage = page
  fetchAllUsers()
}

// 用户选择变化
const handleUserSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 打开授权用户弹窗
const openAssignUsers = () => {
  selectedUsers.value = []
  dialogUserKeyword.value = ''
  userDialogVisible.value = true
  dialogPagination.currentPage = 1
  fetchAllUsers()
}

// 提交用户授权
const submitAssignUsers = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }
  
  try {
    assignUserLoading.value = true
    const userIds = selectedUsers.value.map(user => user.id)
    await assignApplicationUsers(applicationId.value, userIds)
    ElMessage.success('用户授权成功')
    userDialogVisible.value = false
    
    // 重新获取用户授权列表
    fetchUserList()
  } catch (error) {
    console.error('用户授权失败:', error)
    ElMessage.error('用户授权失败')
  } finally {
    assignUserLoading.value = false
  }
}

// 移除用户授权
const removeUserAuth = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要移除用户 "${row.username}" 的授权吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    // TODO: 实现移除用户授权的API调用
    ElMessage.success(`已移除用户 "${row.username}" 的授权`)
    
    // 重新获取用户授权列表
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除用户授权失败:', error)
      ElMessage.error('移除用户授权失败')
    }
  }
}

// 处理编辑
const handleEdit = () => {
  router.push(`/applications/edit/${applicationId.value}`)
}

// 处理删除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除应用 "${applicationDetail.value.name}" 吗？删除后将无法恢复，相关的授权和配置也将被清除！`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await deleteApplication(applicationId.value)
    ElMessage.success('删除成功')
    goBack()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除应用失败:', error)
      ElMessage.error('删除应用失败')
    }
  }
}

// 返回列表页
const goBack = () => {
  router.push('/applications/list')
}

// 格式化授权类型
const formatGrantType = (type) => {
  const typeMap = {
    'authorization_code': '授权码模式',
    'implicit': '隐式授权模式',
    'password': '密码模式',
    'client_credentials': '客户端模式',
    'refresh_token': '刷新令牌'
  }
  return typeMap[type] || type
}

// 格式化时间
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化时间和日期
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${formatDate(dateStr)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}

// 格式化持续时间
const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}秒`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时`
  return `${Math.floor(seconds / 86400)}天`
}

// 生成过去7天日期
const generatePastDates = () => {
  const dates = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const month = date.getMonth() + 1
    const day = date.getDate()
    dates.push(`${month}/${day}`)
  }
  
  return dates
}

// 组件挂载时获取数据
onMounted(() => {
  fetchApplicationDetail()
  fetchUserList()
  fetchLogs()
  chartDates.value = generatePastDates()
})
</script>

<style lang="scss" scoped>
.application-detail-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .left {
      display: flex;
      align-items: center;
      
      .page-title {
        font-size: 20px;
        font-weight: 500;
        color: #303133;
        margin: 0;
        margin-right: 10px;
      }
    }
    
    .actions {
      display: flex;
      gap: 10px;
    }
  }
  
  .detail-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .grant-type-tag {
      margin-right: 8px;
      margin-bottom: 4px;
    }
  }
  
  .tab-card {
    margin-bottom: 20px;
    
    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .pagination-container {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .statistics-container {
    .stat-card {
      margin-bottom: 20px;
      text-align: center;
      padding: 15px;
      
      .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #409eff;
      }
      
      .stat-name {
        font-size: 14px;
        color: #606266;
        margin-top: 5px;
      }
    }
    
    .chart-placeholder {
      margin-top: 20px;
      
      .chart-title {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
      }
      
      .mock-chart {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        height: 250px;
        background-color: #f5f7fa;
        padding: 20px;
        border-radius: 4px;
        
        .mock-bar {
          width: 40px;
          background-color: #409eff;
          border-radius: 4px 4px 0 0;
          transition: height 0.5s ease;
        }
      }
      
      .chart-dates {
        display: flex;
        justify-content: space-between;
        padding: 10px 20px;
        color: #606266;
        font-size: 13px;
      }
    }
  }
  
  .log-filter {
    margin-bottom: 16px;
  }
  
  .dialog-search {
    margin-bottom: 16px;
  }
}
</style>
