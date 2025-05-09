import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlusPlugin from './plugins/element-plus'
import i18n from './plugins/i18n'

// 导入全局样式
import './assets/main.css'
import './assets/styles/app.scss'

// 创建应用
const app = createApp(App)

// 注册插件
app.use(createPinia())
app.use(router)
app.use(ElementPlusPlugin)
app.use(i18n)

// 挂载应用
app.mount('#app')
