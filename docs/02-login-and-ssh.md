# 02 · 登录与 SSH

本章说明 SSH 登录方法，以及通过密钥和快捷名实现 `ssh hkust-hpc2` 免密码登录。

**前提：** 已开通 HPC 账号，且处于校园网内或已连接学校 VPN。Windows 用户在 PowerShell 中执行以下命令。仅适用于部分系统的命令会在位置标签中注明，例如 **本机（Windows PowerShell）：**；未注明的命令各系统通用。

## 1. 密码登录

**本机：**

```bash
ssh 你的用户名@hpc2login.hpc.hkust-gz.edu.cn
```

输入密码时不显示字符属正常现象。密码不应写入脚本、笔记或 Git 仓库。

**主机指纹：** 首次连接时，SSH 会显示服务器的指纹（fingerprint）并询问是否信任，用于确认连接的是学校的服务器而非仿冒者。向管理员或可信渠道核对后输入 `yes`，指纹即记录在本机的 `~/.ssh/known_hosts` 中，此后每次连接自动核对。指纹变化的处理见 [第 4 节](#4-主机指纹变化)。

## 2. 密钥登录（推荐）

原理：在本机生成一对密钥，**私钥**留在本机，**公钥**放到服务器上；登录时两者自动匹配，无需输入密码。这里为 HKUST(GZ) HPC 单独生成一把密钥，文件名带 `hkustgz`，与其他用途的密钥互不影响。

> **注意：** 私钥（不带 `.pub` 后缀的文件）等同于密码，只能保存在自己的电脑上，不得上传、发送给他人或提交到 Git。

**第一步：检查是否已生成。**

**本机：**

```bash
ls ~/.ssh/id_ed25519_hkustgz.pub
```

列出该文件，说明此前已生成，跳到第三步；提示找不到文件，继续第二步。

**第二步：生成密钥。**

**本机：**

```bash
ssh-keygen -t ed25519 -f "$HOME/.ssh/id_ed25519_hkustgz" -C "hkustgz-hpc"
```

出现提示时一路按回车。完成后得到两个文件：私钥 `~/.ssh/id_ed25519_hkustgz` 和公钥 `~/.ssh/id_ed25519_hkustgz.pub`。

**第三步：将公钥添加到服务器。** 按本机系统选择一条执行，执行时需再输入一次 HPC 密码。

**本机（macOS / Linux）：**

```bash
ssh-copy-id -i ~/.ssh/id_ed25519_hkustgz.pub 你的用户名@hpc2login.hpc.hkust-gz.edu.cn
```

**本机（Windows PowerShell）：** 系统没有 `ssh-copy-id`，以下命令效果相同

```powershell
type "$HOME\.ssh\id_ed25519_hkustgz.pub" | ssh 你的用户名@hpc2login.hpc.hkust-gz.edu.cn "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

公钥追加到服务器的 `~/.ssh/authorized_keys`，不会覆盖已有内容。该密钥不是 SSH 的默认文件名，需完成第 3 节的配置后 SSH 才会自动使用。

> **提示：** 在 HPC 上访问 GitHub 私有仓库属于另一方向的 SSH 连接，需要在 HPC 上另行生成密钥，不应复制本机私钥。方法见 [文件与传输](03-storage-and-data.md)。

## 3. 快捷名

在本机 SSH 配置文件中添加以下配置后，可用 `ssh hkust-hpc2` 代替完整地址登录，`scp`、`rsync` 同样可以使用该短名。

打开本机文件 `~/.ssh/config`（不存在则新建；Windows 上为 `C:\Users\你的Windows用户名\.ssh\config`），在末尾**追加**以下内容，保留原有内容。

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
| `Host` | 自定义的短名 |
| `HostName` | 服务器的实际地址 |
| `User` | HPC 用户名 |
| `IdentityFile`、`IdentitiesOnly` | 仅使用该私钥登录；只用密码登录时删除这两行 |
| `ServerAlive...` | 每 60 秒发送一次心跳，减少空闲断线 |

同样的内容见 [SSH 配置模板](../templates/ssh_config.example)。

**本机（macOS / Linux）：** 收紧权限，否则 SSH 可能拒绝使用该配置

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/config
```

**本机：** 测试

```bash
ssh hkust-hpc2
```

不再询问 HPC 密码并直接进入登录节点，说明密钥和快捷名配置完成。

## 4. 主机指纹变化

登录时出现 `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!`，SSH 会拒绝连接。

**原因：** 服务器当前出示的指纹与本机 `known_hosts` 中记录的旧指纹不一致。常见情况是平台重装、升级或更换了登录节点，同一登录地址对应的服务器密钥随之重新生成。

**处理：** 删除该地址的旧记录，重新连接并接受新指纹。

**本机：**

```bash
ssh-keygen -R hpc2login.hpc.hkust-gz.edu.cn
ssh hkust-hpc2
```

第一条命令从 `known_hosts` 中删除旧指纹，原文件备份为 `known_hosts.old`，报错信息中通常也会给出这条命令。第二条重新连接，与首次登录一样输入 `yes`。

> **提示：** `ssh-keygen -R` 只替换这一台服务器的记录，其他服务器的指纹检查照常生效，比 `StrictHostKeyChecking=no` 关闭检查更稳妥。平台无维护或升级而指纹反复变化时，联系管理员。

[返回目录](../README.md) · [官方连接说明](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/connection/)
