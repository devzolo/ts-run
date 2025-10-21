# ts-run

Execute TypeScript/JavaScript files and package.json scripts with the appropriate runtime and package manager.

## Package includes 2 CLIs

- **`ts-run`** - Execute TypeScript/JavaScript files with the appropriate runtime
- **`ts-task`** - Execute package.json scripts with the appropriate package manager

## Installation

```bash
npm install -g @devzolo/ts-run
```

---

## ts-run CLI

Execute TypeScript and JavaScript files with the runtime relative to your package manager.

### Features

- 🚀 **Auto-detects runtime** based on your package manager (npm/yarn/pnpm → Node.js, bun → Bun, deno → Deno)
- 📦 **Native TypeScript support** for Node.js via `--experimental-transform-types`
- 🎨 **Decorator support** - Automatic detection and tsx integration for Node.js
- 🌍 **Unified `.env` support** with automatic format conversion per runtime
- 🔇 **Silent execution** - clean output without verbose logs

### Usage

```bash
# Execute TypeScript files directly
ts-run script.ts

# With environment variables
ts-run --env .env app.ts

# With arguments
ts-run server.ts --port 3000
```

### How it Works

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

### Decorator Support

`ts-run` automatically detects TypeScript decorators in your code and handles them appropriately:

**For Node.js projects:**

- Automatically detects decorator syntax (`@DecoratorName`)
- Switches to [tsx](https://github.com/privatenumber/tsx) for proper transpilation
- Requires `tsx` to be installed (added as optional dependency)

**For Bun/Deno:**

- Native decorator support, no additional dependencies needed

**Example with decorators:**

```typescript
function ClassDecorator(target: any) {
    console.log("ClassDecorator", target);
    return target;
}

@ClassDecorator
class Person {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}
```

```bash
# Just run it - decorator detection is automatic!
ts-run app.ts
```

**If tsx is not installed**, you'll get a helpful error message:

```bash
Error: Decorators detected but tsx is not installed.
To use decorators with Node.js, install tsx:
  npm install -D tsx
  # or
  pnpm add -D tsx
  # or
  yarn add -D tsx

Alternatively, use Bun or Deno which have native decorator support.
```

### Environment Files

The `--env` and `--env-file` flags automatically convert to the correct format:

```bash
ts-run --env .env script.ts
```

- **Deno**: Converts to `--env=.env`
- **Node.js/Bun**: Converts to `--env-file .env`

### Deno Security Flags

You can pass Deno security flags such as `--allow-net`, `--allow-read`, or `-A` when the runtime is detected as Deno. These flags are automatically ignored for Node.js and Bun so they do not trigger unknown option errors.

### Options

```text
-h, --help                Show help
-v, --version             Show version
--env <file>              Load environment file
--env-file <file>         Load environment file
```

### Examples

```bash
# TypeScript with environment variables
ts-run --env .env.local server.ts

# Multiple arguments
ts-run api.ts --host localhost --port 8080

# Different environments
ts-run --env .env.production build.ts
```

---

## ts-task CLI

Execute package.json scripts with the appropriate package manager automatically.

### Features

- 🚀 **Auto-detects package manager** based on your project (npm, yarn, pnpm, bun, or deno)
- 📦 **Smart script execution** with the correct command for each package manager
- 📋 **Script listing** - view all available scripts in your package.json
- 🎯 **Argument forwarding** - pass arguments to your scripts seamlessly

### Usage

```bash
# List all available scripts
ts-task

# Run a script
ts-task build

# Run a script with arguments
ts-task dev --port 3000

# List all scripts explicitly
ts-task --list
```

### How it Works

`ts-task` detects your package manager and uses the appropriate command:

| Package Manager | Command                |
| --------------- | ---------------------- |
| npm             | `npm run <script>`     |
| yarn            | `yarn run <script>`    |
| pnpm            | `pnpm run <script>`    |
| bun             | `bun run <script>`     |
| deno            | `deno task <script>`   |

### Options

```text
-h, --help       Show help message
-v, --version    Show version number
-l, --list       List all available scripts
```

### Examples

```bash
# List all available scripts in package.json
ts-task

# Run build script
ts-task build

# Run dev script with custom port
ts-task dev --port 8080

# Run test script with watch mode
ts-task test --watch
```

### Why ts-task?

Instead of remembering different commands for different package managers:

```bash
# Without ts-task
npm run build    # if using npm
yarn run build   # if using yarn
pnpm run build   # if using pnpm
bun run build    # if using bun
deno task build  # if using deno

# With ts-task
ts-task build    # works with any package manager!
```

---

## Requirements

- **Node.js**: ≥22.6.0 (for TypeScript support)
- **Bun/Deno**: Any version (native TypeScript)

## License

MIT

## Repository

[GitHub](https://github.com/devzolo/ts-run)
