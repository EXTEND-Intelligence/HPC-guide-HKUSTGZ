# HKUST(GZ) HPC 使用手册

香港科技大学（广州）HPC **二期集群**的简明使用手册：SSH 登录、Slurm 作业、Python 环境、计费与结果管理。内容整理自 [官方文档](https://docs.hpc.hkust-gz.edu.cn/)，命令可直接复制。

> 非官方整理。分区、价格和账号权限以官方文档、平台实时配置和账单为准。

## 从这里开始

| 场景 | 文档 |
|---|---|
| 首次使用，约 15 分钟提交第一个作业 | [快速开始](QUICKSTART.md) |
| 查找常用命令 | [命令速查](references/cheatsheet.md) |
| 遇到报错或作业异常 | [常见问题](docs/10-troubleshooting.md) |

## 目录

| 章节 | 内容 |
|---|---|
| [快速开始](QUICKSTART.md) | 登录 HPC，在免费的 `debug` 分区提交第一个测试作业 |
| [01 认识 HPC](docs/01-hpc-overview.md) | 登录节点与计算节点、作业、分区、学校的各期平台 |
| [02 登录与 SSH](docs/02-login-and-ssh.md) | 密钥登录、快捷名、主机指纹变化 |
| [03 文件与传输](docs/03-storage-and-data.md) | 存储位置；用 rsync、scp 或 Git 传输代码与数据 |
| [04 Slurm 作业](docs/04-slurm-basics.md) | 作业脚本结构、资源申请、查看与取消、排队原因 |
| [05 交互式调试](docs/05-debug-and-interactive.md) | 申请计算节点调试，结束后释放资源 |
| [06 Python 环境](docs/06-software-environment.md) | venv / conda 环境，在作业中指定解释器 |
| [07 训练与批量实验](docs/07-training-and-batch.md) | 长时间训练、多组参数的数组作业、GPU 作业 |
| [08 费用与预算](docs/08-pricing-and-budget.md) | 计算与存储的计费规则、费用估算 |
| [09 结果管理](docs/09-results-and-reproducibility.md) | 需要保存的内容、目录组织、备份与复现 |
| [10 常见问题](docs/10-troubleshooting.md) | 按登录、提交、运行、结果四个阶段查找原因 |

首次使用按“快速开始 → 01 → 07”的顺序阅读；08–10 和 [命令速查](references/cheatsheet.md) 按需查阅。

## 使用须知

1. **登录节点不用于计算。** 训练、评估和大量计算通过 Slurm 提交到计算节点运行。
2. **提交不等于运行。** `sbatch` 只是提交申请；状态 `PD` 为排队中，`R` 为正在运行。
3. **运行中的作业持续计费。** 程序空转同样计费；断开 SSH 不会停止作业，不再需要时用 `scancel 作业号` 取消。
4. **调试使用 `debug` 分区。** 免费，单次最长 30 分钟，仅用于调试。
5. **重要结果自行备份。** 平台不承诺永久保存数据。

## 仓库结构

```text
QUICKSTART.md    快速开始
docs/            分章节文档（01–10）
slurm/           作业脚本模板：debug、CPU、GPU、数组作业
examples/        配合脚本的示例程序
templates/       SSH 配置与实验目录模板
references/      命令速查、官方链接、已核验的平台参数
src/ plugins/    网站源码（Astro）
```

脚本和示例的说明见 [examples/README.md](examples/README.md)。

## 网站版

本仓库同时是一个静态网站，直接读取上述 Markdown 和脚本，提供搜索、代码复制、脚本下载和深浅色模式。在本机预览（需要 Node.js 22.12+）：

```bash
npm ci
npm run dev
```

然后打开 `http://localhost:4321`。构建和维护说明见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 资料来源

平台参数核验于 **2026-10-13**，详见 [已核验设置](references/verified-settings.md)；官方文档入口见 [官方参考](references/official-links.md)。平台问题请联系 `hpc@hkust-gz.edu.cn`。
