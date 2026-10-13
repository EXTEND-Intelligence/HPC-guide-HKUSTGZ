#!/bin/bash
#SBATCH --job-name=hpc-gpu
#SBATCH --partition=i64m1tga40u
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --mem=16G
#SBATCH --gres=gpu:1
#SBATCH --time=02:00:00
#SBATCH --output=logs/gpu-%j.out
#SBATCH --error=logs/gpu-%j.err
#SBATCH --export=ALL

set -euo pipefail
cd "${SLURM_SUBMIT_DIR:?Submit from the project root with sbatch}"
PYTHON_BIN="${PYTHON_BIN:-$HOME/venvs/hpc-tutorial-gpu/bin/python}"
if [[ ! -x "$PYTHON_BIN" ]]; then
    printf 'CUDA Python not executable: %s\n' "$PYTHON_BIN" >&2
    exit 1
fi
export OMP_NUM_THREADS="$SLURM_CPUS_PER_TASK"
export MKL_NUM_THREADS="$SLURM_CPUS_PER_TASK"
export OPENBLAS_NUM_THREADS="$SLURM_CPUS_PER_TASK"
export PYTHONUNBUFFERED=1
printf 'Started: %s | job=%s | host=%s\n' "$(date -Is)" "$SLURM_JOB_ID" "$(hostname)"
srun --cpus-per-task="$SLURM_CPUS_PER_TASK" "$PYTHON_BIN" -u examples/gpu_check.py
srun --cpus-per-task="$SLURM_CPUS_PER_TASK" "$PYTHON_BIN" -u examples/train_demo.py \
    --device cuda --steps "${STEPS:-1000}" --seed "${SEED:-23}" --lr "${LR:-0.001}" \
    --output "outputs/gpu-${SLURM_JOB_ID}"
printf 'Completed: %s\n' "$(date -Is)"
