# Changelog

## 0.2.0

### Minor Changes

- b424926: Migrated the package to native ESM (TypeScript ESNext output, .js import specifiers, runtime compatibility helpers) to ensure Bun/Deno support. The CLI now auto-detects decorators in TS sources, switches to tsx when available, and shows package-manager-specific install guidance when decorators require transpilation.

## Unreleased

### Breaking Changes

- **Migrated to ESM (ES Modules)**: The package now uses ES Modules instead of CommonJS
  - All source files now use `import`/`export` instead of `require()`/`module.exports`
  - Added `"type": "module"` to package.json
  - Changed TypeScript compiler to output ESM (`"module": "ESNext"`)
  - This fixes compatibility with Deno which requires ESM
  - Node.js (>=22.6.0), Bun, and Deno all support ESM natively

### Added

- **Decorator Support**: Automatic detection of TypeScript decorators in code
  - Automatically switches to `tsx` when decorators are detected in Node.js projects
  - Detects if `tsx` is installed in user's project (via `node_modules`)
  - Shows personalized install command based on detected package manager (npm/yarn/pnpm)
  - Provides helpful and informative error messages if tsx is not installed
  - Native support maintained for Bun and Deno (no extra dependencies needed)
  - Keeps `ts-run` lightweight - no bundled transpiler dependencies
- Updated help text to mention decorator support
- Enhanced README with decorator usage examples and documentation

### Technical Details

**ESM Migration:**

- All imports now use `.js` extensions for ESM compatibility
- Replaced `require()` with `import` statements
- Replaced `module.exports` with `export` statements
- Used `createRequire()` from `node:module` for `require.resolve()` compatibility in ESM
- Used `import.meta.url` with `fileURLToPath()` to get `__dirname` and `__filename` in ESM
- Changed `moduleResolution` to `"bundler"` for better ESM support

**Decorator Support:**

- Added `hasDecorators()` function to detect decorator syntax in TypeScript files
- Added `isTsxAvailable()` function to check if tsx is installed in user's project
- Added `getTsxInstallCommand()` function to generate package manager-specific install commands
- Refactored `getNodeFlags()` to `getNodeRuntimeInfo()` to support runtime switching
- `getNodeRuntimeInfo()` now accepts `packageManager` parameter for personalized error messages
- Automatic runtime switching from `node` to `tsx` when decorators are detected
- Uses `require.resolve()` with `paths` option to check user's project dependencies

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
