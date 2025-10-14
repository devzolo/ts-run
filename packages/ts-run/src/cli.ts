#!/usr/bin/env node

import { execSync } from "node:child_process";
import { detectPackageManager, getRuntime } from "./detector";

function showHelp() {
	console.log(
		"ts-run - Execute code with the runtime relative to your package manager\n",
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
		"  --env <file>              Load environment file (auto-converted per runtime)",
	);
	console.log(
		"  --env-file <file>         Load environment file (auto-converted per runtime)\n",
	);
	console.log(
		"Note: --env and --env-file are automatically converted to the correct format:",
	);
	console.log("  - Deno: --env=<file>");
	console.log("  - Node/Bun: --env-file <file>");
	console.log("\nAutomatic TypeScript support:");
	console.log(
		"  - Node.js: Automatically adds --experimental-transform-types for .ts files",
	);
	console.log("  - Bun/Deno: Native TypeScript support");
}

function showVersion() {
	const packageJson = require("../package.json");
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
 * Builds Node.js specific flags
 */
function getNodeFlags(targetFile: string | null): string {
	const flags: string[] = [];

	// Add --experimental-transform-types for TypeScript files
	if (targetFile && isTypeScriptFile(targetFile)) {
		flags.push("--experimental-transform-types");
		flags.push("--no-warnings");
	}

	return flags.join(" ");
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

		// Add Node.js specific flags (like --experimental-transform-types for TS)
		if (
			packageManager === "npm" ||
			packageManager === "yarn" ||
			packageManager === "pnpm"
		) {
			const nodeFlags = getNodeFlags(targetFile);
			if (nodeFlags) {
				command += ` ${nodeFlags}`;
			}
		}

		// Add env file if present
		if (envFile) {
			command += ` ${formatEnvArg(envFile, packageManager)}`;
		}

		// Add remaining arguments (script and its args)
		command += ` ${remainingArgs.join(" ")}`;

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
