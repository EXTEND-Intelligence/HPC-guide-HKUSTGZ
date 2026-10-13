# 10 · 常见问题速查

下面除 SSH 客户端诊断外，命令均在 **登录节点**执行。`JOB_ID=123456` 要替换成自己的作业号。

| 现象 | 先检查 | 怎么处理 |
|---|---|---|
| SSH 超时 | 校园网/VPN、二期登录地址 | 恢复网络，确认账号已开通 |
| `Permission denied (publickey)` | 用户名、私钥路径、对应公钥是否授权 | 本机用 `ssh -v hkust-hpc2` 查看选用了哪个 key；不要贴私钥 |
| 主机指纹变化 | 是否更换入口/管理节点 | 先向可信渠道核验，不直接关闭检查 |
| 提交后一直 `PD` | `squeue` 的原因、`scontrol show job` | `Resources`/`Priority` 通常等待；QoS/账户限制需减资源或联系管理员 |
| `Invalid partition` / QoS 拒绝 | `sinfo`、分区和账户权限 | 确认是在二期；以实时配置为准 |
| 日志文件打不开 | `logs/` 是否提交前已存在 | 先 `mkdir -p logs`；Slurm 启动脚本前就要打开日志 |
| `ModuleNotFoundError` | 作业中的 Python 路径 | 明确指定环境里的 Python；登录节点激活环境不保证批作业正确使用 |
| `OUT_OF_MEMORY` | `sacct`、错误日志、批大小 | 减 batch/并行环境，或增加 `--mem`；CPU 内存和 GPU 显存不同 |
| `TIMEOUT` | 时间上限、checkpoint 是否存在 | 调整时限，按项目的恢复训练功能续跑 |
| `FAILED` / 非零 `ExitCode` | `.err`、`.out`、完整 traceback | 先修程序，别盲目批量重提 |
| `squeue` 里“记录不见了” | `sacct -j 作业号` | 可能已结束，并非数据被删；查 `outputs/` 和日志 |
| 8/128 核没有更快 | 程序线程/进程、环境交互瓶颈 | 申请资源不等于自动并行，先做小规模吞吐测试 |

**登录节点：一组常用诊断。**

```bash
JOB_ID=123456
squeue -r -u "$USER" -o '%.18i %.24j %.2t %.10M %.6C %R'
scontrol show job "$JOB_ID"
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,AllocCPUS,MaxRSS,ExitCode
tail -n 60 "logs/cpu-${JOB_ID}.out"
tail -n 60 "logs/cpu-${JOB_ID}.err"
```

`MaxRSS` 可能主要出现在作业 step 行，且依赖站点采样；空值不等于零占用。自己调用 `srun` 的脚本常有 `.0` 等 step 记录。

向管理员反馈时提供：登录入口、作业号、提交时间、分区、等待原因/错误、脚本和脱敏日志。不要发送密码、token、私钥。

支持邮箱：`hpc@hkust-gz.edu.cn`。涉及费用/账户权限，同时联系导师或课题组负责人。

[返回目录](../README.md)
