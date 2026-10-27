# 通用渲染改造：当前证据与边界

## 当前状态（2026-10-27）

当前仅保留引擎任务队列调度优化，见 [通用主线程优化](main-thread-optimization.md)。数组并行复制因适用范围较窄已删除，连同对应实现、菜单开关及专用实验测试入口一起清理；任务分片和唤醒数量实验也已删除。历史采样及调查过程保留在下文，其中旧文件路径、“尚未合入”“进行中”等描述均属于当时状态，不能作为当前功能或可执行入口。

无窗口对照保持相机启用，由探针手动绘制到 RenderTexture；实际绘制帧数必须大于零。自动相机负面对照在本版 batchmode 下没有绘制，已拒绝其计时结果。样本结果不能证明多数地图或其他硬件都获益。

## 早期调查记录

目标是改善多张地图的渲染 CPU 开销；上一轮仅针对 `3575850864` 的植被替换不代表通用引擎改造完成。

## 当前实测

2026-10-23，本机 Ryzen 9 5950X / Radeon RX 7700 XT，Unity 2017.4.13f1 x64，加载实际部署的受保护 Mod，植被实验不启用，正常模拟运行。固定地图及视角仅作为故障复现输入，不能代表其他地图。

命令：`pwsh -NoProfile -File tools/performance/test-dense-map.ps1 -WithMod -EngineDiagnosis`

证据：`artifacts/performance/dense-map-default-mod-engine-diagnosis.txt`，运行结束 `DONE`。各阶段预热后采样 8 秒：

| 条件 | 平均帧耗时 ms | P95 ms | 主线程等效逻辑核 | 进程等效逻辑核 |
| --- | ---: | ---: | ---: | ---: |
| 1280×720 正常渲染 | 10.474 | 11.878 | 0.933 | 3.581 |
| 640×360 正常渲染 | 10.893 | 12.569 | 0.925 | 3.972 |
| 临时关闭原有相机，模拟运行 | 1.384 | 2.543 | 0.828 | 2.568 |
| 恢复 1280×720 与相机 | 9.575 | 11.140 | 0.927 | 3.659 |

降低像素数没有改善本轮帧耗时；关闭相机后明显改善，恢复后回到约 10 ms。结合主线程接近占满一个逻辑核，支持优先调查 CPU 渲染链路。首尾存在约 0.9 ms 波动，因此不把差值解释为某个函数的精确耗时，也不把关闭相机后的 FPS 当成优化收益。

关闭相机同时移除了部分场景遍历、剔除、排序、批处理、图形提交、GPU 绘制和依赖相机的回调；不能据此在这些环节之间进一步归因。没有 GPU 帧时长、原生线程调用栈或命令队列轨迹，不能声称“已确认渲染指令积压”。`Sampler.GetNames` 返回 0，当前非开发版 Player 没有开放内部 Unity 采样点。

## 线程与源码

- x64 解决地址空间限制，不会自动并行化主线程逻辑。
- 当前 PlayerSettings 的 `m_MTRendering`、`graphicsJobs`、`gpuSkinning` 已开启；日志记录 threaded device。进程使用多个核，仍然可能受主线程限制。
- Graphics Jobs 路径下 `SystemInfo.graphicsMultiThreaded=False` 不能单独推导整个引擎单线程。之前默认 / jobs 测试约 9–10 ms，强制普通 mt 约 13.8 ms；早期测试相机不完全一致，不能给出严谨的模式收益百分比。
- 本仓库的 `native/` 是启动、代理和 Doorstop 注入代码；现有 Unity 本体是 `UnityPlayer.dll`。没有可直接重编译的 Unity C++ 渲染器源码或完整游戏 Unity 工程。

## 通用改造应满足的条件

先通过原生 CPU / GPU 轨迹区分主线程准备、驱动提交、工作线程同步和 GPU 等待。主线程准备慢时，额外提交线程不会自动消除它的工作；需要减少工作量，或在正确依赖关系下把纯数据准备移交工作线程。

通用渲染替换应按对象能力识别，而非地图 ID：缓存稳定的渲染数据，按网格 / 材质组织批次，分离动态对象及物理依赖，保持 LOD、阴影、材质属性、透明排序与多人可见状态，并处理移动、激活、销毁和场景切换。Unity 对象读取与不支持跨线程的 API 不能直接放进 `Parallel.For`。

完整重写并重编译 Unity 内部剔除、批处理与任务调度，需要对应引擎源码；基于二进制的原生 Hook 或 Mod 渲染替换属于另一条实现路径，必须逐项验证兼容性。本节调查时尚未完成正式通用实现，后续结果见文首链接，不将单图结果外推。

## 主线程改造进行中：原生采样与原型

已从 Unity 官方符号服务器获取匹配的 `UnityPlayer_Win32_x64.pdb`。引擎 SHA-256 为 `149e42435f9ee37d8bdc0e40a12a8d30c6818468e2d6925c736ed87ebeda6a97`，PDB GUID / age 为 `E97928E7B73F4D678A7F4F4CD5D0C3EF1`。`TraceHotspots` 使用 Microsoft TraceEvent 解码 WPR CPU 采样，分析开始后的前 8 秒，避免把停止录制时的额外活动混入主要窗口。

`artifacts/performance/main-thread-hotspots.json`：主线程 ID 2480，共 6957 个 CPU 样本，6956 个有调用栈。用户态采样包含 `TreeRenderer::CollectTreeRenderers` 中的大块复制；主线程内核态样本中，3045 个最接近的 Unity 调用帧来自 `JobBatchDispatcher` 或 `JobQueue::ScheduleGroup`。这些是采样归因，不能解释为不带测量开销的精确函数耗时。图形线程存在 `ThreadedStreamBuffer::HandleOutOfBufferToReadFrom`，需要结合完整轨迹继续判断等待关系。

### 原生树木数据复制

`tests/NativeTreeCopyExperiment.cs` 仅在当前进程中替换 `TreeRenderer::CollectTreeRenderers` 的两处 `memcpy` 调用。按引擎哈希及原指令校验，三个工作线程与主线程复制互不重叠的范围，全部完成后返回原引擎。复制长度低于 1 MiB 或地址范围重叠时沿用原函数；不读取 Unity 对象，不改变原始数据、画质或物理状态。关闭时恢复调用指令并加入所有工作线程。尚未合入正式 Mod。

实际游戏 Mono 已通过 0 / 1 / 31 / 4095 字节、阈值前后、约 6 MiB 非整齐长度与非对齐地址检查，同时检查边界哨兵、源数据不变和返回指针。每次运行使用新的游戏进程。

| 地图 | 串行包装平均耗时 ms | 并行平均耗时 ms | 限制 |
| --- | --- | --- | --- |
| 3575850864 | 13.212 / 13.325 | 12.058 / 12.138 | 最大单次复制 4198560 字节，离屏路径改善约 9% |
| 1880991247 | 5.422 / 5.428 | 5.387 / 5.402 | 实际复制字节为 0，不能声称有收益 |

两图均完成恢复及工作线程回收并记录 `DONE`。这些数据来自无窗口离屏相机渲染，不能与前面的正常窗口帧耗时混用；第二图证明该专项没有通用收益保证。

### 原生绘制任务粒度

`tests/NativeJobGranularityExperiment.cs` 对照原生范围划分函数 `CalculateJobCountWithMinIndicesPerJobMaxWorkerThreads` 的最大任务数。静态调用点来自 `ExecuteDrawShadowsCommand` 与 `PrepareDrawRenderersCommand`。原函数将范围拆成不多于 16 个任务；实验对照上限 8、4、恢复 16、再测 8。实际引擎工作线程数量及线程本地存储分配保持原值，每次修改和恢复后回读验证。后续采样未发现稳定收益，未采用该修改；正式启动队列调整是独立方案。

### 测试不占用前台

用户要求后台工作期间不抢鼠标。脚本默认 `-batchmode`，实际进程命令行已验证包含该参数，`MainWindowHandle=0`。相机手动渲染到 `RenderTexture`，探针每帧解除鼠标锁定。正常窗口测试必须显式 `-Interactive` 且仅在用户允许时运行。此前首轮无窗口诊断存在相机自动与手动双重绘制的可能，已关闭手动目标相机的自动渲染；原生复制表使用修正后的单独离屏路径。

参考：[Unity 性能定位说明](https://unity.com/how-to/best-practices-for-profiling-game-performance)、[Unity 2017.4 Player Settings](https://docs.unity3d.com/2017.4/Documentation/Manual/class-PlayerSettingsStandalone.html)。
