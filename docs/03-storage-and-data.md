# 03 · 文件与传输

读完这一章，你会知道代码、数据和结果放在 HPC 的哪个目录，以及怎样在本机和 HPC 之间传文件。

## 你的目录

| 位置 | 是什么 | 放什么 |
|---|---|---|
| `$HOME`（家目录） | 你的个人目录，二期通常是 `/hpc2hdd/home/你的用户名`，位于 HDD | 代码、Python 环境、数据、结果 |
| `$HOME/jhspoolers` | 家目录里一个指向 SSD 存储的链接 | 读写特别频繁的数据（可选） |

**登录节点：**

```bash
echo "$HOME"                       # 家目录路径
readlink -f "$HOME/jhspoolers"     # SSD 链接的真实路径
du -sh "$HOME/hpc-first"           # 某个目录占用多少空间
```

每人有免费额度：HDD 1 TB、SSD 200 GB，超出部分按天收费（见 [费用与预算](08-pricing-and-budget.md)）。`du` 尽量只查具体目录，不要频繁扫描整个家目录。

> **注意：** 平台不承诺永久保存你的数据。论文数据、最终模型等重要结果要定期下载备份。

建议的目录布局：

```text
$HOME/
├── my-project/        代码（最好是 Git 仓库）
│   ├── logs/          Slurm 日志
│   └── outputs/       实验结果
├── data/              多个项目共用的大数据集
└── venvs/             Python 环境
```

**作业的结果保存在哪里？** 作业默认在你**执行 `sbatch` 时所在的目录**运行。程序写相对路径（如 `outputs/run1`），结果就出现在那个目录下面。所以请先 `cd` 到项目根目录再提交。

门户网页上的"作业数据区""共享数据区"是网页提交作业和团队共享时使用的目录，用 SSH + Slurm 时不用管它们，详见 [官方说明](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/data/job-area/)。

## 把代码传到 HPC

两种方式，按情况选：

| | 方式 A：从本机上传 | 方式 B：在 HPC 上用 Git |
|---|---|---|
| 适合 | 代码不在 GitHub 上；需要上传数据 | 代码在 GitHub / GitLab 上 |
| 工具 | `rsync`、`scp` | `git clone`、`git pull` |

下面的命令使用 [第 02 章](02-login-and-ssh.md) 设置的快捷名 `hkust-hpc2`。没有设置的话，把它换成 `你的用户名@hpc2login.hpc.hkust-gz.edu.cn`。

### 方式 A：rsync / scp

`rsync` 只传有变化的文件，适合反复同步。Windows PowerShell 没有 `rsync`，可以改用下面的 `scp`，或在 WSL 中使用 rsync。先加 `--dry-run` 预览要传哪些文件，确认无误后去掉它再执行。

**本机（macOS / Linux / WSL）：** 上传项目，跳过 Git 历史、虚拟环境和结果

```bash
rsync -av --dry-run \
  --exclude='.git/' --exclude='.venv/' --exclude='outputs/' --exclude='logs/' \
  ./my-project/ hkust-hpc2:my-project/
```

**本机（macOS / Linux / WSL）：** 下载结果，跳过模型大文件

```bash
rsync -av --exclude='*.pt' --exclude='*.pth' --exclude='checkpoints/' \
  hkust-hpc2:my-project/outputs/ ./hpc-results/
```

两个容易出错的地方：

- 源路径末尾的 `/` 表示"传目录里面的内容"。不加 `/` 会在目标处多套一层目录。
- 不要随手加 `--delete`，它会删除目标端多出来的文件。

`scp` 各系统通用，适合一次性传输；也可以使用 WinSCP 等图形工具。

**本机：** 上传整个目录；下载单个文件

```bash
scp -r ./my-project hkust-hpc2:
scp hkust-hpc2:my-project/outputs/result.csv .
```

第一条把整个 `my-project` 目录复制到 HPC 家目录（冒号后面留空表示家目录）。`scp` 会复制所有文件，上传前先移走虚拟环境和大文件。

### 方式 B：Git

二期可以访问互联网，公开仓库可以直接 clone。外网偶尔会波动，失败时稍后重试。

**登录节点：**

```bash
cd ~
git clone https://github.com/你的账号/你的仓库.git my-project
```

更新代码前，先确认没有未提交的本地改动。

**登录节点：**

```bash
cd ~/my-project
git status --short     # 有输出，说明有本地改动，先处理
git pull --ff-only     # 只做快进更新，不会自动合并
```

> **注意：** 作业正在运行或排队时，不要 `git pull` 它用到的代码，否则后启动的作业会读到新版本。

**私有仓库：** 在 HPC 上**另外生成一把密钥**并添加到 GitHub，不要把本机私钥复制到 HPC。

**第一步：检查是否已经生成过。**

**登录节点：**

```bash
ls ~/.ssh/id_ed25519_github.pub
```

列出了这个文件，说明之前已经生成过，跳到第三步。提示找不到文件，继续第二步。

**第二步：生成密钥。**

**登录节点：**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_github -C "hkustgz-hpc-github"
```

出现提示时一路按回车即可。

**第三步：把公钥添加到 GitHub。**

**登录节点：**

```bash
cat ~/.ssh/id_ed25519_github.pub
```

复制输出的整行内容，添加到 GitHub → Settings → SSH and GPG keys。

**第四步：配置并测试。** 在 **HPC 上的** `~/.ssh/config` 末尾追加以下内容。

**文件：** HPC 上的 `~/.ssh/config`

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

看到 `Hi 你的GitHub用户名! You've successfully authenticated` 即为成功（这条命令的退出码是 1，属于正常）。第一次连接时，按 [GitHub 公布的指纹](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints) 核对后再输入 `yes`。

## 练习：把本教程放到 HPC 上

后面几章会用到本仓库的作业脚本和示例程序。

**登录节点：**

```bash
cd ~
git clone https://github.com/Ronchy2000/HPC-guide-HKUSTGZ.git hpc-tutorial
ls ~/hpc-tutorial
```

能看到 `slurm/`、`examples/` 等目录就完成了。clone 失败的话，在本机下载本仓库，再用方式 A 上传到 `~/hpc-tutorial`。

[返回目录](../README.md) · [官方：家目录](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/data/user-data/)
