# 06 · Python 环境

本章说明 Python 环境的建立方式，以及在作业中指定解释器的方法。

## 基本原则

1. **环境建在家目录中，一次建立，多个作业共用。** 不在每个作业中重复安装依赖；有作业正在使用某个环境时，不修改该环境。
2. **作业中用完整路径指定 Python**，例如 `$HOME/venvs/my-env/bin/python`。依赖提交时恰好激活的环境，容易用错解释器。

## 查看现有环境

**登录节点：**

```bash
python3 --version
module avail
```

本仓库的示例需要 Python 3.10 或更高版本。`module avail` 列出平台提供的软件模块；提示 `command not found` 表示未启用模块系统，可以忽略。系统自带的 Python 版本过低时，使用平台提供的模块，或在家目录中自行安装 Miniforge / Conda；不要修改系统 Python。

## 使用 venv 建立环境

以下以本仓库的 CPU 示例为例。安装依赖需要下载和解压大量文件，在计算节点上进行更稳妥。下面申请的是**收费**的 CPU 分区（不是 debug），2 核运行满 1 小时为 0.04 元，提前退出按实际时间计费。

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

打印出 PyTorch 版本号即表示安装完成，`exit` 退出并释放资源。`--index-url` 指定 PyTorch 的 CPU 版下载源，体积远小于 GPU 版。计算节点无法下载（持续超时）时，联系管理员确认镜像或离线安装方式。

## 在作业中使用环境

本仓库的 CPU 脚本默认使用 `$HOME/venvs/hpc-tutorial/bin/python`。使用其他环境时，提交前设置 `PYTHON_BIN`。

**登录节点：** 路径按实际环境修改

```bash
export PYTHON_BIN="$HOME/venvs/my-env/bin/python"
sbatch slurm/train_cpu.sbatch
```

脚本开头会检查该路径；路径无效时直接报错退出，避免误用其他 Python。

自行编写作业脚本时，直接写完整路径。

**文件：** 作业脚本中的一行

```bash
"$HOME/venvs/my-env/bin/python" -u train.py
```

`-u` 表示不缓冲输出，日志实时写入文件，可用 `tail -f` 查看进度。

## conda 环境

方法相同：找到环境中 Python 的完整路径，在作业中使用该路径。

**登录节点：**

```bash
conda activate my-env
which python
```

`which python` 输出的路径（例如 `.../envs/my-env/bin/python`）即为作业脚本或 `PYTHON_BIN` 中应填写的路径。

## GPU 环境

GPU 训练需要 **CUDA 版** PyTorch，上文安装的 CPU 版无法使用 GPU。建议单独建立一个环境，本仓库的 GPU 脚本默认使用 `$HOME/venvs/hpc-tutorial-gpu`：

1. 申请 GPU 调试节点（见 [交互式调试](05-debug-and-interactive.md)），用 `nvidia-smi` 查看驱动支持的 CUDA 版本。
2. 在 [PyTorch 官方安装页面](https://pytorch.org/get-started/locally/) 选择对应的 CUDA 版本，获取安装命令。
3. 在新环境中执行该命令，再用 `python -c 'import torch; print(torch.cuda.is_available())'` 检查，输出 `True` 即可。

[返回目录](../README.md)
