# 异常碰撞全员重生

自动检测目前暂停：默认关闭，不读取旧的开启状态，设置中的开关已注释，等待稳定复现后再测试。全员控制和个人控制中的手动“重生”按钮保留；自动检测代码独立于安全Force保护和拉丝自动救援。

每 0.25 秒检查一次角色刚体。NaN/Infinity 触发恢复；有限数值情况下，要求至少两人且超过当前可检查玩家的一半，从远处突然跳到原点两米内，头部位置重叠在 15 厘米范围，几乎不动并持续一秒。没有前序位置证据、正常生成、切图、回放和客户端均不据此触发。加载关卡后等待三秒；恢复冷却十五秒。

恢复通过游戏原有 RemoveServerPlayer/AddServerPlayer（客机自身通过 RemoveLocalPlayer/AddLocalPlayer 请求）销毁旧 NetPlayer、Human、Ragdoll 和刚体并创建新身体，不再复用旧身体修补姿态。保留所属 NetHost、localCoopIndex、皮肤；房主广播 RemovePlayer/AddPlayer 及原皮肤数据。创建后的出生位置由游戏原有流程决定，地图及物体不重置。背在目标身上的其他玩家先脱离旧身体，避免随目标一起被销毁。

用户提供的 output_log.txt 中 `Invalid assumption??` 带有 `[Steamworks:RichPresence]` 前缀，伴随正常房间人数变化出现，因此不作为物理故障触发依据。该日志不足以确定可移动物体导致炸房的根因；当前实现是症状恢复，不修复触发故障的地图物体。位置阈值基于所描述的原点堆叠症状，尚需真实炸房现场验证，不能保证覆盖所有有限数值故障。

验证：Release + Reactor 构建；`tools/x64/test-collision-recovery.ps1` 检查检测阈值、请求目标、权限和冷却。`tools/x64/test-body-rebuild-game.ps1` 在真实 Unity Player 中加载混淆产物，验证旧对象销毁、新身体及网络 ID、皮肤和分身编号保留、个人/全员范围及合成远端玩家的对象生命周期。离线合成远端玩家不等同于真实第二客户端同步验收，亦不等同于原始炸房现场验收。

## 2026-10-24：实际序列化路径实验

`tools/x64/probe-collision-serialization.ps1` 在独立进程加载正式游戏的 Mono 和 `Human_Data/Managed/Assembly-CSharp.dll`，直接调用当前实际的 NetFloat、NetVector3、NetQuaternion 和 NetStream；不启动 Unity、Steam 或房间。证据保存在 `artifacts/x64/collision-serialization.txt`。程序集 SHA-256：`388FB75121B2BCEA29FDCCCBC8C17903A5F55AE995E4942A2B9BF9C1AED86CFE`。

实测：NaN 量化为整数 -2147483648，经有限位宽网络写入再读出变为 0，三维位置因此解码为 (0,0,0)；四个分量均为 NaN 的旋转经网络往返后解码为单位四元数 (0,0,0,1)。Infinity 则截到量化边界，并不归零。

同时从当前安装程序集提取的 IL（`artifacts/x64/collision-path-il.txt`）确认：NetBody.CollectState 调用上述量化/写入；ApplyState 读取、解码并调用 ApplyPositionState/ApplyQuaternionState。后者附加 basePos/baseRot 和相对参考变换，因此解码零值不是所有骨骼都落在世界零点，而可能表现为根部回到原点、相对身体部位回到初始相对姿态。这是与所述现象相符的候选机制，尚非该事故的根因证据。

随后在隔离 Unity Player 中加载真实 Ragdoll 和 HumanDefaultBody，按 NetPlayer.SetupBodies 的父子参考规则初始化 NetBody，再把 NaN 经当前 NetVector3/NetQuaternion/NetStream 实际编码、解码，通过 NetBody.ApplyState 应用到骨骼。生成的实际模型图保存在 `artifacts/collision-visual/decoded-*.png`，结果接近 T 字形默认姿态，没有呈现所描述的狮身人面像姿势。不能据此认定原事故已复现，也不能确认单纯 NaN 编码归零就能解释原事故。

当前还没有捕获“玩家操作可移动物体 → 物理数值首次损坏”的过程。截图展示受控注入后的客户端骨骼应用结果，不是真实碰撞产生的现场。测试过程中禁用了隔离副本的 Steam、联网和启动游戏流程，未接入真实房间。

用户随后提供现场图：多人叠在一起，躯干趴倒而头部保持竖直，颈部明显拉伸。这与全量 NaN 注入得到的 T 字形不同。补查已让骨骼修改经过两个新渲染帧后再截图，结果仍为 T 字形，排除了同帧重复 Camera.Render 复用蒙皮结果这一疑点。头部与腰部有独立的位置同步，胸部及多数四肢只有相对旋转同步，故应继续排查部位之间的位置/姿态失配；现场图不足以确定其数值来源。当前原点聚集检测也未在该现场症状上验收，不应称为已经解决这一类事故。

用户明确授权后，还在其正在运行且仅有本人的房间内，向实际本地玩家的 13 个 NetBody 应用上述编码/解码结果。测试通过 Mono 附加线程注册 NetGame.preUpdate，把 Unity 操作转到主线程，未重启或替换游戏安装 DLL。仅暂停本人输入与刚体碰撞，切换临时观察镜头，45 秒后调用已部署的身体重建功能恢复；日志确认已处理 1 名玩家并结束。本人当前皮肤的实测截图 `artifacts/own-body-codec/own-decoded-body.png` 仍呈 T 字形。测试期间原头部控制器出现 `invalid torque (NaN, NaN, NaN) for Head`，这是受控姿态/物理暂停干预期间的日志，不能反推原事故根因。此次没有主动执行玩家与可移动物体的碰撞。

`SteamRichPresence.SetDataToGroupFriends` 的当前 IL 也确认，Invalid assumption 检查的是本地 Human、其 player 或 Steam transport 是否缺失，不是碰撞检测条件。

## 手动重生

全员控制和个人控制的“重生”均放在“御剑飞行”右侧，同一行保留三个槽位，第三格为空。tooltip 明确说明删除旧身体并重新生成，以及“重生过程中会白屏一段时间”。房主/单机可重建全员或选定玩家；客机对自己发送移除/创建玩家请求。手动入口不受自动恢复开关限制，不重置地图。当前 24 项模拟检查只覆盖检测及请求路由；物理对象销毁由真实游戏测试验证。
