YxMod x64 / Unity 2017.4.13f1 / 游戏基线 v109749307

安装：退出游戏，双击 YxMod-x64-Setup.exe，自动定位 Steam 游戏并安装。
ZIP 安装：将全部文件解压至 Human.exe 所在目录并替换，不能多套一层文件夹。
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
仅接收 channel=x64、正确文件名、完整提交版本、大小及 SHA-256 均匹配的更新。
源故障/校验失败保留当前 DLL，错误写入 .yxmod-x64/bootstrap.log。
不会读取或覆盖32位更新清单；不会发布到32位根路径。
自动更新目前更新托管 Mod；运行环境及加载器升级通过重新运行新版安装器完成。

卸载：退出游戏，删除本包 winhttp.dll、YXWIN64.dll、YxMod-x64.exe、
YxModDll-x64.dll，再用 Steam 验证游戏文件，防止自动修复再次生效。
不包含账号、存档、个人配置或自动建房探针。
