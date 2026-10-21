# 03 · 文件与传输

本章说明代码、数据和结果在 HPC 上的存放位置，以及本机与 HPC 之间的文件传输方法。

## 存储位置

| 位置 | 说明 | 用途 |
|---|---|---|
| `$HOME`（家目录） | 个人目录，二期通常为 `/hpc2hdd/home/你的用户名`，位于 HDD | 代码、Python 环境、数据、结果 |
| `$HOME/jhspoolers` | 家目录中指向 SSD 存储的链接 | 读写频繁的数据（可选） |

**登录节点：**

```bash
echo "$HOME"                       # 家目录路径
readlink -f "$HOME/jhspoolers"     # SSD 链接的实际路径
du -sh "$HOME/hpc-first"           # 某个目录占用的空间
```

每个用户有免费额度：HDD 1 TB、SSD 200 GB，超出部分按天计费（见 [费用与预算](08-pricing-and-budget.md)）。`du` 尽量只查询具体目录，避免频繁扫描整个家目录。

> **注意：** 平台不承诺永久保存数据。论文数据、最终模型等重要结果应定期下载备份。

推荐的目录布局：

```text
$HOME/
├── my-project/        代码（建议使用 Git 仓库）
│   ├── logs/          Slurm 日志
│   └── outputs/       实验结果
├── data/              多个项目共用的大数据集
└── venvs/             Python 环境
```

**作业结果的保存位置：** 作业默认在**执行 `sbatch` 时所在的目录**运行。程序使用相对路径（如 `outputs/run1`）时，结果写入该目录下。因此应先 `cd` 到项目根目录再提交。

门户网页上的"作业数据区""共享数据区"用于网页提交作业和团队共享，使用 SSH + Slurm 时无需关注，详见 [官方说明](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/data/job-area/)。

## 传输代码与数据

| | 方式 A：从本机上传 | 方式 B：在 HPC 上使用 Git |
|---|---|---|
| 适用场景 | 代码不在 GitHub 上；需要上传数据 | 代码托管在 GitHub / GitLab |
| 工具 | `rsync`、`scp` | `git clone`、`git pull` |

以下命令使用 [第 02 章](02-login-and-ssh.md) 设置的快捷名 `hkust-hpc2`；未设置时，替换为 `你的用户名@hpc2login.hpc.hkust-gz.edu.cn`。

### 方式 A：rsync / scp

`rsync` 只传输有变化的文件，适合反复同步。Windows PowerShell 没有 `rsync`，可改用下文的 `scp`，或在 WSL 中使用 rsync。建议先加 `--dry-run` 预览传输内容，确认后去掉该参数再执行。

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

常见错误：

- 源路径末尾的 `/` 表示传输目录中的内容；省略 `/` 会在目标位置多出一层目录。
- `--delete` 会删除目标端多出的文件，非必要不加。

`scp` 各系统通用，适合一次性传输；也可使用 WinSCP 等图形工具。

**本机：** 上传整个目录；下载单个文件

```bash
scp -r ./my-project hkust-hpc2:
scp hkust-hpc2:my-project/outputs/result.csv .
```

第一条将整个 `my-project` 目录复制到 HPC 家目录（冒号后留空表示家目录）。`scp` 会复制全部文件，上传前应移走虚拟环境和大文件。

### 方式 B：Git

二期可以访问互联网，公开仓库可直接 clone；外网偶有波动，失败时稍后重试。

**登录节点：**

```bash
cd ~
git clone https://github.com/你的账号/你的仓库.git my-project
```

更新代码前，先确认没有未提交的本地改动。

**登录节点：**

```bash
cd ~/my-project
git status --short     # 有输出表示存在本地改动，需先处理
git pull --ff-only     # 仅快进更新，不自动合并
```

> **注意：** 作业运行或排队期间，不要 `git pull` 其使用的代码，否则后启动的作业会读到新版本。

**私有仓库：** 在 HPC 上**另行生成一把密钥**并添加到 GitHub，不应把本机私钥复制到 HPC。

**第一步：检查是否已生成。**

**登录节点：**

```bash
ls ~/.ssh/id_ed25519_github.pub
```

列出该文件，说明此前已生成，跳到第三步；提示找不到文件，继续第二步。

**第二步：生成密钥。**

**登录节点：**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_github -C "hkustgz-hpc-github"
```

出现提示时一路按回车。

**第三步：将公钥添加到 GitHub。**

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

输出 `Hi 你的GitHub用户名! You've successfully authenticated` 即为成功（该命令退出码为 1，属正常）。首次连接时，按 [GitHub 公布的指纹](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints) 核对后再输入 `yes`。

## 获取本手册的示例文件

第 04–07 章的示例使用本仓库的作业脚本和示例程序，需先将仓库克隆到 HPC。

**登录节点：**

```bash
cd ~
git clone https://github.com/Ronchy2000/HPC-guide-HKUSTGZ.git hpc-tutorial
ls ~/hpc-tutorial
```

列出 `slurm/`、`examples/` 等目录即完成。clone 失败时，可在本机下载本仓库，再用方式 A 上传到 `~/hpc-tutorial`。

[返回目录](../README.md) · [官方：家目录](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/data/user-data/)
