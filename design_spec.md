# 运动训练分析系统 — 视觉设计规范

> 从运动员端前端代码中提取，用于统一各端界面风格。

---

## 一、颜色系统

### 1.1 主色（品牌色）

| 色值 | 名称 | 用途 |
|------|------|------|
| `#534AB7` | 主紫 | 按钮、链接、激活态、导航高亮、标签选中 |
| `#7F77DD` | 浅紫 | 渐变终点、图表线条 |
| `#3C3489` | 深紫 | 鼓励卡片文字 |
| `#AFA9EC` | 灰紫 | 禁用/加载中按钮背景 |

### 1.2 语义色

| 色值 | 语义 | 用途 |
|------|------|------|
| `#1D9E75` | 成功/积极 | 高亮、对勾、E区间、心率图线条 |
| `#0F6E56` | 深绿 | "优秀"状态文字、成功提示 |
| `#E1F5EE` | 浅绿背景 | "优秀"状态背景、成功提示背景 |
| `#9FE1CB` | 绿边框 | 成功提示边框 |
| `#E24B4A` | 危险/警告 | 通知角标、疲劳图线条、录音中、I区间 |
| `#791F1F` | 深红 | "预警"状态文字、R区间 |
| `#FCEBEB` | 浅红背景 | 错误/警告背景 |
| `#F09595` | 红边框 | 错误边框 |
| `#A32D2D` | 错误文字 | 错误提示文字 |
| `#BA7517` | 注意/琥珀 | "关注"状态、T区间、改进建议 |
| `#EF9F27` | 橙色 | 引用左边框 |
| `#633806` | 深棕 | "关注"状态文字 |

### 1.3 状态色（Badge/标签）

| 状态 | 背景色 | 文字色 | 边框色 |
|------|--------|--------|--------|
| 优秀 | `#E1F5EE` | `#0F6E56` | `#9FE1CB` |
| 正常 | `#E6F1FB` | `#0C447C` | `#85B7EB` |
| 关注 | `#FAEEDA` | `#633806` | `#FAC775` |
| 预警 | `#FCEBEB` | `#791F1F` | `#F09595` |

### 1.4 中性色

| 色值 | 用途 |
|------|------|
| `#ffffff` | 卡片背景、导航背景 |
| `#f8f7f4` | 输入框背景、次级按钮背景、列表项背景 |
| `#f1efe8` | 未选中背景、图表网格线、分隔线 |
| `#e0dfd8` | 主边框色、卡片边框、导航底边 |
| `#d3d1c7` | 次级按钮边框、未选中标签边框、禁用态 |
| `#EEEDFE` | 浅紫背景（今日高亮、选中标签） |
| `#CECBF6` | 浅紫边框（今日高亮、鼓励卡片） |
| `#B8A9E8` | 中紫（虚线上传区域、FIT卡片边框） |
| `#F5F3FF` | 极浅紫背景 |
| `#f0efec` | 悬停态背景 |

### 1.5 文字色

| 色值 | 用途 |
|------|------|
| `#2c2c2a` | 主文字（页面默认） |
| `#333` | 次级文字 |
| `#555` | 三级文字 |
| `#666` | 弱化文字（标签、图表标注） |
| `#888` | 辅助文字（时间戳、卡片标题） |
| `#999` | 极弱文字 |
| `#b4b2a9` | 占位符/空状态 |

### 1.6 渐变色

| 渐变 | 用途 |
|------|------|
| `linear-gradient(135deg, #534AB7, #7F77DD)` | 主按钮、麦克风空闲态 |
| `linear-gradient(135deg, #E24B4A, #F09595)` | 麦克风录音态 |
| `linear-gradient(135deg, #667eea, #764ba2)` | 登录页背景 |
| `linear-gradient(135deg, #EEEDFE, #F5F3FF)` | 鼓励卡片背景 |
| `linear-gradient(135deg, #E1F5EE, #f4fcf9)` | 关怀卡片背景 |

### 1.7 训练区间色

| 区间 | 色值 |
|------|------|
| E（轻松跑） | `#1D9E75` |
| M（马拉松） | `#534AB7` |
| T（门槛） | `#BA7517` |
| I（间歇） | `#E24B4A` |
| R（重复） | `#791F1F` |

---

## 二、排版层级

### 2.1 字体

- 字体族：`sans-serif`（系统默认无衬线字体）
- 全局应用于所有页面根 div 和 textarea

### 2.2 字号体系

| 字号 | 用途 |
|------|------|
| `10px` | 底部导航标签、时间戳、图表刻度、百分比标注 |
| `11px` | 辅助说明、设备信息、步骤标签、错误提示、表单标签 |
| `12px` | 卡片标题、表单标签、标签文字、链接文字、日期 |
| `13px` | 正文默认、按钮文字、列表项、标签按钮 |
| `14px` | 页面标题、情绪/疲劳显示、输入框文字、提交按钮 |
| `15px` | 区域标题、主按钮文字、报告摘要 |
| `18px` | 底部导航图标 |
| `20px` | 统计数值、鼓励图标 |
| `24px` | 步骤指示器圆圈 |
| `32px` | 登录页图标 |
| `48px` | 空状态图标 |

### 2.3 字重

| 字重 | 用途 |
|------|------|
| `400` | 正文、未激活标签、未选中按钮 |
| `500` | 卡片标题、按钮文字、表单标题、统计单位 |
| `600` | 页面标题、今日计划标题、报告摘要、激活态 |
| `700` | 统计大数字 |

### 2.4 行高

| 行高 | 用途 |
|------|------|
| `1.5` | 通知内容 |
| `1.6` | 训练计划描述、按钮对齐、鼓励文字、textarea |
| `1.65` | 数据确认页 textarea |
| `1.8` | 训练日记、FIT数据展示 |

---

## 三、间距系统

### 3.1 语义化间距

| 名称 | 值 | 用途 |
|------|-----|------|
| xs | `2px` | 图标与标签间距 |
| sm | `4px` | 步骤指示器间距、分数选择器间距 |
| md | `8px` | 列表项间距、表单网格间距 |
| lg | `12px` | 卡片间距、按钮间距、网格间距 |
| xl | `16px` | 区域间距、页面内边距 |
| xxl | `20px` | 表单区间距 |
| xxxl | `32px` | 登录页标题间距 |

### 3.2 内边距（Padding）

| 值 | 用途 |
|-----|------|
| `4px 12px` | 底部导航按钮 |
| `5px 12px` | 标签按钮 |
| `8px 0` | 底部导航容器 |
| `8px 10px` | 周计划行 |
| `10px 12px` | 列表项、通知项、textarea |
| `12px 0` | 主按钮 |
| `12px 16px` | 顶部导航栏、通知面板头部 |
| `14px 16px` | 标准卡片 |
| `16px` | 主内容区、鼓励卡片 |
| `20px 16px` | 数据确认页根容器 |
| `40px 32px` | 登录卡片 |
| `60px` | 页面加载状态 |

### 3.3 间距（Gap）

| 值 | 用途 |
|-----|------|
| `2px` | 底部导航图标与标签 |
| `4px` | 步骤指示器点与标签 |
| `6px` | 列表项间距 |
| `8px` | 表单网格间距 |
| `10px` | 快速操作按钮间距 |
| `12px` | 主布局网格间距 |
| `24px` | 情绪/疲劳显示间距 |

---

## 四、圆角

| 值 | 用途 |
|-----|------|
| `6px` | 分数选择器按钮、小输入框 |
| `8px` | 列表项背景、错误提示框、textarea |
| `10px` | 主按钮、次级按钮、统计卡片 |
| `12px` | 标准卡片容器 |
| `16px` | 标签按钮（药丸形）、登录卡片 |
| `50%` | 圆形元素（步骤指示器、通知角标、饼图） |

---

## 五、阴影

| 阴影 | 用途 |
|------|------|
| `0 4px 12px rgba(83,74,183,0.3)` | 主按钮 |
| `0 20px 60px rgba(0,0,0,0.15)` | 登录卡片 |
| `0 8px 30px rgba(0,0,0,0.15)` | 通知下拉面板 |
| `none` | 禁用态按钮 |

---

## 六、边框

| 边框 | 用途 |
|------|------|
| `0.5px solid #e0dfd8` | 顶部导航底边 |
| `1px solid #e0dfd8` | 标准卡片边框 |
| `1px solid #d3d1c7` | 次级按钮边框、未选中标签 |
| `1px solid #B8A9E8` | FIT数据卡片边框 |
| `1px dashed #B8A9E8` | 文件上传虚线区域 |
| `1px solid #CECBF6` | 今日高亮行、鼓励卡片 |
| `1px solid #F09595` | 错误提示边框 |
| `1px solid #9FE1CB` | 成功提示边框 |
| `1px solid #534AB7` | 选中标签边框 |
| `2px solid #EF9F27` | 引用左边框 |

---

## 七、关键组件样式

### 7.1 标准卡片

```css
background: #fff;
border-radius: 12px;
padding: 14px 16px;
border: 1px solid #e0dfd8;
```

### 7.2 主按钮（CTA）

```css
padding: 12px 0;
border-radius: 10px;
border: none;
background: linear-gradient(135deg, #534AB7, #7F77DD);
color: #fff;
font-size: 13px;
font-weight: 500;
box-shadow: 0 4px 12px rgba(83,74,183,0.3);
width: 100%;
```

### 7.3 次级按钮

```css
padding: 10px 0;
border-radius: 10px;
border: 1px solid #d3d1c7;
background: #f8f7f4;
color: #534AB7;
font-size: 13px;
font-weight: 500;
```

### 7.4 输入框

```css
width: 100%;
height: 36px;
background: #f8f7f4;
border: 0.5px solid #d3d1c7;
border-radius: 6px;
padding: 0 10px;
font-size: 12px;
color: #2c2c2a;
box-sizing: border-box;
outline: none;
```

### 7.5 Textarea

```css
width: 100%;
padding: 10px 12px;
border-radius: 8px;
border: 1px solid #e0dfd8;
font-size: 13px;
line-height: 1.6;
background: #f8f7f4;
resize: vertical;
outline: none;
font-family: inherit;
box-sizing: border-box;
```

### 7.6 标签/药丸按钮

```css
padding: 5px 12px;
border-radius: 16px;
font-size: 12px;
/* 选中态 */
border: 1px solid #534AB7;
background: #EEEDFE;
color: #534AB7;
/* 未选中态 */
border: 1px solid #d3d1c7;
background: transparent;
color: #666;
transition: all 0.15s;
```

### 7.7 顶部导航栏

```css
display: flex;
align-items: center;
justify-content: space-between;
padding: 12px 16px;
border-bottom: 0.5px solid #e0dfd8;
background: #fff;
position: sticky;
top: 0;
z-index: 10;
```

### 7.8 底部导航栏

```css
position: fixed;
bottom: 0; left: 0; right: 0;
background: #fff;
border-top: 1px solid #e0dfd8;
display: flex;
justify-content: space-around;
padding: 8px 0;
z-index: 100;
/* 图标: 18px, 标签: 10px */
/* 激活: #534AB7, 600 | 未激活: #888, 400 */
```

### 7.9 错误提示框

```css
background: #FCEBEB;
border: 1px solid #F09595;
border-radius: 8px;
padding: 10px 14px;
font-size: 12px;
color: #A32D2D;
```

### 7.10 成功提示框

```css
background: #E1F5EE;
border: 1px solid #9FE1CB;
border-radius: 8px;
padding: 10px 12px;
font-size: 11px;
color: #0F6E56;
```

### 7.11 鼓励卡片

```css
background: linear-gradient(135deg, #EEEDFE, #F5F3FF);
border-radius: 12px;
padding: 16px;
border: 1px solid #CECBF6;
text-align: center;
color: #3C3489;
font-size: 14px;
font-weight: 500;
```

### 7.12 通知角标

```css
position: absolute;
top: -2px; right: -6px;
background: #E24B4A;
color: #fff;
font-size: 10px;
font-weight: 600;
min-width: 16px;
height: 16px;
border-radius: 8px;
display: flex;
align-items: center;
justify-content: center;
padding: 0 4px;
```

---

## 八、图表规范（Recharts）

| 属性 | 值 |
|------|-----|
| 网格线 | `#f1efe8`, 虚线 `3 3` |
| 坐标轴刻度 | `10px`, `#ccc` |
| 提示框字号 | `11px` |
| 折线宽度 | `2px` |
| 折线点半径 | `3px` |
| 饼图内半径 | `35px` |
| 饼图外半径 | `65px` |
| 饼图间距角 | `2°` |

---

## 九、过渡动画

| 过渡 | 用途 |
|------|------|
| `all 0.15s` | 按钮、标签、通知项悬停 |
| `all 0.2s` | 麦克风按钮 |
| `background 0.15s` | 通知列表项 |

---

## 十、布局容器

| 最大宽度 | 用途 |
|----------|------|
| `600px` | 运动员首页主内容 |
| `520px` | 报告详情、数据总结、反馈结果 |
| `400px` | 登录卡片 |
| `360px` | 通知面板宽度 |
| `480px` | 通知面板最大高度 |

页面最小高度：`100vh`
底部导航留白：`60px`
反馈流程留白：`80px`
