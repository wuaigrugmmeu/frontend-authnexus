<template>
  <div class="form-builder">
    <el-form
      :model="formData"
      :rules="rules"
      ref="formRef"
      :label-width="options.labelWidth || '120px'"
      :label-position="options.labelPosition || 'right'"
      :disabled="loading"
    >
      <template v-for="item in schema" :key="item.field">
        <!-- 普通输入框 -->
        <el-form-item
          v-if="item.type === 'input'"
          :label="item.label"
          :prop="item.field"
        >
          <el-input
            v-model="formData[item.field]"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :type="item.inputType || 'text'"
            :maxlength="item.maxlength"
            :show-word-limit="item.showWordLimit"
            :clearable="item.clearable !== false"
          />
        </el-form-item>
        
        <!-- 文本域 -->
        <el-form-item
          v-else-if="item.type === 'textarea'"
          :label="item.label"
          :prop="item.field"
        >
          <el-input
            v-model="formData[item.field]"
            type="textarea"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :maxlength="item.maxlength"
            :show-word-limit="item.showWordLimit"
            :rows="item.rows || 3"
          />
        </el-form-item>
        
        <!-- 选择器 -->
        <el-form-item
          v-else-if="item.type === 'select'"
          :label="item.label"
          :prop="item.field"
        >
          <el-select
            v-model="formData[item.field]"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :clearable="item.clearable !== false"
            :multiple="item.multiple"
            :collapse-tags="item.collapseTags"
            style="width: 100%"
          >
            <el-option
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
              :disabled="opt.disabled"
            />
          </el-select>
        </el-form-item>
        
        <!-- 单选框组 -->
        <el-form-item
          v-else-if="item.type === 'radio'"
          :label="item.label"
          :prop="item.field"
        >
          <el-radio-group
            v-model="formData[item.field]"
            :disabled="item.disabled"
          >
            <el-radio
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.value"
              :disabled="opt.disabled"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 复选框组 -->
        <el-form-item
          v-else-if="item.type === 'checkbox'"
          :label="item.label"
          :prop="item.field"
        >
          <el-checkbox-group
            v-model="formData[item.field]"
            :disabled="item.disabled"
          >
            <el-checkbox
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.value"
              :disabled="opt.disabled"
            >
              {{ opt.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <!-- 开关 -->
        <el-form-item
          v-else-if="item.type === 'switch'"
          :label="item.label"
          :prop="item.field"
        >
          <el-switch
            v-model="formData[item.field]"
            :disabled="item.disabled"
            :active-text="item.activeText"
            :inactive-text="item.inactiveText"
          />
        </el-form-item>
        
        <!-- 日期选择器 -->
        <el-form-item
          v-else-if="item.type === 'date'"
          :label="item.label"
          :prop="item.field"
        >
          <el-date-picker
            v-model="formData[item.field]"
            :type="item.dateType || 'date'"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :clearable="item.clearable !== false"
            style="width: 100%"
          />
        </el-form-item>
        
        <!-- 数字输入框 -->
        <el-form-item
          v-else-if="item.type === 'number'"
          :label="item.label"
          :prop="item.field"
        >
          <el-input-number
            v-model="formData[item.field]"
            :min="item.min"
            :max="item.max"
            :step="item.step || 1"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            style="width: 100%"
          />
        </el-form-item>
      </template>
      
      <!-- 表单按钮 -->
      <el-form-item v-if="showButtons">
        <el-button
          type="primary"
          :loading="loading"
          @click="submitForm"
        >
          {{ submitButtonText }}
        </el-button>
        <el-button @click="resetForm">{{ resetButtonText }}</el-button>
        <slot name="buttons"></slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  // 表单数据模型
  modelValue: {
    type: Object,
    required: true
  },
  // 表单字段配置
  schema: {
    type: Array,
    required: true
  },
  // 表单规则
  rules: {
    type: Object,
    default: () => ({})
  },
  // 表单配置选项
  options: {
    type: Object,
    default: () => ({})
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否显示按钮
  showButtons: {
    type: Boolean,
    default: true
  },
  // 提交按钮文字
  submitButtonText: {
    type: String,
    default: '提交'
  },
  // 重置按钮文字
  resetButtonText: {
    type: String,
    default: '重置'
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'reset'])

const formRef = ref(null)
const initialFormData = ref({})

// 计算属性：处理双向绑定
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 验证并提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', formData.value)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  
  formRef.value.resetFields()
  emit('reset')
}

// 在组件挂载时，保存初始表单数据用于重置
onMounted(() => {
  initialFormData.value = { ...formData.value }
})

// 暴露组件方法
defineExpose({
  submitForm,
  resetForm,
  validate: () => formRef.value?.validate(),
  getFormRef: () => formRef.value
})
</script>

<style lang="scss" scoped>
.form-builder {
  width: 100%;
}
</style>
