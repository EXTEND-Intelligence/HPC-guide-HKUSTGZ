# 09 · 结果管理与复现

本章说明作业结束后自动保留的内容与需要程序自行保存的内容，以及结果的组织、备份与复现。

## Slurm 的记录范围

| 保存方 | 内容 |
|---|---|
| Slurm | 作业号、状态、运行时长、资源用量（用 `sacct` 查看），以及程序的屏幕输出（`logs/*.out`、`logs/*.err`） |
| **训练程序** | 训练指标（loss、准确率、reward 等）、模型 checkpoint、配置、评估结果 |

Slurm 不记录训练指标；程序未写入文件的内容，作业结束后不会保留。

## 每次运行应保存的内容

| 内容 | 用途 |
|---|---|
| 完整配置、命令行参数、随机种子 | 确认实际使用的设置 |
| Git commit、依赖版本 | 确认代码和库的版本 |
| 原始指标，按步数记录到 CSV | 可随时重新绘制曲线 |
| checkpoint，至少保留最终模型 | 可重新评估 |
| 评估结果明细 | 不只保留平均值 |
| 作业号、日志 | 排查问题、核对资源用量 |

本仓库的 [`train_demo.py`](../examples/train_demo.py) 是一个参考实现：保存 `metadata.json`（参数、Git、依赖、Slurm 信息）、`metrics.csv`（原始指标）、`summary.json` 和 `checkpoint.pt`。

**登录节点：** 记录依赖版本和代码版本，路径按实际项目修改

```bash
cd ~/my-project
mkdir -p logs
"$HOME/venvs/my-env/bin/python" -m pip freeze > logs/requirements-resolved.txt
git rev-parse HEAD
```

## 每次运行使用新目录

输出目录名带作业号（如 `outputs/run-${SLURM_JOB_ID}`），每次运行写入新目录，不覆盖旧结果。本仓库的示例程序在目录已存在时拒绝运行，以防止覆盖。

checkpoint 按固定间隔保存，避免每一步都保存大文件。目录组织方式可参考 [实验目录模板](../templates/experiment-layout.md)。

## 保存作业记录

`squeue` 只显示尚未结束的作业。`sacct` 可查询历史，但集群不一定长期保留，重要作业的记录可另存为文件。

**登录节点：**

```bash
JOB_ID=123456
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,AllocCPUS,MaxRSS,ExitCode \
  > "logs/accounting-${JOB_ID}.txt"
```

## 备份

- 定期用 [rsync 或 scp](03-storage-and-data.md) 将结果下载到本机或其他存储。
- 代码和小型配置纳入 Git；大型 checkpoint 和数据另行备份。
- 论文中使用的图，除图片本身外，还应保留绘图所用的数据、脚本和参数。

## 实验记录建议

- 训练种子与评估种子分开记录。
- 比较不同方法时，统一环境、训练预算和评估方式；使用多个种子，报告均值和波动，而不是只选取最好的一次。
- 一批实验运行期间，不修改其使用的代码和配置。

[返回目录](../README.md)
