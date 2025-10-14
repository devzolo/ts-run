# ts-run

Execute TypeScript and JavaScript files with the runtime relative to your package manager.

## Features

- 🚀 **Auto-detects runtime** based on your package manager (npm/yarn/pnpm → Node.js, bun → Bun, deno → Deno)
- 📦 **Native TypeScript support** for Node.js via `--experimental-transform-types`
- 🌍 **Unified `.env` support** with automatic format conversion per runtime
- 🔇 **Silent execution** - clean output without verbose logs

## Installation

```bash
npm install -g @devzolo/ts-run
```

## Usage

```bash
# Execute TypeScript files directly
ts-run script.ts

# With environment variables
ts-run --env .env app.ts

# With arguments
ts-run server.ts --port 3000
```

## How it Works

`ts-run` detects your package manager and uses the appropriate runtime:

| Package Manager | Runtime | TypeScript Support               |
| --------------- | ------- | -------------------------------- |
| npm, yarn, pnpm | Node.js | `--experimental-transform-types` |
| bun             | Bun     | Native                           |
| deno            | Deno    | Native                           |

Detection is based on lock files:

- `package-lock.json` → npm
- `yarn.lock` → Yarn
- `pnpm-lock.yaml` → pnpm
- `bun.lockb` → Bun
- `deno.json` → Deno

## Environment Files

The `--env` and `--env-file` flags automatically convert to the correct format:

```bash
ts-run --env .env script.ts
```

- **Deno**: Converts to `--env=.env`
- **Node.js/Bun**: Converts to `--env-file .env`

## Requirements

- **Node.js**: ≥22.6.0 (for TypeScript support)
- **Bun/Deno**: Any version (native TypeScript)

## Options

```text
-h, --help                Show help
-v, --version             Show version
--env <file>              Load environment file
--env-file <file>         Load environment file
```

## Examples

```bash
# TypeScript with environment variables
ts-run --env .env.local server.ts

# Multiple arguments
ts-run api.ts --host localhost --port 8080

# Different environments
ts-run --env .env.production build.ts
```

## License

MIT

## Repository

[GitHub](https://github.com/devzolo/ts-run)
