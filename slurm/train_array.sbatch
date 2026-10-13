#!/bin/bash
#SBATCH --job-name=hpc-array
#SBATCH --partition=i64m512u
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --mem=16G
#SBATCH --time=12:00:00
#SBATCH --array=0-14%3
#SBATCH --output=logs/array-%A_%a.out
#SBATCH --error=logs/array-%A_%a.err
#SBATCH --export=ALL

set -euo pipefail
cd "${SLURM_SUBMIT_DIR:?Submit from the project root with sbatch}"
PYTHON_BIN="${PYTHON_BIN:-$HOME/venvs/hpc-tutorial/bin/python}"
if [[ ! -x "$PYTHON_BIN" ]]; then
    printf 'Python not executable: %s\n' "$PYTHON_BIN" >&2
    exit 1
fi
export OMP_NUM_THREADS="$SLURM_CPUS_PER_TASK"
export MKL_NUM_THREADS="$SLURM_CPUS_PER_TASK"
export OPENBLAS_NUM_THREADS="$SLURM_CPUS_PER_TASK"
export PYTHONUNBUFFERED=1

learning_rates=(0.0003 0.001 0.003)
seeds=(11 23 37 51 71)
task_id="${SLURM_ARRAY_TASK_ID:?Not an array job}"
if (( task_id < 0 || task_id >= ${#learning_rates[@]} * ${#seeds[@]} )); then
    printf 'Array index out of range: %s\n' "$task_id" >&2
    exit 1
fi
lr="${learning_rates[$((task_id / ${#seeds[@]}))]}"
seed="${seeds[$((task_id % ${#seeds[@]}))]}"
output="outputs/array-${SLURM_ARRAY_JOB_ID}/task-${task_id}-lr-${lr}-seed-${seed}"
printf 'Started: %s | array=%s | index=%s | lr=%s | seed=%s\n' \
    "$(date -Is)" "$SLURM_ARRAY_JOB_ID" "$task_id" "$lr" "$seed"
srun --cpus-per-task="$SLURM_CPUS_PER_TASK" "$PYTHON_BIN" -u examples/train_demo.py \
    --device cpu --steps "${STEPS:-1000}" --lr "$lr" --seed "$seed" --output "$output"
printf 'Completed: %s\n' "$(date -Is)"
