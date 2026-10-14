# 参与维护

内容与写作规范见 `AGENTS.md`。本文件只说明如何在本机预览和构建网站。

## 网站预览（Astro）

网站直接读取本仓库的 Markdown 和脚本，不需要维护两份教程。支持搜索、代码复制、脚本下载、深浅色和移动端导航。

**本机：** 在本仓库目录，需要 Node.js 22.12+

```bash
npm ci
npm run dev
```

打开 `http://localhost:4321`。前台运行用 `Ctrl+C` 停止；后台模式用 `npm run dev:stop` 停止，`npm run dev:status` 查看状态。

## 构建与检查

**本机：**

```bash
npm run build
npm run preview
```

- `dist/` 是可部署的静态网站。构建会检查类型、站内链接、下载文件和搜索索引。
- 网站启动后，可用 `npm run test:http` 验证真实页面和下载响应；生产预览可指定地址，例如 `npm run test:http -- http://127.0.0.1:4322`。
- 网站只在本机开发，不要在 HPC 登录节点上运行。部署时不要上传私钥或实验数据。

## 新增或重命名文档

1. 在 `src/data/catalog.mjs` 中登记（或修改）文档的 `source`、标题、分组和关键词。
2. Markdown 中的相对链接只能指向已登记的文件，否则构建会失败。
3. 运行 `npm run build`，确认通过。
