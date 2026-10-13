# 05 · Slurm：提交、排队、释放

## 一个 Python 进程怎么申请？

| 参数 | 含义 |
|---|---|
| `--partition=i64m512u` | 二期普通 CPU 分区 |
| `--nodes=1` | 使用一台计算节点 |
| `--ntasks=1` | 启动一个任务/进程 |
| `--cpus-per-task=8` | 为这个进程分配 8 个 CPU 核 |
| `--mem=16G` | 每个节点总内存 16 GB，不是每核 16 GB |
| `--time=12:00:00` | 最长 12 小时；到时会终止，不保证自动保存模型 |

单进程训练不要用 `--ntasks=8` 代替 8 核，否则可能启动 8 份程序。申请多核也不会自动把 Python 变成多进程。

## 常用操作

**登录节点，在本项目根目录：**

```bash
mkdir -p logs
sbatch slurm/train_cpu.sbatch
squeue -r -u "$USER" -o '%.18i %.24j %.2t %.10M %.6C %R'
```

`-r` 展开数组子任务，便于准确看有多少项。`PD` = 等待，`R` = 运行；最后一列是节点或等待原因。

把作业号换成自己的：

**登录节点：**

```bash
JOB_ID=123456
scontrol show job "$JOB_ID"
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,AllocCPUS,MaxRSS,ExitCode
```

提前不需要了，才执行下面的取消命令。数组主作业号会取消整组；`scancel 123456_7` 只取消该组索引 7。

**登录节点：取消指定作业。**

```bash
scancel "$JOB_ID"
```

| 状态/操作 | 是否还占计算资源？ |
|---|---|
| `PENDING` | 尚未分配计算资源 |
| `RUNNING`，哪怕程序闲着 | 仍占资源；收费分区仍计费 |
| `COMPLETED` / 取消后完全结束 | 自动释放 |
| 断开 SSH | **不能代替取消**；`sbatch` 作业继续运行 |

## 为什么不能一次运行几百项？

可以提交多项，不等于可以同时运行全部。限制可能作用于 **用户、账户、QoS、分区**。

- `MaxTRESPerUser`：例如用户最多同时分配多少 CPU/GPU。
- `MaxSubmitJobsPerUser`：待运行和运行中的作业数量上限。
- `Priority` / `Resources`：其他用户优先级或空闲资源不足。

**登录节点：查询当前配置，部分内容可能受权限限制。**

```bash
sinfo -o '%P %a %l %D %G'
scontrol show partition i64m512u
sacctmgr show assoc where user="$USER" format=Account,Partition,QOS
sacctmgr show qos format=Name,MaxTRESPerUser,MaxJobsPerUser,MaxSubmitJobsPerUser
```

例如上限为 1024 核，每项 8 核，理论上最多 128 项同时运行；已有作业、内存、账户限制会进一步减少。**这里是算例，不是对你当前权限的承诺。**

[返回目录](../README.md) · [官方 Slurm 用法](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/slurm/job2/)
