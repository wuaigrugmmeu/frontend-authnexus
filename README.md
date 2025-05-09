# AuthNexus 前端系统

AuthNexus 前端系统是基于 Vue 3 构建的现代化管理系统，用于对接 AuthNexus 身份认证与授权管理平台。本项目提供了用户管理、角色管理、权限管理和应用管理等核心功能，支持系统管理员高效地管理身份认证和授权相关的各种资源。

## 项目概述

AuthNexus 是一套完整的身份认证与授权管理解决方案，包括以下核心功能：

- **用户管理**：创建、编辑、删除用户，管理用户状态，重置密码等
- **角色管理**：创建和管理角色，为角色分配权限
- **权限管理**：基于RBAC（基于角色的访问控制）的权限系统，细粒度控制系统功能访问权限
- **应用管理**：管理接入系统的各类应用，支持配置OAuth认证流程

## 特色功能

- **响应式设计**：完美适配不同尺寸的设备，包括桌面端和移动端
- **多语言支持**：内置中英文支持，可轻松扩展其他语言
- **主题切换**：支持浅色和深色两种主题，提升用户体验
- **权限控制**：基于RBAC模型的细粒度权限控制
- **错误处理**：统一的错误处理机制，友好的用户提示

## 技术栈

- **前端框架**: Vue 3 + Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **UI组件库**: Element Plus
- **HTTP客户端**: Axios
- **CSS预处理器**: Sass
- **国际化**: Vue I18n
- **单元测试**: Vitest + Vue Test Utils
- **打包工具**: Vite

## 项目结构

```
frontend-authnexus/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # API请求封装
│   │   ├── index.js            # API主入口
│   │   ├── core/               # 核心请求模块
│   │   │   ├── request.js      # axios实例和拦截器
│   │   ├── modules/            # 按模块划分的API
│   │       ├── auth.js         # 认证相关API
│   │       ├── user.js         # 用户相关API
│   │       ├── role.js         # 角色相关API
│   │       ├── permission.js   # 权限相关API
│   │       ├── application.js  # 应用相关API
│   ├── assets/                 # 资源文件
│   │   ├── images/             # 图片资源
│   │   ├── styles/             # 样式文件
│   │       ├── app.scss        # 全局样式
│   │       ├── theme.scss      # 主题样式
│   │       ├── element/        # Element Plus定制样式
│   ├── components/             # 通用组件
│   │   ├── ui/                 # UI组件
│   │       ├── elements/       # 基础元素组件
│   │           ├── Breadcrumb/    # 面包屑导航
│   │           ├── ThemeSwitch/   # 主题切换组件
│   │           ├── LanguageSwitch/ # 语言切换组件
│   │           ├── MobileNav/     # 移动端导航
│   │           ├── EFormBuilder/  # 表单构建器
│   │           ├── ESearchTable/  # 搜索表格组件
│   ├── layouts/                # 布局组件
│   │   ├── AppLayout.vue       # 主应用布局
│   ├── modules/                # 业务模块
│   │   ├── auth/               # 认证模块
│   │   ├── iam/                # 身份与访问管理模块
│   │   │   ├── users/          # 用户管理
│   │   │   ├── roles/          # 角色管理
│   │   │   ├── permissions/    # 权限管理
│   │   ├── applications/       # 应用管理模块
│   ├── plugins/                # 插件
│   │   ├── element-plus.js     # Element Plus配置
│   │   ├── i18n.js             # 国际化配置
│   │   ├── locales/            # 语言包
│   │       ├── zh-CN.json      # 中文语言包
│   │       ├── en-US.json      # 英文语言包
│   ├── router/                 # 路由配置
│   │   ├── index.js            # 主路由文件
│   ├── stores/                 # Pinia状态管理
│   │   ├── auth.js             # 认证状态管理
│   │   ├── theme.js            # 主题状态管理
│   ├── utils/                  # 工具函数
│   │   ├── errorHandler.js     # 错误处理工具
│   ├── views/                  # 页面视图
│   │   ├── LoginView.vue       # 登录页面
│   │   ├── DashboardView.vue   # 仪表盘页面
│   │   ├── 404View.vue         # 404页面
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 入口文件
├── tests/                      # 测试
│   ├── unit/                   # 单元测试
│   │   ├── components/         # 组件测试
│   ├── e2e/                    # 端到端测试
│   ├── setup.js                # 测试设置
├── .env                        # 环境变量
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── index.html                  # HTML模板
├── vite.config.js              # Vite配置
├── vitest.config.js            # Vitest配置
├── package.json                # 项目依赖
└── README.md                   # 项目说明
```

## 安装与运行

### 前提条件

- Node.js v16+
- npm 或 yarn

### 安装步骤

1. 克隆项目到本地

```bash
git clone https://github.com/your-organization/frontend-authnexus.git
cd frontend-authnexus
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

4. 构建生产版本

```bash
npm run build
# 或
yarn build
```

5. 运行测试

```bash
# 运行单元测试
npm run test
# 或
yarn test

# 监视模式运行测试
npm run test:watch
# 或
yarn test:watch

# 测试覆盖率报告
npm run test:coverage
# 或
yarn test:coverage
```

## 功能模块

### 1. 用户管理
- 用户列表：查看所有用户，支持搜索、筛选和分页
- 用户表单：创建和编辑用户信息
- 用户详情：查看用户详细信息和权限分配

### 2. 角色管理
- 角色列表：查看所有角色，支持搜索和筛选
- 角色表单：创建和编辑角色信息
- 权限分配：为角色分配权限

### 3. 权限管理
- 权限列表：以树形结构展示系统权限，支持搜索和筛选
- 权限创建：添加新的权限节点
- 权限编辑：修改权限信息

### 4. 应用管理
- 应用列表：查看所有接入的应用
- 应用表单：创建和编辑应用信息
- 应用详情：查看应用授权、统计和日志

### 5. 主题与国际化
- 主题切换：支持浅色和深色主题
- 语言切换：支持中英文切换

## 开发指南

### 添加新语言

1. 在 `src/plugins/locales` 目录下创建新的语言包文件（例如 `fr-FR.json`）
2. 将现有语言包的内容复制并翻译
3. 在 `src/plugins/i18n.js` 中导入并注册新语言包
4. 在语言切换组件 `src/components/ui/elements/LanguageSwitch/index.vue` 中添加新语言选项

### 添加新模块

1. 在 `src/modules` 目录下创建新的模块目录
2. 创建相关的视图、组件和API
3. 在 `src/router/index.js` 中添加新的路由配置
4. 在侧边栏菜单中添加新的导航项

### 权限控制

权限控制分为以下几个层面：

1. 路由级别权限：在路由配置中通过 `meta.permissions` 字段定义
2. 组件级别权限：使用权限指令控制组件的显示/隐藏
3. API级别权限：后端API根据用户角色和权限控制访问

## 部署

### Docker 部署

1. 构建Docker镜像

```bash
docker build -t frontend-authnexus .
```

2. 运行容器

```bash
docker run -d -p 80:80 --name authnexus-frontend frontend-authnexus
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/frontend-authnexus/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理配置
    location /api/ {
        proxy_pass http://your-backend-api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[MIT](LICENSE)

## 联系我们

如有问题或建议，请通过以下方式联系我们：

- Email: support@authnexus.com
- 问题: [GitHub Issues](https://github.com/your-organization/frontend-authnexus/issues)

3. 配置环境变量

复制 `.env.example` 文件为 `.env.local`，并根据您的环境进行配置：

```
VITE_API_BASE_URL=http://localhost:8080/api
```

4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

5. 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 核心功能

### 用户认证

- 登录/注册功能
- 令牌管理与刷新
- 权限验证

### 用户管理

- 用户列表：查看、搜索和筛选用户
- 用户表单：创建和编辑用户信息
- 用户角色分配：为用户分配角色
- 用户状态管理：启用/禁用用户
- 密码重置：管理员可重置用户密码

### 角色管理

- 角色列表：查看、搜索和筛选角色
- 角色表单：创建和编辑角色信息
- 权限分配：为角色分配权限
- 角色状态管理：启用/禁用角色

### 权限管理

- 权限列表：以树形结构展示权限
- 权限同步：同步系统权限
- 权限管理：创建、编辑和删除权限

### 应用管理

- 应用列表：查看和管理接入的应用
- 应用表单：创建和编辑应用信息
- 应用密钥管理：生成和重置应用密钥
- 应用权限配置：管理应用可访问的资源范围

## 自定义组件

### EFormBuilder

动态表单构建组件，用于快速创建各类表单。

**示例使用：**

```vue
<EFormBuilder
  v-model="formData"
  :schema="formSchema"
  :rules="formRules"
  :loading="loading"
  @submit="handleSubmit"
  @reset="handleReset"
/>
```

### ESearchTable

集成搜索、表格、分页和操作功能的综合组件，用于处理列表页面。

**示例使用：**

```vue
<ESearchTable
  :columns="columns"
  :search-schema="searchSchema"
  :data="tableData"
  :loading="loading"
  :pagination="pagination"
  :fetch-data-func="fetchData"
  @search="handleSearch"
  @reset="handleReset"
  @edit="handleEdit"
  @delete="handleDelete"
/>
```

## 权限控制

系统采用基于RBAC的权限控制模型，具有以下特点：

1. 路由级权限控制：通过路由meta配置控制页面访问权限
2. 组件级权限控制：通过权限指令控制组件展示
3. 功能级权限控制：通过权限检查函数控制功能使用

**权限使用示例：**

```vue
<!-- 路由配置 -->
{
  path: 'users',
  name: 'Users',
  component: () => import('@/modules/iam/users/views/UserList.vue'),
  meta: { title: '用户管理', permission: 'user:list' }
}

<!-- 组件使用 -->
<el-button v-if="hasPermission('user:create')">新增用户</el-button>
```

## API调用

使用封装的API模块进行后端接口调用：

```javascript
// 用户登录
import { login } from '@/api/modules/auth'

const handleLogin = async () => {
  try {
    const response = await login({ username, password })
    // 处理登录成功
  } catch (error) {
    // 处理登录失败
  }
}
```

## 贡献指南

1. Fork本项目
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个Pull Request

## 许可证

此项目基于 [MIT 许可证](LICENSE) 进行分发和使用。

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 项目问题：[GitHub Issues](https://github.com/your-organization/frontend-authnexus/issues)
- 电子邮件：support@example.com
