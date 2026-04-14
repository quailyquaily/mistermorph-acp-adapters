# MisterMorph ACP Adapters

这个仓库放 MisterMorph 拆出来的 ACP adapter。

当前范围很小：

- `packages/shared`
  - ACP `stdio` server 基座
  - JSON-RPC 公共处理
  - 通用文本提取、参数校验、会话辅助函数
- `packages/codex`
  - Codex backend 的 ACP adapter
- `packages/claude`
  - Claude backend 的 ACP adapter

这里不包含 `cursor`。

原因很直接：Cursor CLI 自己就能直接跑 `agent acp`，不需要额外 proxy。

## 快速使用

先跑测试：

```bash
npm test
```

直接启动 Codex adapter：

```bash
node ./packages/codex/src/index.mjs
```

直接启动 Claude adapter：

```bash
node ./packages/claude/src/index.mjs
```

## 发布

发布到 npm 的包是：

- `@archkk/acp-codex`
- `@archkk/acp-claude`

在仓库根目录执行：

```bash
npm publish --workspace packages/codex --access public
npm publish --workspace packages/claude --access public
```

这两个命令会自动触发各自 package 的 `prepack`，把共享代码打进发布产物，不需要手工先跑 build。

如果当前版本已经发布过，先改版本号，再执行发布。

## 在 MisterMorph 里接入

如果这个仓库和 MisterMorph 分开放，MisterMorph 里的 ACP profile 直接指向这里的入口文件。

Codex 示例：

```yaml
acp:
  agents:
    - name: "codex"
      command: "node"
      args: ["<path-to-mistermorph-acp-adapters>/packages/codex/src/index.mjs"]
      env: {}
      cwd: "."
      read_roots: ["."]
      write_roots: ["."]
      session_options:
        approval_policy: "never"
```

Claude 示例：

```yaml
acp:
  agents:
    - name: "claude"
      command: "node"
      args: ["<path-to-mistermorph-acp-adapters>/packages/claude/src/index.mjs"]
      env: {}
      cwd: "."
      read_roots: ["."]
      write_roots: ["."]
      session_options:
        permission_mode: "dontAsk"
        allowed_tools: ["Read", "Edit", "Write", "Bash", "Glob", "Grep"]
```

## 目录结构

- `packages/shared`
  - 共享实现
- `packages/codex`
  - Codex adapter
- `packages/claude`
  - Claude adapter

## 现在不做的事

- 不包含 MCP passthrough
- 不做 session 持久化
- 不做交互式 approval UI

## 许可

仓库沿用 Apache-2.0。
