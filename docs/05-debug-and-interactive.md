# 05 · 交互式调试：申请一个计算节点

读完这一章，你可以申请一个计算节点，直接在上面敲命令调试程序，用完立即释放。

## 什么时候用

- 第一次运行新代码，想直接看报错、修改后马上再试
- 安装 Python 环境、测试能否 import
- 查看 GPU 是否可用

调通之后，正式训练改用 `sbatch` 提交（见 [正式训练](07-training-and-batch.md)）。交互式会话依赖你的 SSH 连接，网络一断通常就结束了，不适合长时间训练。

## 申请一个调试节点

`debug` 分区**免费、最长 30 分钟、只用于调试**。官方列出的上限是 16 CPU / 2 GPU，实际能分到多少取决于当时的空闲资源。

**登录节点：** 申请 4 核、4 GB、15 分钟

```bash
srun -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 \
  --mem=4G --time=00:15:00 --pty bash
```

`--pty bash` 的意思是：分配到资源后，在计算节点上给我打开一个终端。命令执行后会停住，这是在排队；出现新的提示符时，你已经在计算节点上了。

**计算节点：** 确认位置

```bash
hostname                     # 应该和登录节点的主机名不同
echo "$SLURM_JOB_ID"         # 输出作业号，说明你在作业里
echo "$SLURM_CPUS_PER_TASK"  # 输出 4
```

**计算节点：** 试运行一个示例（需要先完成 [第 03 章的练习](03-storage-and-data.md)）

```bash
cd ~/hpc-tutorial
python3 examples/hello_hpc.py --output "outputs/interactive-${SLURM_JOB_ID}"
```

最后一行输出 `Smoke test completed.` 即为成功，结果保存在 `outputs/interactive-作业号/result.json`。

## 用完立即退出

**计算节点：**

```bash
exit
```

回到登录节点后，这个交互作业就结束了，资源随即释放。可以用 `squeue -u "$USER"` 确认列表里已经没有它。

> **注意：** 如果 SSH 意外断开，不要猜资源有没有释放。重新登录后执行 `squeue -u "$USER"`，作业还在的话用 `scancel 作业号` 取消。

## 调试你自己的程序

先按 [Python 环境](06-software-environment.md) 建好依赖。调试时只跑很少的步数，重点检查：能否正常 import、前向和反向传播能否跑通、结果是否保存到预期的位置。

**计算节点：** 路径和参数换成你自己的

```bash
cd ~/my-project
export OMP_NUM_THREADS="$SLURM_CPUS_PER_TASK"
"$HOME/venvs/my-env/bin/python" -u train.py --steps 200 --seed 1
```

`OMP_NUM_THREADS` 让数值计算库使用的线程数等于申请的核数，避免抢占过多线程反而变慢。

## GPU 调试

需要你的账号有 GPU 使用权限。

**登录节点：**

```bash
srun -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 \
  --mem=8G --gres=gpu:1 --time=00:15:00 --pty bash
```

**计算节点：**

```bash
nvidia-smi
```

能看到 GPU 型号和显存，说明分到了 GPU。如果已经装好 CUDA 版 PyTorch，可以再运行 `examples/gpu_check.py` 检查。debug 分区分到的 GPU 型号不一定和正式的 A40 分区相同。用完同样执行 `exit`。

## 进阶：salloc

`salloc` 也能申请交互资源，但拿到资源后终端仍然停在登录节点，还要再用 `srun` 才能进入计算节点：

**登录节点：**

```bash
salloc -p debug --nodes=1 --ntasks=1 --cpus-per-task=4 \
  --mem=4G --time=00:15:00
srun --cpus-per-task=4 --pty bash
```

退出时要 `exit` **两次**：第一次离开计算节点，第二次才释放整个资源申请。新手直接用前面的 `srun --pty bash` 即可。

[返回目录](../README.md)
