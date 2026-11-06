# YxModDll-Static

官网 [yxmod.cc](https://yxmod.cc/) 的页面、下载入口和历史版本列表统一在本仓库 `docs/` 维护。
`YxModDll` 源码仓库只发布 DLL 和安装包，不再同步官网文件。

修改 `docs/` 后，Pages 工作流自动生成历史版本清单、更新根目录兼容副本并部署；发布 x64 或 32 位 DLL 也会自动触发同一流程。
清单来自本仓库的 DLL 提交历史。历史页面内置清单，支持直接打开本地文件；联网时自动检查更新，下载支持直连、镜像选择和文件校验。

本地检查：

```powershell
python -B .github/scripts/build-version-history.py
python -B .github/scripts/check-site.py
```
