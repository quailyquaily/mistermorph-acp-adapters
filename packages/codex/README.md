# `@archkk/acp-codex`

This package provides an ACP `stdio` adapter for Codex.

The adapter talks to the local `codex app-server` backend and exposes the ACP methods needed by MisterMorph.

## Scope

Current transport:

- `stdio`

Current ACP methods:

- `initialize`
- `authenticate` as a no-op
- `session/new`
- `session/set_config_option`
- `session/prompt`
- `session/cancel`

Backend:

- `codex app-server`

## Current Limits

- No session persistence
- No MCP passthrough
- No interactive approval UI
- Default `approval_policy` is `never`

## Requirements

- Node.js `>= 20`
- A working `codex` CLI in `PATH`, unless you override it with `MISTERMORPH_CODEX_COMMAND`

## Usage

Run without installing permanently:

```bash
npx -y @archkk/acp-codex
```

Install globally:

```bash
npm i -g @archkk/acp-codex
archkk-acp-codex
```

Run from the repository source:

```bash
node ./packages/codex/src/index.mjs
```

Or from the repository root:

```bash
npm run run:codex
```

## ACP Profile Example

Using `npx`:

```yaml
acp:
  agents:
    - name: "codex"
      command: "npx"
      args: ["-y", "@archkk/acp-codex"]
      env: {}
      cwd: "."
      read_roots: ["."]
      write_roots: ["."]
      session_options:
        approval_policy: "never"
```

Using the repository source:

```yaml
acp:
  agents:
    - name: "codex"
      command: "node"
      args: ["./packages/codex/src/index.mjs"]
      env: {}
      cwd: "."
      read_roots: ["."]
      write_roots: ["."]
      session_options:
        approval_policy: "never"
```

## Environment Variables

- `MISTERMORPH_CODEX_COMMAND`
  - Overrides the backend executable. Default: `codex`
- `MISTERMORPH_CODEX_ARGS`
  - Extra backend args. They are split on whitespace and appended after `app-server`
- `MISTERMORPH_CODEX_AUTO_APPROVE`
  - When set to `1`, auto-accepts Codex command and file approval requests for the session

## Development

Run the package test from this directory:

```bash
npm test
```

Or from the repository root:

```bash
npm run test:codex
```

## Publishing

Publish from the repository root:

```bash
npm publish --workspace packages/codex --access public
```

The package `prepack` step builds `dist/` and bundles the shared workspace code into the published output.
