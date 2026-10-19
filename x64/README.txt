YxMod x64 / Unity 2017.4.13f1 / 游戏基线 v109749307

安装：退出游戏，双击 YxMod-x64-Setup.exe，自动定位 Steam 游戏并安装。
ZIP 安装：将全部文件解压至 Human.exe 所在目录并替换，不能多套一层文件夹。
Human.exe 与安装器使用 Steam 原版人类图标；标题栏、任务栏和自动恢复后的图标保持一致。
日常使用：从 Steam 正常开始游戏，不需要修改启动选项。

游戏被验证/重新下载恢复为32位后，只要额外的 Mod 文件仍保留：
winhttp.dll 会在 UnityMain 前拦截启动；YxMod-x64.exe 等待游戏退出，
核对版本后恢复64位文件，并提示再次从 Steam 启动。
完整删除游戏目录也会删除修复入口，此时需要重新运行安装器。
不同游戏版本或主程序集不匹配时停止修复，不覆盖未知版本。

文件说明：
winhttp.dll：32位自动恢复入口；YXWIN64.dll：64位定制 Doorstop。
64位 UnityPlayer.dll 使用 YXWIN64.dll，系统 WinHTTP API 由加载器正确转发。
YxModDll-x64.dll：独立的64位更新渠道（托管程序集保留 AnyCPU）。
YxMod-x64.exe：安装、自动恢复和启动前更新程序，需留在游戏目录。
修复保留已有的 YxModDll-x64.dll，不用旧内嵌版本覆盖自动更新。

更新：OSS x64 目录优先，GitHub Static x64 目录备用，成功检查后间隔6小时。
在 Human.exe 同级放置 skip_update.flag 可跳过联网更新，删除后恢复。
该标记不影响32位回退后的自动恢复，也不影响缺少 Mod DLL 时从安装资源离线补齐。
仅接收 channel=x64、正确文件名、完整提交版本、大小及 SHA-256 均匹配的更新。
源故障/校验失败保留当前 DLL，错误写入 .yxmod-x64/bootstrap.log。
不会读取或覆盖32位更新清单；不会发布到32位根路径。
只有 Mod 变化时只下载 YxModDll-x64.dll，不下载 EXE。
firstpass、原生加载器、运行环境或更新器逻辑变化时，下载并校验新版 EXE。
游戏退出、解除文件占用后，由该 EXE 安装整套配套组件，完成后提示重新从 Steam 启动。
组件版本独立于 Mod、构建时间和 EXE 内嵌的 Mod，不因单独发布 Mod 而反复下载 EXE。
旧版安装器尚无此机制，需要先手动安装一次新版；之后配套组件升级即可自动触发。

卸载：退出游戏，删除本包 winhttp.dll、YXWIN64.dll、YxMod-x64.exe、
YxModDll-x64.dll，再用 Steam 验证游戏文件，防止自动修复再次生效。
不包含账号、存档、个人配置或自动建房探针。
