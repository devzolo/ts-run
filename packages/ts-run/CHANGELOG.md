# Changelog

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
