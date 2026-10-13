# 07 · 正式训练与并行实验

正式 CPU 使用 `i64m512u`，是收费分区。先跑通 [快速上手](../QUICKSTART.md) 和 [Python 环境](04-software-environment.md)。所有脚本从本项目根目录提交。

## 单个 CPU 作业

脚本默认 **1 个进程、8 核、16 GB、最长 12 小时**。训练示例是小型回归模型，不是 RL benchmark；默认 1000 步，很快结束，12 小时只是上限。

**登录节点：**

```bash
cd "$HOME/hpc-tutorial"
mkdir -p logs
sbatch slurm/train_cpu.sbatch
squeue -r -u "$USER"
```

修改步数/种子不必改脚本：

**登录节点：**

```bash
STEPS=2000 SEED=37 sbatch slurm/train_cpu.sbatch
```

自定义变量默认随 `sbatch` 的 `--export=ALL` 传入，脚本已明确设置。`#SBATCH` 行不展开 `$HOME` 等 shell 变量；动态参数放在提交命令或脚本正文。

## 用自己的 RL 项目

把 `train_cpu.sbatch` 复制到自己的项目，保留资源、线程设置和解释器检查，将最后的 `srun ...` 替换为你的训练命令。**从自己的项目根目录提交**，并先建 `logs/`。

**脚本正文示例，不是在登录节点直接执行：**

```bash
srun --cpus-per-task="$SLURM_CPUS_PER_TASK" "$PYTHON_BIN" -u train.py \
  mpe2_simple_tag_5p1/MAPPO_NoComm \
  --algorithm mappo --seed 23 --steps 400000 --device cpu
```

申请核数建议从 4–8 核、16 GB 起测。RL 若主要时间在单进程环境交互，128 核通常不会更快；先测吞吐、内存和并行环境数，再扩大。

## 3 组参数 × 5 个种子 = 15 项

`train_array.sbatch` 使用 3 个学习率、5 个种子，最多同时运行 3 项。**每一项**都是 8 核、16 GB；并发 3 项最多合计 24 核、48 GB。

**登录节点：**

```bash
mkdir -p logs
sbatch slurm/train_array.sbatch
squeue -r -u "$USER"
```

| 数组索引 | 学习率 | 种子 |
|---|---|---|
| 0–4 | 0.0003 | 11、23、37、51、71 |
| 5–9 | 0.001 | 同上 |
| 10–14 | 0.003 | 同上 |

想提交全部、由调度器决定并行数，可以覆盖数组设置；不是保证全部同时启动。

**登录节点，预算和账户权限允许时：**

```bash
sbatch --array=0-14 slurm/train_array.sbatch
```

作业运行/排队期间不要随意 `git pull` 或改配置：后启动的数组项可能读取不同代码。保持仓库不变到这一批结束，另存提交版本和配置。

## 可选：单 GPU

脚本请求 A40 分区 `i64m1tga40u`、1 GPU、8 CPU、16 GB、最长 2 小时。需要 **支持 CUDA 的 PyTorch 环境**，CPU 版 PyTorch 不适用。

先在已分配的 GPU 节点用 `nvidia-smi` 查看驱动，按 [PyTorch 官方安装选择器](https://pytorch.org/get-started/locally/) 建立 GPU 环境；默认路径为 `$HOME/venvs/hpc-tutorial-gpu`。

**登录节点，GPU 环境已准备好后：**

```bash
mkdir -p logs
sbatch slurm/train_gpu.sbatch
```

脚本先检查 CUDA，再训练。小示例不用于证明 GPU 提速；GPU 作业需估算 **CPU + GPU** 两部分费用。

[返回目录](../README.md) · [计费](08-pricing-and-budget.md) · [脚本说明](../examples/README.md)
