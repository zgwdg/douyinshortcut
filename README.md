# 抖音全类型解析下载

> Shortcuts 风格 · 纯前端 · 进度下载

一个纯前端实现的抖音视频/音乐/封面解析下载工具，具有 iOS Shortcuts 风格的现代化 UI。

## ✨ 功能特性

- 🎬 **视频下载** - 无水印高清视频
- 🎵 **音乐下载** - 支持 MP3 和 M4A 格式
- 🖼️ **封面下载** - 视频封面、音乐封面、作者头像
- 📊 **下载进度** - 实时显示下载进度、已下载大小、总大小
- 🌙 **暗黑模式** - 跟随系统 + 手动切换，记忆用户偏好
- 🔄 **版本更新** - 自动检查新版本并提示更新
- 📱 **移动优先** - 响应式设计，手机端体验优秀

## 🚀 快速开始

### 方式一：直接使用

1. 下载 `index.html` 文件
2. 双击用浏览器打开
3. 粘贴抖音分享链接
4. 点击解析，下载资源

### 方式二：部署到服务器

```bash
# 将 index.html 放到任意 Web 服务器即可
# 例如 Nginx
cp index.html /var/www/html/douyin/

# 或使用 Python 快速启动
python -m http.server 8080
```

### 方式三：部署到 GitHub Pages（推荐）

GitHub Pages 只能提供静态文件，无法直接解决 CORS。你需要配合一个反代服务（Cloudflare Worker / Vercel）：

1. 将 `index.html` 部署到 GitHub Pages
2. 部署下方的 Cloudflare Worker（或 Vercel 反代）
3. 打开页面后，在“反代地址”输入框填入 Worker 地址并保存  
   或直接在 URL 里带参数：`?proxy=https://your-worker.example.com`

## ⚠️ 关于跨域 (CORS) 限制

由于浏览器安全策略，纯前端直接请求第三方 API 和资源可能会被拦截。如果遇到解析或下载失败，可以尝试以下方案（GitHub Pages 必须使用反代）：

### 方案一：使用 CORS 浏览器扩展

安装 CORS Unblock 等浏览器扩展临时禁用跨域限制（仅建议开发调试使用）。

### 方案二：Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 静态文件
    location / {
        root /var/www/html/douyin;
        index index.html;
    }

    # 解析 API 代理
    location /api/parse {
        proxy_pass http://api.rcuts.com/Video/DouYin_All.php;
        proxy_set_header Host api.rcuts.com;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS 头
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers '*';
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # 资源下载代理
    location /api/fetch {
        # 从 query 参数获取目标 URL
        set $target_url $arg_url;
        proxy_pass $target_url;
        
        # CORS 头
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Expose-Headers Content-Length;
    }
}
```

使用反代时，无需改代码，只需在页面“反代地址”输入框中填写反代地址即可。

### 方案三：Cloudflare Worker

```javascript
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
        return new Response('', {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': '*'
            }
        })
    }
    
    // 解析 API
    if (url.pathname === '/api/parse') {
        const targetUrl = 'http://api.rcuts.com/Video/DouYin_All.php'
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body
        })
        
        const newResponse = new Response(response.body, response)
        newResponse.headers.set('Access-Control-Allow-Origin', '*')
        newResponse.headers.set('Access-Control-Expose-Headers', 'Content-Length')
        return newResponse
    }
    
    // 资源下载代理
    if (url.pathname === '/api/fetch') {
        const targetUrl = url.searchParams.get('url')
        if (!targetUrl) {
            return new Response('Missing url parameter', { status: 400 })
        }
        
        const response = await fetch(targetUrl, {
            method: request.method
        })
        const newResponse = new Response(response.body, response)
        newResponse.headers.set('Access-Control-Allow-Origin', '*')
        newResponse.headers.set('Access-Control-Expose-Headers', 'Content-Length')
        return newResponse
    }
    
    return new Response('Not Found', { status: 404 })
}
```

### 方案四：Node.js 简易代理

```javascript
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

// 静态文件
app.use(express.static('public'));

// API 代理
app.use('/api/parse', createProxyMiddleware({
    target: 'http://api.rcuts.com',
    changeOrigin: true,
    pathRewrite: { '^/api/parse': '/Video/DouYin_All.php' }
}));

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

## 📋 使用说明

1. **粘贴链接**：从抖音 App 复制分享文本，粘贴到输入框
2. **点击解析**：程序会自动提取链接并请求解析
3. **下载资源**：解析成功后，点击各资源的下载按钮

### 支持的资源类型

| 资源类型 | 文件格式 | 说明 |
|---------|---------|------|
| 视频 | .mp4 | 无水印高清视频 |
| 背景音乐 | .mp3 | MP3 格式音频 |
| 背景音乐 | .m4a | M4A 格式音频 |
| 视频封面 | .jpg | 视频封面图片 |
| 音乐封面 | .jpg | 音乐封面图片 |
| 作者头像 | .jpg | 作者头像图片 |

### 快捷操作

- `Ctrl + Enter` (Windows) / `⌘ + Enter` (Mac)：快速解析
- 点击「粘贴」按钮：自动读取剪贴板内容

## 🎨 主题设置

支持三种主题模式：

- **自动**：跟随系统主题
- **亮色**：始终使用亮色主题
- **暗色**：始终使用暗色主题

设置会自动保存到浏览器本地存储。

## 🔧 技术实现

- **纯前端**：单 HTML 文件，无需后端
- **Fetch Streaming**：使用 ReadableStream 实现下载进度
- **AbortController**：支持取消下载
- **CSS Variables**：实现主题切换
- **localStorage**：保存用户偏好

## 📝 版本历史

- **v3** - 当前版本
  - Shortcuts 风格 UI
  - 下载进度条
  - 暗黑模式支持
  - 版本更新检查

## ⚖️ 免责声明

本工具仅供学习交流使用，请勿用于商业用途。下载的内容版权归原作者所有，请遵守相关法律法规。

## 📄 开源协议

MIT License
