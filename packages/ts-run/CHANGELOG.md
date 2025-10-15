# Changelog

## 0.1.0

### Minor Changes

- 5a01593: Add new ts-task CLI for package.json script execution

  - Added ts-task CLI that automatically detects the package manager and runs scripts
  - Supports npm, yarn, pnpm, bun, and deno with appropriate run commands
  - Lists all available scripts from package.json when called without arguments
  - Seamlessly forwards arguments to scripts
  - Renamed CLI files to cli-run.ts and cli-task.ts for better organization

## 0.0.2

### Patch Changes

- 82287b6: add support for Deno security flags and update CLI help text
- Added new `ts-task` CLI for executing package.json scripts with the appropriate package manager
  - Auto-detects package manager (npm, yarn, pnpm, bun, deno)
  - Lists available scripts from package.json
  - Smart command execution based on detected package manager
  - Seamless argument forwarding to scripts

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-10-14

### Added

- Initial release
- Automatic package manager detection (npm, yarn, pnpm, bun, deno)
- Native TypeScript support for Node.js via `--experimental-transform-types`
- Environment file compatibility layer with automatic format conversion
- Support for `.env` files with `--env` and `--env-file` flags
- Silent execution mode (no verbose detection logs)
- Automatic suppression of Node.js warnings for cleaner output

### Features

- Detects package manager from lock files
- Executes code with appropriate runtime (Node.js, Bun, or Deno)
- Converts env file flags to correct format per runtime
- TypeScript files run directly without additional tools

[0.0.1]: https://github.com/devzolo/ts-run/releases/tag/v0.0.1
