<template>
  <div class="search-table">
    <!-- 搜索区域 -->
    <div v-if="showSearchForm" class="search-form">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <template v-for="item in searchSchema" :key="item.field">
          <el-form-item :label="item.label" :prop="item.field">
            <!-- 输入框 -->
            <el-input
              v-if="item.type === 'input'"
              v-model="searchForm[item.field]"
              :placeholder="item.placeholder"
              clearable
              @keyup.enter="handleSearch"
            />
            
            <!-- 选择器 -->
            <el-select
              v-else-if="item.type === 'select'"
              v-model="searchForm[item.field]"
              :placeholder="item.placeholder"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            
            <!-- 日期选择器 -->
            <el-date-picker
              v-else-if="item.type === 'date'"
              v-model="searchForm[item.field]"
              :type="item.dateType || 'date'"
              :placeholder="item.placeholder"
              clearable
              style="width: 200px"
            />
            
            <!-- 日期范围选择器 -->
            <el-date-picker
              v-else-if="item.type === 'daterange'"
              v-model="searchForm[item.field]"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              clearable
              style="width: 350px"
            />
          </el-form-item>
        </template>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            <span>重置</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 操作按钮区域 -->
    <div class="table-toolbar">
      <div class="left-buttons">
        <slot name="toolbar-left"></slot>
      </div>
      
      <div class="right-buttons">
        <el-tooltip content="刷新" placement="top">
          <el-button
            circle
            @click="fetchData"
            :loading="loading"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="列设置" placement="top">
          <el-button
            circle
            @click="columnSettingVisible = true"
          >
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
        
        <slot name="toolbar-right"></slot>
      </div>
    </div>
    
    <!-- 表格主体 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      :border="border"
      :stripe="stripe"
      :size="size"
      :height="height"
      :max-height="maxHeight"
      :show-header="showHeader"
      :show-summary="showSummary"
      :summary-method="summaryMethod"
      :row-class-name="rowClassName"
      :row-style="rowStyle"
      :cell-class-name="cellClassName"
      :cell-style="cellStyle"
      :header-row-class-name="headerRowClassName"
      :header-row-style="headerRowStyle"
      :header-cell-class-name="headerCellClassName"
      :header-cell-style="headerCellStyle"
      :row-key="rowKey"
      :empty-text="emptyText"
      highlight-current-row
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @sort-change="handleSortChange"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="55"
        align="center"
        fixed="left"
      />
      
      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        align="center"
        fixed="left"
      />
      
      <!-- 动态列 -->
      <template v-for="column in visibleColumns" :key="column.prop">
        <el-table-column
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :sortable="column.sortable"
          :align="column.align || 'left'"
          :show-overflow-tooltip="column.showOverflowTooltip !== false"
        >
          <template #default="scope">
            <!-- 插槽内容 -->
            <slot
              :name="column.prop"
              :row="scope.row"
              :column="column"
              :$index="scope.$index"
            >
              <!-- 默认内容显示 -->
              <template v-if="column.type === 'tag'">
                <el-tag :type="getTagType(scope.row[column.prop], column.options)">
                  {{ getTagLabel(scope.row[column.prop], column.options) }}
                </el-tag>
              </template>
              
              <!-- 日期格式化 -->
              <template v-else-if="column.type === 'date'">
                {{ formatDate(scope.row[column.prop], column.format) }}
              </template>
              
              <!-- 图片 -->
              <template v-else-if="column.type === 'image'">
                <el-image
                  :src="scope.row[column.prop]"
                  :preview-src-list="[scope.row[column.prop]]"
                  style="width: 50px; height: 50px"
                ></el-image>
              </template>
              
              <!-- 默认文本显示 -->
              <template v-else>
                {{ scope.row[column.prop] }}
              </template>
            </slot>
          </template>
        </el-table-column>
      </template>
      
      <!-- 操作列 -->
      <el-table-column
        v-if="showOperation"
        label="操作"
        :width="operationWidth"
        :fixed="operationFixed"
        align="center"
      >
        <template #default="scope">
          <slot
            name="operation"
            :row="scope.row"
            :$index="scope.$index"
          >
            <!-- 默认按钮组 -->
            <el-button
              v-if="operations.includes('view')"
              type="primary"
              size="small"
              plain
              @click.stop="handleView(scope.row)"
            >
              <el-icon><View /></el-icon>
              <span>查看</span>
            </el-button>
            
            <el-button
              v-if="operations.includes('edit')"
              type="primary"
              size="small"
              plain
              @click.stop="handleEdit(scope.row)"
            >
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            
            <el-button
              v-if="operations.includes('delete')"
              type="danger"
              size="small"
              plain
              @click.stop="handleDelete(scope.row)"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div v-if="showPagination" class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="pagination.pageSizes"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 列设置对话框 -->
    <el-dialog
      v-model="columnSettingVisible"
      title="列设置"
      width="500px"
      destroy-on-close
    >
      <el-checkbox
        v-model="selectAllColumns"
        :indeterminate="isIndeterminate"
        @change="handleSelectAllColumnsChange"
      >
        全选
      </el-checkbox>
      
      <el-divider />
      
      <el-checkbox-group v-model="selectedColumns" @change="handleSelectedColumnsChange">
        <el-checkbox
          v-for="column in columns"
          :key="column.prop"
          :label="column.prop"
          :disabled="column.required"
        >
          {{ column.label }}
        </el-checkbox>
      </el-checkbox-group>
      
      <template #footer>
        <el-button @click="columnSettingVisible = false">取消</el-button>
        <el-button type="primary" @click="saveColumnSetting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Delete, Edit, Refresh, Search, Setting, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  // 列配置
  columns: {
    type: Array,
    required: true
  },
  // 搜索表单配置
  searchSchema: {
    type: Array,
    default: () => []
  },
  // 表格数据
  data: {
    type: Array,
    default: () => []
  },
  // 是否显示搜索表单
  showSearchForm: {
    type: Boolean,
    default: true
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否显示边框
  border: {
    type: Boolean,
    default: true
  },
  // 是否显示斑马纹
  stripe: {
    type: Boolean,
    default: true
  },
  // 表格尺寸
  size: {
    type: String,
    default: 'default'
  },
  // 表格高度
  height: {
    type: [String, Number],
    default: undefined
  },
  // 表格最大高度
  maxHeight: {
    type: [String, Number],
    default: undefined
  },
  // 是否显示表头
  showHeader: {
    type: Boolean,
    default: true
  },
  // 是否显示汇总行
  showSummary: {
    type: Boolean,
    default: false
  },
  // 汇总方法
  summaryMethod: {
    type: Function,
    default: null
  },
  // 行类名
  rowClassName: {
    type: [String, Function],
    default: ''
  },
  // 行样式
  rowStyle: {
    type: [Object, Function],
    default: () => ({})
  },
  // 单元格类名
  cellClassName: {
    type: [String, Function],
    default: ''
  },
  // 单元格样式
  cellStyle: {
    type: [Object, Function],
    default: () => ({})
  },
  // 表头行类名
  headerRowClassName: {
    type: [String, Function],
    default: ''
  },
  // 表头行样式
  headerRowStyle: {
    type: [Object, Function],
    default: () => ({})
  },
  // 表头单元格类名
  headerCellClassName: {
    type: [String, Function],
    default: ''
  },
  // 表头单元格样式
  headerCellStyle: {
    type: [Object, Function],
    default: () => ({})
  },
  // 行标识属性
  rowKey: {
    type: String,
    default: 'id'
  },
  // 空数据文本
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  // 是否显示选择列
  showSelection: {
    type: Boolean,
    default: false
  },
  // 是否显示序号列
  showIndex: {
    type: Boolean,
    default: true
  },
  // 是否显示操作列
  showOperation: {
    type: Boolean,
    default: true
  },
  // 操作列宽度
  operationWidth: {
    type: [String, Number],
    default: 200
  },
  // 操作列固定
  operationFixed: {
    type: String,
    default: 'right'
  },
  // 操作按钮
  operations: {
    type: Array,
    default: () => ['view', 'edit', 'delete']
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 分页配置
  pagination: {
    type: Object,
    default: () => ({
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      total: 0
    })
  },
  // 远程获取数据的函数
  fetchDataFunc: {
    type: Function,
    default: null
  }
})

const emit = defineEmits([
  'update:pagination',
  'selection-change',
  'row-click',
  'sort-change',
  'search',
  'reset',
  'view',
  'edit',
  'delete',
  'refresh'
])

// 表格引用
const tableRef = ref(null)
// 搜索表单引用
const searchFormRef = ref(null)
// 表格数据
const tableData = computed(() => props.data)
// 搜索表单数据
const searchForm = ref({})
// 列设置对话框可见性
const columnSettingVisible = ref(false)
// 选中的列
const selectedColumns = ref([])
// 全选状态
const selectAllColumns = ref(false)
// 半选状态
const isIndeterminate = ref(false)
// 可见列
const visibleColumns = computed(() => {
  return props.columns.filter(column => selectedColumns.value.includes(column.prop))
})

// 初始化搜索表单数据
const initSearchForm = () => {
  const form = {}
  props.searchSchema.forEach(item => {
    form[item.field] = item.defaultValue !== undefined ? item.defaultValue : ''
  })
  searchForm.value = form
}

// 初始化选中列
const initSelectedColumns = () => {
  selectedColumns.value = props.columns
    .filter(column => column.hidden !== true)
    .map(column => column.prop)
  
  updateSelectAllStatus()
}

// 更新全选状态
const updateSelectAllStatus = () => {
  const allColumns = props.columns.filter(column => !column.required).map(column => column.prop)
  const selectedRequiredColumns = props.columns.filter(column => column.required).map(column => column.prop)
  
  selectAllColumns.value = selectedColumns.value.length === props.columns.length
  isIndeterminate.value = selectedColumns.value.length > selectedRequiredColumns.length && 
                          selectedColumns.value.length < props.columns.length
}

// 处理全选列变化
const handleSelectAllColumnsChange = (val) => {
  const requiredColumns = props.columns.filter(column => column.required).map(column => column.prop)
  
  selectedColumns.value = val 
    ? props.columns.map(column => column.prop)
    : [...requiredColumns]
  
  isIndeterminate.value = false
}

// 处理选中列变化
const handleSelectedColumnsChange = (val) => {
  updateSelectAllStatus()
}

// 保存列设置
const saveColumnSetting = () => {
  // 这里可以添加保存列设置到本地存储的逻辑
  columnSettingVisible.value = false
}

// 处理搜索
const handleSearch = () => {
  if (props.showPagination) {
    const newPagination = { ...props.pagination, currentPage: 1 }
    emit('update:pagination', newPagination)
  }
  
  emit('search', searchForm.value)
  fetchData()
}

// 处理重置
const handleReset = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  
  if (props.showPagination) {
    const newPagination = { ...props.pagination, currentPage: 1 }
    emit('update:pagination', newPagination)
  }
  
  emit('reset')
  fetchData()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

// 处理行点击
const handleRowClick = (row, column, event) => {
  emit('row-click', row, column, event)
}

// 处理排序变化
const handleSortChange = (sort) => {
  emit('sort-change', sort)
  fetchData()
}

// 处理页面大小变化
const handleSizeChange = (size) => {
  const newPagination = { ...props.pagination, pageSize: size, currentPage: 1 }
  emit('update:pagination', newPagination)
  fetchData()
}

// 处理当前页变化
const handleCurrentChange = (page) => {
  const newPagination = { ...props.pagination, currentPage: page }
  emit('update:pagination', newPagination)
  fetchData()
}

// 获取数据
const fetchData = () => {
  if (props.fetchDataFunc) {
    props.fetchDataFunc({
      ...searchForm.value,
      pageSize: props.pagination.pageSize,
      page: props.pagination.currentPage
    })
  }
  
  emit('refresh')
}

// 处理查看
const handleView = (row) => {
  emit('view', row)
}

// 处理编辑
const handleEdit = (row) => {
  emit('edit', row)
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('delete', row)
  }).catch(() => {})
}

// 获取标签类型
const getTagType = (value, options) => {
  if (!options || !options.length) return ''
  
  const option = options.find(opt => opt.value === value)
  return option ? option.type || '' : ''
}

// 获取标签标签
const getTagLabel = (value, options) => {
  if (!options || !options.length) return value
  
  const option = options.find(opt => opt.value === value)
  return option ? option.label : value
}

// 格式化日期
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  // 这里可以使用日期格式化库，如dayjs
  return new Date(date).toLocaleString()
}

// 监听分页变化
watch(() => props.pagination, (val) => {
  // 分页变化时可以进行一些操作
}, { deep: true })

// 组件挂载时
onMounted(() => {
  initSearchForm()
  initSelectedColumns()
  fetchData()
})

// 暴露方法
defineExpose({
  refresh: fetchData,
  reset: handleReset,
  getSelectedRows: () => tableRef.value?.getSelectionRows(),
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row, selected) => tableRef.value?.toggleRowSelection(row, selected)
})
</script>

<style lang="scss" scoped>
.search-table {
  width: 100%;
  
  .search-form {
    margin-bottom: 16px;
    padding: 18px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .left-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .right-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
