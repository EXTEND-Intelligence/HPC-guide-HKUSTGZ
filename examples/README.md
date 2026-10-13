# 示例与脚本

从项目根目录提交；先执行 `mkdir -p logs`。详细流程见 [快速上手](../QUICKSTART.md)。

| 文件 | 作用 | 依赖 |
|---|---|---|
| `hello_hpc.py` | 查看节点、作业号、CPU，保存一个小结果 | Python 标准库 |
| `train_demo.py` | 小型回归训练，验证环境、日志、指标与模型保存 | PyTorch |
| `gpu_check.py` | 检查 PyTorch 是否可用 CUDA，做小型矩阵计算 | CUDA 版 PyTorch |
| `requirements.txt` | CPU 演示所需依赖 | 按 [环境章节](../docs/04-software-environment.md) 安装 |

| Slurm 脚本 | 默认申请 | 输出 |
|---|---|---|
| `debug_cpu.sbatch` | debug，2 核 / 2 GB / 10 分钟 | `outputs/hello-作业号/` |
| `train_cpu.sbatch` | CPU，8 核 / 16 GB / 12 小时 | `outputs/cpu-作业号/` |
| `train_gpu.sbatch` | A40，8 核 / 16 GB / 1 GPU / 2 小时 | `outputs/gpu-作业号/` |
| `train_array.sbatch` | 15 项，每项 8 核 / 16 GB / 12 小时；默认并发 3 | `outputs/array-主作业号/task-索引-.../` |

`train_demo.py` 默认 1000 步、CPU、种子 23，每 100 步记录一次训练 MSE。它不输出 reward/胜率，也不构成算法对比实验。无需消耗几小时来演示提交方式。

可传变量：`PYTHON_BIN`、`STEPS`；单 CPU/GPU 还支持 `SEED`、`LR`。解释器必须是完整路径，默认 CPU 环境为 `$HOME/venvs/hpc-tutorial/bin/python`，GPU 环境为 `$HOME/venvs/hpc-tutorial-gpu/bin/python`。

所有脚本采用 `set -euo pipefail`，失败不会打印完成标记。不同作业使用不同输出目录；重用同一目录会被 Python 示例拒绝，防止覆盖。

hello 中申请核数看 `slurm_cpus_per_task`；`os_cpu_count` 只是操作系统可见 CPU 数，不代表你获准使用那么多核。

**已分配的计算节点：小规模验证。**

```bash
cd "$HOME/hpc-tutorial"
"$HOME/venvs/hpc-tutorial/bin/python" examples/train_demo.py \
  --steps 100 --seed 23 --device cpu --output outputs/manual-test-1
```

示例保存：`metadata.json`（参数、Git、依赖、Slurm 信息）、`metrics.csv`（原始 MSE）、`summary.json`、`checkpoint.pt`。保存时使用 LF 换行，不依赖截图。
