# 1Panel v2 二次开发资料

基于上游 `dev-v2` 分支源码逆向整理的开发文档，覆盖架构、后端、前端、构建与二开实战。

> 说明：上游无公开开发文档，本目录所有内容均从代码归纳，引用形如 `core/server/server.go:40`，可直接跳转验证。

## 目录

| 文档 | 内容 |
| :--- | :--- |
| [01-architecture.md](01-architecture.md) | 总体架构：双进程模型、目录总览、技术栈 |
| [02-backend.md](02-backend.md) | 后端开发：启动链路、分层约定、依赖装配、典型模块走读 |
| [03-request-lifecycle.md](03-request-lifecycle.md) | 请求生命周期：core 中间件链、core→agent 代理、认证体系 |
| [04-database.md](04-database.md) | 数据库：SQLite 多库、GORM 约定、gormigrate 迁移、迁移编写步骤 |
| [05-cross-cutting.md](05-cross-cutting.md) | 横切机制：错误码（buserr+i18n）、操作日志、日志、i18n、任务系统、定时任务 |
| [06-frontend.md](06-frontend.md) | 前端开发：目录结构、API 层、路由与守卫、状态、i18n、组件 |
| [07-build.md](07-build.md) | 构建与部署：Makefile、前端构建产物嵌入、运行模式、配置文件 |
| [08-dev-guide.md](08-dev-guide.md) | 二开实战：新增一个完整功能模块的端到端步骤清单、xpack 机制、同步上游 |

## 阅读路径建议

- **先看全局**：01 → 03（理解请求怎么流转，二开大部分工作都在这条链路上加东西）
- **做后端功能**：02 → 04 → 05
- **做前端功能**：06
- **动手前必读**：08（端到端步骤 + 注意事项）
