# 10 · 常见问题

按问题出现的阶段查找。命令中的 `123456` 替换为实际的作业号。

## 登录

| 现象 | 常见原因 | 处理方法 |
|---|---|---|
| `Connection timed out`，持续无法连接 | 不在校园网或未连接 VPN；地址错误 | 连接 VPN；核对地址 `hpc2login.hpc.hkust-gz.edu.cn`；确认账号已开通 |
| `Permission denied (publickey)` | 用户名错误、私钥路径不正确，或公钥未添加到服务器 | 本机执行 `ssh -v hkust-hpc2`，查看实际使用的密钥；重新添加公钥。私钥不得发送给他人 |
| `REMOTE HOST IDENTIFICATION HAS CHANGED` | 平台重装或更换了登录节点，与本机记录的旧指纹不一致 | 本机执行 `ssh-keygen -R hpc2login.hpc.hkust-gz.edu.cn` 删除旧记录，再重新登录并接受新指纹，见 [登录与 SSH](02-login-and-ssh.md) |
| `UNPROTECTED PRIVATE KEY FILE` 或 `Bad owner or permissions` | 本机 `~/.ssh` 权限过宽 | macOS / Linux：执行 `chmod 700 ~/.ssh` 和 `chmod 600 ~/.ssh/config ~/.ssh/id_ed25519_hkustgz` |

## 提交与排队

| 现象 | 常见原因 | 处理方法 |
|---|---|---|
| `Invalid partition name specified` | 分区名错误，或当前不在二期 | 用 `sinfo` 查看可用分区；确认登录的是二期地址 |
| 提交时被 QoS 或账户限制拒绝 | 申请量超过账号上限，或没有该分区权限 | 减少申请量；不明确时联系管理员 |
| 作业立即结束，找不到日志 | `logs/` 目录不存在 | 先 `mkdir -p logs` 再提交 |
| 持续处于 `PD` | 正在排队，原因见 `squeue` 最后一列 | 对照 [排队原因](04-slurm-basics.md#排队原因) 处理 |

## 运行

| 现象 | 常见原因 | 处理方法 |
|---|---|---|
| `ModuleNotFoundError` | 作业使用的 Python 不是安装了该包的解释器 | 在脚本中写 Python 的完整路径，见 [Python 环境](06-software-environment.md) |
| `Python not executable: ...` | 本仓库脚本找不到指定的环境 | 先建立环境，或设置 `PYTHON_BIN` |
| 状态 `OUT_OF_MEMORY` | 内存超过 `--mem` | 增大 `--mem`，或减小 batch size、并行环境数。CPU 内存与 GPU 显存相互独立 |
| 状态 `TIMEOUT` | 超过 `--time` | 增大时间上限；程序应定期保存 checkpoint，支持断点续训 |
| 状态 `FAILED`，退出码不是 `0:0` | 程序报错 | 查看 `.err` 文件中的完整报错；修复后先在 debug 中测试，再重新提交 |
| `CUDA unavailable` 或 `torch.cuda.is_available()` 为 `False` | 未申请 GPU，或安装的是 CPU 版 PyTorch | 确认使用了 GPU 分区和 `--gres=gpu:1`；安装 CUDA 版 PyTorch |
| 增加核数后速度未提升 | 程序本身未并行 | 先做小规模测速，见 [训练与批量实验](07-training-and-batch.md) |

## 结果

| 现象 | 常见原因 | 处理方法 |
|---|---|---|
| `squeue` 中作业消失 | 作业已结束，数据并未删除 | 用 `sacct -j 作业号` 查看状态；在 `outputs/` 和 `logs/` 中查找结果 |
| `Output already exists` | 示例程序拒绝覆盖已有结果 | 更换输出目录 |

## 诊断命令

**登录节点：** 以本仓库的 CPU 脚本为例，日志文件名按实际情况修改

```bash
JOB_ID=123456
squeue -r -u "$USER"
scontrol show job "$JOB_ID"
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,AllocCPUS,MaxRSS,ExitCode
tail -n 60 "logs/cpu-${JOB_ID}.out"
tail -n 60 "logs/cpu-${JOB_ID}.err"
```

`sacct` 中的 `MaxRSS`（内存峰值）通常显示在带 `.0` 等后缀的步骤行上；该值依赖采样，为空不代表没有占用内存。

## 联系管理员

发送邮件至 `hpc@hkust-gz.edu.cn`，附上以下信息：

- 登录地址、作业号、提交时间、分区
- 报错信息或排队原因
- 作业脚本和相关日志（去除个人敏感信息）

**不要发送密码、私钥或 token。** 涉及费用或账号权限的问题，同时告知导师或课题组负责人。

[返回目录](../README.md)
