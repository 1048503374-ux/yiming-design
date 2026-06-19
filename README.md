# 📘 一鸣的设计站 · 使用与更新指南

> 保存路径：桌面 `yiming-design` 文件夹

---

## 📁 网站文件结构

```
yiming-design/                  ← 网站根目录
├── index.html                  ← 主页面（一般不需要改）
├── data.js                     ← ★ 你只需要编辑这个文件来更新内容
├── games/                      ← 小游戏脚本（一般不需要改）
│   ├── color-challenge.js      ← 色感挑战游戏
│   ├── pixel-painter.js        ← 像素画板游戏
│   └── designer-quiz.js        ← 设计性格测试游戏
└── assets/
    ├── images/                 ← ★ 把你的作品截图放这里
    │   ├── avatar.jpg          ← 你的头像（可选）
    │   ├── placeholder.jpg     ← 占位图
    │   └── ...                 ← 你的其他作品图
    └── icons/                  ← 图标资源（一般不需要动）
```

---

## 📝 如何更新内容

### 更新作品集

打开 `data.js`，找到 `portfolio` 部分。每个作品是一个对象：

```javascript
{
  title: '作品名称',           // 显示在卡片上
  subtitle: '一句话描述',       // 项目小标题
  role: '你的角色',            // 如：美术设计师
  image: 'assets/images/作品图.jpg',  // 图片路径
  details: '项目详情的文字描述...',    // 点击展开后看到的内容
  tags: ['标签1', '标签2']     // 分类标签
}
```

**添加新作品：** 找到对应的分类（如 `大屏/IPTV`），在 `items` 数组里新增一个对象，照上面的格式填。

**替换作品：** 把旧的对象删掉，换上新的。

**添加新分类：** 在 `portfolio` 数组里新增一个对象：

```javascript
{
  category: '新分类名称',   // 会自动出现在筛选标签里
  items: [ /* 作品数组 */ ]
}
```

### 更新设计笔记（文章）

找到 `articles` 部分，新增一篇文章：

```javascript
{
  date: '2026-05-20',
  title: '文章标题',
  summary: '列表页显示的一段摘要文字',
  content: `
    <p>文章正文，支持HTML标签。</p>
    <p>可以用 &lt;strong&gt;加粗&lt;/strong&gt;、&lt;ul&gt;&lt;li&gt;列表&lt;/li&gt;&lt;/ul&gt; 等。</p>
  `,
  tags: ['标签1', '标签2']
}
```

> 💡 `content` 字段支持 HTML，所以你可以加图片、加链接、加列表。

### 更新服务报价

找到 `services` 部分：

```javascript
{
  name: '服务包名称',
  price: '¥价格',
  description: '一句话说明',
  includes: ['包含服务1', '包含服务2'],
  popular: false   // true = 标记为"最受欢迎"
}
```

### 更新个人信息

找到 `profile` 部分，修改对应字段即可：
- `tags`: 首页标签
- `status`: 接单状态
- `social.zcool`: 站酷链接

---

## 🖼️ 关于作品图片

1. 把你的作品截图放到 `assets/images/` 文件夹
2. 在 `data.js` 的 `image` 字段写上图片路径，如 `assets/images/iptv-01.jpg`
3. 图片建议用 JPG 或 WebP 格式，宽度 1200px 以上

> **目前展示的是占位图**，你需要替换成自己的作品截图才有实际效果。

---

## 🚀 如何上线

### 方式一：Vercel（推荐，最方便）

1. 打开 [vercel.com](https://vercel.com)
2. 用 GitHub 注册登录，或点 "Continue with Email"
3. 把整个 `yiming-design` 文件夹**直接拖进去**
4. 等几秒 → 获得一个网址（如 `yiming-design.vercel.app`）

### 方式二：手动更新已上线的网站

如果你已经部署过：
1. 在本地修改 `data.js`（添加作品/文章）
2. 把新的作品图片放进 `assets/images/`
3. 把整个文件夹重新拖到 Vercel → 自动覆盖更新

---

## 🎮 小游戏说明

三个小游戏已经做进网站了：

| 游戏 | 入口 | 用途 |
|------|------|------|
| 🎯 色感挑战 | 趣味空间 → 第1个标签 | 让访客玩一把，证明"设计师的色感" |
| 🎨 像素画板 | 趣味空间 → 第2个标签 | 自由涂鸦，可截图保存 |
| 🧠 性格测试 | 趣味空间 → 第3个标签 | 5道题测设计人格，可分享 |

**如果你想调整游戏：**
- 色感挑战的难度、轮数 → `games/color-challenge.js` 顶部参数
- 像素画板的预设图案 → `games/pixel-painter.js` 中 `PRESET_PATTERN` 数组
- 性格测试的题目 → `data.js` 的 `quiz` 部分（可直接改题目和选项）

---

## ❓ 常见问题

**Q：改完 data.js 为什么不生效？**
A：保存文件后刷新浏览器页面即可。如果还是不生效，可能是浏览器缓存，按 `Ctrl+F5` 强制刷新。

**Q：我想换网站的颜色主题？**
A：在 `index.html` 的 `:root` 部分修改 CSS 变量值。

**Q：联系方式里的微信怎么设置？**
A：目前微信显示的是占位文本。你可以在 `data.js` 的 `profile.social.wechat` 设置微信二维码图片路径。

**Q：联系表单能真的发送消息吗？**
A：目前是演示效果，不真的发消息。如果想接入，可以用「表单spree」或「腾讯云函数」实现。
