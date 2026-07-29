# UI 组件目录

> 来源：Uiverse.io，MIT 开源可商用
> 项目：西班牙语学习打卡平台

## 按钮

| 组件 | 原作者 | 效果 | 项目用法 |
|------|--------|------|----------|
| `BtnPrimary.jsx` | 0x-Sarthak | 紫底扩散填充+箭头滑出 | 主要操作（登录、打卡提交、新建挑战） |
| `BtnBrutal.jsx` | 0xnihilism | 粗野方块，hover图标旋转+文字浮现 | 功能入口卡片 |
| `BtnSwap.jsx` | AKAspidey01 | hover上滑切换确认 | 打卡确认按钮 |
| `BtnGhost.jsx` | AnshKaushal | 极简黑白，hover反色放大 | 取消、退出等次要操作 |

## 卡片

| 组件 | 原作者 | 效果 | 项目用法 |
|------|--------|------|----------|
| `CardGlow.jsx` | 05akalan57 | 角落光晕+内嵌边框 | 打卡卡片、通用容器 |
| `CardBrutal.jsx` | 0xnihilism | 微倾斜+粗黑边框+角落飘带 | 挑战列表卡片 |
| `CardSplit.jsx` | AbanoubMagdy1 | 分屏动画，hover撕裂+扫光 | 个人页身份卡 |

## 表单

| 组件 | 原作者 | 效果 | 项目用法 |
|------|--------|------|----------|
| `FormBrutal.jsx` | D3OXY | 硬边黑白+粗野按钮+分隔线 | 登录/注册 |
| `FormWarm.jsx` | Praashoo7 | 虚线暖金+奶油底色 | 打卡弹窗 |

## 导航

| 组件 | 原作者 | 效果 | 项目用法 |
|------|--------|------|----------|
| `NavTabbar` (CSS) | 3bdel3ziz-T (改编) | 选中放大+阴影+变色 | 底部导航栏 |

## 加载

| 组件 | 原作者 | 效果 | 项目用法 |
|------|--------|------|----------|
| `LoaderSpin` (CSS) | AHMED-MIT | 双环旋转 | 页面加载中 |

---

## 文件结构

```
src/components/
├── BtnPrimary.jsx    # 主按钮
├── BtnBrutal.jsx     # 粗野按钮
├── BtnSwap.jsx       # 滑动按钮
├── BtnGhost.jsx      # 幽灵按钮
├── CardGlow.jsx      # 光晕卡片
├── CardBrutal.jsx    # 粗野卡片
├── CardSplit.jsx     # 分屏卡片
├── FormBrutal.jsx    # 粗野表单
├── FormWarm.jsx      # 暖色表单
└── ...
src/styles/global.css # 所有UI组件CSS定义
```
