# 主机联机线程改造

2026-10-23，针对本机 x64 游戏实现，保留原版联机协议。未发布、未提交 Git。

## 找到的原因与改动

- 原 Mod 的 `Patcher_NetTransportSteam.StartThread` 无条件把 `NetGame.multithreading` 设为 `false`，且 `ReadPackets` 无视原先的后台参数，两个通道均直接调用 `OnData`。现在恢复原版线程设置，使用独立的 `YxSteamReceive` 收取字节缓冲区和整理普通分片。
- 原版主机本来就有状态差分线程，默认两个。这次保留原版的客户端分配及 `NetScope.NotifyClients` 编码器，将其 5 ms 轮询改为有任务才唤醒的队列，退出改为停止接收任务、等待当前任务完成、释放待处理数据，去掉该路径的 `Thread.Abort`。
- 原版每次按网络对象 ID 查找同步域都遍历 `NetScope.all`。现在建立索引，在启用、禁用、动态 ID 变更及玩家生成后失效重建，保持重复 ID 时取第一个对象的语义。
- 同步域成员变更和场景对象销毁前，主线程先等待差分读取结束。从大厅退出、从关卡直接离房、网络整体销毁、创建房间失败及取消创建均回收工作线程；实际地图测试发现关卡内离房不走 `StopServer`，已补齐这条清理路径。

默认主机使用 **1 个收包线程和原有的 2 个差分线程**；继续尊重原版 `serverThreads` / `clientThreads` 设置，包括关闭线程的设置。没有另加协议、握手要求或客户端插件依赖。

## 数据与执行边界

后台收包线程只操作字节数组和分片状态。`OnData`、聊天、踢人、输入应用和 Unity 对象更新在主线程执行，避免直接恢复原版后台通道后把 Mod 的 Unity 回调一起搬到工作线程。两个通道保持各自消息的接收顺序，主线程处理帧开始时已有的批次。

接收队列在 4096 个包或约 16 MiB 待处理载荷处施加背压，等待主线程消费；不因队列满而主动丢可靠消息。单个入队包可以跨过字节门槛。差分队列沿用原版过载丢弃阈值，每个入队快照均保留引用，并在完成或取消时释放。

原版消息 ID、网络版本、状态差分、ACK、帧号、容器、可靠通道、物理步长均未更改。物理模拟、抓取、角色控制和地图脚本仍遵守原游戏主线程依赖。本次没有将任意 Unity API 直接放到工作线程。

## 已验证内容

使用完整 Release 构建并经过 Reactor 保护的实际 DLL，在 Unity 2017.4.13f1 x64 / 游戏 Mono 中验证：

- 原版同步编码与后台队列编码对照，覆盖初始全状态、ACK 后的差分和连续帧。使用原版 `NetStream` / `NetFloat.AddDelta` 解码，每一帧重建状态一致；有效报文位逐位相同。原版缓冲池中的对齐位、尾部未使用位不保证清零，比较排除了这些无语义填充位。
- 两个差分线程均实际执行；关闭线程的同步路径也通过同样编码对照。
- 交错发送者及两个通道的分片数据互不混合；后台收到 ACK 后不修改游戏状态，主线程消费后原版 ACK 解码器得到正确帧号，且只派发一次。
- 接收队列满载、背压中的关闭、回调中断线、创建失败/取消、队列残留缓冲区释放均通过。
- 网络对象索引覆盖启用、禁用、销毁、动态 ID 变更及稳定索引复用。
- 创建两轮真实 Steam 私密主机房间，未邀请其他人。首轮进入地图 `1880991247`，为 8 个模拟客户端处理约 2900 个实际地图快照任务，随后从关卡直接离房；第二轮从大厅退出。每次均检查收包与差分线程已回收。
- 全程 `-batchmode`，实际进程 `MainWindowHandle=0`；游戏自然退出，退出码 0，无强制终止。

模拟客户端的发送路径仅在探针中截获，不向虚构 Steam ID 发送数据。测试临时修改的线程设置、房间人数和 `LastLobby` 恢复，测试 DLL 与标记在结束后清理，部署文件用 SHA-256 核对。

这证明了本机线程路径与协议编码的兼容性，**尚未完成另一台原版客户端的真实加入、抓取互动、掉线重连及长时间多人游玩验收**。不能把模拟客户端视为实际玩家，也没有足够证据给出联机 FPS 提升百分比。串行编码与后台提交的计时用于证明工作已离开主线程；旧版主机原本已有两个编码线程，不能把该对照当成升级前后的整体加速比。

## 复现、产物与回退

```powershell
# 先完成项目 Release /t:Build，保留 Reactor。
pwsh -NoProfile -File tools/performance/test-host-network.ps1
python tools/performance/summarize-host-network.py
```

证据在 `artifacts/performance/host-network-game.txt`、`host-network-inputs.json`、`host-network-exit.json` 及 `host-network-results.json`。本机部署记录在 `host-network-deployment.json`，回退副本为 `YxModDll-before-host-network.dll`。关闭游戏后将回退副本覆盖游戏目录的 `YxModDll-x64.dll` 即可回到上一版渲染优化版本。

本轮 Mod SHA-256：`45C89276A54B85D1B6AE64E579EEA5A163DB0DD3A5F81448D923FE6FCEC62C04`。本轮未改 Unity DLL、`Assembly-CSharp.dll` 或原生启动组件。

实现入口：`YxModDll/Patches/Patcher_NetTransportSteam.cs`、`YxModDll/Mod/NetworkReceiveWorker.cs`、`YxModDll/Mod/HostNetworkScheduling.cs`。上一轮渲染优化及其当时版本的计时记录见 [通用主线程优化](main-thread-optimization.md)。

## 2026-10-23 多实体分项与队列通知修复

新增默认关闭的编码/入队/同步等待计时与峰值队列记录。队列非空时不再对每个完成任务唤醒全部空闲等待者；入队使用 `PulseAll`，因为同一个条件变量还有 `WaitIdle` 等待者，单一 `Pulse` 可能只唤醒等待空闲者而遗漏工作线程。实际 Mono 的 500 轮并发入队与等待测试通过，原版协议有效位、ACK 和退出回收测试仍通过。

探针现在创建真实 `NetPlayer`、加入 `NetGame.players`、执行 `StartNetwork` 与 `Respawn`，结束时移除并销毁；模拟连接的所有发送仍被截获。相机以 1280×720 RenderTexture 显式绘制。`-PeerCount 8|16|24` 可选择额外实体数，`-CaptureCpuTrace` 在实体创建完成后启动 WPR，采样完成后停止。

8 个额外实体（155 刚体，10 scopes）连续 8 秒：1753 次相机绘制共 5336.49 ms；4560 次 Collect 共 56.78 ms；4104 次 Human.FixedUpdate 共 99.02 ms；两个后台差分队列累计 276.28 ms，主线程入队 7.48 ms，峰值各 39，无丢弃。证据保存于 `artifacts/performance/host-network-8-game.txt`、对应 inputs/exit JSON。游戏无窗口、自然退出 0。

这里的 Human.FixedUpdate **仅是托管角色控制耗时，不包含原生 PhysX 求解器**；相机时长也不等于 GPU 时长。角色为本机模拟对象，没有真实远程输入和网络抖动，没有主动抓取脚本。这些数据不能用来承诺真人人数上限或前台 FPS。当前轻图场景渲染占比明显高于采集，暂无证据支持将 Unity 状态读取强行移到后台。

24 个额外实体稳态补测（30 秒相机预热，持续模拟走动/转向/伸手和松手，随后 8 秒采样）：427 刚体、26 scopes；986 次绘制共 4193.31 ms；Collect 12480 次共 195.98 ms；Human.FixedUpdate 12000 次共 679.35 ms；后台编码合计 3045.71 ms，主线程入队 15.75 ms，299520 个任务，无丢弃、异常，退出 0。证据为 `host-network-24-steady-*`。本轮开启 WPR，且期间有短时符号解析工具活动，绝对时间不可当无干扰基准或与前轮直接算收益比。

该稳态 ETL 的 500–6500 ms 窗口主线程 5514 个 CPU 样本，1202 个栈包含物理（21.8%，inclusive 采样归因，不是墙钟耗时）；`CompletionTask::ProcessAllPhysicsTasks` 642、`PhysxJobFunc` 419、`PhysicsManager::ProcessContacts` 203。多个原生工作线程亦运行 PhysX。未预热窗口中曾出现大量皮肤烘焙转换，故不可拿该窗口判断稳态物理占比。

匹配 PDB 与二进制检查显示 `PhysxJobDispatcher::getWorkerCount` (RVA 0x594e90) 返回 `JobSystem::GetJobQueueThreadCount()+1`，`submitTask` (0x5968f0) 调用 `ScheduleJobInternal(PhysxJobFunc, task, 1)` 后 `ClearFenceWithoutSync`；即原生物理任务已经异步派发。主线程完成栅栏执行剩余任务不等于游戏物理完全单线程。尚未对这条原生派发路径做补丁，须先验证参数及任务依赖，不能删除完成栅栏或后台调用 Unity Physics API。

进一步反汇编沿 `ScheduleJobInternal` (0x4a4450) → `JobQueue::ScheduleJob` (0x4a54c0) → `JobQueue::ScheduleGroup` (0x4a5390) 确认：参数 1 走可执行任务栈 `AtomicStack::PushAll` (0x5402b0)，随后 `CappedSemaphore::Signal` (0x4a57b0) 唤醒工作线程。这不是积攒到帧末才 flush 的延迟提交路径；额外唤醒或更改参数没有证据支持，改参数还会改变 group/依赖队列语义。本轮保留原生物理语义，不加入没有正确性和收益证据的 hook。已实施并验证的是网络队列通知正确性及减少无效空闲唤醒；不将其宣称为已测得的整体 FPS 提升。

最终候选验证：8 个额外角色，30 秒持续输入预热、8 秒稳态，未开 WPR，旁路 CPU/GPU 工具暂停。38400 编码任务对应旧实现必定执行 38400 次完成通知；新实测只执行 480+481=961 次（减少 97.5% 的完成通知调用，**不是 FPS 提升百分比**）。入队仍 PulseAll 保证 worker/WaitIdle 混合等待者可前进。500 轮并发 WaitIdle/入队、有效协议位、ACK、无窗口和退出回收全部通过，游戏自然退出 0。

该轮 1794 次离屏绘制累计 5540.99 ms，Collect 68.84 ms，Human.FixedUpdate 224.81 ms，后台差分 376.48 ms，入队 8.57 ms，无丢弃。证据 `host-network-8-steady-final-{game.txt,inputs.json,exit.json}`；候选经过完整 Release + Reactor，SHA-256 `DFD5E2B8CC5FD407BAB41B865F842A763639EC12D046EC5E451C73FDF741792E`，此处仅为候选测试记录，未部署。测试后自动恢复游戏原 DLL。本轮生成的两个可再生 ETLX 缓存已删除，保留 ETL 和 JSON 报告。
