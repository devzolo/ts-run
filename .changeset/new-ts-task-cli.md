---
"@devzolo/ts-run": minor
---

Add new ts-task CLI for package.json script execution

- Added ts-task CLI that automatically detects the package manager and runs scripts
- Supports npm, yarn, pnpm, bun, and deno with appropriate run commands
- Lists all available scripts from package.json when called without arguments
- Seamlessly forwards arguments to scripts
- Renamed CLI files to cli-run.ts and cli-task.ts for better organization

