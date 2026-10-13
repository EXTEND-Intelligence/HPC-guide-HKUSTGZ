# 01 · HPC、平台与节点

HPC 是多人共享的计算集群。你申请的是 **一定数量的 CPU/GPU、内存和运行时间**，不是新建一台云服务器。Slurm 决定作业何时、在哪个计算节点运行。

## HKUST(GZ) 有哪些平台？

官网简介列出一期、二期、三期（ACD）、EDA；新版手册还单列四期（国产）。因此，“有四个平台”不等于你已拥有四个平台权限。

| 平台 | SSH 入口 / 用途 | 本教程是否适用 |
|---|---|---|
| 一期 | `hpc1login.hpc.hkust-gz.edu.cn` | 官方使用 `jsub` / `jjobs`，不能直接照搬 Slurm |
| 二期 | `hpc2login.hpc.hkust-gz.edu.cn` | **主线：CPU、NVIDIA GPU，使用 Slurm** |
| 三期（ACD） | `hpc3login.hpc.hkust-gz.edu.cn` | 另见三期手册；网络/资源规则不同 |
| EDA | 专门平台，用于电子设计自动化 | 按对应手册与权限使用 |
| 四期（国产） | `hpc4login.hpc.hkust-gz.edu.cn` | 按国产平台手册使用，环境不能直接照搬 |

账号通过学校 OneStop → IT 服务 → HPC Platform Application 申请，通常需要导师审批。费用归属导师；能否访问其他平台要核实开通权限。

官方对比页说明一期/二期可访问互联网，三期不开放互联网；不要假设各平台都能直接 `pip install` 或访问 GitHub。

## 登录节点 ≠ 计算节点

| 位置 | 可以做 | 不应做 |
|---|---|---|
| 登录节点 | SSH、Git、传文件、编辑脚本、`sbatch` / `squeue` | 直接跑训练、大规模评估、重计算 |
| 已分配的计算节点 | 训练、评估、交互调试、编译 | 超出作业分配的资源 |

**登录节点：确认当前入口和目录。**

```bash
hostname
printf '家目录：%s\n' "$HOME"
sinfo -o '%P %a %l %D %G'
```

`mgmt-3` / `mgmt-4` 只是管理节点名，**不能据此判断三期/四期**。判断平台看 SSH 的登录地址、门户选择和可用分区。

SSH + Slurm 不要求 Docker。Python 虚拟环境通常足够；容器只在项目确实需要时考虑。

[返回目录](../README.md) · [官方平台简介](https://docs.hpc.hkust-gz.edu.cn/docs/intro/)
