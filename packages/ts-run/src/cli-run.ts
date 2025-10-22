#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { detectPackageManager, getRuntime } from "./detector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

function showHelp() {
  console.log(
    "ts-run - Execute code with the runtime relative to your package manager\n"
  );
  console.log("Usage: ts-run [options] <file> [arguments...]\n");
  console.log("Examples:");
  console.log("  ts-run script.ts");
  console.log("  ts-run --env .env app.js --port 3000");
  console.log("  ts-run --env-file .env.local index.ts arg1 arg2\n");
  console.log("Supported package managers:");
  console.log("  npm, yarn, pnpm  → uses node");
  console.log("  bun              → uses bun");
  console.log("  deno             → uses deno run\n");
  console.log("Options:");
  console.log("  -h, --help                Show this help message");
  console.log("  -v, --version             Show version number");
  console.log(
    "  --env <file>              Load environment file (auto-converted per runtime)"
  );
  console.log(
    "  --env-file <file>         Load environment file (auto-converted per runtime)\n"
  );
  console.log(
    "Note: --env and --env-file are automatically converted to the correct format:"
  );
  console.log("  - Deno: --env=<file>");
  console.log("  - Node/Bun: --env-file <file>");
  console.log(
    "\nDeno security flags (--allow-*, -A) are forwarded only when Deno is detected."
  );
  console.log("\nAutomatic TypeScript support:");
  console.log(
    "  - Node.js: Automatically adds --experimental-transform-types for .ts files"
  );
  console.log(
    "  - Node.js with decorators: Auto-detects and uses tsx if installed in your project"
  );
  console.log("  - Bun/Deno: Native TypeScript and decorator support");
}

function showVersion() {
  const packageJsonPath = join(__dirname, "../package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  console.log(`ts-run v${packageJson.version}`);
}

/**
 * Extracts env file information from arguments
 * Supports: --env=file, --env file, --env-file=file, --env-file file
 */
function extractEnvFile(args: string[]): {
  envFile: string | null;
  remainingArgs: string[];
} {
  let envFile: string | null = null;
  const remainingArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // --env=.env or --env-file=.env
    if (arg.startsWith("--env=")) {
      envFile = arg.substring(6);
      continue;
    }

    if (arg.startsWith("--env-file=")) {
      envFile = arg.substring(11);
      continue;
    }

    // --env .env or --env-file .env
    if ((arg === "--env" || arg === "--env-file") && i + 1 < args.length) {
      envFile = args[i + 1];
      i++; // Skip next argument
      continue;
    }

    remainingArgs.push(arg);
  }

  return { envFile, remainingArgs };
}

/**
 * Formats the env file argument based on the runtime
 */
function formatEnvArg(envFile: string, packageManager: string): string {
  if (packageManager === "deno") {
    return `--env=${envFile}`;
  }
  // Node, Bun, and others use --env-file
  return `--env-file ${envFile}`;
}

/**
 * Checks if the file is a TypeScript file
 */
function isTypeScriptFile(filename: string): boolean {
  return /\.(ts|tsx|mts|cts)$/i.test(filename);
}

/**
 * Checks if the file content contains decorators
 */
function hasDecorators(filename: string): boolean {
  try {
    const content = readFileSync(filename, "utf-8");
    // Check for decorator syntax: @DecoratorName at the start of a line or after whitespace
    return /@[A-Z][a-zA-Z0-9_]*/.test(content);
  } catch {
    return false;
  }
}

/**
 * Extracts the target file from remaining arguments
 */
function getTargetFile(args: string[]): string | null {
  // Find the first argument that looks like a file (not a flag)
  for (const arg of args) {
    if (
      !arg.startsWith("-") &&
      (arg.endsWith(".ts") ||
        arg.endsWith(".tsx") ||
        arg.endsWith(".mts") ||
        arg.endsWith(".cts") ||
        arg.endsWith(".js") ||
        arg.endsWith(".mjs") ||
        arg.endsWith(".cjs"))
    ) {
      return arg;
    }
  }
  return null;
}

/**
 * Checks if tsx is available in the user's project
 */
function isTsxAvailable(): boolean {
  try {
    // Check if tsx is available in the user's project node_modules
    require.resolve("tsx", { paths: [process.cwd()] });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the install command for tsx based on the package manager
 */
function getTsxInstallCommand(packageManager: string): string {
  switch (packageManager) {
    case "npm":
      return "npm install -D tsx";
    case "yarn":
      return "yarn add -D tsx";
    case "pnpm":
      return "pnpm add -D tsx";
    default:
      return "npm install -D tsx";
  }
}

/**
 * Builds Node.js specific flags and returns runtime info
 */
function getNodeRuntimeInfo(
  targetFile: string | null,
  packageManager: string
): {
  runtime: string;
  flags: string;
} {
  const flags: string[] = [];
  let runtime = "node";

  // Check if file uses decorators - if so, we need tsx
  if (targetFile && isTypeScriptFile(targetFile) && hasDecorators(targetFile)) {
    if (isTsxAvailable()) {
      // Use tsx which supports decorators (installed in user's project)
      runtime = "tsx";
      // tsx doesn't need extra flags for TypeScript
    } else {
      const installCmd = getTsxInstallCommand(packageManager);
      console.error(
        "\x1b[31m✗ Error: TypeScript decorators are not supported by Node.js natively.\x1b[0m\n"
      );
      console.error(
        "\x1b[33m📦 Solution 1: Install tsx in your project (recommended for Node.js)\x1b[0m"
      );
      console.error(`  ${installCmd}\n`);
      console.error(
        "\x1b[33m🚀 Solution 2: Use Bun or Deno (native decorator support)\x1b[0m"
      );
      console.error(
        "  They support decorators out of the box, no extra dependencies needed!"
      );
      console.error(
        "\n\x1b[90mNote: Node.js --experimental-transform-types only strips types, it doesn't transpile decorators.\x1b[0m"
      );
      throw new Error("Decorator transpilation not available");
    }
  } else if (targetFile && isTypeScriptFile(targetFile)) {
    // Regular TypeScript without decorators - use Node's type stripping
    flags.push("--experimental-transform-types");
    flags.push("--no-warnings");
  }

  return { runtime, flags: flags.join(" ") };
}

/**
 * Checks if an argument matches a Deno security flag
 */
function isDenoSecurityFlag(arg: string): boolean {
  const normalized = arg.toLowerCase();
  if (normalized === "-a" || normalized === "--allow-all") {
    return true;
  }

  return normalized.startsWith("--allow-");
}

/**
 * Filters out Deno-only security flags when running on other runtimes
 */
function filterArgsForRuntime(
  args: string[],
  packageManager: string,
  targetFile: string | null
): string[] {
  if (packageManager === "deno") {
    return args;
  }

  if (!targetFile) {
    return args.filter((arg) => !isDenoSecurityFlag(arg));
  }

  const targetIndex = args.indexOf(targetFile);
  if (targetIndex === -1) {
    return args.filter((arg) => !isDenoSecurityFlag(arg));
  }

  const beforeTarget = args
    .slice(0, targetIndex)
    .filter((arg) => !isDenoSecurityFlag(arg));
  const afterTarget = args.slice(targetIndex);

  return beforeTarget.concat(afterTarget);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(1);
  }

  const firstArg = args[0];

  if (firstArg === "-h" || firstArg === "--help") {
    showHelp();
    process.exit(0);
  }

  if (firstArg === "-v" || firstArg === "--version") {
    showVersion();
    process.exit(0);
  }

  try {
    const packageManager = detectPackageManager();
    const runtime = getRuntime(packageManager);

    // Extract env file if present
    const { envFile, remainingArgs } = extractEnvFile(args);

    // Get target file to determine if we need TypeScript flags
    const targetFile = getTargetFile(remainingArgs);

    // Build command with runtime-specific flags
    let command = runtime;

    // Add Node.js specific flags and potentially switch to tsx for decorators
    if (
      packageManager === "npm" ||
      packageManager === "yarn" ||
      packageManager === "pnpm"
    ) {
      const nodeInfo = getNodeRuntimeInfo(targetFile, packageManager);
      command = nodeInfo.runtime;
      if (nodeInfo.flags) {
        command += ` ${nodeInfo.flags}`;
      }
    }

    // Add env file if present
    if (envFile) {
      command += ` ${formatEnvArg(envFile, packageManager)}`;
    }

    // Add remaining arguments (script and its args)
    const sanitizedArgs = filterArgsForRuntime(
      remainingArgs,
      packageManager,
      targetFile
    );
    if (sanitizedArgs.length > 0) {
      command += ` ${sanitizedArgs.join(" ")}`;
    }

    execSync(command, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

main();
