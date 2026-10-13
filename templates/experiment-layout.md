# 实验目录模板

代码、数据、结果分开；场景名标清 agent 数和观测设置，避免把 full 和 local 混在一起。

```text
my-project/
├── configs/
├── src/
├── slurm/
├── logs/                         Slurm stdout / stderr / accounting
├── data/                         数据集；或链接到单独数据目录
├── outputs/
│   ├── mpe2_simple_tag/
│   │   ├── 8p3e_full/<算法>/seed-23/<run-id>/
│   │   └── 8p3e_local-r0.3_k3/<算法>/seed-23/<run-id>/
│   └── mpe2_simple_spread/
│       └── 9agents_full/<算法>/seed-23/<run-id>/
└── figures/<环境族>/<场景>/
    ├── curves/
    └── evaluation/
```

`run-id` 建议含时间和 Slurm 作业号；数组任务再加数组索引。每次重跑用新目录，不覆盖旧结果。

每个 run 保留：完整配置、参数、Git commit、依赖版本、原始指标、评估协议、必要 checkpoint。场景名只是检索入口，不代替配置。

并行批次提交后不要修改它读取的代码/配置；必须改时，使用独立版本目录并明确记录版本，而不是让同一批次混用版本。

Git 记录代码/配置/小型分析材料；checkpoint、原始大轨迹另存、备份。是否跟踪 `figures/` 由项目决定，但应保留图对应的小型汇总数据与绘图脚本。

**登录节点，进入自己的项目目录：记录依赖。**

```bash
mkdir -p logs
"$HOME/你的环境/bin/python" -m pip freeze > logs/requirements-resolved.txt
git rev-parse HEAD
```
