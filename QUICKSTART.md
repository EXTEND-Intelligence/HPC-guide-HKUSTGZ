# 快速开始：提交第一个作业

本页完成一次最小流程：登录 HPC，在免费的 `debug` 分区提交一个测试作业，并查看它在计算节点上的输出。全程约 15 分钟，无需安装软件或上传代码。

## 0. 准备条件

- **HPC 账号。** 尚未开通的，在 [OneStop](https://onestop-online.hkust-gz.edu.cn) → IT 服务 → HPC Platform Application 申请，需导师审批。
- **校园网或学校 VPN。** 校外网络直接连接会超时。
- **终端。** macOS / Linux 使用系统自带的"终端"；Windows 10/11 使用 PowerShell（已自带 `ssh` 和 `scp`）。

## 1. 登录

**本机：** 把 `你的用户名` 换成 HPC 账号

```bash
ssh 你的用户名@hpc2login.hpc.hkust-gz.edu.cn
```

- 输入密码时屏幕**不显示任何字符**，属正常现象，输完按回车。
- 首次连接会询问 `Are you sure you want to continue connecting`，用于确认服务器身份（主机指纹）。向管理员或可信渠道核对后输入 `yes`，详见 [登录与 SSH](docs/02-login-and-ssh.md)。

出现新的命令提示符且没有报错，即已进入**登录节点**。

## 2. 编写作业脚本

作业脚本是一个普通的 Bash 脚本，开头用 `#SBATCH` 声明要申请的资源。下面的命令新建目录 `hpc-first`，并在其中生成脚本 `hello.sbatch`，整段复制执行即可。

**登录节点：**

```bash
mkdir -p ~/hpc-first && cd ~/hpc-first
cat > hello.sbatch <<'EOF'
#!/bin/bash
#SBATCH --job-name=hello
#SBATCH --partition=debug
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --mem=2G
#SBATCH --time=00:05:00
#SBATCH --output=hello-%j.out

echo "Job ID: $SLURM_JOB_ID"
echo "Node:   $(hostname)"
echo "CPUs:   $SLURM_CPUS_PER_TASK"
echo "Python: $(python3 --version 2>&1)"
sleep 60
echo "Done."
EOF
cat hello.sbatch
```

最后一行 `cat` 打印脚本内容，用于核对。各 `#SBATCH` 参数的含义：

| 参数 | 含义 |
|---|---|
| `--job-name=hello` | 作业名，查看队列时显示 |
| `--partition=debug` | 免费的调试分区（最长 30 分钟，仅用于测试） |
| `--nodes=1`、`--ntasks=1` | 在 1 台计算节点上运行 1 个程序 |
| `--cpus-per-task=2` | 为该程序分配 2 个 CPU 核 |
| `--mem=2G` | 内存 2 GB |
| `--time=00:05:00` | 最长运行 5 分钟，到时自动结束 |
| `--output=hello-%j.out` | 程序输出写入该文件，`%j` 替换为作业号 |

`#SBATCH` 之后是普通命令，在计算节点上执行。`sleep 60` 使作业停留一分钟，便于观察作业状态。

## 3. 提交与查看

**登录节点：**

```bash
sbatch hello.sbatch
```

提交成功时输出 `Submitted batch job 123456`，其中的数字是**作业号**，后续查询都会用到。

**登录节点：** 查看自己的作业，可隔几秒重复执行

```bash
squeue -u "$USER"
```

`ST` 列表示状态：`PD` 为排队中，`R` 为运行中。作业从列表中消失，表示已经结束。

## 4. 查看结果

**登录节点：** 把 `123456` 换成实际的作业号

```bash
JOB_ID=123456
cat "hello-${JOB_ID}.out"
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,ExitCode
```

输出文件中包含作业号、节点名、`CPUs: 2` 和 Python 版本，最后一行为 `Done.`。节点名与登录节点不同，说明程序运行在计算节点上。`sacct` 显示 `COMPLETED`、退出码 `0:0`，表示作业正常结束。

## 5. 下载到本机（可选）

**本机：** 在新的本机终端窗口中执行，而不是已登录 HPC 的窗口

```bash
scp 你的用户名@hpc2login.hpc.hkust-gz.edu.cn:hpc-first/hello-*.out .
```

文件下载到本机的当前目录。`scp` 在 macOS、Linux 和 Windows PowerShell 中均可使用。

## 流程回顾

1. 在**本机**通过 SSH 登录到**登录节点**。
2. 编写作业脚本（相当于一份预约单），用 `sbatch` 提交给 **Slurm**。
3. Slurm 在某台**计算节点**上分配 2 核、2 GB，运行脚本，结束后自动收回资源。
4. 在登录节点查看输出，并下载到本机。

作业结束后资源自动释放，无需清理。作业仍在运行但已不需要时，执行 `scancel 作业号`。

**后续阅读：** [认识 HPC](docs/01-hpc-overview.md) → [登录与 SSH](docs/02-login-and-ssh.md) → [文件与传输](docs/03-storage-and-data.md)
