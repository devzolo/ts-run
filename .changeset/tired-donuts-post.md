---
"@devzolo/ts-run": minor
---

Migrated the package to native ESM (TypeScript ESNext output, .js import specifiers, runtime compatibility helpers) to ensure Bun/Deno support. The CLI now auto-detects decorators in TS sources, switches to tsx when available, and shows package-manager-specific install guidance when decorators require transpilation.
