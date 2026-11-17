# 前端模块功能对照清单（初版）

来源：旧前端路由元数据自动生成；未迁移表示尚未在 React 前端实现与验收，不表示当前工单范围缺失。后续每个迁移工单需将对应项更新为已迁移并附验证证据。

## ai（sort 3，根 /ai）

- [ ] GPUGroups | `/ai/gpu/groups` | website.groupSetting | 权限 ai_gpu_view | 隐藏 | 模块 ai | 未迁移
- [ ] GPU | `/ai/gpu/current` | aiTools.gpu.gpu | 权限 ai_gpu_view | 模块 ai | 未迁移
- [ ] OllamaModels | `/ai/ollama` | aiTools.model.ollamaManagement | 权限 ai_model_view | 模块 ai | 未迁移
- [ ] ModelServices | `/ai/model-services` | aiTools.model.services | 权限 ai_model_view | 模块 ai | 未迁移
- [ ] Agents | `/ai/agents/agent` | aiTools.agents.agent | 权限 ai_agent_view | 模块 ai | 未迁移
- [ ] MCPServer | `/ai/mcp` | menu.mcp | 权限 无 | 模块 ai | 未迁移
- [ ] MCPServerList | `/ai/mcp/server` | panelMCP.servicesTitle | 权限 ai_mcp_view | 隐藏 | 模块 ai | 未迁移
- [ ] PanelMCP | `/ai/mcp/1panel` | panelMCP.accessTitle | 权限 mcp_access_view | 隐藏 | 模块 ai | 未迁移
- [ ] GPUHistory | `/ai/gpu/history` | aiTools.gpu.history | 权限 ai_gpu_view | 隐藏 | 模块 ai | 未迁移

## app-store（sort 2，根 /apps）

- [ ] App | `/apps` | - | 权限 app_view | 模块 app-store | 未迁移
- [ ] AppAll | `all` | app.all | 权限 app_view | 隐藏 | 模块 app-store | 未迁移
- [ ] AppInstalled | `installed` | app.installed | 权限 app_view | 隐藏 | 模块 app-store | 未迁移
- [ ] AppUpgrade | `upgrade` | app.canUpgrade | 权限 app_view | 隐藏 | 模块 app-store | 未迁移
- [ ] AppStoreSetting | `setting` | commons.button.set | 权限 app_view | 隐藏 | 模块 app-store | 未迁移

## container（sort 6，根 /containers）

- [ ] Container | `/containers` | - | 权限 无 | 模块 container | 未迁移
- [ ] ContainerDashboard | `dashboard` | menu.home | 权限 container_view | 隐藏 | 模块 container | 未迁移
- [ ] ContainerItem | `container` | menu.container | 权限 container_view | 隐藏 | 模块 container | 未迁移
- [ ] ContainerCreate | `container/operate` | - | 权限 container_view | 隐藏，ignoreTab | 模块 container | 未迁移
- [ ] Image | `image` | container.image | 权限 container_view | 隐藏 | 模块 container | 未迁移
- [ ] Network | `network` | container.network | 权限 container_view | 隐藏 | 模块 container | 未迁移
- [ ] Volume | `volume` | container.volume | 权限 container_view | 隐藏 | 模块 container | 未迁移
- [ ] Repo | `repo` | container.repo | 权限 container_view | 隐藏 | 模块 container | 未迁移
- [ ] Compose | `compose` | container.compose | 权限 container_view | 隐藏 | 模块 container | 未迁移
- [ ] ComposeTemplate | `template` | container.composeTemplate | 权限 container_view | 隐藏 | 模块 container | 未迁移
- [ ] ContainerSetting | `setting` | container.setting | 权限 container_view | 隐藏 | 模块 container | 未迁移

## cronjob（sort 9，根 /cronjobs）

- [ ] Cronjob | `/cronjobs` | - | 权限 无 | 模块 cronjob | 未迁移
- [ ] CronjobItem | `cronjob` | menu.cronjob | 权限 cronjob_view | 隐藏 | 模块 cronjob | 未迁移
- [ ] CronjobOperate | `cronjob/operate` | - | 权限 cronjob_view | 隐藏，ignoreTab | 模块 cronjob | 未迁移
- [ ] Library | `library` | cronjob.library.library | 权限 cronjob_view | 隐藏 | 模块 cronjob | 未迁移

## database（sort 5，根 /databases）

- [ ] Database | `/databases` | - | 权限 无 | 模块 database | 未迁移
- [ ] MySQL | `mysql` | MySQL | 权限 database_view | 隐藏 | 模块 database | 未迁移
- [ ] MySQL-Setting | `mysql/setting/:type/:database` | - | 权限 database_view | 隐藏，ignoreTab | 模块 database | 未迁移
- [ ] MySQL-Remote | `mysql/remote` | MySQL | 权限 database_view | 隐藏 | 模块 database | 未迁移
- [ ] PostgreSQL | `postgresql` | PostgreSQL | 权限 database_view | 隐藏 | 模块 database | 未迁移
- [ ] PostgreSQL-Remote | `postgresql/remote` | PostgreSQL | 权限 database_view | 隐藏 | 模块 database | 未迁移
- [ ] PostgreSQL-Setting | `postgresql/setting/:type/:database` | - | 权限 database_view | 隐藏，ignoreTab | 模块 database | 未迁移
- [ ] Redis | `redis` | Redis | 权限 database_view | 隐藏 | 模块 database | 未迁移
- [ ] Redis-Remote | `redis/remote` | Redis | 权限 database_view | 隐藏 | 模块 database | 未迁移
- [ ] MongoDB | `mongodb` | MongoDB | 权限 database_view | 隐藏 | 模块 database | 未迁移
- [ ] MongoDB-Remote | `mongodb/remote` | MongoDB | 权限 database_view | 隐藏 | 模块 database | 未迁移

## error

- [ ] 404 | `404` | commons.msg.notFound | 权限 无 | 隐藏 | 模块 error | 未迁移

## host（sort 7，根 /hosts）

- [ ] File | `/hosts/files` | menu.files | 权限 host_file_view | 模块 host | 未迁移
- [ ] Monitorx | `/hosts/monitor/monitor` | menu.monitor | 权限 host_monitor_view | 模块 host | 未迁移
- [ ] HostMonitorExport | `/hosts/monitor/export` | menu.monitor | 权限 host_monitor_view | 隐藏 | 模块 host | 未迁移
- [ ] HostMonitorSetting | `/hosts/monitor/setting` | menu.monitor | 权限 host_monitor_view | 隐藏 | 模块 host | 未迁移
- [ ] FirewallPort | `/hosts/firewall/rules` | menu.firewall | 权限 host_firewall_view | 模块 host | 未迁移
- [ ] FirewallDockerGuard | `/hosts/firewall/docker` | firewall.dockerGuard | 权限 host_firewall_view | 隐藏 | 模块 host | 未迁移
- [ ] FirewallForward | `/hosts/firewall/forward` | firewall.forwardRule | 权限 host_firewall_view | 隐藏 | 模块 host | 未迁移
- [ ] FirewallSetting | `/hosts/firewall/setting` | commons.button.set | 权限 host_firewall_view | 隐藏 | 模块 host | 未迁移
- [ ] Disk | `/hosts/disk` | menu.disk | 权限 host_disk_view | 模块 host | 未迁移
- [ ] Process | `/hosts/process/process` | menu.processManage | 权限 host_process_view | 模块 host | 未迁移
- [ ] ProcessNetwork | `/hosts/process/network` | menu.network | 权限 host_process_view | 隐藏 | 模块 host | 未迁移
- [ ] SSH | `/hosts/ssh/ssh` | menu.ssh | 权限 host_ssh_view | 模块 host | 未迁移
- [ ] SSHLog | `/hosts/ssh/log` | ssh.loginLogs | 权限 host_ssh_view | 隐藏 | 模块 host | 未迁移
- [ ] SSHSession | `/hosts/ssh/session` | ssh.session | 权限 host_ssh_view | 隐藏 | 模块 host | 未迁移

## log（sort 11，根 /logs）

- [ ] Log | `/logs` | - | 权限 无 | 模块 log | 未迁移
- [ ] OperationLog | `operation` | logs.operation | 权限 log_view | 隐藏 | 模块 log | 未迁移
- [ ] LoginLog | `login` | logs.login | 权限 log_view | 隐藏 | 模块 log | 未迁移
- [ ] WebsiteLog | `website` | logs.websiteLog | 权限 log_view | 隐藏 | 模块 log | 未迁移
- [ ] SystemLog | `system` | logs.system | 权限 log_view | 隐藏 | 模块 log | 未迁移
- [ ] HostSystemLog | `host` | logs.hostSystem | 权限 log_view | 隐藏 | 模块 log | 未迁移
- [ ] SSHLog2 | `ssh` | ssh.loginLogs | 权限 log_view | 隐藏 | 模块 log | 未迁移
- [ ] Task | `task` | logs.task | 权限 log_view | 隐藏 | 模块 log | 未迁移

## setting（sort 12，根 /settings）

- [ ] Setting | `/settings` | - | 权限 无 | 模块 setting | 未迁移
- [ ] APIKeys | `apikeys` | apiKeyManagement.title | 权限 无 | 隐藏 | 模块 setting | 未迁移
- [ ] Panel | `panel` | setting.panel | 权限 无 | 隐藏，adminOnly | 模块 setting | 未迁移
- [ ] Alert | `alert` | xpack.alert.alertNotice | 权限 alert_view | 隐藏 | 模块 setting | 未迁移
- [ ] BackupAccount | `backupaccount` | setting.backupAccount | 权限 backup_view | 隐藏 | 模块 setting | 未迁移
- [ ] License | `license` | setting.license | 权限 无 | 隐藏，adminOnly | 模块 setting | 未迁移
- [ ] About | `about` | setting.about | 权限 无 | 隐藏，adminOnly | 模块 setting | 未迁移
- [ ] Safe | `safe` | setting.safe | 权限 无 | 隐藏，adminOnly | 模块 setting | 未迁移
- [ ] Snapshot | `snapshot` | setting.snapshot | 权限 无 | 隐藏，adminOnly | 模块 setting | 未迁移
- [ ] Expired | `expired` | - | 权限 无 | 隐藏，ignoreTab | 模块 setting | 未迁移

## terminal（sort 8，根 /terminal）

- [ ] Terminal | `/terminal` | - | 权限 无 | protectedRoleOnly | 模块 terminal | 未迁移

## toolbox（sort 9，根 /toolbox）

- [ ] Toolbox | `/toolbox` | - | 权限 无 | 模块 toolbox | 未迁移
- [ ] Device | `device` | toolbox.device.toolbox | 权限 toolbox_view | 隐藏 | 模块 toolbox | 未迁移
- [ ] Supervisor | `supervisor` | menu.supervisor | 权限 toolbox_view | 隐藏 | 模块 toolbox | 未迁移
- [ ] Clam | `clam` | toolbox.clam.clam | 权限 toolbox_view | 隐藏 | 模块 toolbox | 未迁移
- [ ] Clam-Setting | `clam/setting` | - | 权限 toolbox_view | 隐藏，ignoreTab | 模块 toolbox | 未迁移
- [ ] FTP | `ftp` | FTP | 权限 toolbox_view | 隐藏 | 模块 toolbox | 未迁移
- [ ] Fail2ban | `fail2ban` | Fail2Ban | 权限 toolbox_view | 隐藏 | 模块 toolbox | 未迁移
- [ ] Clean | `clean` | setting.diskClean | 权限 toolbox_view | 隐藏 | 模块 toolbox | 未迁移

## vm


## website（sort 4，根 /websites）

- [ ] Website | `/websites` | menu.website | 权限 website_view | 模块 website | 未迁移
- [ ] WebsiteConfig | `/websites/:id/config/:tab` | - | 权限 website_view | 隐藏，ignoreTab | 模块 website | 未迁移
- [ ] SSL | `/websites/ssl` | menu.ssl | 权限 website_cert_view | 模块 website | 未迁移
- [ ] SSL-CA | `/websites/ssl/ca` | menu.ssl | 权限 website_cert_view | 隐藏 | 模块 website | 未迁移
- [ ] SSL-ACME | `/websites/ssl/acme-account` | menu.ssl | 权限 website_cert_view | 隐藏 | 模块 website | 未迁移
- [ ] SSL-DNS | `/websites/ssl/dns-account` | menu.ssl | 权限 website_cert_view | 隐藏 | 模块 website | 未迁移
- [ ] WebsiteTemplate | `/websites/templates` | menu.template | 权限 website_view | 模块 website | 未迁移
- [ ] PHP | `/websites/runtimes/php` | menu.runtime | 权限 website_runtime_view | 模块 website | 未迁移
- [ ] node | `/websites/runtimes/node` | menu.runtime | 权限 website_runtime_view | 隐藏 | 模块 website | 未迁移
- [ ] java | `/websites/runtimes/java` | menu.runtime | 权限 website_runtime_view | 隐藏 | 模块 website | 未迁移
- [ ] go | `/websites/runtimes/go` | menu.runtime | 权限 website_runtime_view | 隐藏 | 模块 website | 未迁移
- [ ] python | `/websites/runtimes/python` | menu.runtime | 权限 website_runtime_view | 隐藏 | 模块 website | 未迁移
- [ ] dotNet | `/websites/runtimes/dotnet` | menu.runtime | 权限 website_runtime_view | 隐藏 | 模块 website | 未迁移

