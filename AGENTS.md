<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Running tools

Do not use `npx`. Every tool this project needs is a devDependency, run through npm scripts:

- `npm run dev` (another port: `npm run dev -- -p <port>`), `npm run build`, `npm test`, `npm run typecheck`, `npm run lint`
- For a tool without a script, use `node_modules/.bin/<tool>` (e.g. `node_modules/.bin/eslint src`)

`npx` downloads and runs a package from the registry when it is not installed locally, which adds overhead and supply-chain risk. If a new tool is needed, add it to `devDependencies` (and a script if it is used often) instead of reaching for `npx`.
