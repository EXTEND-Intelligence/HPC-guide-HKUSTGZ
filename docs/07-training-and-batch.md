# 07 · 正式训练、批量实验与 GPU

读完这一章，你可以提交长时间训练，一次提交多组参数和随机种子，以及使用 GPU。

**开始前：** 已按 [Python 环境](06-software-environment.md) 建好环境，并在 [交互式调试](05-debug-and-interactive.md) 中跑通过你的程序。

## 单个 CPU 训练作业

[`slurm/train_cpu.sbatch`](../slurm/train_cpu.sbatch) 默认申请 1 个进程、8 核、16 GB、最长 12 小时，使用收费的 CPU 分区 `i64m512u`。示例训练很小，几分钟就会结束。12 小时只是上限，按实际运行时间计费。

**登录节点：**

```bash
cd ~/hpc-tutorial
mkdir -p logs
sbatch slurm/train_cpu.sbatch
```

结果保存在 `outputs/cpu-作业号/`，日志在 `logs/cpu-作业号.out` 和 `.err`。

**查看运行中的日志：** `tail -f logs/cpu-作业号.out`，按 `Ctrl+C` 停止查看（不会影响作业）。

**改参数不用改脚本。** 在提交命令前加环境变量，脚本会读取它们。

**登录节点：**

```bash
STEPS=2000 SEED=37 sbatch slurm/train_cpu.sbatch
```

资源也可以在提交时覆盖，命令行参数优先于脚本里的 `#SBATCH`。

**登录节点：**

```bash
sbatch --cpus-per-task=4 --time=02:00:00 slurm/train_cpu.sbatch
```

## 换成你自己的项目

1. 把 `slurm/train_cpu.sbatch` 复制到你的项目里。
2. 按需修改 `#SBATCH` 资源行。
3. 把最后的 `srun ... examples/train_demo.py ...` 换成你的训练命令。
4. 在**你的项目根目录**执行 `mkdir -p logs`，再 `sbatch`。

**文件：** 替换后的训练命令示例

```bash
srun --cpus-per-task="$SLURM_CPUS_PER_TASK" "$PYTHON_BIN" -u train.py \
  --config configs/my_config.yaml --seed 23 --output "outputs/run-${SLURM_JOB_ID}"
```

输出目录带上作业号，每次运行都是新目录，不会覆盖旧结果。

> **提示：** 核数不是越多越快。很多程序（例如强化学习里单进程与环境交互的部分）用 8 核和 64 核速度差不多，多出来的核只会多花钱。先用 4–8 核短跑，测一下每秒能处理多少步，再决定要不要加核。

## 多组参数 × 多个种子：数组作业

做实验经常需要"3 个学习率 × 5 个随机种子"共 15 次运行。**数组作业（job array）** 可以一次提交全部 15 项：Slurm 给每一项分配一个编号 `SLURM_ARRAY_TASK_ID`，脚本根据编号选择参数。

[`slurm/train_array.sbatch`](../slurm/train_array.sbatch) 中编号与参数的对应关系：

| 编号 | 学习率 | 种子 |
|---|---|---|
| 0–4 | 0.0003 | 11、23、37、51、71 |
| 5–9 | 0.001 | 同上 |
| 10–14 | 0.003 | 同上 |

脚本中的 `#SBATCH --array=0-14%3` 表示编号 0 到 14，**最多同时运行 3 项**。每项 8 核、16 GB，所以同一时刻最多占用 24 核、48 GB。

**登录节点：**

```bash
cd ~/hpc-tutorial
mkdir -p logs
sbatch slurm/train_array.sbatch
squeue -r -u "$USER"
```

`-r` 把每个数组项分行显示。日志文件是 `logs/array-主作业号_编号.out`。

想放宽同时运行的数量，可以在提交时覆盖。这只是允许，实际能同时跑几项仍取决于空闲资源和账号上限。

**登录节点：**

```bash
sbatch --array=0-14 slurm/train_array.sbatch
```

取消时，`scancel 主作业号` 取消整组，`scancel 主作业号_7` 只取消编号 7。

> **注意：** 数组作业排队和运行期间，不要 `git pull` 或修改代码、配置。后启动的项会读到改动后的版本，同一批实验就混用了两个版本的代码。

## 使用 GPU

[`slurm/train_gpu.sbatch`](../slurm/train_gpu.sbatch) 申请 A40 分区 `i64m1tga40u`：1 块 GPU、8 核、16 GB，最长 2 小时。需要先建好 CUDA 版 PyTorch 环境（见 [Python 环境](06-software-environment.md)）。

和 CPU 脚本相比，关键区别只有两行。

**文件：** `slurm/train_gpu.sbatch` 中的 GPU 设置

```bash
#SBATCH --partition=i64m1tga40u
#SBATCH --gres=gpu:1
```

**登录节点：**

```bash
cd ~/hpc-tutorial
mkdir -p logs
sbatch slurm/train_gpu.sbatch
```

脚本先运行 `examples/gpu_check.py` 确认 CUDA 可用，再开始训练。

GPU 作业的费用 = GPU 费用 + CPU 费用，GPU 闲着也照样计费。提交前确认程序真的会用 GPU，例如训练代码里设置了 `device="cuda"`。

[返回目录](../README.md) · [费用与预算](08-pricing-and-budget.md) · [示例说明](../examples/README.md)
