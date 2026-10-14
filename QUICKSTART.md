# 快速上手：跑通第一个作业

**目标：** 大约 15 分钟，登录 HPC，提交一个免费的测试作业，看到它在计算节点上运行的结果。不需要安装任何软件，也不需要先上传代码。

## 0. 开始前确认

- **有 HPC 账号。** 还没有的话，在 [OneStop](https://onestop-online.hkust-gz.edu.cn) → IT 服务 → HPC Platform Application 申请，需要导师审批。
- **在校园网内，或已连接学校 VPN。** 否则连接会超时。
- **有一个终端。** macOS / Linux 用系统自带的"终端"；Windows 10/11 用 PowerShell（已自带 `ssh` 和 `scp`）。

## 1. 登录

**本机：** 把 `你的用户名` 换成 HPC 账号

```bash
ssh 你的用户名@hpc2login.hpc.hkust-gz.edu.cn
```

- 输入密码时屏幕**不显示任何字符**，这是正常的，输完按回车即可。
- 第一次连接会询问 `Are you sure you want to continue connecting`。这是在确认服务器的身份（主机指纹），可以向管理员或可信渠道核对后输入 `yes`。详见 [登录与 SSH](docs/02-login-and-ssh.md)。

看到新的命令提示符、没有报错，就说明你已经在**登录节点**上了。

## 2. 写一个作业脚本

作业脚本就是一个普通的 Bash 脚本，开头用 `#SBATCH` 写明要申请的资源。下面的命令会新建目录 `hpc-first`，并在里面生成脚本 `hello.sbatch`。整段复制、粘贴、回车即可。

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

最后一行 `cat` 会把脚本内容打印出来，方便你确认。每个 `#SBATCH` 的意思：

| 这一行 | 意思 |
|---|---|
| `--job-name=hello` | 作业名，查看队列时显示 |
| `--partition=debug` | 用免费的调试分区（最长 30 分钟，只用于测试） |
| `--nodes=1`、`--ntasks=1` | 在 1 台计算节点上运行 1 个程序 |
| `--cpus-per-task=2` | 给这个程序 2 个 CPU 核 |
| `--mem=2G` | 内存 2 GB |
| `--time=00:05:00` | 最多运行 5 分钟，到时自动结束 |
| `--output=hello-%j.out` | 程序的输出写进这个文件，`%j` 会替换成作业号 |

`#SBATCH` 下面是普通命令，会在计算节点上执行。`sleep 60` 只是让作业多停留一分钟，方便你观察它的状态。

## 3. 提交并观察

**登录节点：**

```bash
sbatch hello.sbatch
```

成功时会看到 `Submitted batch job 123456`。这串数字就是**作业号**，记下来。

**登录节点：** 查看自己的作业，可以隔几秒多执行几次

```bash
squeue -u "$USER"
```

看 `ST` 这一列：`PD` 表示排队中，`R` 表示运行中。作业从列表中消失，说明已经结束。

## 4. 查看结果

**登录节点：** 把 `123456` 换成你的作业号

```bash
JOB_ID=123456
cat "hello-${JOB_ID}.out"
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,ExitCode
```

输出文件里应该有作业号、节点名、`CPUs: 2` 和 Python 版本，最后一行是 `Done.`。节点名和登录节点的不同，说明程序确实运行在计算节点上。`sacct` 显示 `COMPLETED`、退出码 `0:0`，表示作业成功结束。

## 5. 下载到本机（可选）

**本机：** 新开一个本机终端（不是登录 HPC 的那个窗口）

```bash
scp 你的用户名@hpc2login.hpc.hkust-gz.edu.cn:hpc-first/hello-*.out .
```

文件会下载到本机的当前目录。`scp` 在 macOS、Linux 和 Windows PowerShell 中都可以使用。

## 你刚才做了什么

1. 在**本机**用 SSH 登录到**登录节点**。
2. 写了一份"预约单"（作业脚本），用 `sbatch` 交给 **Slurm**。
3. Slurm 在某台**计算节点**上分配了 2 核、2 GB，运行脚本，结束后自动收回资源。
4. 你在登录节点查看了输出，并把它下载到本机。

作业结束后资源会自动释放，不需要做任何清理。如果作业还在运行而你不想要了，执行 `scancel 作业号`。

**下一步：** [认识 HPC](docs/01-hpc-overview.md) → [配置免密登录](docs/02-login-and-ssh.md) → [上传自己的代码](docs/03-storage-and-data.md)
