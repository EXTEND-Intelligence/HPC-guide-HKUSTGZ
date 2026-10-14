# 09 · 结果管理与可复现

读完这一章，你会知道作业结束后哪些东西会自动留下、哪些必须由程序自己保存，以及怎样让几个月后的自己还能复现结果。

## Slurm 记了什么，没记什么

| 由谁保存 | 内容 |
|---|---|
| Slurm | 作业号、状态、运行时长、资源用量（用 `sacct` 查看），以及程序的屏幕输出（`logs/*.out`、`logs/*.err`） |
| **你的程序** | 训练指标（loss、准确率、reward 等）、模型 checkpoint、配置、评估结果 |

Slurm 不认识你的训练指标。程序不写文件，作业结束后就什么都没有留下。

## 每次运行保存什么

| 内容 | 用途 |
|---|---|
| 完整配置、命令行参数、随机种子 | 知道这次到底跑的是什么设置 |
| Git commit、依赖版本 | 知道用的是哪一版代码和库 |
| 原始指标，按步数记录到 CSV | 随时重画任何曲线 |
| checkpoint，至少保留最终模型 | 可以重新评估 |
| 评估结果明细 | 不只保留平均值 |
| 作业号、日志 | 排查问题、核对资源用量 |

本仓库的 [`train_demo.py`](../examples/train_demo.py) 就是一个例子：它保存 `metadata.json`（参数、Git、依赖、Slurm 信息）、`metrics.csv`（原始指标）、`summary.json` 和 `checkpoint.pt`。

**登录节点：** 记录依赖版本和代码版本，路径换成你自己的

```bash
cd ~/my-project
mkdir -p logs
"$HOME/venvs/my-env/bin/python" -m pip freeze > logs/requirements-resolved.txt
git rev-parse HEAD
```

## 每次运行用一个新目录

输出目录名带上作业号（如 `outputs/run-${SLURM_JOB_ID}`），每次运行都写入新目录，不覆盖旧结果。本仓库的示例程序发现目录已存在时会拒绝运行，就是为了防止覆盖。

checkpoint 按固定间隔保存，不要每一步都存大文件。目录怎么组织，可以参考 [实验目录模板](../templates/experiment-layout.md)。

## 保存作业记录

`squeue` 只显示还没结束的作业。`sacct` 可以查历史，但集群不一定长期保留。重要作业的记录可以存成文件。

**登录节点：**

```bash
JOB_ID=123456
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,AllocCPUS,MaxRSS,ExitCode \
  > "logs/accounting-${JOB_ID}.txt"
```

## 备份

- 定期用 [rsync 或 scp](03-storage-and-data.md) 把结果下载到本机或其他存储。
- 代码和小型配置放进 Git；大 checkpoint 和数据另外备份。
- 论文用到的图，除了图片本身，还要保留画图用的数据、脚本和参数。

## 实验的好习惯

- 训练种子和评估种子分开记录。
- 比较不同方法时，统一环境、训练预算和评估方式；用多个种子，报告均值和波动，不只挑最好的一次。
- 一批实验运行期间不修改它用到的代码和配置。

[返回目录](../README.md)
