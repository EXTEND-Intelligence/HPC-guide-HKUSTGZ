// The original Markdown and scripts remain the single source of truth.
export const verifiedAt = '2026-10-13';
export const officialUrl = 'https://docs.hpc.hkust-gz.edu.cn/';

export const documents = [
  { slug: 'overview', source: 'README.md', title: '使用总览', description: '先认识节点、资源与一次作业的完整流程。', group: '开始使用', number: '', keywords: '入门 HPC SSH Slurm Docker' },
  { slug: 'quickstart', source: 'QUICKSTART.md', title: '快速上手', description: '上传、提交、查看、下载：跑通第一个 CPU 作业。', group: '开始使用', number: '', keywords: '第一个作业 免费 debug 测试' },
  { slug: 'hpc-overview', source: 'docs/01-hpc-overview.md', title: 'HPC 与节点', description: '平台区别、账号权限、登录节点与计算节点。', group: '基础与准备', number: '01', keywords: '一期 二期 三期 四期 EDA mgmt' },
  { slug: 'login-and-ssh', source: 'docs/02-login-and-ssh.md', title: '登录与 SSH', description: '登录集群、设置密钥、核验主机指纹。', group: '基础与准备', number: '02', keywords: 'VPN 免密 私钥 公钥 指纹 认证' },
  { slug: 'storage-and-data', source: 'docs/03-storage-and-data.md', title: '存储与数据', description: '家目录、SSD、作业数据区与 rsync 传输。', group: '基础与准备', number: '03', keywords: '上传 下载 HOME HDD SSD spooler' },
  { slug: 'software-environment', source: 'docs/04-software-environment.md', title: 'Python 与 Git', description: '为训练准备独立环境，同步 GitHub 代码。', group: '基础与准备', number: '04', keywords: 'venv pip torch module GitHub pull' },
  { slug: 'slurm-basics', source: 'docs/05-slurm-basics.md', title: 'Slurm 基础', description: '申请资源、查看队列、理解限制、释放作业。', group: '申请与运行', number: '05', keywords: 'sbatch squeue scancel sacct QoS 内存 释放' },
  { slug: 'debug-and-interactive', source: 'docs/06-debug-and-interactive.md', title: '交互式调试', description: '申请短时调试资源，进入真正的计算节点。', group: '申请与运行', number: '06', keywords: 'srun salloc debug 交互 exit 免费' },
  { slug: 'training-and-batch', source: 'docs/07-training-and-batch.md', title: '训练与并行', description: '正式 CPU 训练、数组作业与可选 GPU。', group: '申请与运行', number: '07', keywords: '种子 array GPU RL 多核 并发' },
  { slug: 'pricing-and-budget', source: 'docs/08-pricing-and-budget.md', title: '计费与预算', description: '计算与存储如何收费，如何估算一批实验。', group: '费用与维护', number: '08', keywords: '价格 导师 PBMS 账单 费用 0.02' },
  { slug: 'results-and-reproducibility', source: 'docs/09-results-and-reproducibility.md', title: '结果与复现', description: '保存原始指标、配置、模型与评估协议。', group: '费用与维护', number: '09', keywords: 'checkpoint CSV reward 胜率 备份 论文' },
  { slug: 'troubleshooting', source: 'docs/10-troubleshooting.md', title: '常见问题', description: '排队、认证、内存、时限和日志的排查入口。', group: '费用与维护', number: '10', keywords: 'FAILED OOM TIMEOUT 报错 作业消失' },
  { slug: 'examples', source: 'examples/README.md', title: '示例说明', description: '每个示例和提交脚本的依赖、参数与输出。', group: '脚本与参考', number: '', keywords: '示例 hello train_demo 保存内容' },
  { slug: 'experiment-layout', source: 'templates/experiment-layout.md', title: '实验目录规范', description: '用场景、算法、种子和 run-id 整理实验。', group: '脚本与参考', number: '', keywords: '目录 full local 命名 输出' },
  { slug: 'official-links', source: 'references/official-links.md', title: '官方参考', description: '平台手册、价格、账号申请和支持渠道。', group: '脚本与参考', number: '', keywords: '官方 文档 管理员 支持' },
  { slug: 'verified-settings', source: 'references/verified-settings.md', title: '核验与边界', description: '核验日期、可变参数与已验证的范围。', group: '脚本与参考', number: '', keywords: '核验 限制 时间 日期 权限' },
];

export const resources = [
  { slug: 'debug-cpu', source: 'slurm/debug_cpu.sbatch', title: '免费 CPU 调试', language: 'bash', group: 'Slurm 脚本', description: '标准库小测试，无需先安装 PyTorch。', specification: '2 核 · 2 GB · 10 分钟', related: 'quickstart' },
  { slug: 'train-cpu', source: 'slurm/train_cpu.sbatch', title: '单作业 CPU 训练', language: 'bash', group: 'Slurm 脚本', description: '显式调用虚拟环境，记录输出，错误时退出。', specification: '8 核 · 16 GB · 12 小时上限', related: 'training-and-batch' },
  { slug: 'train-array', source: 'slurm/train_array.sbatch', title: '多种子并行实验', language: 'bash', group: 'Slurm 脚本', description: '3 个学习率 × 5 个种子，默认最多并发 3 项。', specification: '15 项 · 每项 8 核 / 16 GB', related: 'training-and-batch' },
  { slug: 'train-gpu', source: 'slurm/train_gpu.sbatch', title: '单 GPU 训练', language: 'bash', group: 'Slurm 脚本', description: '先检查 CUDA，再执行示例；需要 GPU 环境。', specification: '1 A40 · 8 核 · 16 GB', related: 'training-and-batch' },
  { slug: 'hello-hpc', source: 'examples/hello_hpc.py', title: 'Hello HPC', language: 'python', group: 'Python 示例', description: '输出所在节点和 Slurm 参数，保存一个 JSON。', specification: '仅 Python 标准库', related: 'examples' },
  { slug: 'train-demo', source: 'examples/train_demo.py', title: '最小训练示例', language: 'python', group: 'Python 示例', description: '小型回归训练，保存指标、元信息与 checkpoint。', specification: 'PyTorch · 默认 1000 步', related: 'examples' },
  { slug: 'gpu-check', source: 'examples/gpu_check.py', title: 'GPU 检查', language: 'python', group: 'Python 示例', description: '检查 CUDA 可见性并运行小型矩阵计算。', specification: '需要 CUDA 版 PyTorch', related: 'examples' },
  { slug: 'ssh-config', source: 'templates/ssh_config.example', title: 'SSH 配置模板', language: 'ssh-config', group: '配置模板', description: '合并到本机 SSH 配置，替换用户名并核验密钥。', specification: '本机 ~/.ssh/config', related: 'login-and-ssh' },
  { slug: 'requirements', source: 'examples/requirements.txt', title: '示例依赖', language: 'text', group: '配置模板', description: 'CPU 示例依赖；安装方式参照环境章节。', specification: 'requirements.txt', related: 'software-environment' },
];

export const navigationGroups = ['开始使用', '基础与准备', '申请与运行', '费用与维护', '脚本与参考'];
export const documentHref = (document) => `/guide/${document.slug}/`;
export const resourceHref = (resource) => `/scripts/${resource.slug}/`;
export const sourceRoutes = new Map([
  ...documents.map((document) => [document.source, documentHref(document)]),
  ...resources.map((resource) => [resource.source, resourceHref(resource)]),
]);
