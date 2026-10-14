# 02 · 登录与 SSH

读完这一章，你可以用一条短命令 `ssh hkust-hpc2` 免密码登录 HPC。

**前提：** 已有 HPC 账号；在校园网内或已连接学校 VPN。Windows 用户在 PowerShell 中执行下面的命令。只适用于部分系统的命令，会在位置标签里注明，例如 **本机（Windows PowerShell）：**；没有注明的，各系统通用。

## 1. 用密码登录

**本机：**

```bash
ssh 你的用户名@hpc2login.hpc.hkust-gz.edu.cn
```

输入密码时不显示字符是正常的。不要把密码写进脚本、笔记或 Git 仓库。

**关于主机指纹：** 第一次连接时，SSH 会显示服务器的指纹（fingerprint）并询问是否信任。它用来确认你连上的确实是学校的服务器，而不是冒充者。可以向管理员或可信渠道核对后输入 `yes`，指纹会记录在本机的 `~/.ssh/known_hosts` 中，以后每次连接都会自动核对。如果以后提示指纹变了，见本章 [第 4 节](#4-提示指纹变了怎么办)。

## 2. 设置密钥登录（推荐）

原理：在本机生成一对密钥。**私钥**留在本机，**公钥**放到服务器上。登录时两者自动匹配，不用再输入密码。本教程为 HKUST(GZ) HPC 单独生成一把密钥，文件名带 `hkustgz`，和你其他用途的密钥互不影响。

> **注意：** 私钥（没有 `.pub` 后缀的那个文件）就相当于你的密码，只能留在自己的电脑上，不要上传、发送给别人或提交到 Git。

**第一步：检查是否已经生成过。**

**本机：**

```bash
ls ~/.ssh/id_ed25519_hkustgz.pub
```

列出了这个文件，说明之前已经生成过，跳到第三步。提示找不到文件，继续第二步。

**第二步：生成密钥。**

**本机：**

```bash
ssh-keygen -t ed25519 -f "$HOME/.ssh/id_ed25519_hkustgz" -C "hkustgz-hpc"
```

出现提示时一路按回车即可。完成后会得到两个文件：私钥 `~/.ssh/id_ed25519_hkustgz` 和公钥 `~/.ssh/id_ed25519_hkustgz.pub`。

**第三步：把公钥放到服务器。** 按你的系统选一条执行，都需要再输入一次 HPC 密码。

**本机（macOS / Linux）：**

```bash
ssh-copy-id -i ~/.ssh/id_ed25519_hkustgz.pub 你的用户名@hpc2login.hpc.hkust-gz.edu.cn
```

**本机（Windows PowerShell）：** 没有 `ssh-copy-id`，用这条命令代替，效果相同

```powershell
type "$HOME\.ssh\id_ed25519_hkustgz.pub" | ssh 你的用户名@hpc2login.hpc.hkust-gz.edu.cn "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

公钥会追加到服务器的 `~/.ssh/authorized_keys`，不会覆盖已有内容。这把密钥不是 SSH 默认的文件名，还需要完成下一节的配置，SSH 才会自动使用它。

> **提示：** 在 HPC 上访问 GitHub 私有仓库是另一个方向的 SSH，需要在 HPC 上另外生成一把密钥，不要把本机私钥复制过去。做法见 [文件与传输](03-storage-and-data.md)。

## 3. 设置快捷名

每次输入完整地址很麻烦。在本机的 SSH 配置文件中加一段，就能用 `ssh hkust-hpc2` 登录，`scp`、`rsync` 也能使用这个短名。

打开本机文件 `~/.ssh/config`（没有就新建；Windows 上是 `C:\Users\你的Windows用户名\.ssh\config`），在末尾**追加**以下内容，不要删除原有内容。

**文件：** 本机的 `~/.ssh/config`

```sshconfig
Host hkust-hpc2
    HostName hpc2login.hpc.hkust-gz.edu.cn
    User 你的用户名
    IdentityFile ~/.ssh/id_ed25519_hkustgz
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

**本机（macOS / Linux）：** 收紧权限，否则 SSH 可能拒绝使用这个配置

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/config
```

**本机：** 测试

```bash
ssh hkust-hpc2
```

不再询问 HPC 密码、直接进入登录节点，就说明密钥和快捷名都配置好了。

## 4. 提示指纹变了怎么办

如果登录时看到 `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!`，SSH 会拒绝连接。

**原因：** 服务器现在出示的指纹，和本机 `known_hosts` 里记下的旧指纹对不上。常见情况是平台重装、升级或更换了登录节点，同一个登录地址背后的服务器密钥随之重新生成。

**处理：** 删除这个地址的旧记录，再重新连接并接受新指纹。

**本机：**

```bash
ssh-keygen -R hpc2login.hpc.hkust-gz.edu.cn
ssh hkust-hpc2
```

第一条命令从 `known_hosts` 中删除旧指纹，原文件会备份为 `known_hosts.old`；报错信息里通常也会给出这条命令。第二条重新连接，像第一次登录一样输入 `yes` 即可。

> **提示：** 用 `ssh-keygen -R` 只替换这一台服务器的记录，其他服务器的指纹检查照常生效，比用 `StrictHostKeyChecking=no` 关掉检查更稳妥。如果平台没有维护或升级，指纹却反复变化，再联系管理员。

[返回目录](../README.md) · [官方连接说明](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/connection/)
