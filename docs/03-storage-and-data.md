# 03 · 家目录、作业数据区与传输

## 文件到底放哪里？

| 名称 | 含义 | 建议 |
|---|---|---|
| 用户家目录 | 二期通常为 `/hpc2hdd/home/<用户名>`；`$HOME` 就是你的目录 | 放代码、数据、长期结果 |
| `$HOME/jhspoolers` | 官方说明为 SSD 存储链接 | 对 I/O 敏感的数据可考虑使用；先核实路径与容量 |
| 网页“作业数据区” | 门户提交任务的 spooler 工作目录 | 不是 SSH 作业唯一的保存位置 |
| 节点本地临时盘 | 计算节点自己的临时存储，如站点提供 | 不能当永久存储；结束前复制回共享目录 |
| 网页“共享数据区” | 按共享组和权限开放的目录 | 用于团队共享，避免公开敏感数据 |

**登录节点：查看实际路径与占用。**

```bash
printf '家目录：%s\n' "$HOME"
pwd
ls -ld "$HOME/jhspoolers"
readlink -f "$HOME/jhspoolers"
du -sh "$HOME/hpc-tutorial"
```

`du` 尽量查具体项目，不频繁扫描整个大型家目录。HDD / SSD 的免费额度和超额费用见 [计费](08-pricing-and-budget.md)；免费额度不等于硬性容量上限。

## SSH 作业的保存位置

`sbatch` 默认工作目录是你提交时所在的目录；程序使用相对路径时，结果通常保存到这里。本项目脚本也显式进入 `SLURM_SUBMIT_DIR`。

例如在 `$HOME/hpc-tutorial` 提交，脚本指定 `outputs/cpu-作业号`，结果就在 `$HOME/hpc-tutorial/outputs/`，不会因为叫“作业”就自动移入网页作业数据区。

## 上传与下载

已按 [SSH 章节](02-login-and-ssh.md) 配置 `hkust-hpc2`。路径换成自己的；先用 `--dry-run` 检查，再去掉它执行。以下命令不删除目标端文件。

**本机：上传代码。**

```bash
rsync -av --dry-run --exclude='.git/' --exclude='.venv/' \
  --exclude='outputs/' --exclude='logs/' \
  /本机项目目录/ hkust-hpc2:my-project/
```

**本机：下载结果，不包含大模型。**

```bash
rsync -av --exclude='*.pt' --exclude='*.pth' --exclude='checkpoints/' \
  hkust-hpc2:my-project/outputs/ ./hpc-results/
```

源路径结尾的 `/` 表示复制目录里的内容。不要随意加 `--delete`，它会删除目标端多余文件。

作业结束不会等同于实验文件被删除。但官方不承诺你的数据永久保留；用户需自行备份。**调度记录、日志、训练输出是三种不同的数据。**

[返回目录](../README.md) · [家目录](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/data/user-data/) · [作业数据区](https://docs.hpc.hkust-gz.edu.cn/docs/hpc12/data/job-area/)
