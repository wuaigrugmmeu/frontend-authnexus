<template>
  <div class="user-list-container">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="primary" @click="handleCreateUser" v-if="hasCreatePermission">
        <el-icon><Plus /></el-icon>
        <span>新增用户</span>
      </el-button>
    </div>
    
    <ESearchTable
      ref="searchTableRef"
      :columns="columns"
      :search-schema="searchSchema"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :fetch-data-func="fetchUsers"
      @search="handleSearch"
      @reset="handleReset"
      @edit="handleEditUser"
      @view="handleViewUser"
      @delete="handleDeleteUser"
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
          @click.stop="handleViewUser(row)"
        >
          <el-icon><View /></el-icon>
          <span>查看</span>
        </el-button>
        
        <el-button
          type="primary"
          size="small"
          plain
          @click.stop="handleEditUser(row)"
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
              <el-dropdown-item command="resetPassword" v-if="hasResetPasswordPermission">重置密码</el-dropdown-item>
              <el-dropdown-item command="assignRoles" v-if="hasAssignRolePermission">分配角色</el-dropdown-item>
              <el-dropdown-item command="delete" v-if="hasDeletePermission" divided>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </ESearchTable>
    
    <!-- 分配角色弹窗 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="500px"
    >
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="用户">
          <span>{{ currentUser?.username }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="roleForm.roleIds">
            <el-checkbox
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.id"
            >
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssignRoles" :loading="roleSubmitting">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 重置密码弹窗 -->
    <el-dialog
      v-model="resetPasswordDialogVisible"
      title="重置密码"
      width="500px"
    >
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="100px"
      >
        <el-form-item label="用户">
          <span>{{ currentUser?.username }}</span>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请确认新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPassword" :loading="passwordSubmitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, More, Plus, View } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import ESearchTable from '@/components/ui/elements/ESearchTable/index.vue'
import { getUserList, deleteUser, getUserRoles, assignUserRoles, resetUserPassword } from '@/api/modules/user'

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

// 搜索表单配置
const searchSchema = [
  { label: '用户名', field: 'username', type: 'input', placeholder: '请输入用户名' },
  { label: '姓名', field: 'name', type: 'input', placeholder: '请输入姓名' },
  { label: '邮箱', field: 'email', type: 'input', placeholder: '请输入邮箱' },
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
  { prop: 'username', label: '用户名', minWidth: 120 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'email', label: '邮箱', minWidth: 150 },
  { prop: 'phone', label: '手机号', minWidth: 120 },
  { 
    prop: 'gender', 
    label: '性别', 
    minWidth: 80,
    type: 'tag',
    options: [
      { value: 1, label: '男', type: '' },
      { value: 2, label: '女', type: 'success' },
      { value: 0, label: '未知', type: 'info' }
    ]
  },
  { prop: 'department', label: '部门', minWidth: 120 },
  { 
    prop: 'status', 
    label: '状态', 
    minWidth: 100 
  },
  { prop: 'lastLoginTime', label: '最后登录时间', minWidth: 160, type: 'date' },
  { prop: 'createdAt', label: '创建时间', minWidth: 160, type: 'date' }
]

// 分配角色相关
const roleDialogVisible = ref(false)
const roleOptions = ref([])
const roleForm = reactive({
  userId: null,
  roleIds: []
})
const roleSubmitting = ref(false)

// 重置密码相关
const resetPasswordDialogVisible = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  userId: null,
  password: '',
  confirmPassword: ''
})
const passwordRules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur'
    }
  ]
}
const passwordSubmitting = ref(false)

// 当前选中的用户
const currentUser = ref(null)

// 权限控制
const hasCreatePermission = computed(() => authStore.hasPermission('user:create'))
const hasUpdatePermission = computed(() => authStore.hasPermission('user:update'))
const hasDeletePermission = computed(() => authStore.hasPermission('user:delete'))
const hasAssignRolePermission = computed(() => authStore.hasPermission('user:assign-role'))
const hasResetPasswordPermission = computed(() => authStore.hasPermission('user:reset-password'))

// 获取用户列表
const fetchUsers = async (params) => {
  try {
    loading.value = true
    const { list, total } = await getUserList(params)
    tableData.value = list
    pagination.value.total = total
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
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

// 处理用户创建
const handleCreateUser = () => {
  router.push('/iam/users/create')
}

// 处理用户编辑
const handleEditUser = (row) => {
  router.push(`/iam/users/edit/${row.id}`)
}

// 处理用户查看
const handleViewUser = (row) => {
  // 可以实现查看详情页，或者用弹窗展示
  ElMessage.info(`查看用户: ${row.username}`)
}

// 处理用户删除
const handleDeleteUser = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchUsers({
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

// 处理用户状态变更
const handleStatusChange = async (row) => {
  try {
    // 这里可以调用更新用户状态的 API
    ElMessage.success(`用户 "${row.username}" 状态已${row.status === 1 ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('更新用户状态失败:', error)
    ElMessage.error('更新用户状态失败')
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 处理下拉菜单命令
const handleCommand = (command, row) => {
  currentUser.value = row
  
  switch (command) {
    case 'resetPassword':
      openResetPasswordDialog(row)
      break
    case 'assignRoles':
      openAssignRolesDialog(row)
      break
    case 'delete':
      handleDeleteUser(row)
      break
  }
}

// 打开分配角色弹窗
const openAssignRolesDialog = async (row) => {
  try {
    roleForm.userId = row.id
    roleForm.roleIds = []
    
    // 获取所有角色列表和用户已有角色
    // 这里示例数据，实际应从API获取
    roleOptions.value = [
      { id: 1, name: '管理员' },
      { id: 2, name: '操作员' },
      { id: 3, name: '访客' },
      { id: 4, name: '审核员' }
    ]
    
    // 获取用户已有角色
    const userRoles = await getUserRoles(row.id)
    roleForm.roleIds = userRoles.map(role => role.id)
    
    roleDialogVisible.value = true
  } catch (error) {
    console.error('获取角色信息失败:', error)
    ElMessage.error('获取角色信息失败')
  }
}

// 提交分配角色
const submitAssignRoles = async () => {
  try {
    roleSubmitting.value = true
    await assignUserRoles(roleForm.userId, roleForm.roleIds)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
  } catch (error) {
    console.error('角色分配失败:', error)
    ElMessage.error('角色分配失败')
  } finally {
    roleSubmitting.value = false
  }
}

// 打开重置密码弹窗
const openResetPasswordDialog = (row) => {
  passwordForm.userId = row.id
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  resetPasswordDialogVisible.value = true
}

// 提交重置密码
const submitResetPassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    
    passwordSubmitting.value = true
    await resetUserPassword(passwordForm.userId, passwordForm.password)
    ElMessage.success('密码重置成功')
    resetPasswordDialogVisible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      console.error('密码重置失败:', error)
      if (typeof error === 'string') {
        ElMessage.error(error)
      } else {
        ElMessage.error('密码重置失败')
      }
    }
  } finally {
    passwordSubmitting.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers({
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize
  })
})
</script>

<style lang="scss" scoped>
.user-list-container {
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
}
</style>
