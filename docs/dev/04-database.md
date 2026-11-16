# 04 · 数据库与迁移

## 多库布局

SQLite（glebarez 纯 Go 驱动），文件位于 `<install_dir>/1panel/db/`：

| 连接变量 | 文件 | 归属 | 内容 |
| :--- | :--- | :--- | :--- |
| core `global.DB` | `core.db` | core | setting、用户、日志、API key、MCP、脚本库 |
| core `global.AgentDB` | `agent.db` | core | 节点列表（企业版） |
| core `global.TaskDB` | `task.db` | core | 任务记录 |
| core `global.AlertDB` | `alert.db` | core | 告警 |
| agent `global.DB` | `agent.db` | agent | 业务主库：网站、容器、应用、数据库、SSL、监控… |
| agent `global.TaskDB` | `task.db` | agent | agent 任务 |
| agent `global.AlertDB` | `alert.db` | agent | 告警配置/日志 |

core 侧初始化见 `core/init/db/db.go:10`；agent 侧见 `agent/init/db/db.go`。**同一台机器上 core 与 agent 的 db 目录相同但连接独立**。

## GORM 约定

- Model 定义在 `*/app/model/`，公共字段用嵌入结构（`ID/CreatedAt/UpdatedAt`，软删除按需加 `DeletedAt gorm.DeletedAt`，如 `core/cmd/server/cmd/root.go:30` 的 setting 示例）
- 表名默认复数（GORM 惯例），无需 `TableName()`（个别除外）
- 查询条件用 **函数式选项**：`repo.WithByName("xx")` 等，repo 方法签名 `List(opts ...global.DBOption)`（`core/app/repo/setting.go:22`）
- setting 表是 **KV 结构**（key/value），读走 go-cache 5 分钟 TTL（`core/app/repo/setting.go:17`）——**高频配置读它，别自己建表**
- 敏感值（SSL 私钥、代理密码等）入库前经 `utils/encrypt` AES 加密

## 迁移机制（gormigrate）

两端迁移入口：`core/init/migration/migrate.go`、`agent/init/migration/migrate.go`。

结构（以 agent 为例，`agent/init/migration/migrate.go:15`）：

```go
func Init() {
    InitAgentDB()   // global.DB，100+ 个迁移
    InitTaskDB()    // global.TaskDB
    InitAlertDB()   // global.AlertDB（带事务选项）
}
```

每个迁移是一个 `*gormigrate.Migration{ID, Migrate, Rollback}`，集中登记在 `agentDBMigrations()` 切片（`agent/init/migration/migrate.go:22`）。迁移文件在 `*/init/migration/migrations/`，一域一文件（如 `vm.go`、`firewall_whitelist.go`），包内提供 `init.go` 汇总变量。

gormigrate 在 DB 里维护 `migrations` 表记录已执行 ID，**仅追加、不可重排**——上游每次发版都往列表尾部加新迁移。

## 新增迁移的步骤（二开场景）

例：给 agent 的 `websites` 表加一列。

1. **改 model**：`agent/app/model/website.go` 加字段（`gorm:"column:xxx"`）
2. **建迁移**：在 `agent/init/migration/migrations/` 新建文件：

```go
package migrations

import (
    "github.com/1Panel-dev/1Panel/agent/global"
    "github.com/go-gormigrate/gormigrate/v2"
    "gorm.io/gorm"
)

var AddWebsiteRemarkColumn = &gormigrate.Migration{
    ID: "20261116-add-website-remark-column",
    Migrate: func(tx *gorm.DB) error {
        type Website struct{ Remark string }
        return tx.Migrator().AddColumn(&Website{}, "Remark")
    },
    Rollback: func(tx *gorm.DB) error {
        type Website struct{ Remark string }
        return tx.Migrator().DropColumn(&Website{}, "Remark")
    },
}
```

3. **登记**：在 `agentDBMigrations()` 切片**末尾**追加 `migrations.AddWebsiteRemarkColumn`（core 侧同理加到 `coreMigrations()`）

规则：

- **ID 必须全局唯一**（惯例：日期前缀 + 动作描述）
- 新表直接在迁移里 `tx.AutoMigrate(&model.Xxx{})`，同时**别忘**在 AddTable 初始迁移之外，新域建表也可参考 `migrations/AddTaskTable` 的写法
- 改既有数据需要数据搬迁时（如 `NormalizeFirewallBackendSelections`），在 Migrate 回调里逐条 `Save`
- **与上游同步的冲突规避**：上游每版都会往同一切片追加迁移。二开迁移命名加自有前缀（如 `SD20261116-xxx`，SD=secondary development），并集中放在自己新增的 `migrations/sd_*.go` 文件里，同步合并时冲突最小（详见 08-dev-guide.md）
