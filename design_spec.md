# 脉 MAI — 视觉设计规范

> 基于当前代码提取，暗色主题 + 金色强调色。
> 最后更新：2026-06-29

---

## 一、设计原则

- **移动端优先**：max-width 430px，适配手机竖屏
- **暗色主题**：深色背景减少视觉疲劳，适配训练后的户外/更衣室场景
- **信息层级分明**：通过字号、字重、颜色建立清晰的视觉层级
- **东方美学 + 现代科技**：Outfit（英文）+ Noto Serif SC（中文），金色强调色

---

## 二、颜色系统

### 2.1 背景色

| 变量 | 色值 | 用途 |
|---|---|---|
| `--bg` | `#0D0C0A` | 页面背景（最深） |
| `--surface` | `#171613` | 弹窗、Sheet 背景 |
| `--card` | `#1F1E19` | 卡片背景 |
| `--card-hover` | `#28261F` | 卡片悬停态 |

### 2.2 强调色（品牌色）

| 变量 | 色值 | 用途 |
|---|---|---|
| `--accent` | `#D4A44C` | 主按钮、链接、激活态、导航高亮、标签选中 |
| `--accent-glow` | `rgba(212,164,76,0.20)` | 光晕效果、悬停阴影 |
| `--accent-dim` | `rgba(212,164,76,0.10)` | 选中态背景、今日标签 |

渐变：`linear-gradient(135deg, var(--accent), #C08830)` — 主按钮、头像边框

### 2.3 语义色

| 变量 | 色值 | 语义 | 用途 |
|---|---|---|---|
| `--green` | `#6BBF6E` | 成功/积极 | 优秀状态、E 区间、完成标记 |
| `--green-dim` | `rgba(107,191,110,0.12)` | 成功背景 | 优秀标签背景 |
| `--amber` | `#E8A849` | 注意/中等 | 关注状态、T 区间、警告 |
| `--amber-dim` | `rgba(232,168,73,0.12)` | 注意背景 | 关注标签背景 |
| `--red` | `#D45C5C` | 危险/预警 | 预警状态、I 区间、录音中、通知角标 |
| `--red-dim` | `rgba(212,92,92,0.12)` | 危险背景 | 预警标签背景、错误提示 |
| `--blue` | `#5C9FD4` | 信息 | M 区间、信息提示 |
| `--blue-dim` | `rgba(92,159,212,0.12)` | 信息背景 | 信息标签背景 |

### 2.4 文字色

| 变量 | 色值 | 用途 |
|---|---|---|
| `--text` | `#F0EBE0` | 主文字（标题、数值） |
| `--text-secondary` | `#B8B2A8` | 次级文字（正文、描述） |
| `--text-dim` | `#B8B2A8` | 辅助文字（时间戳、标签、占位符） |

### 2.5 边框色

| 变量 | 色值 | 用途 |
|---|---|---|
| `--border` | `rgba(255,255,255,0.06)` | 标准卡片边框 |
| `--border-light` | `rgba(255,255,255,0.10)` | 悬停态边框、高亮边框 |

### 2.6 状态色组合

| 状态 | 背景色 | 文字色 | 边框色 |
|---|---|---|---|
| 优秀 | `#E1F5EE` | `#0F6E56` | `#9FE1CB` |
| 正常 | `#E6F1FB` | `#0C447C` | `#85B7EB` |
| 关注 | `#FAEEDA` | `#633806` | `#FAC775` |
| 预警 | `#FCEBEB` | `#791F1F` | `#F09595` |

### 2.7 训练区间色

| 区间 | 色值 | 含义 |
|---|---|---|
| E（轻松跑） | `#6BBF6E` 绿 | 有氧基础 |
| M（马拉松配速） | `#5C9FD4` 蓝 | 比赛配速 |
| T（乳酸阈） | `#E8A849` 琥珀 | 阈值训练 |
| I（间歇） | `#E87040` 橙 | 高强度 |
| R（重复） | `#D45C5C` 红 | 无氧冲刺 |

---

## 三、排版层级

### 3.1 字体

| 字体 | 变量 | 用途 |
|---|---|---|
| **Outfit** | `--font-primary` | 英文/数字/界面元素（主字体） |
| **Noto Serif SC** | `--font-serif` | 中文正文、训练日记、报告内容 |
| 系统无衬线 | fallback | PingFang SC、Microsoft YaHei |

### 3.2 字号体系

| 变量 | 值 | 用途 |
|---|---|---|
| `--text-xs` | `11px` | 辅助说明、时间戳、标签、错误提示 |
| `--text-sm` | `13px` | 正文默认、按钮文字、表单标签 |
| `--text-base` | `14px` | 页面标题、输入框文字、卡片正文 |
| `--text-lg` | `16px` | 区域标题、统计标签 |
| `--text-xl` | `20px` | 统计大数字、头像图标 |
| `--text-2xl` | `24px` | 页面主标题 |
| `--text-3xl` | `28px` | 问候语姓名 |

### 3.3 字重

| 字重 | 用途 |
|---|---|
| `300` | 极轻装饰文字 |
| `400` | 正文、未激活标签 |
| `500` | 卡片标题、按钮文字、表单标签 |
| `600` | 页面标题、激活态、统计数值 |
| `700` | 大数字、强调文字 |

### 3.4 行高

| 行高 | 用途 |
|---|---|
| `1.5` | 通知内容、短文本 |
| `1.6` | 按钮文字、表单 |
| `1.7` | 报告摘要、卡片正文 |
| `1.8` | 训练日记、长文本（Noto Serif SC） |

---

## 四、间距系统

### 4.1 语义化间距

| 变量 | 值 | 用途 |
|---|---|---|
| `--space-xs` | `4px` | 图标与标签间距 |
| `--space-sm` | `8px` | 列表项间距、表单网格 |
| `--space-md` | `16px` | 区域间距、页面内边距 |
| `--space-lg` | `24px` | 大区块间距 |
| `--space-xl` | `32px` | 登录页标题间距 |
| `--space-2xl` | `48px` | 页面顶部留白 |

### 4.2 常用间距

| 值 | 用途 |
|---|---|
| `4px 12px` | 标签按钮内边距 |
| `8px 0` | 导航容器内边距 |
| `10px 14px` | 标准输入框内边距 |
| `12px 16px` | 顶部导航栏内边距 |
| `14px 16px` | 标准卡片内边距 |
| `16px 22px` | 页面主内容区内边距 |
| `20px` | 弹窗内边距 |
| `24px 20px` | Hero 卡片内边距 |

### 4.3 Gap

| 值 | 用途 |
|---|---|
| `4px` | 步骤指示器间距 |
| `6px` | 标签按钮间距 |
| `8px` | 表单网格间距 |
| `10px` | 快捷操作按钮间距 |
| `12px` | 主布局网格间距 |
| `14px` | 卡片内图标与文字间距 |
| `16px` | 头像与文字间距 |
| `24px` | 大区块内元素间距 |

---

## 五、圆角

| 变量 | 值 | 用途 |
|---|---|---|
| `--radius-sm` | `10px` | 按钮、输入框、小卡片 |
| `--radius` | `16px` | 标准卡片、弹窗、标签按钮 |
| — | `12px` | 头像、中等卡片 |
| — | `20px` | Sheet 弹窗顶部 |
| — | `50%` | 圆形（头像、步骤指示器、通知角标） |

---

## 六、阴影

| 阴影 | 用途 |
|---|---|
| `0 0 30px var(--accent-glow)` | 主按钮悬停 |
| `0 0 20px var(--accent-glow)` | 头像悬停 |
| `0 8px 30px rgba(0,0,0,0.5)` | 通知下拉面板 |
| `0 0 50px rgba(212,92,92,0.3)` | 录音中脉冲 |
| `none` | 默认态 |

---

## 七、关键组件样式

### 7.1 标准卡片

```css
background: var(--card);
border-radius: 16px;
padding: 14px 16px;
border: 1px solid var(--border);
transition: border-color 0.2s, background 0.2s;
```

### 7.2 主按钮（CTA）

```css
width: 100%;
padding: 14px;
border-radius: 10px;
border: none;
background: linear-gradient(135deg, var(--accent), #C08830);
color: var(--bg);
font-family: inherit;
font-size: 14px;
font-weight: 600;
cursor: pointer;
transition: box-shadow 0.2s;
```

### 7.3 输入框

```css
width: 100%;
padding: 12px 14px;
background: var(--card);
border: 1px solid var(--border);
border-radius: 10px;
color: var(--text);
font-family: inherit;
font-size: 14px;
outline: none;
box-sizing: border-box;
transition: border-color 0.2s;
```

Focus 态：`border-color: var(--accent);`

### 7.4 顶部导航栏

```css
display: flex;
justify-content: space-between;
align-items: flex-start;
padding: 20px 22px 0;
```

### 7.5 底部导航栏

```css
position: fixed;
bottom: 0; left: 0; right: 0;
max-width: 430px;
margin: 0 auto;
background: var(--surface);
border-top: 1px solid var(--border);
display: flex;
justify-content: space-around;
padding: 8px 0;
z-index: 100;
```

- 图标：`18px`
- 标签：`10px`, `font-weight: 500`
- 激活态：`color: var(--accent); font-weight: 600;`
- 未激活态：`color: var(--text-dim); font-weight: 400;`

### 7.6 Hero 卡片（AI 报告）

```css
background: linear-gradient(135deg, rgba(30,38,52,0.6) 0%, rgba(30,26,22,0.4) 100%);
border: 1px solid var(--border);
border-radius: 16px;
padding: 24px 20px;
```

### 7.7 Sheet 弹窗

```css
position: fixed;
bottom: 0; left: 50%;
transform: translateX(-50%) translateY(0);
max-width: 430px; width: 100%;
background: var(--surface);
border-radius: 20px 20px 0 0;
max-height: 85vh; overflow-y: auto;
transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
```

### 7.8 通知角标

```css
position: absolute;
top: -2px; right: -6px;
background: var(--red);
color: #fff;
font-size: 10px;
font-weight: 600;
min-width: 16px; height: 16px;
border-radius: 8px;
display: flex; align-items: center; justify-content: center;
padding: 0 4px;
```

### 7.9 状态标签

```css
font-size: 10px;
padding: 2px 8px;
border-radius: 10px;
font-weight: 600;
/* 颜色由状态决定，参考 2.6 状态色组合 */
```

---

## 八、动画

| 动画 | 用途 | 参数 |
|---|---|---|
| `fadeUp` | 页面元素入场 | `0.4s ease`，延迟递增 `0.05s` |
| `pageIn` | 页面切换 | `0.35s ease` |
| `loading-spin` | 加载旋转 | `0.8s linear infinite` |
| `recordPulse` | 录音中脉冲 | `1.5s ease infinite` |
| `ringPulse` | 录音按钮光环 | `2.5s ease infinite` |

### 过渡

| 过渡 | 用途 |
|---|---|
| `all 0.2s` | 按钮悬停、卡片边框 |
| `all 0.25s ease` | 导航标签切换 |
| `transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)` | Sheet 弹窗滑入 |
| `opacity 0.3s ease` | 遮罩层淡入 |

---

## 九、布局

| 属性 | 值 | 用途 |
|---|---|---|
| 最大宽度 | `430px` | 全局容器（`#root`） |
| 最小高度 | `100vh` | 页面撑满屏幕 |
| 底部留白 | `70px` | 为底部导航栏留空间 |
| 内边距 | `0 22px` | 主内容区水平内边距 |

### 纹理覆盖层

```css
body::before {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none; z-index: 9999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,..."); /* fractalNoise */
}
```

---

## 十、图表规范（Recharts）

| 属性 | 值 |
|---|---|
| 网格线 | `rgba(255,255,255,0.04)`, 虚线 |
| 坐标轴刻度 | `11px`, `var(--text-dim)` |
| 提示框背景 | `var(--surface)` |
| 提示框边框 | `1px solid var(--border)` |
| 折线宽度 | `2px` |
| 折线点半径 | `3px` |

---

## 十一、国际化适配

- 三语切换：中文 / English / Italiano
- 字体 fallback：Outfit → PingFang SC → Microsoft YaHei
- 长文本处理：`text-overflow: ellipsis`、`-webkit-line-clamp`
- 训练区间标签、状态标签等使用 locale key 动态切换
