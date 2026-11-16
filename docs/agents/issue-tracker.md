# Issue 跟踪：GitHub

本仓库的 issue 与规格文档以 GitHub issue 形式存在于 fork 仓库 `Tften/1Panel`。所有操作使用 `gh` CLI。

## 约定

- **创建 issue**：`gh issue create --title "..." --body "..."`，多行正文用 heredoc。
- **读取 issue**：`gh issue view <number> --json number,title,body,labels,comments`。
- **列出 issue**：`gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`，按需加 `--label` 与 `--state` 过滤。
- **把 issue 设为父 issue 的子 issue**：`gh issue create --parent <parent> ...`，或事后 `gh issue edit <parent> --add-sub-issue <child>`（`gh` 2.94+）。旧版 `gh`：`gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>`（数据库 id，见下方「阻塞」）。不支持子 issue 时，在子 issue 正文顶部写 `Part of #<parent>`。
- **评论**：`gh issue comment <number> --body "..."`
- **添加 / 移除标签**：`gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **关闭**：`gh issue close <number> --comment "..."`

仓库从 `git remote -v` 推断；在 clone 内运行时 `gh` 会自动识别。

## Pull request 作为分流入口

**外部 PR 视为请求入口：否。**（若本仓库将外部 PR 视为功能请求，改为 `是`；`/triage` 会读取此开关。）

设为 `是` 时，PR 与 issue 走相同的标签与状态，使用对应的 `gh pr` 命令：

- **读取 PR**：`gh pr view <number> --comments`，diff 用 `gh pr diff <number>`。
- **列出待分流的外部 PR**：`gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`。
- **评论 / 标签 / 关闭**：`gh pr comment`、`gh pr edit --add-label` / `--remove-label`、`gh pr close`。

GitHub 的 issue 与 PR 共用一个编号空间，裸 `#42` 可能是两者之一：先 `gh pr view 42`，失败再 `gh issue view 42`。

## 当 skill 说「发布到 issue 跟踪器」

创建一个 GitHub issue。

## 当 skill 说「获取相关工单」

按上方「读取 issue」执行。

## Wayfinder 操作

供 `/wayfinder` 使用。**地图（map）**是单个 issue，子 issue 作为工单。

- **地图**：单个带 `wayfinder:map` 标签的 issue，正文包含 Notes / Decisions-so-far / Fog。`gh issue create --label wayfinder:map`。
- **子工单**：作为地图的 GitHub 子 issue 关联（见「把 issue 设为父 issue 的子 issue」）。子 issue 不可用时，把子项加入地图正文的任务列表，并在子工单正文顶部写 `Part of #<map>`。标签：`wayfinder:<type>`（`research` / `prototype` / `grilling` / `task`）。被认领后，工单指派给主导开发者。
- **阻塞**：GitHub **原生 issue 依赖**，UI 可见的规范表示。加边：`gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`，其中 `<blocker-db-id>` 是阻塞方的数字**数据库 id**（`gh api repos/<owner>/<repo>/issues/<n> --jq .id`，不是 `#number` 也不是 `node_id`）。GitHub 通过 `issue_dependencies_summary.blocked_by` 报告（仅统计开放阻塞，作为实时门禁）。依赖不可用时，退回在子工单正文顶部写 `Blocked by: #<n>, #<n>`。所有阻塞关闭后工单才解除阻塞。
- **前沿查询**：列出地图的开放子项（`gh issue list --state open`，限定地图的子 issue / 任务列表），剔除有开放阻塞（`issue_dependencies_summary.blocked_by > 0`，或 `Blocked by` 行中有开放 issue）或有指派人的；按地图顺序取第一个。
- **认领**：`gh issue edit <n> --add-assignee @me`，作为会话的首次写操作。
- **解决**：`gh issue comment <n> --body "<答案>"`，然后 `gh issue close <n>`，最后把上下文指针（gist + 链接）追加到地图的 Decisions-so-far。
