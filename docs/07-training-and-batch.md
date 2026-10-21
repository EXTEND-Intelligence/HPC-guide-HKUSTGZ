# 07 · 训练、批量实验与 GPU

本章说明长时间训练、多组参数的数组作业，以及 GPU 作业的提交方法。

**前提：** 已按 [Python 环境](06-software-environment.md) 建立环境，并已在 [交互式调试](05-debug-and-interactive.md) 中验证程序可以正常运行。

## 单个 CPU 训练作业

[`slurm/train_cpu.sbatch`](../slurm/train_cpu.sbatch) 默认申请 1 个进程、8 核、16 GB、最长 12 小时，使用收费的 CPU 分区 `i64m512u`。示例训练规模很小，几分钟内即可结束；12 小时只是上限，按实际运行时间计费。

**登录节点：**

```bash
cd ~/hpc-tutorial
mkdir -p logs
sbatch slurm/train_cpu.sbatch
```

结果保存在 `outputs/cpu-作业号/`，日志为 `logs/cpu-作业号.out` 和 `.err`。

**查看运行中的日志：** `tail -f logs/cpu-作业号.out`，按 `Ctrl+C` 退出查看，不影响作业。

**调整参数无需修改脚本。** 在提交命令前设置环境变量，脚本会读取这些变量。

**登录节点：**

```bash
STEPS=2000 SEED=37 sbatch slurm/train_cpu.sbatch
```

资源也可在提交时覆盖，命令行参数优先于脚本中的 `#SBATCH`。

**登录节点：**

```bash
sbatch --cpus-per-task=4 --time=02:00:00 slurm/train_cpu.sbatch
```

## 用于自己的项目

1. 将 `slurm/train_cpu.sbatch` 复制到项目中。
2. 按需修改 `#SBATCH` 资源行。
3. 将最后的 `srun ... examples/train_demo.py ...` 替换为实际的训练命令。
4. 在**项目根目录**执行 `mkdir -p logs`，再 `sbatch`。

**文件：** 替换后的训练命令示例

```bash
srun --cpus-per-task="$SLURM_CPUS_PER_TASK" "$PYTHON_BIN" -u train.py \
  --config configs/my_config.yaml --seed 23 --output "outputs/run-${SLURM_JOB_ID}"
```

输出目录带作业号，每次运行写入新目录，不覆盖旧结果。

> **提示：** 核数并非越多越快。许多程序（例如强化学习中单进程与环境交互的部分）使用 8 核与 64 核的速度相近，多出的核只会增加费用。建议先用 4–8 核短时运行，测出每秒处理的步数，再决定是否增加核数。

## 多组参数 × 多个种子：数组作业

实验中常需要"3 个学习率 × 5 个随机种子"共 15 次运行。**数组作业（job array）** 可一次提交全部 15 项：Slurm 为每一项分配编号 `SLURM_ARRAY_TASK_ID`，脚本根据编号选择参数。

[`slurm/train_array.sbatch`](../slurm/train_array.sbatch) 中编号与参数的对应关系：

| 编号 | 学习率 | 种子 |
|---|---|---|
| 0–4 | 0.0003 | 11、23、37、51、71 |
| 5–9 | 0.001 | 同上 |
| 10–14 | 0.003 | 同上 |

脚本中的 `#SBATCH --array=0-14%3` 表示编号 0 到 14，**最多同时运行 3 项**。每项 8 核、16 GB，同一时刻最多占用 24 核、48 GB。

**登录节点：**

```bash
cd ~/hpc-tutorial
mkdir -p logs
sbatch slurm/train_array.sbatch
squeue -r -u "$USER"
```

`-r` 将每个数组项分行显示。日志文件为 `logs/array-主作业号_编号.out`。

需要放宽同时运行的数量时，可在提交时覆盖。这只是放开限制，实际同时运行的数量仍取决于空闲资源和账号上限。

**登录节点：**

```bash
sbatch --array=0-14 slurm/train_array.sbatch
```

取消时，`scancel 主作业号` 取消整组，`scancel 主作业号_7` 只取消编号 7。

> **注意：** 数组作业排队和运行期间，不要 `git pull` 或修改代码、配置。后启动的项会读到改动后的版本，导致同一批实验混用两个版本的代码。

## GPU 作业

[`slurm/train_gpu.sbatch`](../slurm/train_gpu.sbatch) 申请 A40 分区 `i64m1tga40u`：1 块 GPU、8 核、16 GB，最长 2 小时。需先建立 CUDA 版 PyTorch 环境（见 [Python 环境](06-software-environment.md)）。

与 CPU 脚本相比，关键区别在于以下两行。

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

GPU 作业的费用为 GPU 费用与 CPU 费用之和，GPU 空闲时同样计费。提交前应确认程序会使用 GPU，例如训练代码中设置了 `device="cuda"`。

[返回目录](../README.md) · [费用与预算](08-pricing-and-budget.md) · [示例说明](../examples/README.md)
