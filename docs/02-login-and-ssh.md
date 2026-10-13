# 02 · 登录与 SSH

## 普通登录

先连接校园网或学校 VPN。把 `YOUR_USERNAME` 换成自己的 HPC 账号。

**本机：**

```bash
ssh YOUR_USERNAME@hpc2login.hpc.hkust-gz.edu.cn
```

密码在提示时输入，不会显示；不要写在命令、教程或 Git 仓库中。

首次出现主机指纹时，向管理员/可信渠道核验后再接受。指纹变化也先核验，**不要用 `StrictHostKeyChecking=no` 绕过**。负载均衡或管理节点变化可能导致入口对应的主机变化，但仍需确认。

## 设置公钥登录

先检查是否已有密钥，避免覆盖。

**本机：**

```bash
ls -l "$HOME/.ssh/id_ed25519" "$HOME/.ssh/id_ed25519.pub"
```

生成时避免覆盖已有文件，建议设置口令：

**本机：**

```bash
if [ -e "$HOME/.ssh/id_ed25519" ] || [ -e "$HOME/.ssh/id_ed25519.pub" ]; then
  printf '已有密钥文件，请复用或选择新文件名，不要覆盖。\n'
else
  ssh-keygen -t ed25519 -f "$HOME/.ssh/id_ed25519" -C 'hpc-client'
fi
cat "$HOME/.ssh/id_ed25519.pub"
```

按平台支持的方式，把 **`.pub` 公钥**添加到 HPC 的 SSH 授权设置；若允许命令行配置，可使用 `ssh-copy-id`。没有该工具时，按管理员指引处理，不覆盖原 `authorized_keys`。

**本机，安装了 `ssh-copy-id` 时：**

```bash
ssh-copy-id -i "$HOME/.ssh/id_ed25519.pub" \
  YOUR_USERNAME@hpc2login.hpc.hkust-gz.edu.cn
```

私钥 `id_ed25519` 只留本机，不能上传或发给别人。客户端密钥与服务器主机指纹是两回事。

## 配置快捷名称

把 [模板](../templates/ssh_config.example) 中 `YOUR_USERNAME` 换成账号，合并到本机 `~/.ssh/config`；不是替换整个现有文件。

**本机：**

```bash
chmod 700 "$HOME/.ssh"
chmod 600 "$HOME/.ssh/config"
if [ -f "$HOME/.ssh/id_ed25519" ]; then chmod 600 "$HOME/.ssh/id_ed25519"; fi
ssh hkust-hpc2
```

`IdentityFile` 必须指向本机实际私钥。只用密码登录时，删除模板的 `IdentityFile` 和 `IdentitiesOnly` 两行即可。

HPC 从 GitHub 拉代码，是另一个 SSH 方向：需要在 **HPC 上生成独立密钥**，把公钥添加到 GitHub，而不是把本机私钥复制过去。见 [软件环境与 Git](04-software-environment.md)。

[返回目录](../README.md) · [官方连接说明](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/connection/)
