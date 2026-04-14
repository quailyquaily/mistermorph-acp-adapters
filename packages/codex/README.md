# MisterMorph ACP Codex Adapter

This package exposes an ACP `stdio` adapter for Codex.

Current shape:

- transport: `stdio`
- ACP methods:
  - `initialize`
  - `authenticate` (no-op)
  - `session/new`
  - `session/set_config_option`
  - `session/prompt`
  - `session/cancel`
- backend: `codex app-server`

Current limits:

- no session persistence
- no MCP passthrough
- no interactive approval flow
- default `approval_policy` is `never`

Run it directly:

```bash
node ./packages/codex/src/index.mjs
```

Or from the repository root:

```bash
npm run run:codex
```

Example ACP profile:

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

Optional environment variables:

- `MISTERMORPH_CODEX_COMMAND`
  - override backend executable, default `codex`
- `MISTERMORPH_CODEX_ARGS`
  - extra backend args, whitespace-split, appended after `app-server`
- `MISTERMORPH_CODEX_AUTO_APPROVE`
  - when set to `1`, auto-accept Codex command/file approval requests for the session

Test:

```bash
npm run test:codex
```
