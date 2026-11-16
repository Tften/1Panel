# 1Panel 二次开发约定

本仓库是 [1Panel-dev/1Panel](https://github.com/1Panel-dev/1Panel) 的 fork，用于二次开发。

## 分支模型

| 分支 | 用途 |
| :--- | :--- |
| `dev-v2` | **仅用于同步上游仓库**（`https://github.com/1Panel-dev/1Panel.git`），**不允许直接修改**，所有提交必须来自上游 |
| `dev` | **二次开发的主分支**，基于 `dev-v2` 创建；功能分支自此切出、完成后合回 |

同步上游：

```bash
git switch dev-v2
git fetch upstream
git merge --ff-only upstream/dev-v2   # 仅允许快进，保证历史与上游一致
git switch dev
git merge dev-v2                      # 上游变更并入二开主分支
```

Git 管理规范（分支流程、Commit Message、风险分级）参考 `git-workflow` skill。

## 仓库结构

- `core/`：管理端后端（Go）
- `agent/`：被管节点后端（Go）
- `frontend/`：Web 前端（Vue 3 + TypeScript + Vite）

## Agent skills

### Issue tracker

Issues 跟踪于 fork 仓库 `Tften/1Panel` 的 GitHub Issues（使用 `gh` CLI）。见 `docs/agents/issue-tracker.md`。

### Triage labels

沿用五个默认 triage 标签（`needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`）。见 `docs/agents/triage-labels.md`。

### Domain docs

单一上下文布局（根目录 `GLOSSARY.md` + `docs/adr/`）。见 `docs/agents/domain.md`。
