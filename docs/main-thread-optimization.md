# 通用主线程优化

已实现并部署到本机 64 位游戏。两项优化默认开启，生产代码不按地图 ID、物体名称或材质筛选。原 Unity DLL 保持不变，原生修改只存在于当前游戏进程中。未提交 Git、未发布到更新服务器。

## 实际改动

1. **引擎任务队列。** 在 Unity 初始化前设置工作线程数量，让构造器按该数量创建线程及配套存储。超过 9 个逻辑核时使用 8 个任务工作线程；较小的 CPU 保留原配置。本机原来创建 31 个任务工作线程，减少过量唤醒和切换后，主线程更快完成一帧。没有在运行途中修改线程数量字段。
2. **大型渲染数组并行复制。** 当前引擎 `TreeRenderer::CollectTreeRenderers` 的两个复制调用按实际字节量处理。遇到至少 1 MiB 的数据后，按需创建最多 3 个复制工作线程，主线程也参与复制，并等待全部范围完成后继续原引擎流程。小数据及重叠地址沿用原函数，没有大数据的地图不创建复制工作线程。
3. **模块验证移到后台。** 模块枚举和 SHA-256 校验使用后台任务，每个进程验证一次，切图和重新启用时复用结果。后台不读取 Unity 对象。

没有减少物体、改变 LOD、阴影、材质、分辨率或物理步长。复制的是每次调用传入的新数据，不缓存场景矩阵，因此物体移动、激活和地图变化仍由原游戏决定。关闭功能、离开地图和组件销毁时恢复原生调用点并回收复制工作线程。

## 当前验证结果

本机 Ryzen 9 5950X（32 逻辑核）、Radeon RX 7700 XT，Unity 2017.4.13f1 x64。采用 1280×720 离屏相机绘制，关闭测试帧率上限及垂直同步，物理和脚本继续运行。相机保持启用，视角固定；后两图的相机位置及旋转保存为 `camera-rig-<id>.txt` 并跨运行复用。

| 地图 | 地图 MeshRenderer / Rigidbody | 原配置平均帧耗时 | 优化后平均帧耗时 | 帧耗时减少 |
| --- | --- | ---: | ---: | ---: |
| 《云漫蓝海时》3575850864 | 57768 / 274 | 14.573 ms | 6.875 ms | 52.8% |
| 《小短腿跑酷—森林的早晨》1880991247 | 818 / 0 | 5.436 ms | 3.555 ms | 34.6% |
| 《地之险测试版》1781627395 | 1019 / 51 | 3.142 ms | 1.952 ms | 37.9% |

原配置是同一版启动组件和受保护 Mod，关闭调度优化、恢复原来的 31 个任务线程，禁用新的复制功能；每图预热 30 秒后做两段 8 秒采样。表中原配置按样本帧数加权。优化列使用两项默认功能均开启后的采样。后两图实际没有大块复制数据，收益来自通用任务队列调整。

第一图在同一进程中只开启任务队列优化时为 8.578 ms，启用并行复制后为 6.875 ms，再关闭复制后为 8.568 ms。实际观察到单次 4198560 字节的原生复制；没有把纯逻辑运行或没有绘制的帧当成提帧证据。

以上是**本机离屏帧耗时**，不等于已验证的桌面显示 FPS。用户在前台工作期间，所有后续测试使用 `-batchmode`，进程 `MainWindowHandle=0`，不接收鼠标键盘输入。探针每帧释放鼠标；默认不会启动交互式窗口。正常屏幕显示、完整通关、多人与其他 CPU/GPU 尚未实测，不能把三个样本的百分比推广到所有机器及地图。

## 构建、正确性及回退

- 完整 `Release /t:Build` 执行 Reactor，使用实际受保护产物进入游戏测试。
- 复制检查覆盖零长度、短长度、1 MiB 阈值两侧、约 6 MiB 非整齐长度、非对齐地址、边界哨兵、源数据不变及返回指针；验证实际引擎调用经过受保护的原生回调。
- 验证启用、关闭、再次启用、退出地图、返回菜单、在同一进程载入另一张地图；原调用指令恢复、复制线程回收、后台模块验证次数仍为 1。
- 原生启动测试覆盖 x86 拦截、x64 正常启动、自更新、组件更新、未知引擎拒绝补丁，以及无窗口模式下启动失败直接退出而不弹对话框。
- 部署后独立验证默认设置自动生效，没有通过探针手动开启功能；记录游戏自然退出结果及部署文件哈希。

仅接受 Unity DLL SHA-256：`149e42435f9ee37d8bdc0e40a12a8d30c6818468e2d6925c736ed87ebeda6a97`，同时核对原指令。未知引擎沿用原路径。

本机部署文件：

| 文件 | SHA-256 |
| --- | --- |
| `YxModDll-x64.dll` | `6F294F86EF98CCF6802917777F5C0A4365F4BFA4E016FF4D155B1D03E908E9DA` |
| `YXWIN64.dll` | `7DB39CC428819780F81D2D97CD20F63587A850C88D6AFA6AAB72CF7822492DD1` |

游戏设置中的“渲染调度优化（重启生效）”可恢复原任务线程配置，保存到游戏目录的 `YxModEngine.ini`；“多线程渲染数据准备”可立即关闭复制功能。两者均默认开启。地图专用植被实验及其开关已删除，当前仅保留通用优化。

完整文件回退副本位于 `artifacts/performance/YxModDll-before-main-thread.dll` 和 `YXWIN64-before-main-thread.dll`；关闭游戏后可恢复对应的两个游戏文件。部署前后的哈希记录在 `main-thread-deployment.json`。

## 复现与证据

```powershell
# 关闭调度优化的原配置对照；保存并恢复已有配置文件。
pwsh -NoProfile -File tools/performance/test-dense-map.ps1 -WithMod -EngineDiagnosis -TunedBootstrap -OriginalScheduler -ProductDll YxModDll/bin/Release/YxModDll-x64.dll

# 实际保护版本：后台校验、并行复制、开关、切图及回收。
pwsh -NoProfile -File tools/performance/test-dense-map.ps1 -WithMod -EngineDiagnosis -TunedBootstrap -NativeProduct -ProductDll YxModDll/bin/Release/YxModDll-x64.dll

# 其他两图使用同样命令追加 -MapId 1880991247 或 -MapId 1781627395。

# 检查已部署文件的默认启用与自然退出。
pwsh -NoProfile -File tools/performance/test-dense-map.ps1 -WithMod -EngineDiagnosis -NativeDefaults
python tools/performance/summarize-main-thread.py --require-deployed
```

原始采样日志、固定相机数据、部署哈希、原生启动测试及汇总 JSON 保存在 `artifacts/performance/`、`artifacts/x64/native-tests.json`。汇总工具拒绝缺少 `DONE`、包含 `FAIL`、线程数量不符或绘制帧数为零的结果。

主要实现位于 `native/engine_jobs.c`、`YxModDll/Mod/EngineScheduling.cs`、`YxModDll/Mod/NativeEngineCopies.cs` 和 `YxModDll/Mod/ParallelRenderPreparation.cs`。早期调查及未采用的方案见 `render-threading-investigation.md`；单独修改分片上限或唤醒数量的实验没有稳定收益，没有加入正式功能。
