# 06 · 申请调试节点

二期官方 `debug` 分区：**免费、仅代码调试、最长 30 分钟**。文档列出的资源上限是 16 CPU / 2 GPU，实际分配仍受权限和空闲资源约束。不要拿它做正式长训练。

## 推荐：直接进入已分配的计算节点

**登录节点：申请 4 核、4 GB、15 分钟。**

```bash
srun -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 \
  --mem=4G --time=00:15:00 --pty bash
```

排队时仍未拿到资源。出现新 shell 后，先确认位置和作业号。

**已分配的计算节点：**

```bash
hostname
printf '作业号：%s，CPU：%s\n' "$SLURM_JOB_ID" "$SLURM_CPUS_PER_TASK"
cd "$HOME/hpc-tutorial"
python3 examples/hello_hpc.py --output "outputs/interactive-${SLURM_JOB_ID}"
exit
```

这里的 `exit` 退出计算 shell，使本次直接由 `srun` 创建的交互作业结束、释放资源。回到登录节点用 `squeue -u "$USER"` 确认。

## 换成自己的训练命令

先按 [软件环境](04-software-environment.md) 建好依赖。调试只跑短步数，主要检查导入、环境 reset、前向/反向、保存输出是否正常。

**已分配的计算节点，在自己的项目目录：**

```bash
export OMP_NUM_THREADS="$SLURM_CPUS_PER_TASK"
export MKL_NUM_THREADS="$SLURM_CPUS_PER_TASK"
# 换成你自己的 Python 路径；项目应支持这里的参数：
"$HOME/你的环境/bin/python" -u train.py \
  mpe2_simple_tag_5p1/MAPPO_NoComm \
  --algorithm mappo --seed 23 --steps 2000 --device cpu
```

## `salloc` 和 `srun` 有什么不同？

`salloc` 拿到 allocation 后的 shell 通常还在登录节点；还需要 `srun` 才进入计算节点。

**登录节点：**

```bash
salloc -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 \
  --mem=4G --time=00:15:00
srun --cpus-per-task=4 --pty bash
```

退出时有 **两层**：先 `exit` 计算 shell，再 `exit` allocation shell。只退出第一层不一定释放整个 allocation。

SSH 意外断开后，不要猜资源是否释放。重新登录查询，仍在运行且不需要时执行 `scancel 具体作业号`。

## 可选：GPU 调试

**登录节点，需有 GPU/debug 权限：**

```bash
srun -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 \
  --mem=8G --gres=gpu:1 --time=00:15:00 --pty bash
```

进入计算节点后可执行 `nvidia-smi`；已有 CUDA 版 PyTorch 时，可运行 `examples/gpu_check.py`。不用了同样 `exit`。debug 中分配的 GPU 型号不保证与正式 A40 队列相同。

[返回目录](../README.md)
