# 04 · Python 环境与 Git

环境放在家目录，多个作业共用；不要每个作业重新安装依赖，也不要边运行边改同一个环境。

## 建立 CPU 示例环境

先查看现有 Python。示例建议 Python 3.10+；若系统版本不满足，使用平台提供的模块/Conda，不要修改系统 Python。

**登录节点：**

```bash
python3 --version
command -v python3
module avail
```

`module` 未启用时该命令可能不存在，以站点提供的软件环境为准。安装/编译与测试可放到已申请的计算节点；下面是 **收费 CPU 分区**，不是免费 debug。

**登录节点：申请最多 1 小时的环境配置资源。**

```bash
srun -p i64m512u --nodes=1 --ntasks=1 --cpus-per-task=2 \
  --mem=4G --time=01:00:00 --pty bash
```

**已分配的计算节点：**

```bash
cd "$HOME/hpc-tutorial"
python3 -m venv "$HOME/venvs/hpc-tutorial"
source "$HOME/venvs/hpc-tutorial/bin/activate"
python -m pip install --upgrade pip
python -m pip install -r examples/requirements.txt \
  --index-url https://download.pytorch.org/whl/cpu
python -c 'import torch; print(torch.__version__)'
exit
```

默认 CPU 脚本直接调用 `$HOME/venvs/hpc-tutorial/bin/python`，无需在登录节点一直保持环境激活。如果计算节点不能访问下载源，按管理员提供的镜像/离线方式安装。

已有自己的环境时，在提交前指定解释器即可：

**登录节点，按实际路径修改：**

```bash
export PYTHON_BIN="$HOME/你的环境/bin/python"
sbatch slurm/train_cpu.sbatch
```

## HPC 上使用 GitHub

二期官方允许访问互联网，但外部服务连通性仍可能波动。拉代码前先看分支和本地改动，不强行覆盖。

**登录节点，进入你自己的代码仓库：**

```bash
git status --short
git branch --show-current
git pull --ff-only
git rev-parse HEAD
```

私有仓库可在 HPC 上单独生成 SSH 密钥。先确认下面的文件名未被使用；已存在就复用或换名，**不要覆盖**。

**登录节点：**

```bash
if [ -e "$HOME/.ssh/id_ed25519_github" ] || [ -e "$HOME/.ssh/id_ed25519_github.pub" ]; then
  printf '已有 GitHub 密钥文件，请复用或换名，不要覆盖。\n'
else
  ssh-keygen -t ed25519 -f "$HOME/.ssh/id_ed25519_github" -C 'hpc-github'
fi
cat "$HOME/.ssh/id_ed25519_github.pub"
```

把公钥添加到 GitHub → Settings → SSH and GPG keys；将下列内容合并到 **HPC 的** `~/.ssh/config`。首次连接也需按 GitHub 官方公布的指纹核验。

**HPC 的 SSH 配置片段：**

```sshconfig
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
    IdentitiesOnly yes
```

**登录节点：**

```bash
ssh -T git@github.com
```

显示成功认证但不提供 shell 即为正常；GitHub 该测试通常返回退出码 1。

[返回目录](../README.md)
