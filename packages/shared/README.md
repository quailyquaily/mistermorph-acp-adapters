# `@archkk/acp-shared`

这里放两个 adapter 共用的最小公共层：

- ACP `stdio` server 基座
- JSON-RPC 请求分发
- 通用错误类型
- 文本提取和参数规整函数

这个 package 主要给仓库内的 `codex` 和 `claude` 共用。

它只作为 workspace 内部公共层存在，不单独发布，也不承诺独立稳定接口。
