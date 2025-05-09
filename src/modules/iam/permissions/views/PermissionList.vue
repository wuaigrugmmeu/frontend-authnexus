<template>
  <div class="permission-list-container">
    <div class="page-header">
      <h2 class="page-title">权限管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreatePermission" v-if="hasCreatePermission">
          <el-icon><Plus /></el-icon>
          <span>新增权限</span>
        </el-button>
        
        <el-button type="success" @click="handleRefreshPermissions" v-if="hasRefreshPermission">
          <el-icon><Refresh /></el-icon>
          <span>同步权限</span>
        </el-button>
      </div>
    </div>
    
    <!-- 权限树形表格 -->
    <el-card class="tree-table-card">
      <template #header>
        <div class="card-header">
          <div class="left">
            <el-input
              v-model="filterText"
              placeholder="搜索权限名称或标识"
              clearable
              prefix-icon="Search"
              @input="filterPermissionTable"
              style="width: 250px"
            />
          </div>
          <div class="right">
            <el-button type="primary" plain size="small" @click="expandAll">
              <el-icon><ArrowDown /></el-icon>
              <span>展开全部</span>
            </el-button>
            <el-button type="info" plain size="small" @click="collapseAll">
              <el-icon><ArrowUp /></el-icon>
              <span>收起全部</span>
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        ref="permissionTableRef"
        v-loading="loading"
        :data="permissionTableData"
        row-key="id"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        highlight-current-row
        @row-click="handleRowClick"
      >
        <!-- 名称列 -->
        <el-table-column prop="name" label="权限名称" min-width="180">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
            <el-tag type="info" size="small" v-if="row.isMenu" class="tag-margin">菜单</el-tag>
            <el-tag type="warning" size="small" v-if="row.isButton" class="tag-margin">按钮</el-tag>
            <el-tag type="success" size="small" v-if="row.isApi" class="tag-margin">接口</el-tag>
          </template>
        </el-table-column>
        
        <!-- 标识列 -->
        <el-table-column prop="code" label="权限标识" min-width="220" />
        
        <!-- 路径列 -->
        <el-table-column prop="path" label="路径" min-width="180" />
        
        <!-- 图标列 -->
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <!-- 排序列 -->
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        
        <!-- 状态列 -->
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              :disabled="!hasUpdatePermission"
            />
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              plain
              @click.stop="handleEditPermission(row)"
              v-if="hasUpdatePermission"
            >
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            
            <el-button
              type="primary"
              size="small"
              plain
              @click.stop="handleAddChild(row)"
              v-if="hasCreatePermission"
            >
              <el-icon><Plus /></el-icon>
              <span>添加子项</span>
            </el-button>
            
            <el-button
              type="danger"
              size="small"
              plain
              @click.stop="handleDeletePermission(row)"
              v-if="hasDeletePermission"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 权限表单弹窗 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionRules"
        label-width="100px"
      >
        <el-form-item label="上级权限">
          <el-tree-select
            v-model="permissionForm.parentId"
            :data="permissionOptions"
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            check-strictly
            default-expand-all
            placeholder="请选择上级权限，不选则为顶级权限"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="权限类型">
          <el-radio-group v-model="permissionForm.type">
            <el-radio label="menu">菜单权限</el-radio>
            <el-radio label="button">按钮权限</el-radio>
            <el-radio label="api">接口权限</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限标识，如：user:create" />
        </el-form-item>
        
        <template v-if="permissionForm.type === 'menu'">
          <el-form-item label="菜单路径" prop="path">
            <el-input v-model="permissionForm.path" placeholder="请输入菜单路径，如：/system/user" />
          </el-form-item>
          
          <el-form-item label="菜单图标">
            <el-popover
              placement="bottom"
              :width="400"
              trigger="click"
            >
              <template #reference>
                <el-input v-model="permissionForm.icon" placeholder="请选择菜单图标">
                  <template #prepend>
                    <el-icon v-if="permissionForm.icon">
                      <component :is="permissionForm.icon" />
                    </el-icon>
                    <span v-else>图标</span>
                  </template>
                </el-input>
              </template>
              <div class="icon-selector">
                <div 
                  v-for="icon in iconList" 
                  :key="icon" 
                  class="icon-item" 
                  @click="selectIcon(icon)"
                >
                  <el-icon>
                    <component :is="icon" />
                  </el-icon>
                  <span class="icon-name">{{ icon }}</span>
                </div>
              </div>
            </el-popover>
          </el-form-item>
        </template>
        
        <template v-if="permissionForm.type === 'api'">
          <el-form-item label="接口路径" prop="apiPath">
            <el-input v-model="permissionForm.apiPath" placeholder="请输入接口路径，如：/api/users" />
          </el-form-item>
          
          <el-form-item label="请求方法">
            <el-select v-model="permissionForm.apiMethod" placeholder="请选择请求方法" style="width: 100%">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
              <el-option label="全部" value="*" />
            </el-select>
          </el-form-item>
        </template>
        
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="permissionForm.sortOrder" :min="0" :max="9999" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch
            v-model="permissionForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="permissionForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPermissionForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, ArrowUp, Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { 
  getPermissionList, 
  createPermission, 
  updatePermission, 
  deletePermission,
  refreshSystemPermissions
} from '@/api/modules/permission'

const authStore = useAuthStore()

// 权限表格相关
const permissionTableRef = ref(null)
const loading = ref(false)
const permissionTableData = ref([])
const filterText = ref('')
const allPermissions = ref([])

// 权限表单弹窗相关
const permissionDialogVisible = ref(false)
const permissionFormRef = ref(null)
const submitLoading = ref(false)
const isEdit = ref(false)
const currentPermissionId = ref(null)
const currentParentId = ref(null)

// 权限表单数据
const permissionForm = reactive({
  parentId: null,
  type: 'menu',
  name: '',
  code: '',
  path: '',
  icon: '',
  apiPath: '',
  apiMethod: 'GET',
  sortOrder: 0,
  status: 1,
  remark: ''
})

// 权限表单校验规则
const permissionRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限标识', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_:]+$/, message: '权限标识只能包含字母、数字、下划线和冒号', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入菜单路径', trigger: 'blur' }
  ],
  apiPath: [
    { required: true, message: '请输入接口路径', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 图标列表
const iconList = [
  'HomeFilled', 'User', 'Setting', 'Edit', 'Delete', 'Search', 
  'Plus', 'View', 'Refresh', 'Lock', 'Menu', 'Key', 'Monitor', 
  'Grid', 'DataLine', 'Document', 'Folder', 'Notification', 'Calendar'
]

// 权限下拉选项
const permissionOptions = ref([])

// 对话框标题
const dialogTitle = computed(() => {
  if (isEdit.value) {
    return '编辑权限'
  }
  if (currentParentId.value) {
    return '添加子权限'
  }
  return '新增权限'
})

// 权限控制
const hasCreatePermission = computed(() => authStore.hasPermission('permission:create'))
const hasUpdatePermission = computed(() => authStore.hasPermission('permission:update'))
const hasDeletePermission = computed(() => authStore.hasPermission('permission:delete'))
const hasRefreshPermission = computed(() => authStore.hasPermission('permission:refresh'))

// 获取权限列表
const fetchPermissions = async () => {
  try {
    loading.value = true
    const data = await getPermissionList()
    allPermissions.value = data
    permissionTableData.value = data
    preparePermissionOptions()
  } catch (error) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

// 处理权限表格过滤
const filterPermissionTable = () => {
  if (!filterText.value) {
    permissionTableData.value = [...allPermissions.value]
    return
  }
  
  const filterLower = filterText.value.toLowerCase()
  
  // 递归过滤，保留匹配的节点及其父节点
  const filterTreeData = (data, keyword) => {
    const result = []
    
    for (const node of data) {
      // 如果当前节点匹配
      if (
        node.name.toLowerCase().includes(keyword) || 
        (node.code && node.code.toLowerCase().includes(keyword))
      ) {
        result.push({ ...node })
        continue
      }
      
      // 递归检查子节点
      if (node.children && node.children.length) {
        const filteredChildren = filterTreeData(node.children, keyword)
        if (filteredChildren.length) {
          result.push({
            ...node,
            children: filteredChildren
          })
        }
      }
    }
    
    return result
  }
  
  permissionTableData.value = filterTreeData(allPermissions.value, filterLower)
}

// 准备权限选项
const preparePermissionOptions = () => {
  // 添加一个虚拟的根节点
  permissionOptions.value = [
    { id: null, name: '顶级权限', children: [...allPermissions.value] }
  ]
}

// 展开所有节点
const expandAll = () => {
  permissionTableRef.value?.expandAll()
}

// 收起所有节点
const collapseAll = () => {
  permissionTableRef.value?.collapseAll()
}

// 处理行点击
const handleRowClick = (row) => {
  // 可以实现行选中效果或其他操作
}

// 处理状态变更
const handleStatusChange = async (row) => {
  try {
    await updatePermission(row.id, { status: row.status })
    ElMessage.success(`权限 "${row.name}" 状态已${row.status === 1 ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('更新权限状态失败:', error)
    ElMessage.error('更新权限状态失败')
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 选择图标
const selectIcon = (icon) => {
  permissionForm.icon = icon
}

// 打开新增权限弹窗
const handleCreatePermission = () => {
  isEdit.value = false
  currentPermissionId.value = null
  currentParentId.value = null
  
  resetPermissionForm()
  permissionDialogVisible.value = true
}

// 打开添加子权限弹窗
const handleAddChild = (row) => {
  isEdit.value = false
  currentPermissionId.value = null
  currentParentId.value = row.id
  
  resetPermissionForm()
  permissionForm.parentId = row.id
  permissionDialogVisible.value = true
}

// 打开编辑权限弹窗
const handleEditPermission = (row) => {
  isEdit.value = true
  currentPermissionId.value = row.id
  
  resetPermissionForm()
  
  // 设置表单数据
  Object.assign(permissionForm, {
    parentId: row.parentId,
    type: row.isMenu ? 'menu' : (row.isButton ? 'button' : 'api'),
    name: row.name,
    code: row.code,
    path: row.path || '',
    icon: row.icon || '',
    apiPath: row.apiPath || '',
    apiMethod: row.apiMethod || 'GET',
    sortOrder: row.sortOrder,
    status: row.status,
    remark: row.remark || ''
  })
  
  permissionDialogVisible.value = true
}

// 处理删除权限
const handleDeletePermission = async (row) => {
  // 检查是否有子权限
  if (row.children && row.children.length > 0) {
    ElMessage.warning('该权限下存在子权限，请先删除子权限')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除权限 "${row.name}" 吗？删除后将无法恢复！`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await deletePermission(row.id)
    ElMessage.success('删除成功')
    
    // 重新获取权限列表
    fetchPermissions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除权限失败:', error)
      ElMessage.error('删除权限失败')
    }
  }
}

// 处理同步权限
const handleRefreshPermissions = async () => {
  try {
    await ElMessageBox.confirm('确定要同步系统权限吗？这将根据代码中的权限注解重新生成权限数据。', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    loading.value = true
    
    await refreshSystemPermissions()
    ElMessage.success('权限同步成功')
    
    // 重新获取权限列表
    await fetchPermissions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('同步权限失败:', error)
      ElMessage.error('同步权限失败')
    }
  } finally {
    loading.value = false
  }
}

// 重置权限表单
const resetPermissionForm = () => {
  if (permissionFormRef.value) {
    permissionFormRef.value.resetFields()
  }
  
  // 重置表单数据
  Object.assign(permissionForm, {
    parentId: currentParentId.value || null,
    type: 'menu',
    name: '',
    code: '',
    path: '',
    icon: '',
    apiPath: '',
    apiMethod: 'GET',
    sortOrder: 0,
    status: 1,
    remark: ''
  })
}

// 提交权限表单
const submitPermissionForm = async () => {
  if (!permissionFormRef.value) return
  
  try {
    await permissionFormRef.value.validate()
    
    submitLoading.value = true
    
    // 转换表单数据
    const submitData = {
      parentId: permissionForm.parentId || null,
      name: permissionForm.name,
      code: permissionForm.code,
      isMenu: permissionForm.type === 'menu',
      isButton: permissionForm.type === 'button',
      isApi: permissionForm.type === 'api',
      path: permissionForm.type === 'menu' ? permissionForm.path : '',
      icon: permissionForm.type === 'menu' ? permissionForm.icon : '',
      apiPath: permissionForm.type === 'api' ? permissionForm.apiPath : '',
      apiMethod: permissionForm.type === 'api' ? permissionForm.apiMethod : '',
      sortOrder: permissionForm.sortOrder,
      status: permissionForm.status,
      remark: permissionForm.remark
    }
    
    if (isEdit.value) {
      await updatePermission(currentPermissionId.value, submitData)
      ElMessage.success('权限更新成功')
    } else {
      await createPermission(submitData)
      ElMessage.success('权限创建成功')
    }
    
    permissionDialogVisible.value = false
    
    // 重新获取权限列表
    await fetchPermissions()
  } catch (error) {
    console.error(isEdit.value ? '更新权限失败:' : '创建权限失败:', error)
    ElMessage.error(isEdit.value ? '更新权限失败' : '创建权限失败')
  } finally {
    submitLoading.value = false
  }
}

// 组件挂载时获取权限列表
onMounted(() => {
  fetchPermissions()
})
</script>

<style lang="scss" scoped>
.permission-list-container {
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
    
    .header-actions {
      display: flex;
      gap: 10px;
    }
  }
  
  .tree-table-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .tag-margin {
    margin-left: 8px;
  }
  
  .icon-selector {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
    
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      cursor: pointer;
      border-radius: 4px;
      
      &:hover {
        background-color: #ecf5ff;
      }
      
      .el-icon {
        font-size: 20px;
        margin-bottom: 5px;
      }
      
      .icon-name {
        font-size: 12px;
        color: #606266;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        text-align: center;
      }
    }
  }
}
</style>
