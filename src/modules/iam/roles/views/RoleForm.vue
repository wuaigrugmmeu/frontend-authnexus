<template>
  <div class="role-form-container">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑角色' : '新增角色' }}</h2>
    </div>
    
    <el-card class="form-card">
      <EFormBuilder
        ref="formRef"
        v-model="formData"
        :schema="formSchema"
        :rules="formRules"
        :loading="loading"
        @submit="handleSubmit"
        @reset="handleReset"
      >
        <template #buttons>
          <el-button @click="goBack">返回</el-button>
        </template>
      </EFormBuilder>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import EFormBuilder from '@/components/ui/elements/EFormBuilder/index.vue'
import { createRole, getRoleDetail, updateRole } from '@/api/modules/role'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)
const roleId = computed(() => route.params.id)

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  description: '',
  status: 1,
  sortOrder: 0
})

// 表单字段配置
const formSchema = [
  {
    field: 'name',
    label: '角色名称',
    type: 'input',
    placeholder: '请输入角色名称',
    clearable: true
  },
  {
    field: 'code',
    label: '角色编码',
    type: 'input',
    placeholder: '请输入角色编码',
    clearable: true,
    disabled: isEdit.value // 编辑模式下不允许修改角色编码
  },
  {
    field: 'description',
    label: '角色描述',
    type: 'textarea',
    placeholder: '请输入角色描述',
    rows: 3,
    clearable: true
  },
  {
    field: 'status',
    label: '状态',
    type: 'switch',
    activeText: '启用',
    inactiveText: '禁用'
  },
  {
    field: 'sortOrder',
    label: '排序',
    type: 'number',
    min: 0,
    max: 9999
  }
]

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_:]+$/, message: '角色编码只能包含字母、数字、下划线和冒号', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 获取角色详情
const fetchRoleDetail = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    const roleDetail = await getRoleDetail(roleId.value)
    
    // 更新表单数据
    Object.keys(formData).forEach(key => {
      if (roleDetail[key] !== undefined) {
        formData[key] = roleDetail[key]
      }
    })
  } catch (error) {
    console.error('获取角色详情失败:', error)
    ElMessage.error('获取角色详情失败')
    goBack()
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true
    
    if (isEdit.value) {
      await updateRole(roleId.value, formData)
      ElMessage.success('角色更新成功')
    } else {
      await createRole(formData)
      ElMessage.success('角色创建成功')
    }
    
    goBack()
  } catch (error) {
    console.error(isEdit.value ? '更新角色失败:' : '创建角色失败:', error)
    ElMessage.error(isEdit.value ? '更新角色失败' : '创建角色失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (isEdit.value) {
    // 编辑模式下重新获取角色详情
    fetchRoleDetail()
  } else {
    // 新增模式下清空表单
    formRef.value?.resetForm()
  }
}

// 返回列表页
const goBack = () => {
  router.push('/iam/roles')
}

// 组件挂载时获取角色详情
onMounted(() => {
  fetchRoleDetail()
})
</script>

<style lang="scss" scoped>
.role-form-container {
  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 20px;
      font-weight: 500;
      color: #303133;
      margin: 0;
    }
  }
  
  .form-card {
    margin-bottom: 20px;
  }
}
</style>
