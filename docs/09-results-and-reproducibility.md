# 09 · 结果保存与复现

Slurm 保存的是调度记录和标准输出/错误；reward、胜率、捕获率、模型等 **需要训练程序自己保存**。Slurm 不会自动替你记录这些指标。

## 每次实验至少保存什么？

| 文件/内容 | 用途 |
|---|---|
| 完整配置、CLI 参数、训练种子 | 说明实际实验设置，而不是只写配置文件名 |
| Git commit、依赖版本、环境参数 | 确认代码和软件版本 |
| 逐次训练/评估指标 CSV | 重画曲线；保留原始值、步数和评估次数 |
| checkpoint | 复测策略；至少保留 final，最好还有验证规则明确的 best |
| 评估数据与汇总 | 保存每回合结果、评估种子/初始化规则、均值与离散程度 |
| Slurm 作业号、日志、退出状态 | 排查失败、确认完成和资源使用 |

不要每个环境 step 都保存大型 checkpoint。按固定间隔存指标，降低模型保存频率；大矩阵/轨迹按研究问题定期采样，不要无差别全量保存。

训练种子与评估种子分开记录。评估若每个 episode 都用相同种子 `reset`，可能反复评估同一初始场景；通常只初始化随机流一次，或明确使用不同 episode 种子。

## 目录规范

```text
outputs/<环境族>/<场景>/<算法>/seed-23/<唯一run-id>/
    config.yaml
    metadata.json
    metrics.csv
    evaluation/
    checkpoints/
figures/<环境族>/<场景>/
    curves/
    evaluation/
```

场景名应包含 agent 数、full/local、观测半径等关键差异，例如 `8p3e_local-r0.3_k3`；完整设置仍须保存到配置。参照 [目录模板](../templates/experiment-layout.md)。

本项目小示例保存 `metadata.json`、`metrics.csv`、`summary.json`、`checkpoint.pt`；测试 hello 只保存 `result.json`。输出目录已存在时拒绝覆盖。

## 保留作业记录与备份

`squeue` 只显示活动作业，完成后消失很正常。`sacct` 是历史记录，但集群可能有保留期限，不能当永久档案。

**登录节点，按自己的作业号修改：**

```bash
JOB_ID=123456
sacct -j "$JOB_ID" --format=JobID,State,Elapsed,AllocCPUS,MaxRSS,ExitCode \
  > "logs/accounting-${JOB_ID}.txt"
```

定期用 [rsync 下载](03-storage-and-data.md)。代码和小型配置适合 Git；大 checkpoint/轨迹放独立存储。论文数据不要只留下图片：**同时保留生成图的数据、脚本、参数和来源清单**。

比较算法时统一环境、训练预算、评估协议，多种子报告均值与变异，不挑选单次最优结果冒充总体表现。

[返回目录](../README.md)
