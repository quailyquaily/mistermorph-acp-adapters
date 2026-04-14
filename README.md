# MisterMorph ACP Adapters

这个目录先作为 ACP adapter 迁出准备区。

当前只做三件事：

- 固定新的仓库边界
- 先分出 `shared` / `codex` / `claude` 三个 package
- 给后续代码迁移留出明确入口

## 目标边界

- `packages/shared`
  - 放 ACP `stdio` server 基座
  - 放 JSON-RPC 公共处理
  - 放通用的文本提取、参数校验、会话辅助函数
- `packages/codex`
  - 放 Codex backend 的 ACP adapter
  - 只关心 Codex 协议映射和会话逻辑
- `packages/claude`
  - 放 Claude backend 的 ACP adapter
  - 只关心 Claude 协议映射和会话逻辑

不包含 `cursor`。

原因很简单：Cursor CLI 自己就能直接跑 `agent acp`，不需要再保留一层透明 proxy。

## 当前状态

- `shared` / `codex` / `claude` 代码已经从主仓复制到这里
- 主仓后续只保留 ACP client 和回调边界
- 这里暂时还是本地迁移目录，不做发布

## 建议迁移顺序

1. 先把 `shared` 的公共层抽过来。
2. 再迁 `codex`。
3. 最后迁 `claude`。

这样做的原因很简单：先把公共层固定住，后面两个 adapter 才不会各自带一份重复代码。
