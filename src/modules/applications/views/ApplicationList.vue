<template>
  <div class="application-list-container">
    <div class="page-header">
      <h2 class="page-title">应用管理</h2>
      <el-button type="primary" @click="handleCreateApplication" v-if="hasCreatePermission">
        <el-icon><Plus /></el-icon>
        <span>新增应用</span>
      </el-button>
    </div>
    
    <ESearchTable
      ref="searchTableRef"
      :columns="columns"
      :search-schema="searchSchema"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :fetch-data-func="fetchApplications"
      @search="handleSearch"
      @reset="handleReset"
      @edit="handleEditApplication"
      @view="handleViewApplication"
      @delete="handleDeleteApplication"
    >
      <!-- 状态列自定义渲染 -->
      <template #status="{ row }">
        <el-switch
          v-model="row.status"
          :active-value="1"
          :inactive-value="0"
          @change="handleStatusChange(row)"
          :disabled="!hasUpdatePermission"
        />
      </template>
      
      <!-- 自定义操作按钮 -->
      <template #operation="{ row }">
        <el-button
          type="primary"
          size="small"
          plain
          @click.stop="handleViewApplication(row)"
        >
          <el-icon><View /></el-icon>
          <span>查看</span>
        </el-button>
        
        <el-button
          type="primary"
          size="small"
          plain
          @click.stop="handleEditApplication(row)"
          v-if="hasUpdatePermission"
        >
          <el-icon><Edit /></el-icon>
          <span>编辑</span>
        </el-button>
        
        <el-dropdown trigger="click" @command="handleCommand($event, row)">
          <el-button size="small">
            <el-icon><More /></el-icon>
            <span>更多</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="generateSecret" v-if="hasSecretPermission">重置密钥</el-dropdown-item>
              <el-dropdown-item command="delete" v-if="hasDeletePermission" divided>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </ESearchTable>
    
    <!-- 重置密钥对话框 -->
    <el-dialog
      v-model="secretDialogVisible"
      title="应用密钥"
      width="600px"
    >
      <div class="secret-content">
        <p class="warning-text">
          <el-icon><Warning /></el-icon>
          重要提示：应用密钥仅显示一次，请妥善保存！
        </p>
        
        <div class="secret-item">
          <div class="item-label">应用 ID：</div>
          <div class="item-value">{{ secretInfo.appId }}</div>
          <el-button
            type="primary"
            size="small"
            circle
            @click="copyToClipboard(secretInfo.appId)"
          >
            <el-icon><CopyDocument /></el-icon>
          </el-button>
        </div>
        
        <div class="secret-item">
          <div class="item-label">应用密钥：</div>
          <div class="item-value">{{ secretInfo.appSecret }}</div>
          <el-button
            type="primary"
            size="small"
            circle
            @click="copyToClipboard(secretInfo.appSecret)"
          >
            <el-icon><CopyDocument /></el-icon>
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="secretDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Edit, More, Plus, View, Warning } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import ESearchTable from '@/components/ui/elements/ESearchTable/index.vue'
import { getApplicationList, deleteApplication, generateApplicationSecret } from '@/api/modules/application'

const router = useRouter()
const authStore = useAuthStore()

// 表格相关数据
const searchTableRef = ref(null)
const loading = ref(false)
const tableData = ref([])
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  total: 0
})

// 重置密钥对话框
const secretDialogVisible = ref(false)
const secretInfo = ref({
  appId: '',
  appSecret: ''
})

// 搜索表单配置
const searchSchema = [
  { label: '应用名称', field: 'name', type: 'input', placeholder: '请输入应用名称' },
  { label: '应用标识', field: 'appId', type: 'input', placeholder: '请输入应用标识' },
  { 
    label: '状态', 
    field: 'status', 
    type: 'select', 
    placeholder: '请选择状态',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
]

// 表格列配置
const columns = [
  { prop: 'name', label: '应用名称', minWidth: 150 },
  { prop: 'appId', label: '应用标识', minWidth: 200 },
  { prop: 'redirectUri', label: '回调地址', minWidth: 220 },
  { prop: 'description', label: '应用描述', minWidth: 200 },
  { 
    prop: 'status', 
    label: '状态', 
    minWidth: 100 
  },
  { prop: 'createdAt', label: '创建时间', minWidth: 160, type: 'date' },
  { prop: 'updatedAt', label: '更新时间', minWidth: 160, type: 'date' }
]

// 权限控制
const hasCreatePermission = computed(() => authStore.hasPermission('application:create'))
const hasUpdatePermission = computed(() => authStore.hasPermission('application:update'))
const hasDeletePermission = computed(() => authStore.hasPermission('application:delete'))
const hasSecretPermission = computed(() => authStore.hasPermission('application:secret'))

// 获取应用列表
const fetchApplications = async (params) => {
  try {
    loading.value = true
    const { list, total } = await getApplicationList(params)
    tableData.value = list
    pagination.value.total = total
  } catch (error) {
    console.error('获取应用列表失败:', error)
    ElMessage.error('获取应用列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = (formData) => {
  // 搜索由 ESearchTable 内部处理，这里可以添加额外逻辑
}

// 处理重置
const handleReset = () => {
  // 重置由 ESearchTable 内部处理，这里可以添加额外逻辑
}

// 处理应用创建
const handleCreateApplication = () => {
  router.push('/applications/create')
}

// 处理应用编辑
const handleEditApplication = (row) => {
  router.push(`/applications/edit/${row.id}`)
}

// 处理应用查看
const handleViewApplication = (row) => {
  router.push(`/applications/detail/${row.id}`)
}

// 处理应用删除
const handleDeleteApplication = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除应用 "${row.name}" 吗？删除后将无法恢复，相关的授权和配置也将被清除！`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await deleteApplication(row.id)
    ElMessage.success('删除成功')
    fetchApplications({
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除应用失败:', error)
      ElMessage.error('删除应用失败')
    }
  }
}

// 处理应用状态变更
const handleStatusChange = async (row) => {
  try {
    // 这里可以调用更新应用状态的 API
    ElMessage.success(`应用 "${row.name}" 状态已${row.status === 1 ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('更新应用状态失败:', error)
    ElMessage.error('更新应用状态失败')
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 处理下拉菜单命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'generateSecret':
      handleGenerateSecret(row)
      break
    case 'delete':
      handleDeleteApplication(row)
      break
  }
}

// 处理生成密钥
const handleGenerateSecret = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要重置应用 "${row.name}" 的密钥吗？重置后旧密钥将无法使用！`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const result = await generateApplicationSecret(row.id)
    secretInfo.value = {
      appId: result.appId,
      appSecret: result.appSecret
    }
    secretDialogVisible.value = true
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密钥失败:', error)
      ElMessage.error('重置密钥失败')
    }
  }
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchApplications({
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize
  })
})
</script>

<style lang="scss" scoped>
.application-list-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .page-title {
      font-size: 20px;
      font-weight: 500;
      color: #303133;
      margin: 0;
    }
  }
  
  .secret-content {
    .warning-text {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding: 10px;
      background-color: #fef0f0;
      border-radius: 4px;
      color: #f56c6c;
      
      .el-icon {
        margin-right: 8px;
      }
    }
    
    .secret-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      .item-label {
        width: 100px;
        font-weight: 500;
      }
      
      .item-value {
        flex: 1;
        font-family: monospace;
        background-color: #f5f7fa;
        padding: 8px 12px;
        border-radius: 4px;
        margin-right: 10px;
        word-break: break-all;
      }
    }
  }
}
</style>
