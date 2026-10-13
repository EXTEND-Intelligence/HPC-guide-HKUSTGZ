#!/usr/bin/env python3
"""Tiny regression training: demonstrate Slurm execution and result saving."""

import argparse
import csv
from datetime import datetime, timezone
import json
import math
import os
from pathlib import Path
import platform
import socket
import subprocess
import time

import torch
from torch import nn


def git_value(*arguments):
    try:
        return subprocess.check_output(
            ["git", *arguments], stderr=subprocess.DEVNULL, text=True
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        return None


def save_json(path, value):
    with path.open("w", encoding="utf-8") as handle:
        json.dump(value, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--steps", type=int, default=1000)
    parser.add_argument("--seed", type=int, default=23)
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--device", choices=("cpu", "cuda"), default="cpu")
    parser.add_argument("--log-every", type=int, default=100)
    args = parser.parse_args()
    if args.steps < 1 or args.log_every < 1 or not math.isfinite(args.lr) or args.lr <= 0:
        parser.error("steps/log-every must be positive; lr must be finite and positive.")
    if args.device == "cuda" and not torch.cuda.is_available():
        parser.error("CUDA unavailable. Use a GPU allocation and CUDA-enabled PyTorch.")
    if args.output.exists():
        parser.error("Output already exists; choose a new directory.")

    threads = int(os.environ.get("SLURM_CPUS_PER_TASK", "1"))
    if threads < 1:
        parser.error("SLURM_CPUS_PER_TASK must be positive.")
    torch.set_num_threads(threads)
    torch.set_num_interop_threads(1)
    torch.manual_seed(args.seed)
    if args.device == "cuda":
        torch.cuda.manual_seed_all(args.seed)
    device = torch.device(args.device)
    args.output.mkdir(parents=True, exist_ok=False)

    parameters = vars(args).copy()
    parameters["output"] = str(args.output.resolve())
    metadata = {
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
        "parameters": parameters,
        "hostname": socket.gethostname(),
        "working_directory": str(Path.cwd()),
        "python": platform.python_version(),
        "torch": str(torch.__version__),
        "cuda_runtime": torch.version.cuda,
        "torch_cpu_threads": threads,
        "git_commit": git_value("rev-parse", "HEAD"),
        "git_status": git_value("status", "--short"),
        "slurm": {
            key: os.environ.get(key)
            for key in (
                "SLURM_JOB_ID", "SLURM_JOB_PARTITION", "SLURM_CPUS_PER_TASK",
                "SLURM_ARRAY_JOB_ID", "SLURM_ARRAY_TASK_ID",
            )
        },
        "metric_note": "Training-set MSE, not evaluation reward or success rate.",
    }
    save_json(args.output / "metadata.json", metadata)

    # Fixed synthetic dataset within a seed, shared across learning-rate settings.
    inputs = torch.randn(2048, 8, device=device)
    weights = torch.linspace(-1, 1, 8, device=device).reshape(8, 1)
    targets = inputs @ weights + 0.1 * torch.randn(2048, 1, device=device)
    model = nn.Sequential(nn.Linear(8, 32), nn.ReLU(), nn.Linear(32, 1)).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    criterion = nn.MSELoss()
    start = time.monotonic()

    def full_mse():
        with torch.no_grad():
            return criterion(model(inputs), targets).item()

    initial_mse = full_mse()
    with (args.output / "metrics.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(("step", "train_mse", "elapsed_seconds"))
        writer.writerow((0, initial_mse, 0.0))
        handle.flush()
        print(f"step=0 train_mse={initial_mse:.6f} device={device} threads={threads}", flush=True)
        for step in range(1, args.steps + 1):
            indices = torch.randint(0, len(inputs), (128,), device=device)
            loss = criterion(model(inputs[indices]), targets[indices])
            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            optimizer.step()
            if step % args.log_every == 0 or step == args.steps:
                mse = full_mse()
                if not math.isfinite(mse):
                    raise RuntimeError("Non-finite MSE; inspect hyperparameters and logs.")
                writer.writerow((step, mse, time.monotonic() - start))
                handle.flush()
                print(f"step={step} train_mse={mse:.6f}", flush=True)

    final_mse = full_mse()
    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "step": args.steps,
            "parameters": parameters,
            "torch_rng_state": torch.get_rng_state(),
            "cuda_rng_states": torch.cuda.get_rng_state_all() if device.type == "cuda" else None,
        },
        args.output / "checkpoint.pt",
    )
    summary = {
        "finished_at_utc": datetime.now(timezone.utc).isoformat(),
        "steps": args.steps,
        "initial_train_mse": initial_mse,
        "final_train_mse": final_mse,
        "elapsed_seconds": time.monotonic() - start,
        "seed": args.seed,
        "device": str(device),
    }
    save_json(args.output / "summary.json", summary)
    print(f"Completed: {args.output.resolve()}", flush=True)


if __name__ == "__main__":
    main()
