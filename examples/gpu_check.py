#!/usr/bin/env python3
"""Fail fast if the allocated GPU is not available to PyTorch."""

import json
import os
import socket

import torch


def main():
    if not torch.cuda.is_available():
        raise SystemExit("CUDA unavailable: check GPU allocation, driver, and PyTorch build.")
    tensor = torch.ones(32, 32, device="cuda")
    checksum = (tensor @ tensor).sum().item()
    print(json.dumps({
        "hostname": socket.gethostname(),
        "slurm_job_id": os.environ.get("SLURM_JOB_ID"),
        "cuda_visible_devices": os.environ.get("CUDA_VISIBLE_DEVICES"),
        "visible_gpu_count": torch.cuda.device_count(),
        "gpu_name": torch.cuda.get_device_name(0),
        "torch": str(torch.__version__),
        "cuda_runtime": torch.version.cuda,
        "checksum": checksum,
    }, indent=2), flush=True)


if __name__ == "__main__":
    main()
