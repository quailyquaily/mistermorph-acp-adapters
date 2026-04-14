# MisterMorph ACP Adapters

This repository contains ACP adapters extracted from MisterMorph.

It currently publishes two packages:

- `@archkk/acp-codex`
- `@archkk/acp-claude`

## Scope

This repository does three things:

- Provides an ACP `stdio` adapter for Codex
- Provides an ACP `stdio` adapter for Claude Code
- Maintains the small shared code layer used by both adapters

## Requirements

- Node.js `>= 20`
- npm workspace support for local development

## Repository Layout

- `packages/codex`
  - Codex adapter
- `packages/claude`
  - Claude Code adapter
- `packages/shared`
  - Internal shared code used by both adapters
- `tools/build-package.mjs`
  - Build script that bundles shared code into each published package

## Local Development

Run tests:

```bash
npm test
```

Run the source entry points directly:

```bash
node ./packages/codex/src/index.mjs
node ./packages/claude/src/index.mjs
```

Or use the root scripts:

```bash
npm run run:codex
npm run run:claude
```

## Published Packages

Run a package without installing it permanently:

```bash
npx -y @archkk/acp-codex
npx -y @archkk/acp-claude
```

Install both packages globally:

```bash
npm i -g @archkk/acp-codex @archkk/acp-claude
```

The installed command names are:

```bash
archkk-acp-codex
archkk-acp-claude
```

## MisterMorph Integration

If you want to use the published npm packages, an ACP profile can look like this.

Codex:

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

Claude:

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

For local integration work, you can also point MisterMorph at the source entry points in this repository.

Codex:

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

Claude:

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

## Publishing

Only these two packages are published:

- `@archkk/acp-codex`
- `@archkk/acp-claude`

From the repository root, run:

```bash
npm publish --workspace packages/codex --access public
npm publish --workspace packages/claude --access public
```

Each command automatically runs that package's `prepack` script.

`prepack` does two things:

- Generates `dist/`
- Copies the shared code from `packages/shared` into the package output

Because of that, `packages/shared` does not need to be published.

If the current version has already been published, bump the version before publishing again.

## License

Apache-2.0
