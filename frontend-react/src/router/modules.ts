import type { AppRoute } from './types';

export const app_storeRouter: AppRoute = {
    sort: 2,
    path: '/apps',
    name: 'App-Menu',
    redirect: '/apps/all',
    meta: { title: 'menu.apps', icon: 'p-appstore' },
    children: [
        { path: '/apps', name: 'App', meta: { permission: 'app_view' } },
        { path: 'all', name: 'AppAll', hidden: true, props: true, meta: { title: 'app.all', permission: 'app_view', activeMenu: '/apps' } },
        { path: 'installed', name: 'AppInstalled', hidden: true, props: true, meta: { title: 'app.installed', permission: 'app_view', activeMenu: '/apps' } },
        { path: 'upgrade', name: 'AppUpgrade', hidden: true, props: true, meta: { title: 'app.canUpgrade', permission: 'app_view', activeMenu: '/apps' } },
        { path: 'setting', name: 'AppStoreSetting', hidden: true, props: true, meta: { title: 'commons.button.set', permission: 'app_view', activeMenu: '/apps' } },
    ],
};

export const aiRouter: AppRoute = {
    sort: 3,
    path: '/ai',
    name: 'AI-Menu',
    redirect: '/ai/model-services',
    meta: { title: 'menu.aiTools', icon: 'p-jiqiren2' },
    children: [
        { path: '/ai/gpu/groups', name: 'GPUGroups', hidden: true, meta: { title: 'website.groupSetting', permission: 'ai_gpu_view', activeMenu: '/ai/gpu/current' } },
        { path: '/ai/gpu/current', name: 'GPU', meta: { title: 'aiTools.gpu.gpu', icon: 'p-gpu-menu', permission: 'ai_gpu_view', activeMenu: '/ai/gpu/current' } },
        { path: '/ai/ollama', name: 'OllamaModels', meta: { title: 'aiTools.model.ollamaManagement', icon: 'p-moxing-menu', permission: 'ai_model_view' } },
        { path: '/ai/model-services', name: 'ModelServices', meta: { title: 'aiTools.model.services', icon: 'p-moxing-menu', permission: 'ai_model_view', activeMenu: '/ai/model-services' } },
        { path: '/ai/agents/agent', name: 'Agents', meta: { title: 'aiTools.agents.agent', icon: 'p-jiqiren2', permission: 'ai_agent_view' } },
        { path: '/ai/mcp', name: 'MCPServer', meta: { title: 'menu.mcp', icon: 'p-mcp-menu' } },
        { path: '/ai/mcp/server', name: 'MCPServerList', hidden: true, meta: { title: 'panelMCP.servicesTitle', permission: 'ai_mcp_view', activeMenu: '/ai/mcp' } },
        { path: '/ai/mcp/1panel', name: 'PanelMCP', hidden: true, meta: { title: 'panelMCP.accessTitle', permission: 'mcp_access_view', activeMenu: '/ai/mcp' } },
        { path: '/ai/gpu/history', name: 'GPUHistory', hidden: true, meta: { title: 'aiTools.gpu.history', permission: 'ai_gpu_view', activeMenu: '/ai/gpu/current' } },
    ],
};

export const websiteRouter: AppRoute = {
    sort: 4,
    path: '/websites',
    name: 'Website-Menu',
    redirect: '/websites',
    meta: { title: 'menu.website', icon: 'p-website' },
    children: [
        { path: '/websites', name: 'Website', meta: { title: 'menu.website', icon: 'p-website', permission: 'website_view' } },
        { path: '/websites/:id/config/:tab', name: 'WebsiteConfig', hidden: true, props: true, meta: { permission: 'website_view', activeMenu: '/websites', ignoreTab: 'true' } },
        { path: '/websites/ssl', name: 'SSL', meta: { title: 'menu.ssl', icon: 'p-ssl-menu', permission: 'website_cert_view' } },
        { path: '/websites/ssl/ca', name: 'SSL-CA', hidden: true, meta: { title: 'menu.ssl', permission: 'website_cert_view', activeMenu: '/websites/ssl', detail: 'ssl.selfSigned' } },
        { path: '/websites/ssl/acme-account', name: 'SSL-ACME', hidden: true, meta: { title: 'menu.ssl', permission: 'website_cert_view', activeMenu: '/websites/ssl', detail: 'website.acmeAccountManage' } },
        { path: '/websites/ssl/dns-account', name: 'SSL-DNS', hidden: true, meta: { title: 'menu.ssl', permission: 'website_cert_view', activeMenu: '/websites/ssl', detail: 'website.dnsAccountManage' } },
        { path: '/websites/templates', name: 'WebsiteTemplate', meta: { title: 'menu.template', icon: 'p-file-html', permission: 'website_view' } },
        { path: '/websites/runtimes/php', name: 'PHP', meta: { title: 'menu.runtime', icon: 'p-run-menu', permission: 'website_runtime_view', activeMenu: '/websites/runtimes/php', detail: 'PHP' } },
        { path: '/websites/runtimes/node', name: 'node', hidden: true, meta: { title: 'menu.runtime', permission: 'website_runtime_view', activeMenu: '/websites/runtimes/php', detail: 'Node' } },
        { path: '/websites/runtimes/java', name: 'java', hidden: true, meta: { title: 'menu.runtime', permission: 'website_runtime_view', activeMenu: '/websites/runtimes/php', detail: 'Java' } },
        { path: '/websites/runtimes/go', name: 'go', hidden: true, meta: { title: 'menu.runtime', permission: 'website_runtime_view', activeMenu: '/websites/runtimes/php', detail: 'Go' } },
        { path: '/websites/runtimes/python', name: 'python', hidden: true, meta: { title: 'menu.runtime', permission: 'website_runtime_view', activeMenu: '/websites/runtimes/php', detail: 'Python' } },
        { path: '/websites/runtimes/dotnet', name: 'dotNet', hidden: true, meta: { title: 'menu.runtime', permission: 'website_runtime_view', activeMenu: '/websites/runtimes/php', detail: '.Net' } },
    ],
};

export const databaseRouter: AppRoute = {
    sort: 5,
    path: '/databases',
    name: 'Database-Menu',
    redirect: '/databases/mysql',
    meta: { title: 'menu.database', icon: 'p-database' },
    children: [
        { path: '/databases', name: 'Database', meta: {  } },
        { path: 'mysql', name: 'MySQL', hidden: true, meta: { title: 'MySQL', permission: 'database_view', activeMenu: '/databases' } },
        { path: 'mysql/setting/:type/:database', name: 'MySQL-Setting', hidden: true, props: true, meta: { permission: 'database_view', activeMenu: '/databases', ignoreTab: 'true' } },
        { path: 'mysql/remote', name: 'MySQL-Remote', hidden: true, meta: { title: 'MySQL', permission: 'database_view', activeMenu: '/databases', detail: 'database.remote' } },
        { path: 'postgresql', name: 'PostgreSQL', hidden: true, meta: { title: 'PostgreSQL', permission: 'database_view', activeMenu: '/databases' } },
        { path: 'postgresql/remote', name: 'PostgreSQL-Remote', hidden: true, meta: { title: 'PostgreSQL', permission: 'database_view', activeMenu: '/databases', detail: 'database.remote' } },
        { path: 'postgresql/setting/:type/:database', name: 'PostgreSQL-Setting', hidden: true, props: true, meta: { permission: 'database_view', activeMenu: '/databases', ignoreTab: 'true' } },
        { path: 'redis', name: 'Redis', hidden: true, meta: { title: 'Redis', permission: 'database_view', activeMenu: '/databases' } },
        { path: 'redis/remote', name: 'Redis-Remote', hidden: true, meta: { title: 'Redis', permission: 'database_view', activeMenu: '/databases', detail: 'database.remote' } },
        { path: 'mongodb', name: 'MongoDB', hidden: true, meta: { title: 'MongoDB', permission: 'database_view', activeMenu: '/databases' } },
        { path: 'mongodb/remote', name: 'MongoDB-Remote', hidden: true, meta: { title: 'MongoDB', permission: 'database_view', activeMenu: '/databases', detail: 'database.remote' } },
    ],
};

export const containerRouter: AppRoute = {
    sort: 6,
    path: '/containers',
    name: 'Container-Menu',
    redirect: '/containers/container',
    meta: { title: 'menu.container', icon: 'p-docker1' },
    children: [
        { path: '/containers', name: 'Container', meta: {  } },
        { path: 'dashboard', name: 'ContainerDashboard', hidden: true, props: true, meta: { title: 'menu.home', permission: 'container_view', activeMenu: '/containers' } },
        { path: 'container', name: 'ContainerItem', hidden: true, props: true, meta: { title: 'menu.container', permission: 'container_view', activeMenu: '/containers' } },
        { path: 'container/operate', name: 'ContainerCreate', hidden: true, props: true, meta: { permission: 'container_view', activeMenu: '/containers', ignoreTab: 'true' } },
        { path: 'image', name: 'Image', hidden: true, meta: { title: 'container.image', permission: 'container_view', activeMenu: '/containers' } },
        { path: 'network', name: 'Network', hidden: true, meta: { title: 'container.network', permission: 'container_view', activeMenu: '/containers' } },
        { path: 'volume', name: 'Volume', hidden: true, meta: { title: 'container.volume', permission: 'container_view', activeMenu: '/containers' } },
        { path: 'repo', name: 'Repo', hidden: true, meta: { title: 'container.repo', permission: 'container_view', activeMenu: '/containers' } },
        { path: 'compose', name: 'Compose', hidden: true, meta: { title: 'container.compose', permission: 'container_view', activeMenu: '/containers' } },
        { path: 'template', name: 'ComposeTemplate', hidden: true, meta: { title: 'container.composeTemplate', permission: 'container_view', activeMenu: '/containers' } },
        { path: 'setting', name: 'ContainerSetting', hidden: true, meta: { title: 'container.setting', permission: 'container_view', activeMenu: '/containers' } },
    ],
};

export const hostRouter: AppRoute = {
    sort: 7,
    path: '/hosts',
    name: 'System-Menu',
    redirect: '/hosts/security',
    meta: { title: 'menu.system', icon: 'p-host' },
    children: [
        { path: '/hosts/files', name: 'File', props: true, meta: { title: 'menu.files', icon: 'p-file-menu', permission: 'host_file_view' } },
        { path: '/hosts/monitor/monitor', name: 'Monitorx', meta: { title: 'menu.monitor', icon: 'p-system-monitor-menu', permission: 'host_monitor_view', activeMenu: '/hosts/monitor/monitor' } },
        { path: '/hosts/monitor/export', name: 'HostMonitorExport', hidden: true, meta: { title: 'menu.monitor', permission: 'host_monitor_view', activeMenu: '/hosts/monitor/monitor', detail: 'commons.button.export' } },
        { path: '/hosts/monitor/setting', name: 'HostMonitorSetting', hidden: true, meta: { title: 'menu.monitor', permission: 'host_monitor_view', activeMenu: '/hosts/monitor/monitor', detail: 'commons.button.set' } },
        { path: '/hosts/firewall/rules', name: 'FirewallPort', meta: { title: 'menu.firewall', icon: 'p-firewalld-menu', permission: 'host_firewall_view', activeMenu: '/hosts/firewall/rules' } },
        { path: '/hosts/firewall/docker', name: 'FirewallDockerGuard', hidden: true, meta: { title: 'firewall.dockerGuard', permission: 'host_firewall_view', activeMenu: '/hosts/firewall/rules' } },
        { path: '/hosts/firewall/forward', name: 'FirewallForward', hidden: true, meta: { title: 'firewall.forwardRule', permission: 'host_firewall_view', activeMenu: '/hosts/firewall/rules' } },
        { path: '/hosts/firewall/setting', name: 'FirewallSetting', hidden: true, meta: { title: 'commons.button.set', permission: 'host_firewall_view', activeMenu: '/hosts/firewall/rules' } },
        { path: '/hosts/disk', name: 'Disk', props: true, meta: { title: 'menu.disk', icon: 'p-disk-menu', permission: 'host_disk_view' } },
        { path: '/hosts/process/process', name: 'Process', meta: { title: 'menu.processManage', icon: 'p-process-menu', permission: 'host_process_view', activeMenu: '/hosts/process/process', detail: 'menu.process' } },
        { path: '/hosts/process/network', name: 'ProcessNetwork', hidden: true, meta: { title: 'menu.network', permission: 'host_process_view', activeMenu: '/hosts/process/process' } },
        { path: '/hosts/ssh/ssh', name: 'SSH', meta: { title: 'menu.ssh', icon: 'p-ssh-menu', permission: 'host_ssh_view', activeMenu: '/hosts/ssh/ssh', detail: 'menu.config' } },
        { path: '/hosts/ssh/log', name: 'SSHLog', hidden: true, meta: { title: 'ssh.loginLogs', permission: 'host_ssh_view', activeMenu: '/hosts/ssh/ssh' } },
        { path: '/hosts/ssh/session', name: 'SSHSession', hidden: true, meta: { title: 'ssh.session', permission: 'host_ssh_view', activeMenu: '/hosts/ssh/ssh' } },
    ],
};

export const terminalRouter: AppRoute = {
    sort: 8,
    path: '/terminal',
    name: 'Terminal-Menu',
    redirect: '/terminal',
    meta: { title: 'menu.terminal', icon: 'p-terminal2' },
    children: [
        { path: '/terminal', name: 'Terminal', props: true, meta: { protectedRoleOnly: 'true' } },
    ],
};

export const cronjobRouter: AppRoute = {
    sort: 9,
    path: '/cronjobs',
    name: 'Cronjob-Menu',
    redirect: '/cronjobs/cronjob',
    meta: { title: 'menu.cronjob', icon: 'p-plan' },
    children: [
        { path: '/cronjobs', name: 'Cronjob', meta: {  } },
        { path: 'cronjob', name: 'CronjobItem', hidden: true, meta: { title: 'menu.cronjob', permission: 'cronjob_view', activeMenu: '/cronjobs' } },
        { path: 'cronjob/operate', name: 'CronjobOperate', hidden: true, meta: { permission: 'cronjob_view', activeMenu: '/cronjobs', ignoreTab: 'true' } },
        { path: 'library', name: 'Library', hidden: true, meta: { title: 'cronjob.library.library', permission: 'cronjob_view', activeMenu: '/cronjobs' } },
    ],
};

export const toolboxRouter: AppRoute = {
    sort: 9,
    path: '/toolbox',
    name: 'Toolbox-Menu',
    redirect: '/toolbox/supervisor',
    meta: { title: 'menu.toolbox', icon: 'p-toolbox' },
    children: [
        { path: '/toolbox', name: 'Toolbox', meta: {  } },
        { path: 'device', name: 'Device', hidden: true, meta: { title: 'toolbox.device.toolbox', permission: 'toolbox_view', activeMenu: '/toolbox' } },
        { path: 'supervisor', name: 'Supervisor', hidden: true, meta: { title: 'menu.supervisor', permission: 'toolbox_view', activeMenu: '/toolbox' } },
        { path: 'clam', name: 'Clam', hidden: true, meta: { title: 'toolbox.clam.clam', permission: 'toolbox_view', activeMenu: '/toolbox' } },
        { path: 'clam/setting', name: 'Clam-Setting', hidden: true, meta: { permission: 'toolbox_view', activeMenu: '/toolbox', ignoreTab: 'true' } },
        { path: 'ftp', name: 'FTP', hidden: true, meta: { title: 'FTP', permission: 'toolbox_view', activeMenu: '/toolbox' } },
        { path: 'fail2ban', name: 'Fail2ban', hidden: true, meta: { title: 'Fail2Ban', permission: 'toolbox_view', activeMenu: '/toolbox' } },
        { path: 'clean', name: 'Clean', hidden: true, meta: { title: 'setting.diskClean', permission: 'toolbox_view', activeMenu: '/toolbox' } },
    ],
};

export const logRouter: AppRoute = {
    sort: 11,
    path: '/logs',
    name: 'Log-Menu',
    redirect: '/logs/operation',
    meta: { title: 'menu.logs', icon: 'p-log' },
    children: [
        { path: '/logs', name: 'Log', meta: {  } },
        { path: 'operation', name: 'OperationLog', hidden: true, meta: { title: 'logs.operation', permission: 'log_view', activeMenu: '/logs' } },
        { path: 'login', name: 'LoginLog', hidden: true, meta: { title: 'logs.login', permission: 'log_view', activeMenu: '/logs' } },
        { path: 'website', name: 'WebsiteLog', hidden: true, meta: { title: 'logs.websiteLog', permission: 'log_view', activeMenu: '/logs' } },
        { path: 'system', name: 'SystemLog', hidden: true, meta: { title: 'logs.system', permission: 'log_view', activeMenu: '/logs' } },
        { path: 'host', name: 'HostSystemLog', hidden: true, meta: { title: 'logs.hostSystem', permission: 'log_view', activeMenu: '/logs' } },
        { path: 'ssh', name: 'SSHLog2', hidden: true, meta: { title: 'ssh.loginLogs', permission: 'log_view', activeMenu: '/logs' } },
        { path: 'task', name: 'Task', hidden: true, meta: { title: 'logs.task', permission: 'log_view', activeMenu: '/logs' } },
    ],
};

export const settingRouter: AppRoute = {
    sort: 12,
    path: '/settings',
    name: 'Setting-Menu',
    meta: { title: 'menu.settings', icon: 'p-config' },
    children: [
        { path: '/settings', name: 'Setting', meta: {  } },
        { path: 'apikeys', name: 'APIKeys', hidden: true, meta: { title: 'apiKeyManagement.title', activeMenu: '/settings' } },
        { path: 'panel', name: 'Panel', hidden: true, meta: { title: 'setting.panel', adminOnly: 'true', activeMenu: '/settings' } },
        { path: 'alert', name: 'Alert', hidden: true, meta: { title: 'xpack.alert.alertNotice', permission: 'alert_view', activeMenu: '/settings' } },
        { path: 'backupaccount', name: 'BackupAccount', hidden: true, meta: { title: 'setting.backupAccount', permission: 'backup_view', activeMenu: '/settings' } },
        { path: 'license', name: 'License', hidden: true, meta: { title: 'setting.license', adminOnly: 'true', activeMenu: '/settings' } },
        { path: 'about', name: 'About', hidden: true, meta: { title: 'setting.about', adminOnly: 'true', activeMenu: '/settings' } },
        { path: 'safe', name: 'Safe', hidden: true, meta: { title: 'setting.safe', adminOnly: 'true', activeMenu: '/settings' } },
        { path: 'snapshot', name: 'Snapshot', hidden: true, meta: { title: 'setting.snapshot', adminOnly: 'true', activeMenu: '/settings' } },
        { path: 'expired', name: 'Expired', hidden: true, meta: { activeMenu: '/settings', ignoreTab: 'true' } },
    ],
};

export const errorRouter: AppRoute = {
    sort: undefined,
    path: '/error',
    name: '404',
    meta: { title: 'commons.msg.notFound', icon: 'undefined' },
    children: [
        { path: '404', name: '404', hidden: true, meta: { title: 'commons.msg.notFound' } },
    ],
};

export const vmRouter: AppRoute = {
    sort: undefined,
    path: '/vm',
    name: 'VirtualMachine',
    redirect: '/vm/overview',
    meta: { title: 'xpack.vm.vm', icon: 'p-xuniji' },
    children: [
    ],
};

export const modules = [app_storeRouter, aiRouter, websiteRouter, databaseRouter, containerRouter, hostRouter, terminalRouter, cronjobRouter, toolboxRouter, logRouter, settingRouter, errorRouter, vmRouter];
