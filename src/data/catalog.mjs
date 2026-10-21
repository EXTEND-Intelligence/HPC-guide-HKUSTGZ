// The original Markdown and scripts remain the single source of truth.
export const verifiedAt = '2026-10-13';
export const officialUrl = 'https://docs.hpc.hkust-gz.edu.cn/';

export const documents = [
  { slug: 'quickstart', source: 'QUICKSTART.md', title: '快速开始', description: '登录、编写脚本、提交、查看结果，完成第一个作业。', group: '开始使用', number: '', keywords: '第一个作业 免费 debug 测试 sbatch hello' },
  { slug: 'hpc-overview', source: 'docs/01-hpc-overview.md', title: '认识 HPC', description: '集群概览、登录节点与计算节点、作业与分区、各期平台。', group: '基础准备', number: '01', keywords: '概览 流程 节点 分区 队列 作业 状态 一期 二期 三期 四期 EDA mgmt' },
  { slug: 'login-and-ssh', source: 'docs/02-login-and-ssh.md', title: '登录与 SSH', description: '密码登录、密钥免密登录、设置快捷名。', group: '基础准备', number: '02', keywords: 'VPN 免密 私钥 公钥 指纹 Windows PowerShell config' },
  { slug: 'storage-and-data', source: 'docs/03-storage-and-data.md', title: '文件与传输', description: '存储位置，以及用 rsync、scp 或 Git 传输代码与数据。', group: '基础准备', number: '03', keywords: '上传 下载 HOME HDD SSD rsync scp GitHub clone pull' },
  { slug: 'slurm-basics', source: 'docs/04-slurm-basics.md', title: 'Slurm 作业', description: '作业脚本结构、资源申请，查看、取消与排队原因。', group: '运行作业', number: '04', keywords: 'sbatch squeue scancel sacct scontrol QoS 内存 排队 PD' },
  { slug: 'debug-and-interactive', source: 'docs/05-debug-and-interactive.md', title: '交互式调试', description: '申请计算节点进行交互式调试，结束后释放资源。', group: '运行作业', number: '05', keywords: 'srun salloc debug 交互 exit 免费 GPU nvidia-smi' },
  { slug: 'software-environment', source: 'docs/06-software-environment.md', title: 'Python 环境', description: '建立 venv 或 conda 环境，并在作业中指定解释器。', group: '运行作业', number: '06', keywords: 'venv conda pip torch module PYTHON_BIN CUDA' },
  { slug: 'training-and-batch', source: 'docs/07-training-and-batch.md', title: '训练与批量实验', description: 'CPU 训练、多组参数的数组作业、GPU 作业。', group: '运行作业', number: '07', keywords: '种子 array 数组 GPU A40 多核 并发' },
  { slug: 'pricing-and-budget', source: 'docs/08-pricing-and-budget.md', title: '费用与预算', description: '计算与存储的计费规则，以及一批实验的费用估算。', group: '费用与维护', number: '08', keywords: '价格 导师 PBMS 账单 费用 0.02 省钱' },
  { slug: 'results-and-reproducibility', source: 'docs/09-results-and-reproducibility.md', title: '结果管理', description: '需要保存的内容、目录组织、备份与复现。', group: '费用与维护', number: '09', keywords: 'checkpoint CSV 指标 备份 论文 复现 sacct' },
  { slug: 'troubleshooting', source: 'docs/10-troubleshooting.md', title: '常见问题', description: '按登录、提交、运行、结果四个阶段查找报错原因。', group: '费用与维护', number: '10', keywords: 'FAILED OOM TIMEOUT 报错 作业消失 Permission denied 求助' },
  { slug: 'cheatsheet', source: 'references/cheatsheet.md', title: '命令速查', description: '常用命令、作业状态、#SBATCH 参数和环境变量。', group: '脚本与参考', number: '', keywords: '速查 命令 cheatsheet 状态 SBATCH 环境变量' },
  { slug: 'examples', source: 'examples/README.md', title: '示例说明', description: '每个示例和提交脚本的依赖、参数与输出。', group: '脚本与参考', number: '', keywords: '示例 hello train_demo 保存内容 PYTHON_BIN' },
  { slug: 'experiment-layout', source: 'templates/experiment-layout.md', title: '实验目录模板', description: '代码、数据、结果分开存放，每次运行使用独立目录。', group: '脚本与参考', number: '', keywords: '目录 命名 输出 run-id' },
  { slug: 'official-links', source: 'references/official-links.md', title: '官方参考', description: '平台手册、价格、账号申请和支持渠道。', group: '脚本与参考', number: '', keywords: '官方 文档 管理员 支持' },
  { slug: 'verified-settings', source: 'references/verified-settings.md', title: '核验与边界', description: '核验日期、可变参数与已验证的范围。', group: '脚本与参考', number: '', keywords: '核验 限制 时间 日期 权限' },
];

export const resources = [
  { slug: 'debug-cpu', source: 'slurm/debug_cpu.sbatch', title: '免费 CPU 调试', language: 'bash', group: 'Slurm 脚本', description: '仅使用 Python 标准库的测试，无需安装 PyTorch。', specification: '2 核 · 2 GB · 10 分钟', related: 'slurm-basics' },
  { slug: 'train-cpu', source: 'slurm/train_cpu.sbatch', title: '单作业 CPU 训练', language: 'bash', group: 'Slurm 脚本', description: '显式调用虚拟环境，记录输出，错误时退出。', specification: '8 核 · 16 GB · 12 小时上限', related: 'training-and-batch' },
  { slug: 'train-array', source: 'slurm/train_array.sbatch', title: '多种子并行实验', language: 'bash', group: 'Slurm 脚本', description: '3 个学习率 × 5 个种子，默认最多并发 3 项。', specification: '15 项 · 每项 8 核 / 16 GB', related: 'training-and-batch' },
  { slug: 'train-gpu', source: 'slurm/train_gpu.sbatch', title: '单 GPU 训练', language: 'bash', group: 'Slurm 脚本', description: '先检查 CUDA，再执行示例；需要 GPU 环境。', specification: '1 A40 · 8 核 · 16 GB', related: 'training-and-batch' },
  { slug: 'hello-hpc', source: 'examples/hello_hpc.py', title: 'Hello HPC', language: 'python', group: 'Python 示例', description: '输出所在节点和 Slurm 参数，保存一个 JSON。', specification: '仅 Python 标准库', related: 'examples' },
  { slug: 'train-demo', source: 'examples/train_demo.py', title: '最小训练示例', language: 'python', group: 'Python 示例', description: '小型回归训练，保存指标、元信息与 checkpoint。', specification: 'PyTorch · 默认 1000 步', related: 'examples' },
  { slug: 'gpu-check', source: 'examples/gpu_check.py', title: 'GPU 检查', language: 'python', group: 'Python 示例', description: '检查 CUDA 可见性并运行小型矩阵计算。', specification: '需要 CUDA 版 PyTorch', related: 'examples' },
  { slug: 'ssh-config', source: 'templates/ssh_config.example', title: 'SSH 配置模板', language: 'ssh-config', group: '配置模板', description: '合并到本机 SSH 配置，替换用户名并核验密钥。', specification: '本机 ~/.ssh/config', related: 'login-and-ssh' },
  { slug: 'requirements', source: 'examples/requirements.txt', title: '示例依赖', language: 'text', group: '配置模板', description: 'CPU 示例依赖；安装方式参照环境章节。', specification: 'requirements.txt', related: 'software-environment' },
];

export const navigationGroups = ['开始使用', '基础准备', '运行作业', '费用与维护', '脚本与参考'];
export const documentHref = (document) => `/guide/${document.slug}/`;
export const resourceHref = (resource) => `/scripts/${resource.slug}/`;
export const sourceRoutes = new Map([
  // README.md is the GitHub landing page; on the website its role is played by the homepage.
  ['README.md', '/'],
  ...documents.map((document) => [document.source, documentHref(document)]),
  ...resources.map((resource) => [resource.source, resourceHref(resource)]),
]);
