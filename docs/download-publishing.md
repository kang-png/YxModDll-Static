# x64 下载分发

用户确认的顺序：阿里云轻量服务器 → 多吉云 → 七牛云（HTTP）→ 阿里 OSS → GitHub 原始文件及其代理镜像。

## 地址和发布

- 主源：`https://download.mc1.top/x64`，北京轻量服务器 `39.96.15.149`，套餐 `swas.s.c2m2s40b1.linux`，200 Mbps 峰值、无固定流量。
- 多吉云：`https://cdn.mc1.top/x64`，回源到主源，Host 为 `download.mc1.top`。
- 七牛云：`http://cdn2.mc1.top/x64`，保持 HTTP 免费线路，回源到主源 HTTP，Host 为 `download.mc1.top`。
- 阿里 OSS 和 GitHub 路径继续保留，供旧更新器使用和失败回退；x32/master 发布命名空间不变。

只需沿用 x64 手动发布工作流。构建任务继续发布 Static / OSS / GitHub；新增 `publish-download` 任务从构建工件调用 `tools/x64/publish-download.py`，最后 QQ 任务从轻量服务器取包。CDN 按请求自动回源，无需对象存储上传 API。

仓库 Secrets 为 `DOWNLOAD_SSH_KEY` 和 `DOWNLOAD_SSH_KNOWN_HOSTS`。私钥仅用于专用 `yxmod-publish` 账户，SSH 强制执行 `/usr/local/lib/yxmod-download/download-receiver.py`，禁用交互和端口转发；不使用 root 发布密钥。

服务器内容在 `/srv/yxmod-download`。接收端在非公开目录解包和核验所有文件，保留按版本/哈希命名的历史对象，最后原子切换 `public/x64`。校验失败不会切换已发布清单。

## HTTP 与缓存

七牛云启用 HTTPS 后会失去原 HTTP 免费 CDN 额度，因此按用户确认保持 HTTP。七牛只传安装器、DLL 和组件；客户端从阿里 OSS 的 HTTPS 清单读取预期大小/哈希，校验成功才安装。HTTP 镜像不能提供其自身的可信清单。

主源对清单返回 `Cache-Control: no-store`，固定名称安装包返回 `no-cache`，带版本/哈希的文件返回一年 immutable 缓存。多吉云已为这四个固定名称文件配置不缓存，带版本/哈希的文件继续缓存。七牛缓存模式设为遵循源站，避免旧清单或固定名称旧安装包滞留。七牛 HTTP 链接从 HTTPS 网页下载 EXE/ZIP 时，部分浏览器可能阻止不安全下载；自动更新器按可信清单校验下载不受网页混合内容策略影响。

## 证书

`download.mc1.top` 使用服务器上的 Certbot webroot 证书和现有 Nginx 续期 reload 钩子。

多吉云 `cdn.mc1.top` 已上传独立 RSA 2048 证书，2027-01-23 到期。用户选择不开启平台的证书无忧增值服务；到期前需将新证书和私钥再次上传并绑定。服务器 Certbot 配置已切换为 webroot，验证文件可经 CDN 到达源站；2026-10-25 staging 续期模拟遇到 CA 网络超时，尚未通过完整续期模拟。服务器证书更新不会自动更新多吉云控制台中的证书。

本地证书：`D:/Documents/ChatGPT/Yxmod/证书/cdn.mc1.top/fullchain.pem` 和 `private.key`。私钥不进入仓库、不通过聊天正文传递。七牛不上传证书、不启用 HTTPS。

## 迁移生效

仅修改源码不会改变已安装客户端的下载顺序。需要后续提交并发布 x64，新版更新器通过现有自更新链更新到玩家机器后才生效。因此继续给 OSS / Static 发布完整兼容文件。
