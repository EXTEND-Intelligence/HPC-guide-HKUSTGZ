# 05 · 交互式调试：申请计算节点

本章说明如何申请计算节点进行交互式调试，以及调试结束后释放资源。

## 适用场景

- 首次运行新代码，需要直接查看报错并反复修改
- 安装 Python 环境、测试依赖能否导入
- 检查 GPU 是否可用

程序验证无误后，正式训练改用 `sbatch` 提交（见 [训练与批量实验](07-training-and-batch.md)）。交互式会话依赖 SSH 连接，网络中断通常会结束会话，不适合长时间训练。

## 申请调试节点

`debug` 分区**免费、最长 30 分钟、仅用于调试**。官方列出的上限为 16 CPU / 2 GPU，实际可分配的数量取决于当时的空闲资源。

**登录节点：** 申请 4 核、4 GB、15 分钟

```bash
srun -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 \
  --mem=4G --time=00:15:00 --pty bash
```

`--pty bash` 表示分配到资源后，在计算节点上打开一个交互终端。命令执行后处于等待状态，表示正在排队；出现新的提示符，即已进入计算节点。

**计算节点：** 确认所在位置

```bash
hostname                     # 与登录节点的主机名不同
echo "$SLURM_JOB_ID"         # 输出作业号，表示当前处于作业中
echo "$SLURM_CPUS_PER_TASK"  # 输出 4
```

**计算节点：** 运行示例程序（需先按 [第 03 章](03-storage-and-data.md#获取本手册的示例文件) 克隆本仓库）

```bash
cd ~/hpc-tutorial
python3 examples/hello_hpc.py --output "outputs/interactive-${SLURM_JOB_ID}"
```

最后一行输出 `Smoke test completed.` 即为成功，结果保存在 `outputs/interactive-作业号/result.json`。

## 释放资源

**计算节点：**

```bash
exit
```

回到登录节点后，该交互作业即结束，资源随之释放。可用 `squeue -u "$USER"` 确认列表中已无该作业。

> **注意：** SSH 意外断开时，无法确定资源是否已释放。重新登录后执行 `squeue -u "$USER"`，作业仍在时用 `scancel 作业号` 取消。

## 调试自己的程序

先按 [Python 环境](06-software-environment.md) 安装依赖。调试时只运行少量步数，重点检查：依赖能否正常导入、前向和反向传播能否完成、结果是否保存到预期位置。

**计算节点：** 路径和参数按实际项目修改

```bash
cd ~/my-project
export OMP_NUM_THREADS="$SLURM_CPUS_PER_TASK"
"$HOME/venvs/my-env/bin/python" -u train.py --steps 200 --seed 1
```

`OMP_NUM_THREADS` 使数值计算库的线程数与申请的核数一致，避免线程过多反而变慢。

## GPU 调试

需要账号具备 GPU 使用权限。

**登录节点：**

```bash
srun -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 \
  --mem=8G --gres=gpu:1 --time=00:15:00 --pty bash
```

**计算节点：**

```bash
nvidia-smi
```

显示 GPU 型号和显存，说明已分配到 GPU。已安装 CUDA 版 PyTorch 时，可再运行 `examples/gpu_check.py` 检查。debug 分区分配的 GPU 型号不一定与正式的 A40 分区相同。结束后同样执行 `exit`。

## 进阶：salloc

`salloc` 同样可以申请交互资源，但获得资源后终端仍停留在登录节点，需要再用 `srun` 进入计算节点。

**登录节点：**

```bash
salloc -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 \
  --mem=4G --time=00:15:00
srun --cpus-per-task=4 --pty bash
```

退出时需执行两次 `exit`：第一次离开计算节点，第二次释放整个资源申请。一般情况下使用前文的 `srun --pty bash` 即可。

[返回目录](../README.md)
