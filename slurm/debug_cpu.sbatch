#!/bin/bash
#SBATCH --job-name=hpc-hello
#SBATCH --partition=debug
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --mem=2G
#SBATCH --time=00:10:00
#SBATCH --output=logs/debug-%j.out
#SBATCH --error=logs/debug-%j.err
#SBATCH --export=ALL

# Submit from the project root after: mkdir -p logs
set -euo pipefail
cd "${SLURM_SUBMIT_DIR:?Submit this script with sbatch}"
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3)}"
if [[ ! -x "$PYTHON_BIN" ]]; then
    printf 'Python not executable: %s\n' "$PYTHON_BIN" >&2
    exit 1
fi
export OMP_NUM_THREADS="$SLURM_CPUS_PER_TASK"
export MKL_NUM_THREADS="$SLURM_CPUS_PER_TASK"
export PYTHONUNBUFFERED=1
printf 'Started: %s | job=%s | host=%s\n' "$(date -Is)" "$SLURM_JOB_ID" "$(hostname)"
srun --cpus-per-task="$SLURM_CPUS_PER_TASK" "$PYTHON_BIN" -u examples/hello_hpc.py \
    --output "outputs/hello-${SLURM_JOB_ID}"
printf 'Completed: %s\n' "$(date -Is)"
