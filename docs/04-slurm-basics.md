# 04 · Slurm 作业：提交、查看、取消

读完这一章，你能看懂并修改作业脚本，按需申请资源，并知道作业排队时该看什么。

## 作业脚本长什么样

[快速上手](../QUICKSTART.md) 里你已经写过一个作业脚本。正式脚本的结构相同，下面是本仓库 [`slurm/train_cpu.sbatch`](../slurm/train_cpu.sbatch) 的开头部分。

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
| `--cpus-per-task=8` | 给这个进程 8 个 CPU 核 |
| `--mem=16G` | 整个作业共用 16 GB 内存（不是每核 16 GB） |
| `--time=12:00:00` | 最长 12 小时，到时会被强制结束，程序没保存的进度会丢失 |
| `--output` / `--error` | 标准输出和错误输出分别写入的文件，`%j` 是作业号 |
| `--export=ALL` | 把提交时的环境变量带进作业 |

脚本的其余部分是普通 Bash 命令，在计算节点上执行，主要做了这几件事：

- `set -euo pipefail`：任何一步出错就立即停止，不会带着错误继续跑。
- `cd "$SLURM_SUBMIT_DIR"`：进入你执行 `sbatch` 时所在的目录。
- 设置 `OMP_NUM_THREADS` 等变量：让数值计算库使用的线程数等于申请的核数。
- 用 `srun` 启动 Python 程序：Slurm 会单独记录这一步的资源使用情况。

> **注意：** `#SBATCH` 行里不能使用 `$HOME` 等变量，它们不会被展开。需要变化的参数，可以在提交命令里覆盖，例如 `sbatch --time=02:00:00 slurm/train_cpu.sbatch`。

## 申请多少资源合适

| 参数 | 怎么定 |
|---|---|
| `--cpus-per-task` | 程序真正能用上的核数。一般的 PyTorch CPU 训练可以先试 4–8 核 |
| `--mem` | 先粗略估计；跑过一次后，用 `sacct` 的 `MaxRSS` 看实际峰值，再留一些余量 |
| `--time` | 比预计时间稍长一些。太短会被中途终止；太长可能更难排上队 |
| `--gres=gpu:1` | 只在 GPU 分区需要，表示要 1 块 GPU |

> **注意：** 一个 Python 程序要用多核，写 `--ntasks=1 --cpus-per-task=N`，**不要**写 `--ntasks=N`。`--ntasks=8` 的意思是启动 8 个进程，你的程序可能会被重复运行 8 遍。另外，申请多核不会让程序自动并行，程序本身要支持多线程或多进程。

## 提交、查看、取消

先在仓库根目录用免费的调试脚本练习（需要先完成 [第 03 章的练习](03-storage-and-data.md)，把本仓库放到 HPC 上）。

**登录节点：**

```bash
cd ~/hpc-tutorial
mkdir -p logs
sbatch slurm/debug_cpu.sbatch
```

> **注意：** 本仓库的脚本把日志写到 `logs/` 目录，提交前必须先建好它。Slurm 在脚本运行之前就要打开日志文件，目录不存在时作业会直接失败，而且没有日志可看。

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

`squeue` 只显示还没结束的作业，作业结束后从列表消失是正常的。`scontrol` 用来查看排队或运行中作业的完整信息；`sacct` 是历史记录，已结束的作业也能查到。

**登录节点：** 取消作业

```bash
scancel "$JOB_ID"
```

如果想一次取消自己的全部作业，可以用 `scancel -u "$USER"`，执行前务必确认。

断开 SSH 不会停止用 `sbatch` 提交的作业。这意味着你可以关掉电脑等结果，也意味着不需要的作业必须自己取消。

## 为什么一直在排队

`squeue` 最后一列括号里是等待原因：

| 原因 | 意思 | 怎么办 |
|---|---|---|
| `Priority` | 前面有优先级更高的作业 | 等待 |
| `Resources` | 暂时没有足够的空闲资源 | 等待，或减少申请的核数、内存、时间 |
| 含 `QOS`、`Assoc` 或 `Limit` 的原因 | 超过了账号的使用上限，例如同时占用的核数 | 等前面的作业结束，或减小申请量；不清楚时联系管理员 |
| `ReqNodeNotAvail` | 需要的节点暂不可用，例如在维护 | 等待，或关注平台公告 |

能提交很多作业，不等于它们会同时运行。平台会按用户、账户、QoS（服务质量等级）和分区设置上限。比如上限是 1024 核、每个作业 8 核，最多 128 个作业同时运行；你已有的作业和内存限制会让实际数量更少。

**登录节点：** 查看分区和自己的限制（部分信息可能因权限看不到）

```bash
sinfo -o '%P %a %l %D %G'
sacctmgr show assoc where user="$USER" format=Account,Partition,QOS
sacctmgr show qos format=Name,MaxTRESPerUser,MaxJobsPerUser,MaxSubmitJobsPerUser
```

`sinfo` 这一行依次显示：分区名、是否可用、最长时间、节点数、GPU 等资源。

[返回目录](../README.md) · [官方 Slurm 用法](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/slurm/job2/) · [官方分区说明](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/slurm/queue/)
