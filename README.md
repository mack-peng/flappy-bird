# Flappy Bird（管道小鸟）

从 [Awesome-Game](https://github.com/ordinaryA/Awesome-Game) 拆分的独立小游戏，Vue 2.7 + Vite 重构，全端响应式（桌面 / 平板 / 手机可玩）。

## 玩法

- 空格键或点击屏幕开始 / 跳跃
- 侧边栏（桌面）或难度下拉（移动端）切换普通 / 困难 / 疯狂难度
- 最高分刷新期间保留（sessionStorage）

## 开发

```bash
npm install
npm run dev      # 开发（Vite dev server）
npm run build    # 构建 → dist/
npm run preview  # 本地预览构建产物
```

## 结构

```
src/
├── main.js               # 入口（prototype 方法 + v-first 指令安装）
├── App.vue               # Rain 特效 + 游戏页 + Alert + Awesome 漫画
├── page/bird/index.vue   # 游戏本体（物理逻辑 + 缩放舞台）
├── components/           # alert / awesome / rain / ConfigSelect
├── constants/bird.js     # 难度配置
├── assets/{css,img}      # papercss + 手绘素材
├── store/                # Vuex（alert/cartoon/最高分）
└── utils/  mixins/
```

## 来源与说明

- 游戏逻辑来自 Awesome-Game（Vue 2.5 + webpack 3），迁移到 Vue 2.7 + Vite
- 响应式：`1000×530` 逻辑坐标层 `transform: scale()` 等比缩放；`<768px` 隐藏侧栏、启用下拉与触控
