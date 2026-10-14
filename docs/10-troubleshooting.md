# 10 · 常见问题

按你卡住的阶段查找。命令里的 `123456` 换成你的作业号。

## 登录

| 现象 | 常见原因 | 怎么办 |
|---|---|---|
| `Connection timed out`，一直连不上 | 不在校园网或没连 VPN；地址写错 | 连上 VPN；核对地址 `hpc2login.hpc.hkust-gz.edu.cn`；确认账号已开通 |
| `Permission denied (publickey)` | 用户名错误、私钥路径不对，或公钥没有添加到服务器 | 本机执行 `ssh -v hkust-hpc2`，看用的是哪把密钥；重新添加公钥。不要把私钥发给别人 |
| `REMOTE HOST IDENTIFICATION HAS CHANGED` | 平台重装或更换了登录节点，本机记录的旧指纹对不上 | 本机执行 `ssh-keygen -R hpc2login.hpc.hkust-gz.edu.cn` 删除旧记录，再重新登录并接受新指纹，见 [登录与 SSH](02-login-and-ssh.md) |
| `UNPROTECTED PRIVATE KEY FILE` 或 `Bad owner or permissions` | 本机 `~/.ssh` 的权限太宽 | macOS / Linux：执行 `chmod 700 ~/.ssh` 和 `chmod 600 ~/.ssh/config ~/.ssh/id_ed25519_hkustgz` |

## 提交与排队

| 现象 | 常见原因 | 怎么办 |
|---|---|---|
| `Invalid partition name specified` | 分区名写错，或者不在二期 | 用 `sinfo` 查看可用分区；确认登录的是二期地址 |
| 提交时被 QoS 或账户限制拒绝 | 申请量超过账号上限，或没有该分区权限 | 减少申请量；不清楚时联系管理员 |
| 作业马上结束，找不到日志 | `logs/` 目录不存在 | 先 `mkdir -p logs` 再提交 |
| 一直是 `PD` | 在排队，原因见 `squeue` 最后一列 | 对照 [排队原因](04-slurm-basics.md) 处理 |

## 运行

| 现象 | 常见原因 | 怎么办 |
|---|---|---|
| `ModuleNotFoundError` | 作业里用的 Python 不是装了这个包的那个 | 在脚本中写 Python 的完整路径，见 [Python 环境](06-software-environment.md) |
| `Python not executable: ...` | 本仓库脚本找不到你的环境 | 先建好环境，或设置 `PYTHON_BIN` |
| 状态 `OUT_OF_MEMORY` | 内存超过了 `--mem` | 增大 `--mem`，或减小 batch size、并行环境数。CPU 内存和 GPU 显存是两回事 |
| 状态 `TIMEOUT` | 超过了 `--time` | 加大时间上限；程序定期保存 checkpoint，支持断点续训 |
| 状态 `FAILED`，退出码不是 `0:0` | 程序报错 | 看 `.err` 文件里的完整报错；修好后先在 debug 中测试，不要直接批量重新提交 |
| `CUDA unavailable` 或 `torch.cuda.is_available()` 为 `False` | 没申请 GPU，或装的是 CPU 版 PyTorch | 确认使用了 GPU 分区和 `--gres=gpu:1`；安装 CUDA 版 PyTorch |
| 加了核也没变快 | 程序本身没有并行 | 先做小规模测速，见 [正式训练](07-training-and-batch.md) |

## 结果

| 现象 | 常见原因 | 怎么办 |
|---|---|---|
| `squeue` 里作业不见了 | 作业已经结束，并不是数据被删除 | 用 `sacct -j 作业号` 查看状态；到 `outputs/` 和 `logs/` 找结果 |
| `Output already exists` | 示例程序拒绝覆盖已有结果 | 换一个输出目录 |

## 一组诊断命令

**登录节点：** 以本仓库的 CPU 脚本为例，日志文件名换成你自己的

```bash
JOB_ID=123456
squeue -r -u "$USER"
scontrol show job "$JOB_ID"
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,AllocCPUS,MaxRSS,ExitCode
tail -n 60 "logs/cpu-${JOB_ID}.out"
tail -n 60 "logs/cpu-${JOB_ID}.err"
```

`sacct` 中的 `MaxRSS`（内存峰值）通常显示在带 `.0` 等后缀的步骤行上；它依赖采样，显示为空不等于没有占用内存。

## 向管理员求助

发邮件到 `hpc@hkust-gz.edu.cn`，附上：

- 登录地址、作业号、提交时间、分区
- 报错信息或排队原因
- 作业脚本和相关日志（去掉个人敏感信息）

**不要发送密码、私钥或 token。** 涉及费用或账号权限的问题，同时告知导师或课题组负责人。

[返回目录](../README.md)
