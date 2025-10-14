import { existsSync } from "node:fs";
import { basename, join } from "node:path";

/**
 * Detects the package manager being used in the current project from the user agent
 */
export function detectPackageManagerFromUserAgent():
  | PackageManager
  | undefined {
  const ua = process.env.npm_config_user_agent || "";
  if (ua) return ua.split(" ")[0].split("/")[0] as PackageManager; // 'pnpm/8.x', 'bun/1.x', 'npm/10.x', 'yarn/1.x'
  const exec = (process.env.npm_execpath || "").toLowerCase();
  const name = basename(exec);
  if (name.includes("pnpm")) return "pnpm";
  if (name.includes("yarn")) return "yarn";
  if (name.includes("bun")) return "bun";
  if (name.includes("npm")) return "npm";
  if (name.includes("deno")) return "deno";
}

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun" | "deno";

/**
 * Detects the package manager being used in the current project from lock files
 */
export function detectPackageManagerFromLockFiles(): PackageManager | undefined {
  const cwd = process.cwd();

  if (existsSync(join(cwd, "bun.lockb"))) {
    return "bun";
  }

  if (
    existsSync(join(cwd, "deno.json")) ||
    existsSync(join(cwd, "deno.jsonc"))
  ) {
    return "deno";
  }

  if (existsSync(join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (existsSync(join(cwd, "yarn.lock"))) {
    return "yarn";
  }

  if (existsSync(join(cwd, "package-lock.json"))) {
    return "npm";
  }
}


/**
 * Detects the package manager being used in the current project
 */
export function detectPackageManager(): PackageManager {
  const fromUserAgent = detectPackageManagerFromUserAgent();
  if (fromUserAgent) return fromUserAgent;

  const fromLockFiles = detectPackageManagerFromLockFiles();
  if (fromLockFiles) return fromLockFiles;

  return "npm";
}

/**
 * Returns the appropriate runtime for the given package manager
 */
export function getRuntime(packageManager: PackageManager): string {
  switch (packageManager) {
    case "bun":
      return "bun";
    case "deno":
      return "deno run";
    default:
      return "node";
  }
}
