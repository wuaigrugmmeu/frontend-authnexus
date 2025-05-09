<template>
  <div class="user-form-container">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑用户' : '新增用户' }}</h2>
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
import { createUser, getUserDetail, updateUser } from '@/api/modules/user'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)
const userId = computed(() => route.params.id)

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  gender: 0,
  department: '',
  status: 1,
  remark: ''
})

// 表单字段配置
const formSchema = computed(() => [
  {
    field: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    disabled: isEdit.value, // 编辑模式下不允许修改用户名
    clearable: true
  },
  {
    field: 'name',
    label: '姓名',
    type: 'input',
    placeholder: '请输入姓名',
    clearable: true
  },
  {
    field: 'email',
    label: '邮箱',
    type: 'input',
    inputType: 'email',
    placeholder: '请输入邮箱',
    clearable: true
  },
  {
    field: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入手机号',
    clearable: true
  },
  // 新增用户时显示密码字段
  ...(!isEdit.value ? [
    {
      field: 'password',
      label: '密码',
      type: 'input',
      inputType: 'password',
      placeholder: '请输入密码',
      showPassword: true
    },
    {
      field: 'confirmPassword',
      label: '确认密码',
      type: 'input',
      inputType: 'password',
      placeholder: '请确认密码',
      showPassword: true
    }
  ] : []),
  {
    field: 'gender',
    label: '性别',
    type: 'radio',
    options: [
      { label: '未知', value: 0 },
      { label: '男', value: 1 },
      { label: '女', value: 2 }
    ]
  },
  {
    field: 'department',
    label: '部门',
    type: 'input',
    placeholder: '请输入部门',
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
    field: 'remark',
    label: '备注',
    type: 'textarea',
    placeholder: '请输入备注信息',
    rows: 3,
    clearable: true,
    showWordLimit: true,
    maxlength: 200
  }
])

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: !isEdit.value, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur'
    }
  ]
}

// 获取用户详情
const fetchUserDetail = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    const userDetail = await getUserDetail(userId.value)
    
    // 更新表单数据
    Object.keys(formData).forEach(key => {
      if (key !== 'password' && key !== 'confirmPassword' && userDetail[key] !== undefined) {
        formData[key] = userDetail[key]
      }
    })
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
    goBack()
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true
    
    // 提交前处理表单数据
    const submitData = { ...formData }
    // 编辑模式下删除密码字段
    if (isEdit.value) {
      delete submitData.password
      delete submitData.confirmPassword
    }
    // 删除确认密码字段
    else {
      delete submitData.confirmPassword
    }
    
    if (isEdit.value) {
      await updateUser(userId.value, submitData)
      ElMessage.success('用户更新成功')
    } else {
      await createUser(submitData)
      ElMessage.success('用户创建成功')
    }
    
    goBack()
  } catch (error) {
    console.error(isEdit.value ? '更新用户失败:' : '创建用户失败:', error)
    ElMessage.error(isEdit.value ? '更新用户失败' : '创建用户失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (isEdit.value) {
    // 编辑模式下重新获取用户详情
    fetchUserDetail()
  } else {
    // 新增模式下清空表单
    formRef.value?.resetForm()
  }
}

// 返回列表页
const goBack = () => {
  router.push('/iam/users')
}

// 组件挂载时获取用户详情
onMounted(() => {
  fetchUserDetail()
})
</script>

<style lang="scss" scoped>
.user-form-container {
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
