# 06 · Python 环境

读完这一章，你会建好一个 Python 环境，并在作业中正确地使用它。

## 两条原则

1. **环境建在家目录里，建一次，多个作业共用。** 不要在每个作业里重新安装依赖；有作业正在使用某个环境时，不要改动这个环境。
2. **作业里用完整路径指定 Python**，例如 `$HOME/venvs/my-env/bin/python`。不要指望提交作业时恰好激活了正确的环境，这样很容易用错解释器。

## 先看看有什么

**登录节点：**

```bash
python3 --version
module avail
```

本教程的示例需要 Python 3.10 或更高版本。`module avail` 列出平台提供的软件模块；提示 `command not found` 说明没有启用模块系统，可以忽略。系统自带的 Python 版本太低时，使用平台提供的模块，或在家目录里自己安装 Miniforge / Conda。不要尝试修改系统 Python。

## 用 venv 建环境

以本教程的 CPU 示例为例。安装依赖需要下载和解压大量文件，放在计算节点上做更稳妥。下面申请的是**收费**的 CPU 分区（不是 debug），2 核用满 1 小时也只要 0.04 元，而且提前退出只按实际时间计费。

**登录节点：**

```bash
srun -p i64m512u --nodes=1 --ntasks=1 --cpus-per-task=2 \
  --mem=4G --time=01:00:00 --pty bash
```

**计算节点：**

```bash
cd ~/hpc-tutorial
python3 -m venv ~/venvs/hpc-tutorial
source ~/venvs/hpc-tutorial/bin/activate
python -m pip install --upgrade pip
python -m pip install -r examples/requirements.txt \
  --index-url https://download.pytorch.org/whl/cpu
python -c 'import torch; print(torch.__version__)'
exit
```

最后打印出 PyTorch 的版本号就说明装好了，`exit` 退出并释放资源。`--index-url` 指定的是 PyTorch 的 CPU 版下载源，体积比 GPU 版小得多。如果计算节点无法下载（一直超时），联系管理员询问镜像或离线安装的方式。

## 在作业里使用环境

本仓库的 CPU 脚本默认使用 `$HOME/venvs/hpc-tutorial/bin/python`。想用自己的环境时，提交前设置 `PYTHON_BIN`：

**登录节点：** 路径换成你自己的环境

```bash
export PYTHON_BIN="$HOME/venvs/my-env/bin/python"
sbatch slurm/train_cpu.sbatch
```

脚本开头会检查这个路径；找不到时会直接报错退出，而不是悄悄用错 Python。

自己写作业脚本时，直接写完整路径：

**文件：** 作业脚本中的一行

```bash
"$HOME/venvs/my-env/bin/python" -u train.py
```

`-u` 表示不缓冲输出，日志会实时写入文件，方便用 `tail -f` 查看进度。

## conda 用户

做法相同：找到环境里 Python 的完整路径，在作业中使用它。

**登录节点：**

```bash
conda activate my-env
which python
```

`which python` 输出的路径（例如 `.../envs/my-env/bin/python`）就是要写进作业脚本或 `PYTHON_BIN` 的路径。

## GPU 环境

GPU 训练需要 **CUDA 版**的 PyTorch，上面装的 CPU 版无法使用 GPU。建议另建一个环境，本仓库的 GPU 脚本默认使用 `$HOME/venvs/hpc-tutorial-gpu`：

1. 申请一个 GPU 调试节点（见 [交互式调试](05-debug-and-interactive.md)），用 `nvidia-smi` 查看驱动支持的 CUDA 版本。
2. 在 [PyTorch 官方安装页面](https://pytorch.org/get-started/locally/) 选择对应的 CUDA 版本，得到安装命令。
3. 在新环境中执行该命令，再用 `python -c 'import torch; print(torch.cuda.is_available())'` 检查，输出 `True` 即可。

[返回目录](../README.md)
