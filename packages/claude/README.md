# `@archkk/acp-claude`

This package provides an ACP `stdio` adapter for Claude Code.

The adapter talks to the local Claude Code CLI in print mode and exposes the ACP methods needed by MisterMorph.

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

- `claude -p --output-format stream-json`

## Current Limits

- No session persistence
- No MCP passthrough
- No interactive approval UI
- Claude tool calls are not bridged back into ACP file or terminal callbacks

## Requirements

- Node.js `>= 20`
- A working `claude` CLI in `PATH`, unless you override it with `MISTERMORPH_CLAUDE_COMMAND`

## Usage

Run without installing permanently:

```bash
npx -y @archkk/acp-claude
```

Install globally:

```bash
npm i -g @archkk/acp-claude
archkk-acp-claude
```

Run from the repository source:

```bash
node ./packages/claude/src/index.mjs
```

Or from the repository root:

```bash
npm run run:claude
```

## ACP Profile Example

Using `npx`:

```yaml
acp:
  agents:
    - name: "claude"
      command: "npx"
      args: ["-y", "@archkk/acp-claude"]
      env: {}
      cwd: "."
      read_roots: ["."]
      write_roots: ["."]
      session_options:
        permission_mode: "dontAsk"
        allowed_tools: ["Read", "Edit", "Write", "Bash", "Glob", "Grep"]
```

Using the repository source:

```yaml
acp:
  agents:
    - name: "claude"
      command: "node"
      args: ["./packages/claude/src/index.mjs"]
      env: {}
      cwd: "."
      read_roots: ["."]
      write_roots: ["."]
      session_options:
        permission_mode: "dontAsk"
        allowed_tools: ["Read", "Edit", "Write", "Bash", "Glob", "Grep"]
```

## Notes

- `bare: true` is optional
- `bare: false` is the safer default when you rely on Claude.ai login
- Claude Code bare mode skips OAuth and keychain reads

## Environment Variables

- `MISTERMORPH_CLAUDE_COMMAND`
  - Overrides the backend executable. Default: `claude`
- `MISTERMORPH_CLAUDE_ARGS`
  - Extra backend args. They are split on whitespace and inserted before the print-mode flags

## Development

Run the package test from this directory:

```bash
npm test
```

Or from the repository root:

```bash
npm run test:claude
```

## Publishing

Publish from the repository root:

```bash
npm publish --workspace packages/claude --access public
```

The package `prepack` step builds `dist/` and bundles the shared workspace code into the published output.
