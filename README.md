# HKUST(GZ) HPC：SSH + Slurm 简明教程

面向第一次使用香港科技大学（广州）HPC 的用户。主线是 **HPC 二期、SSH、Slurm、CPU 作业**，不需要 Docker。

先读 [快速上手](QUICKSTART.md)，跑通一次，再按需查下面的章节。

## 网页预览（Astro）

网站直接读取本项目的 Markdown 和脚本，不需要维护两份教程。支持搜索、代码复制、完整脚本下载、深浅色和移动端导航。

**本机，在本项目目录，Node.js 22.12+：**

```bash
npm ci
npm run dev
```

打开 `http://localhost:4321`。前台运行用 `Ctrl+C` 停止；后台模式用 `npm run dev:stop`，状态可用 `npm run dev:status` 查询。这与 HPC 作业释放无关。

**本机：检查、构建与预览静态网站。**

```bash
npm run build
npm run preview
```

`dist/` 是可部署的静态网站；构建会检查类型、站内链接、下载文件和搜索索引。网页服务运行在本机，不需要申请 HPC 资源；部署时不要上传私钥/实验数据。

网站启动后，还可用 `npm run test:http` 验证真实页面和下载响应；生产预览可指定地址，例如 `npm run test:http -- http://127.0.0.1:4322`。

## 先理解这件事

**本机编辑代码 → SSH 登录 → 上传代码/数据 → Slurm 申请资源 → 计算节点执行 → 取回结果。**

| 名称 | 你用它做什么 |
|---|---|
| 本机 | 编辑、上传、下载、看图 |
| 登录节点 | 管理文件、提交作业、查询队列；不跑正式训练 |
| 计算节点 | 获得 Slurm 分配后，运行训练、调试、评估 |
| 家目录 | 你的服务器文件目录；二期通常是 `/hpc2hdd/home/<用户名>` |
| 分区/队列 | 一类可申请的计算资源，例如 CPU、GPU、debug |
| 作业 | 一次资源申请 + 要执行的程序；不是创建服务器或容器 |

**`sbatch` 只是提交，不代表已经开始运行。作业结束自动释放资源；提前不用了，用 `scancel 作业号`。**

## 阅读入口

| 想解决的问题 | 文档 |
|---|---|
| 我能用哪些平台？登录节点是什么？ | [01 HPC 概览](docs/01-hpc-overview.md) |
| 怎么登录、配置免密、核验指纹？ | [02 登录与 SSH](docs/02-login-and-ssh.md) |
| 家目录、作业数据区、SSD；上传下载 | [03 存储与数据](docs/03-storage-and-data.md) |
| Python 环境怎么装、作业怎么调用？ | [04 软件环境](docs/04-software-environment.md) |
| 申请、查询、取消；为什么排队？ | [05 Slurm 基础](docs/05-slurm-basics.md) |
| 申请免费调试资源，进入计算节点 | [06 交互式调试](docs/06-debug-and-interactive.md) |
| 正式训练、多个种子并行、GPU | [07 批量训练](docs/07-training-and-batch.md) |
| 怎么收费、估算预算？ | [08 计费与预算](docs/08-pricing-and-budget.md) |
| 保存哪些结果、怎样方便复现？ | [09 结果与复现](docs/09-results-and-reproducibility.md) |
| 提交失败、环境错误、作业记录消失 | [10 常见问题](docs/10-troubleshooting.md) |

## 项目目录

```text
README.md / QUICKSTART.md       总览 / 最短操作流程
docs/                          分主题教程
examples/                      可运行的小程序，不是科研 benchmark
slurm/                         debug、CPU、GPU、数组作业脚本
templates/                     SSH 配置与实验目录模板
references/                    官方链接、核验日期与易变参数
src/ / public/ / plugins/       Astro 页面、样式、交互与链接转换
scripts/                       构建产物检查
AGENTS.md / .gitignore          文档维护规则 / 生成文件排除规则
```

示例从本项目根目录提交。用户名用占位符；不要把密码、私钥写进仓库。

官方信息核验于 **2026-10-13**。队列、权限和价格可能调整，以平台实时配置和账单为准：[官方依据](references/official-links.md)、[已核验设置](references/verified-settings.md)。
