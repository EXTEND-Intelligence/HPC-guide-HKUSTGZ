# 快速上手：提交第一个 CPU 作业

目标：不用安装第三方库，完成 **上传 → 提交 → 看日志 → 下载**。使用免费的 `debug` 分区，仅做短时测试。

## 1. 在本机配置 SSH

先连接校园网或学校 VPN。参照 [SSH 模板](templates/ssh_config.example)，把其中的 `YOUR_USERNAME` 换成账号，合并进本机 `~/.ssh/config`。初次登录要核验服务器指纹，见 [SSH 说明](docs/02-login-and-ssh.md)。

**本机：**

```bash
ssh hkust-hpc2
```

**登录节点：**

```bash
whoami
hostname
printf '家目录：%s\n' "$HOME"
mkdir -p "$HOME/hpc-tutorial"
```

## 2. 上传本项目

打开另一个本机终端；`cd` 后面的路径换成本项目在本机的位置。

**本机：**

```bash
cd '/你的本机路径/[HKUST(GZ)]HPC-Slurm'
rsync -av --exclude='.git/' --exclude='logs/' --exclude='outputs/' \
  --exclude='node_modules/' --exclude='dist/' --exclude='.astro/' \
  ./ hkust-hpc2:hpc-tutorial/
```

这里远端的 `hpc-tutorial/` 是 SSH 用户家目录下的目录，不需要手填 `/hpc2hdd/home/用户名`。

## 3. 提交测试

**登录节点：**

```bash
cd "$HOME/hpc-tutorial"
mkdir -p logs
sbatch slurm/debug_cpu.sbatch
squeue -u "$USER"
```

预期看到 `Submitted batch job 数字`。记录这个作业号；`PD` 是排队，`R` 是运行。示例很短，可能查询时已经结束。

## 4. 查看结果

把下面 `123456` 换成刚才的作业号。

**登录节点：**

```bash
JOB_ID=123456
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,ExitCode
cat "logs/debug-${JOB_ID}.out"
cat "logs/debug-${JOB_ID}.err"
cat "outputs/hello-${JOB_ID}/result.json"
```

成功时状态为 `COMPLETED`、退出码为 `0:0`，输出中有计算节点名和申请的 CPU 数量。

## 5. 下载到本机

**本机，在本项目目录下：**

```bash
rsync -av hkust-hpc2:hpc-tutorial/outputs/ ./outputs/
rsync -av hkust-hpc2:hpc-tutorial/logs/ ./logs/
```

完成的作业已自动释放资源，无须再操作。未完成但不想继续时，在登录节点执行 `scancel 具体作业号`。

下一步：[申请交互式调试节点](docs/06-debug-and-interactive.md) → [配置 Python 环境](docs/04-software-environment.md) → [正式训练与并行](docs/07-training-and-batch.md)。
