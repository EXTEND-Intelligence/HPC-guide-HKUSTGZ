# 04 · Slurm 作业：提交、查看、取消

本章说明作业脚本的结构与资源申请方法，以及作业的提交、查看、取消和排队原因。

## 作业脚本结构

[快速开始](../QUICKSTART.md) 中的作业脚本只包含最基本的设置。正式脚本结构相同，以下是本仓库 [`slurm/train_cpu.sbatch`](../slurm/train_cpu.sbatch) 的开头部分。

**文件：** `slurm/train_cpu.sbatch` 的资源申请部分

```bash
#!/bin/bash
#SBATCH --job-name=hpc-cpu
#SBATCH --partition=i64m512u
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --mem=16G
#SBATCH --time=12:00:00
#SBATCH --output=logs/cpu-%j.out
#SBATCH --error=logs/cpu-%j.err
#SBATCH --export=ALL
```

| 参数 | 含义 |
|---|---|
| `--partition=i64m512u` | 普通 CPU 分区（收费） |
| `--nodes=1`、`--ntasks=1` | 1 台节点上运行 1 个进程 |
| `--cpus-per-task=8` | 为该进程分配 8 个 CPU 核 |
| `--mem=16G` | 整个作业共用 16 GB 内存（不是每核 16 GB） |
| `--time=12:00:00` | 最长 12 小时，到时强制结束，未保存的进度会丢失 |
| `--output` / `--error` | 标准输出和错误输出分别写入的文件，`%j` 为作业号 |
| `--export=ALL` | 将提交时的环境变量传入作业 |

脚本其余部分是普通 Bash 命令，在计算节点上执行，主要包括：

- `set -euo pipefail`：任一步骤出错即停止，避免带着错误继续执行。
- `cd "$SLURM_SUBMIT_DIR"`：进入执行 `sbatch` 时所在的目录。
- 设置 `OMP_NUM_THREADS` 等变量：使数值计算库的线程数与申请的核数一致。
- 用 `srun` 启动 Python 程序：Slurm 单独记录这一步的资源使用情况。

> **注意：** `#SBATCH` 行中不能使用 `$HOME` 等变量，它们不会被展开。需要变化的参数可在提交命令中覆盖，例如 `sbatch --time=02:00:00 slurm/train_cpu.sbatch`。

## 资源申请

| 参数 | 建议 |
|---|---|
| `--cpus-per-task` | 程序实际能利用的核数。一般的 PyTorch CPU 训练可从 4–8 核开始测试 |
| `--mem` | 先粗略估计；运行一次后，用 `sacct` 的 `MaxRSS` 查看实际峰值，再留出余量 |
| `--time` | 略长于预计时间。过短会被中途终止；过长可能更难排上队 |
| `--gres=gpu:1` | 仅 GPU 分区需要，表示申请 1 块 GPU |

> **注意：** 单个 Python 程序使用多核时，写 `--ntasks=1 --cpus-per-task=N`，**不要**写 `--ntasks=N`。`--ntasks=8` 表示启动 8 个进程，程序可能被重复运行 8 次。此外，申请多核不会使程序自动并行，程序本身需要支持多线程或多进程。

## 提交、查看、取消

以下示例使用免费的调试脚本，需先按 [第 03 章](03-storage-and-data.md#获取本手册的示例文件) 将本仓库克隆到 HPC。

**登录节点：**

```bash
cd ~/hpc-tutorial
mkdir -p logs
sbatch slurm/debug_cpu.sbatch
```

> **注意：** 本仓库的脚本将日志写入 `logs/` 目录，提交前必须先创建。Slurm 在脚本运行前就会打开日志文件，目录不存在时作业直接失败，且没有日志可查。

**登录节点：** 查看自己的作业

```bash
squeue -u "$USER"
```

| 列 | 含义 |
|---|---|
| `JOBID` | 作业号 |
| `ST` | 状态：`PD` 排队、`R` 运行、`CG` 正在结束 |
| `TIME` | 已运行时间 |
| `NODELIST(REASON)` | 运行中显示节点名；排队中显示等待原因 |

**登录节点：** 查看某个作业的详细信息

```bash
JOB_ID=123456
scontrol show job "$JOB_ID"
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,AllocCPUS,MaxRSS,ExitCode
```

`squeue` 只显示尚未结束的作业，作业结束后从列表中消失属正常现象。`scontrol` 用于查看排队或运行中作业的完整信息；`sacct` 是历史记录，已结束的作业同样可查。

**登录节点：** 取消作业

```bash
scancel "$JOB_ID"
```

一次取消自己的全部作业可用 `scancel -u "$USER"`，执行前务必确认。

断开 SSH 不会停止用 `sbatch` 提交的作业：关闭本机后作业照常运行，不再需要的作业也必须手动取消。

## 排队原因

`squeue` 最后一列括号中为等待原因：

| 原因 | 含义 | 处理方法 |
|---|---|---|
| `Priority` | 有优先级更高的作业在前 | 等待 |
| `Resources` | 暂无足够的空闲资源 | 等待，或减少申请的核数、内存、时间 |
| 含 `QOS`、`Assoc` 或 `Limit` 的原因 | 超过账号的使用上限，例如同时占用的核数 | 等待已有作业结束，或减小申请量；不明确时联系管理员 |
| `ReqNodeNotAvail` | 所需节点暂不可用，例如正在维护 | 等待，或关注平台公告 |

可以提交大量作业，不代表它们会同时运行。平台按用户、账户、QoS（服务质量等级）和分区设置上限。例如上限为 1024 核、每个作业 8 核时，最多 128 个作业同时运行；已有作业和内存限制会使实际数量更少。

**登录节点：** 查看分区和账号限制（部分信息可能因权限无法查看）

```bash
sinfo -o '%P %a %l %D %G'
sacctmgr show assoc where user="$USER" format=Account,Partition,QOS
sacctmgr show qos format=Name,MaxTRESPerUser,MaxJobsPerUser,MaxSubmitJobsPerUser
```

`sinfo` 这一行依次显示：分区名、可用状态、最长时间、节点数、GPU 等资源。

[返回目录](../README.md) · [官方 Slurm 用法](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/slurm/job2/) · [官方分区说明](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/slurm/queue/)
