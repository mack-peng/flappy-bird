# Flappy Bird agent

## 项目

- Vue 2.7 + Vite 5 + Vuex 3 + sass(dart-sass) + wowjs
- 由 ~/Projects/Awesome-Game 拆分迁移而来（该仓只读参考）
- GitHub: https://github.com/mack-peng/flappy-bird

## 命令

| 命令 | 作用 |
|------|------|
| npm run dev | Vite dev server |
| npm run build | 构建到 dist/ |
| npm run preview | 预览构建产物 |

## 约定

- commit 全英文 `<type>(<scope>): <desc>`；禁止 force push
- 游戏逻辑坐标固定 1000×530，视觉缩放走 `.scaler` 的 `--k`（勿把缩放写回 JS 坐标）
- 全局方法 HiAlert/HiImg 挂 Vue.prototype（src/utils/test.js）
- 响应式断点：<768px 隐藏侧栏用 ConfigSelect 下拉；触控 tap 与空格键共用 onStageTap
