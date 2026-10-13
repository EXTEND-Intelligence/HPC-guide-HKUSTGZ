# Tutorial maintenance rules

- Scope: concise Chinese documentation for HKUST(GZ) HPC, primarily Phase II SSH + Slurm.
- Keep commands copyable. Label their execution location: local, login node, or allocated compute node.
- Use official sources for platform facts. Record verification dates in `references/verified-settings.md`.
- Do not confuse management hostnames with platform phases, or reuse Phase II Slurm scripts on other schedulers.
- Separate documented prices/limits from live account permissions/QoS. Never invent retention guarantees.
- Never store passwords, private keys, tokens, real user credentials, or personal experiment data.
- Keep examples lightweight. Do not run training on login nodes. Do not submit/cancel real jobs without a user request.
- Scripts must use one task plus `--cpus-per-task` for one Python process, unique output directories, and explicit Python environments.
- Create `logs/` before submission; Slurm opens output files before the script starts.
- Validate Bash syntax, Python examples, array parameter mapping, Markdown links, and budget arithmetic after changes.
- Generated logs/results/environments are ignored by Git; keep teaching source and templates tracked.
- Do not commit/push or change SSH trust settings unless requested.
- The Astro website reads existing Markdown/scripts directly; do not duplicate tutorial content into website-only copies.
- Maintain public page/resource mappings in `src/data/catalog.mjs`; only allowlisted teaching sources may be downloaded or indexed.
- Keep Markdown relative links usable outside the website; rewrite them only during rendering.
- After website changes, run `npm run build` and check desktop/mobile navigation, search, theme and code copying in a browser.
- With the dev/preview server running, use `npm run test:http -- <local-url>` to check actual download routes, not only generated files.
- Website development is local; do not run the web dev server on HPC login nodes.
