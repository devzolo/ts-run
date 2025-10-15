#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { detectPackageManager } from "./detector";

function showHelp() {
	console.log(
		"ts-task - Execute package.json scripts with the appropriate package manager\n",
	);
	console.log("Usage: ts-task [options] [script-name] [arguments...]\n");
	console.log("Examples:");
	console.log("  ts-task                    # List available scripts");
	console.log("  ts-task build              # Run the 'build' script");
	console.log("  ts-task dev --port 3000    # Run 'dev' with arguments\n");
	console.log("Supported package managers:");
	console.log("  npm   → npm run <script>");
	console.log("  yarn  → yarn run <script>");
	console.log("  pnpm  → pnpm run <script>");
	console.log("  bun   → bun run <script>");
	console.log("  deno  → deno task <script>\n");
	console.log("Options:");
	console.log("  -h, --help       Show this help message");
	console.log("  -v, --version    Show version number");
	console.log("  -l, --list       List all available scripts\n");
}

function showVersion() {
	const packageJsonPath = join(__dirname, "..", "package.json");
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
	console.log(`ts-task v${packageJson.version}`);
}

/**
 * Reads scripts from package.json
 */
function getPackageScripts(): Record<string, string> | null {
	const cwd = process.cwd();
	const packageJsonPath = join(cwd, "package.json");

	if (!existsSync(packageJsonPath)) {
		return null;
	}

	try {
		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
		return packageJson.scripts || {};
	} catch {
		return null;
	}
}

/**
 * Lists all available scripts
 */
function listScripts() {
	const scripts = getPackageScripts();

	if (!scripts || Object.keys(scripts).length === 0) {
		console.log("No scripts found in package.json");
		return;
	}

	console.log("Available scripts:\n");

	const maxLength = Math.max(...Object.keys(scripts).map((s) => s.length));

	for (const [name, command] of Object.entries(scripts)) {
		console.log(`  ${name.padEnd(maxLength)}  ${command}`);
	}
	console.log();
}

/**
 * Gets the run command for the package manager
 */
function getRunCommand(packageManager: string): string {
	switch (packageManager) {
		case "deno":
			return "deno task";
		case "npm":
		case "yarn":
		case "pnpm":
		case "bun":
			return `${packageManager} run`;
		default:
			return "npm run";
	}
}

function main() {
	const args = process.argv.slice(2);

	// Show help if no arguments or help flag
	if (args.length === 0) {
		listScripts();
		process.exit(0);
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

	if (firstArg === "-l" || firstArg === "--list") {
		listScripts();
		process.exit(0);
	}

	try {
		const packageManager = detectPackageManager();
		const scripts = getPackageScripts();

		if (!scripts) {
			console.error("Error: No package.json found in current directory");
			process.exit(1);
		}

		const scriptName = firstArg;
		const scriptArgs = args.slice(1);

		// Check if script exists
		if (!scripts[scriptName]) {
			console.error(`Error: Script "${scriptName}" not found in package.json`);
			console.log("\nAvailable scripts:");
			for (const name of Object.keys(scripts)) {
				console.log(`  - ${name}`);
			}
			process.exit(1);
		}

		// Build command
		const runCommand = getRunCommand(packageManager);
		const command = `${runCommand} ${scriptName}${scriptArgs.length > 0 ? ` ${scriptArgs.join(" ")}` : ""}`;

		// Execute the command
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

