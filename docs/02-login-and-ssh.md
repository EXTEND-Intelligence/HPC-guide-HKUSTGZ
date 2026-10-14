# 02 · 登录与 SSH

读完这一章，你可以用一条短命令 `ssh hkust-hpc2` 免密码登录 HPC。

**前提：** 已有 HPC 账号；在校园网内或已连接学校 VPN。Windows 用户在 PowerShell 中执行下面的命令，有差异的地方会单独说明。

## 1. 用密码登录

**本机：**

```bash
ssh 你的用户名@hpc2login.hpc.hkust-gz.edu.cn
```

输入密码时不显示字符是正常的。不要把密码写进脚本、笔记或 Git 仓库。

**关于主机指纹：** 第一次连接时，SSH 会显示服务器的指纹（fingerprint）并询问是否信任。它用来确认你连上的确实是学校的服务器，而不是冒充者。可以向管理员或可信渠道核对后输入 `yes`。

> **注意：** 如果以后提示指纹**变了**（`REMOTE HOST IDENTIFICATION HAS CHANGED`），先停下来向管理员核实，不要用 `StrictHostKeyChecking=no` 之类的选项绕过检查。

## 2. 设置密钥登录（推荐）

原理：在本机生成一对密钥。**私钥**留在本机，**公钥**放到服务器上。登录时两者自动匹配，不用再输入密码。

> **注意：** 私钥（没有 `.pub` 后缀的那个文件）就相当于你的密码，只能留在自己的电脑上，不要上传、发送给别人或提交到 Git。

**本机：** 先检查是否已有密钥

```bash
ls ~/.ssh/id_ed25519.pub
```

如果列出了文件，说明已有密钥，直接跳到"把公钥放到服务器"。如果提示文件不存在，生成一对新的：

**本机：**

```bash
ssh-keygen -t ed25519 -C "hpc"
```

按回车使用默认路径。随后会提示设置口令（passphrase），建议设置，它保护的是私钥本身。如果出现 `Overwrite (y/n)?`，说明已有同名密钥，输入 `n`，复用原来的密钥即可。

**把公钥放到服务器。** macOS / Linux：

**本机：**

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub 你的用户名@hpc2login.hpc.hkust-gz.edu.cn
```

Windows PowerShell 没有 `ssh-copy-id`，用这条命令代替（追加公钥，不会覆盖服务器上已有的公钥）：

**本机：** Windows PowerShell

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh 你的用户名@hpc2login.hpc.hkust-gz.edu.cn "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

这两种方式都需要再输入一次密码。之后重新执行 `ssh 你的用户名@hpc2login.hpc.hkust-gz.edu.cn`，不再询问账号密码就成功了（设置过口令的话，会询问密钥口令）。

## 3. 设置快捷名

每次输入完整地址很麻烦。在本机的 SSH 配置文件中加一段，就能用 `ssh hkust-hpc2` 登录，`scp`、`rsync` 也能使用这个短名。

打开本机文件 `~/.ssh/config`（没有就新建；Windows 上是 `C:\Users\你的Windows用户名\.ssh\config`），在末尾**追加**以下内容，不要删除原有内容：

**文件：** 本机的 `~/.ssh/config`

```sshconfig
Host hkust-hpc2
    HostName hpc2login.hpc.hkust-gz.edu.cn
    User 你的用户名
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

| 配置项 | 作用 |
|---|---|
| `Host` | 你起的短名 |
| `HostName` | 服务器的真实地址 |
| `User` | 你的 HPC 用户名 |
| `IdentityFile`、`IdentitiesOnly` | 只使用这把私钥登录；只用密码登录的话，删掉这两行 |
| `ServerAlive...` | 每 60 秒发一次心跳，减少空闲时断线 |

同样的内容也在 [SSH 配置模板](../templates/ssh_config.example) 中。

macOS / Linux 还需要收紧权限，否则 SSH 可能拒绝使用这个配置：

**本机：**

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/config
```

**本机：** 测试

```bash
ssh hkust-hpc2
```

直接进入登录节点就说明配置成功。

> **提示：** 在 HPC 上访问 GitHub 私有仓库是另一个方向的 SSH，需要在 HPC 上另外生成一把密钥，不要把本机私钥复制过去。做法见 [文件与传输](03-storage-and-data.md)。

[返回目录](../README.md) · [官方连接说明](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/connection/)
