<template>
  <div class="application-form-container">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑应用' : '新增应用' }}</h2>
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
import { createApplication, getApplicationDetail, updateApplication } from '@/api/modules/application'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)
const applicationId = computed(() => route.params.id)

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  redirectUri: '',
  status: 1,
  allowedGrantTypes: ['authorization_code', 'refresh_token'],
  accessTokenValidity: 3600,
  refreshTokenValidity: 86400
})

// 表单字段配置
const formSchema = [
  {
    field: 'name',
    label: '应用名称',
    type: 'input',
    placeholder: '请输入应用名称',
    clearable: true
  },
  {
    field: 'description',
    label: '应用描述',
    type: 'textarea',
    placeholder: '请输入应用描述',
    rows: 3,
    clearable: true
  },
  {
    field: 'redirectUri',
    label: '回调地址',
    type: 'input',
    placeholder: '请输入应用回调地址，多个地址用逗号分隔',
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
    field: 'allowedGrantTypes',
    label: '授权类型',
    type: 'checkbox',
    options: [
      { label: '授权码模式', value: 'authorization_code' },
      { label: '密码模式', value: 'password' },
      { label: '客户端模式', value: 'client_credentials' },
      { label: '刷新令牌', value: 'refresh_token' }
    ]
  },
  {
    field: 'accessTokenValidity',
    label: '访问令牌有效期(秒)',
    type: 'number',
    min: 60,
    max: 86400,
    step: 60
  },
  {
    field: 'refreshTokenValidity',
    label: '刷新令牌有效期(秒)',
    type: 'number',
    min: 3600,
    max: 2592000,
    step: 3600
  }
]

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  redirectUri: [
    { required: true, message: '请输入应用回调地址', trigger: 'blur' }
  ],
  allowedGrantTypes: [
    { required: true, message: '请至少选择一种授权类型', trigger: 'change' }
  ],
  accessTokenValidity: [
    { required: true, message: '请设置访问令牌有效期', trigger: 'blur' }
  ],
  refreshTokenValidity: [
    { required: true, message: '请设置刷新令牌有效期', trigger: 'blur' }
  ]
}

// 获取应用详情
const fetchApplicationDetail = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    const detail = await getApplicationDetail(applicationId.value)
    
    // 更新表单数据
    Object.keys(formData).forEach(key => {
      if (detail[key] !== undefined) {
        formData[key] = detail[key]
      }
    })
  } catch (error) {
    console.error('获取应用详情失败:', error)
    ElMessage.error('获取应用详情失败')
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
      await updateApplication(applicationId.value, formData)
      ElMessage.success('应用更新成功')
    } else {
      await createApplication(formData)
      ElMessage.success('应用创建成功')
    }
    
    goBack()
  } catch (error) {
    console.error(isEdit.value ? '更新应用失败:' : '创建应用失败:', error)
    ElMessage.error(isEdit.value ? '更新应用失败' : '创建应用失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (isEdit.value) {
    // 编辑模式下重新获取应用详情
    fetchApplicationDetail()
  } else {
    // 新增模式下清空表单
    formRef.value?.resetForm()
  }
}

// 返回列表页
const goBack = () => {
  router.push('/applications/list')
}

// 组件挂载时获取应用详情
onMounted(() => {
  fetchApplicationDetail()
})
</script>

<style lang="scss" scoped>
.application-form-container {
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
