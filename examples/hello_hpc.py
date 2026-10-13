#!/usr/bin/env python3
"""A tiny standard-library-only Slurm smoke test."""

import argparse
import json
import os
from pathlib import Path
import platform
import socket
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Output already exists; choose a new directory.")
    args.output.mkdir(parents=True, exist_ok=False)

    start = time.monotonic()
    checksum = sum(number * number for number in range(100_000))
    result = {
        "hostname": socket.gethostname(),
        "python": platform.python_version(),
        "working_directory": str(Path.cwd()),
        "slurm_job_id": os.environ.get("SLURM_JOB_ID"),
        "slurm_cpus_per_task": os.environ.get("SLURM_CPUS_PER_TASK"),
        # This is host visibility, NOT a reliable allocation size.
        "os_cpu_count": os.cpu_count(),
        "checksum": checksum,
        "elapsed_seconds": time.monotonic() - start,
    }
    with (args.output / "result.json").open("w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    print(json.dumps(result, indent=2, ensure_ascii=False), flush=True)
    print("Smoke test completed.", flush=True)


if __name__ == "__main__":
    main()
