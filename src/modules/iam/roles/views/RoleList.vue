<template>
  <div class="role-list-container">
    <div class="page-header">
      <h2 class="page-title">角色管理</h2>
      <el-button type="primary" @click="handleCreateRole" v-if="hasCreatePermission">
        <el-icon><Plus /></el-icon>
        <span>新增角色</span>
      </el-button>
    </div>
    
    <ESearchTable
      ref="searchTableRef"
      :columns="columns"
      :search-schema="searchSchema"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :fetch-data-func="fetchRoles"
      @search="handleSearch"
      @reset="handleReset"
      @edit="handleEditRole"
      @view="handleViewRole"
      @delete="handleDeleteRole"
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
          @click.stop="handleViewRole(row)"
        >
          <el-icon><View /></el-icon>
          <span>查看</span>
        </el-button>
        
        <el-button
          type="primary"
          size="small"
          plain
          @click.stop="handleEditRole(row)"
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
              <el-dropdown-item command="assignPermissions" v-if="hasAssignPermissionPermission">分配权限</el-dropdown-item>
              <el-dropdown-item command="delete" v-if="hasDeletePermission" divided>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </ESearchTable>
    
    <!-- 分配权限弹窗 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="分配权限"
      width="600px"
    >
      <el-form :model="permissionForm" label-width="80px">
        <el-form-item label="角色">
          <span>{{ currentRole?.name }}</span>
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTreeData"
            :props="{ label: 'name', children: 'children' }"
            show-checkbox
            node-key="id"
            check-strictly
            default-expand-all
            :default-checked-keys="selectedPermissions"
            @check="handlePermissionCheck"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssignPermissions" :loading="permissionSubmitting">确定</el-button>
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
import { getRoleList, deleteRole, getRolePermissions, assignRolePermissions } from '@/api/modules/role'
import { getPermissionTree } from '@/api/modules/permission'

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
  { label: '角色名称', field: 'name', type: 'input', placeholder: '请输入角色名称' },
  { label: '角色编码', field: 'code', type: 'input', placeholder: '请输入角色编码' },
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
  { prop: 'name', label: '角色名称', minWidth: 150 },
  { prop: 'code', label: '角色编码', minWidth: 150 },
  { prop: 'description', label: '角色描述', minWidth: 200 },
  { 
    prop: 'status', 
    label: '状态', 
    minWidth: 100 
  },
  { prop: 'createdAt', label: '创建时间', minWidth: 160, type: 'date' },
  { prop: 'updatedAt', label: '更新时间', minWidth: 160, type: 'date' }
]

// 分配权限相关
const permissionDialogVisible = ref(false)
const permissionTreeRef = ref(null)
const permissionTreeData = ref([])
const selectedPermissions = ref([])
const permissionForm = reactive({
  roleId: null,
  permissionIds: []
})
const permissionSubmitting = ref(false)

// 当前选中的角色
const currentRole = ref(null)

// 权限控制
const hasCreatePermission = computed(() => authStore.hasPermission('role:create'))
const hasUpdatePermission = computed(() => authStore.hasPermission('role:update'))
const hasDeletePermission = computed(() => authStore.hasPermission('role:delete'))
const hasAssignPermissionPermission = computed(() => authStore.hasPermission('role:assign-permission'))

// 获取角色列表
const fetchRoles = async (params) => {
  try {
    loading.value = true
    const { list, total } = await getRoleList(params)
    tableData.value = list
    pagination.value.total = total
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
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

// 处理角色创建
const handleCreateRole = () => {
  router.push('/iam/roles/create')
}

// 处理角色编辑
const handleEditRole = (row) => {
  router.push(`/iam/roles/edit/${row.id}`)
}

// 处理角色查看
const handleViewRole = (row) => {
  // 可以实现查看详情页，或者用弹窗展示
  ElMessage.info(`查看角色: ${row.name}`)
}

// 处理角色删除
const handleDeleteRole = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？删除后将无法恢复！`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchRoles({
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败')
    }
  }
}

// 处理角色状态变更
const handleStatusChange = async (row) => {
  try {
    // 这里可以调用更新角色状态的 API
    ElMessage.success(`角色 "${row.name}" 状态已${row.status === 1 ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('更新角色状态失败:', error)
    ElMessage.error('更新角色状态失败')
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 处理下拉菜单命令
const handleCommand = (command, row) => {
  currentRole.value = row
  
  switch (command) {
    case 'assignPermissions':
      openAssignPermissionsDialog(row)
      break
    case 'delete':
      handleDeleteRole(row)
      break
  }
}

// 处理权限选择
const handlePermissionCheck = (data, { checkedKeys, checkedNodes }) => {
  permissionForm.permissionIds = [...checkedKeys]
}

// 打开分配权限弹窗
const openAssignPermissionsDialog = async (row) => {
  try {
    permissionForm.roleId = row.id
    permissionForm.permissionIds = []
    
    // 获取权限树和角色已有权限
    const [permissionTree, rolePermissions] = await Promise.all([
      getPermissionTree(),
      getRolePermissions(row.id)
    ])
    
    permissionTreeData.value = permissionTree
    selectedPermissions.value = rolePermissions.map(item => item.id)
    permissionForm.permissionIds = [...selectedPermissions.value]
    
    permissionDialogVisible.value = true
  } catch (error) {
    console.error('获取权限信息失败:', error)
    ElMessage.error('获取权限信息失败')
  }
}

// 提交分配权限
const submitAssignPermissions = async () => {
  try {
    permissionSubmitting.value = true
    await assignRolePermissions(permissionForm.roleId, permissionForm.permissionIds)
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('权限分配失败:', error)
    ElMessage.error('权限分配失败')
  } finally {
    permissionSubmitting.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchRoles({
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize
  })
})
</script>

<style lang="scss" scoped>
.role-list-container {
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
