# 示例与脚本

这些示例程序只用于演示提交流程，不是性能测试或科研实验。所有脚本都从仓库根目录提交，提交前先执行 `mkdir -p logs`。首次使用请参考 [快速开始](../QUICKSTART.md)。

## Python 示例

| 文件 | 作用 | 依赖 |
|---|---|---|
| `hello_hpc.py` | 显示所在节点、作业号和 CPU 数，保存一个 JSON | 只用 Python 标准库 |
| `train_demo.py` | 小型回归训练，演示日志、指标和模型的保存 | PyTorch |
| `gpu_check.py` | 检查 PyTorch 能否使用 CUDA，并做一次小矩阵计算 | CUDA 版 PyTorch |
| `requirements.txt` | CPU 示例的依赖 | 安装方法见 [Python 环境](../docs/06-software-environment.md) |

## Slurm 脚本

| 脚本 | 默认申请 | 输出位置 |
|---|---|---|
| `slurm/debug_cpu.sbatch` | debug 分区，2 核 / 2 GB / 10 分钟 | `outputs/hello-作业号/` |
| `slurm/train_cpu.sbatch` | CPU 分区，8 核 / 16 GB / 12 小时 | `outputs/cpu-作业号/` |
| `slurm/train_gpu.sbatch` | A40 分区，1 GPU / 8 核 / 16 GB / 2 小时 | `outputs/gpu-作业号/` |
| `slurm/train_array.sbatch` | CPU 分区，15 项，每项 8 核 / 16 GB / 12 小时，最多同时 3 项 | `outputs/array-主作业号/task-编号-.../` |

## 可以调整的变量

在 `sbatch` 前设置即可，例如 `STEPS=2000 sbatch slurm/train_cpu.sbatch`：

| 变量 | 作用 | 适用脚本 |
|---|---|---|
| `PYTHON_BIN` | Python 的完整路径 | 全部 |
| `STEPS` | 训练步数，默认 1000 | 训练脚本 |
| `SEED`、`LR` | 随机种子、学习率 | 单个 CPU / GPU 训练 |

`PYTHON_BIN` 的默认值：CPU 脚本是 `$HOME/venvs/hpc-tutorial/bin/python`，GPU 脚本是 `$HOME/venvs/hpc-tutorial-gpu/bin/python`。

## 示例会保存什么

`train_demo.py` 默认 CPU、1000 步、种子 23，每 100 步记录一次训练误差（MSE），保存：

- `metadata.json`：参数、Git commit、依赖版本、Slurm 信息
- `metrics.csv`：原始指标
- `summary.json`：结果汇总
- `checkpoint.pt`：模型

`hello_hpc.py` 只保存 `result.json`。其中申请到的核数看 `slurm_cpus_per_task`；`os_cpu_count` 是整台机器可见的 CPU 数，不代表作业可以使用这么多核。

## 设计上的安全措施

- 脚本使用 `set -euo pipefail`：任何一步出错就停止，不会打印完成标记。
- 每个作业的输出目录都带作业号；目录已存在时，示例程序拒绝运行，防止覆盖旧结果。

**计算节点：** 手动做一次小规模验证

```bash
cd ~/hpc-tutorial
"$HOME/venvs/hpc-tutorial/bin/python" examples/train_demo.py \
  --steps 100 --seed 23 --device cpu --output outputs/manual-test-1
```
