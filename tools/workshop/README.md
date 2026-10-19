# 地图表维护

本目录维护 Steam App 477160 的 Levels 地图表。原始脚本与 CSV 来自 116 的
`D:\Desktop\爬人类图`，现由本仓库独立维护，客户端按需下载 `WorkshopMaps/*.tsv`。

`workshop-maps.yml` 放在本仓库默认分支 `main`，每天北京时间 04:23 更新，也可手动运行。
首次推送脚本或分类配置时也会更新。只提交 `WorkshopMaps/`，不发布 Mod、安装包或 QQ 通知，
使用仓库自己的 `GITHUB_TOKEN`，不需要 Steam API Key 或额外推送令牌。
计划任务可能被 GitHub 延迟；以 Actions 的实际完成状态和清单时间为准。

每次完整分页抓取最新 Levels 列表（不再固定前 220 页），合并已有 ID 并每批 50 个更新详情。
Steam 列表页支持新的 `valve-ssr-data` 结构和旧版 HTML；网络/分页/详情响应不完整时直接失败，
不将残缺数据发布为新地图表。失效、私有或已改成非 Levels 的项目会从下一次结果移除。

`categories.json` 分别维护连跳、解谜、躲猫猫、感染、恐怖和听歌识曲的关键词。
匹配标题和完整简介，分类可以重叠；属于这些玩法的地图进入各自的表，不进入普通大小分区。
这是关键词分类，创作者未写玩法或简介误提关键词时可能出现漏分/误分，可调整对应关键词。
玩法表包含所有大小；普通地图按 `[100,300)`、`[300,500)`、`[100,500)`、`[500,+∞)` MB 导出。
这里的 MB 沿用旧表算法，即 1024×1024 字节。

本地只重新分类（不联网）：

```powershell
python -B tools/workshop/update_maps.py
```

完整更新（需要 `requests`）：

```powershell
python -B tools/workshop/update_maps.py --refresh --proxy http://127.0.0.1:7893
python -B -m unittest discover -s tools/workshop -p 'test_*.py' -v
```

CI 不使用本机代理。`workshop_details.csv` 保留完整详情，便于以后调整分类时直接重导。
清单记录生成时间、条目数、分类名称、大小范围和每张表的 SHA-256。
