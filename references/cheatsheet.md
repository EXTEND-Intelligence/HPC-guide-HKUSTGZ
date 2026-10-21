# 命令速查

常用命令汇总。`hkust-hpc2` 是 [第 02 章](../docs/02-login-and-ssh.md) 设置的快捷名，`123456` 替换为实际的作业号。

## 连接与传输（本机执行）

| 用途 | 命令 |
|---|---|
| 登录 | `ssh hkust-hpc2` |
| 指纹变了，删除旧记录 | `ssh-keygen -R hpc2login.hpc.hkust-gz.edu.cn` |
| 上传目录（rsync） | `rsync -av ./my-project/ hkust-hpc2:my-project/` |
| 下载结果（rsync） | `rsync -av hkust-hpc2:my-project/outputs/ ./outputs/` |
| 上传目录（scp，Windows 也可用） | `scp -r ./my-project hkust-hpc2:` |
| 下载单个文件（scp） | `scp hkust-hpc2:my-project/outputs/result.csv .` |

## 作业（登录节点执行）

| 用途 | 命令 |
|---|---|
| 提交作业 | `sbatch 脚本.sbatch` |
| 看我的作业 | `squeue -u "$USER"` |
| 看作业详情 | `scontrol show job 123456` |
| 查已结束作业的状态和资源用量 | `sacct -j 123456 --format=JobID,State,Elapsed,MaxRSS,ExitCode` |
| 实时看日志 | `tail -f logs/cpu-123456.out`（`Ctrl+C` 退出查看） |
| 取消一个作业 | `scancel 123456` |
| 取消自己的全部作业 | `scancel -u "$USER"`（慎用） |
| 申请交互式调试节点 | `srun -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 --mem=4G --time=00:15:00 --pty bash` |
| 离开计算节点并释放资源 | `exit` |
| 看有哪些分区 | `sinfo` |
| 看目录占用空间 | `du -sh 目录名` |

## 作业状态

| 缩写 | 全称 | 意思 |
|---|---|---|
| `PD` | PENDING | 排队中，不计费 |
| `R` | RUNNING | 运行中，计费 |
| `CG` | COMPLETING | 正在结束 |
| `CD` | COMPLETED | 正常结束 |
| `F` | FAILED | 程序出错退出 |
| `TO` | TIMEOUT | 超过时间上限被终止 |
| `CA` | CANCELLED | 被取消 |
| `OOM` | OUT_OF_MEMORY | 内存超过申请量 |

## 常用 `#SBATCH` 参数

| 参数 | 含义 |
|---|---|
| `--job-name=名字` | 作业名 |
| `--partition=分区` | `debug`（免费调试）、`i64m512u`（CPU）、`i64m1tga40u`（A40 GPU） |
| `--nodes=1` | 节点数 |
| `--ntasks=1` | 进程数；单个 Python 程序写 1 |
| `--cpus-per-task=8` | 每个进程的 CPU 核数 |
| `--mem=16G` | 整个作业的内存 |
| `--gres=gpu:1` | GPU 数量 |
| `--time=12:00:00` | 时间上限，格式为 时:分:秒，或 天-时:分:秒 |
| `--output=logs/%j.out` | 标准输出文件，`%j` 是作业号 |
| `--error=logs/%j.err` | 错误输出文件 |
| `--array=0-14%3` | 数组作业：编号 0–14，最多同时运行 3 项 |

## 作业中可用的环境变量

| 变量 | 含义 |
|---|---|
| `SLURM_JOB_ID` | 作业号 |
| `SLURM_CPUS_PER_TASK` | 申请到的每进程核数 |
| `SLURM_SUBMIT_DIR` | 执行 `sbatch` 时所在的目录 |
| `SLURM_ARRAY_JOB_ID` | 数组作业的主作业号 |
| `SLURM_ARRAY_TASK_ID` | 当前数组项的编号 |

[返回目录](../README.md)
