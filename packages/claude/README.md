# MisterMorph ACP Claude Adapter

This package exposes an ACP `stdio` adapter for Claude Code.

Current shape:

- transport: `stdio`
- ACP methods:
  - `initialize`
  - `authenticate` (no-op)
  - `session/new`
  - `session/set_config_option`
  - `session/prompt`
  - `session/cancel`
- backend: `claude -p --output-format stream-json`

Current limits:

- no session persistence
- no MCP passthrough
- no interactive approval flow
- the adapter does not bridge Claude tool calls back into ACP file or terminal callbacks

Run it directly:

```bash
node ./packages/claude/src/index.mjs
```

Or from the repository root:

```bash
npm run run:claude
```

Example ACP profile:

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

Notes:

- `bare: true` is optional, but it is not safe as a default when you rely on Claude.ai login.
- Claude Code bare mode skips OAuth and keychain reads, so Claude.ai login usually requires `bare: false`.

Optional environment variables:

- `MISTERMORPH_CLAUDE_COMMAND`
  - override backend executable, default `claude`
- `MISTERMORPH_CLAUDE_ARGS`
  - extra backend args, whitespace-split, inserted before print-mode flags

Test:

```bash
npm run test:claude
```
