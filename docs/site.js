'use strict';
(() => {
  // Only these bundled translations are rendered as HTML; no URL or remote text is inserted.
  const translations = {
    en: {
      skip:'Skip to downloads',navDownload:'Download',navInstall:'Install',navCommunity:'Community',language:'Language',eyebrow:'HUMAN FALL FLAT · FUN MOD',heroTitle:'Fall into fun.<br>Play your way<span class="punct">.</span>',heroDescription:'Save positions, fly, teleport and use accessories.<br>A little more freedom in your favorite wobbly world.',heroDownload:'Get YxMod x64',heroGuide:'Installation guide',heroNote:'Free to use · Windows x64 · Classic 32-bit also available',feature1:'SAVE / Keep the moment',feature2:'FLY / A different perspective',feature3:'TELEPORT / Go where the fun is',downloadTitle:'Your way to start playing.',downloadIntro:'Two downloads. The same x64 edition.<br>Choose the installation method that suits you.',recommended:'RECOMMENDED',exeTitle:'Easy installer',exeDescription:'Run the installer and confirm your game folder. One entry point for installation, repairs and companion component upgrades.',exeDownload:'Download EXE installer',githubMirror:'Download slow? Try the GitHub mirror ↗',zipTag:'MANUAL INSTALL',zipTitle:'Complete ZIP package',zipDescription:'For players who know their game folder. Extract every file and folder into the game directory and replace existing files.',zipDownload:'Download ZIP package',downloadFootnote:'Moving from an older version? Run the new installer or extract the complete ZIP. Close the game before installing.',compatibility:'Current x64 baseline: game build v109749307 (Unity 2017.4.13f1). The installer checks compatibility before replacing files.',installTitle:'Set up. Then jump in.',installIntro:'Find the game folder. Take it from there.<br>Choose just one of these installation methods.',exeTab:'EXE installer',zipTab:'ZIP extraction',exeStep1:'Download and run',exeStep1Text:'Close the game, then run YxMod-x64-Setup.exe.',exeStep2:'Confirm the game directory',exeStep2Text:'Follow the installer prompts. If choosing manually, select the Human Fall Flat folder containing Human.exe.',exeStep3:'Launch from Steam',exeStep3Text:'Once installation finishes, start the game from Steam as usual.',zipStep1:'Open the local game folder',zipStep1Text:'Steam Library → right-click Human Fall Flat → Manage → Browse local files.',zipStep2:'Extract everything and replace',zipStep2Text:'Close the game. Extract all files and folders from the ZIP alongside Human.exe. Replace existing files when asked.',zipStep3:'Start the game from Steam',zipStep3Text:'Copy the entire package, not just the Mod DLL. Do not leave the files inside an extra nested folder.',pathLabel:'Example game directory',zoomGuide:'Enlarge the installation image',imageTitle:'ZIP installation, illustrated',imageDescription:'Find the game folder → extract and replace all contents',imageZoom:'Open original image ↗',imageNote:'The file list in the image is an example. Install all contents of the current ZIP package.',updateTitle:'Less fuss. More play.',updateIntro:'The new x64 installation checks for updates at startup.',updateMod:'Only the Mod changed? Keep it light.',updateModText:'When only YxMod changes, only the Mod DLL is downloaded and updated.',updateComponents:'Companion files changed? Installer takes over.',updateComponentsText:'When companion DLLs or runtime files change, the new installer is downloaded and verified. The current launch exits, the upgrade runs, and you can restart as prompted.',updateRepair:'Reverted to 32-bit? Automatic repair.',updateRepairText:'After Steam verification or a redownload, startup restores x64 if the recovery entry is still present. If the entire game folder was deleted, install YxMod again.',faqTitle:'A few good things to know',faq1:'Do I need both EXE and ZIP?',faq1Text:'No. Choose one. The EXE guides you through installation; the ZIP is for a full manual extraction. Both contain the x64 edition.',faq2:'How do I pause automatic updates?',faq2Text:'Create skip_update.flag beside Human.exe to skip online updates. Remove it to resume checks. Offline restoration of a missing Mod and recovery after a 32-bit rollback still work.',faq3:'How do existing users get the new updater?',faq3Text:'Run the new x64 installer from this page once, or fully extract the new ZIP over the game folder. Future Mod-only changes update the DLL; companion changes use the installer.',faq4:'Is it free? Where can I get help?',faq4Text:'YxMod is free. Support is entirely optional. For help with installation or play, join the community below or report an issue on GitHub.',legacyTitle:'Still playing in 32-bit?',legacyText:'The classic 32-bit edition stays available as a separate download. Install the edition you use.',legacyDownload:'Download 32-bit ZIP',legacyMirror:'GitHub mirror ↗',legacyGuide:'32-bit install image ↗',communityTitle:'Better when we fall together.',communityIntro:'Find players, share ideas and report problems.<br>Come say hello.',qqLabel:'QQ GROUP',discordLabel:'JOIN THE SERVER',feedback:'Report an issue ↗',panorama:'Panorama viewer ↗',support:'Support YxMod ♡',freeNote:'Free to use. Optional support.',footerNote:'A fun mod for Human Fall Flat players. Not an official game product.',backTop:'Back to top ↑',close:'Close',supportTitle:'Enjoy it? Buy me a coffee.',supportText:'YxMod is free. Your optional support helps keep development going.',afdian:'Afdian ↗'
    },
    ko: {
      skip:'다운로드로 이동',navDownload:'다운로드',navInstall:'설치 안내',navCommunity:'커뮤니티',language:'언어',eyebrow:'휴먼 폴 플랫 · 재미를 더하는 모드',heroTitle:'즐거움에 빠져요.<br>나만의 방식으로<span class="punct">.</span>',heroDescription:'위치 저장, 비행, 순간이동, 액세서리.<br>익숙한 말랑말랑한 세상에서 더 자유롭게 놀아 보세요.',heroDownload:'YxMod x64 받기',heroGuide:'설치 안내 보기',heroNote:'무료 · Windows x64 · 기존 32비트 버전도 제공',feature1:'위치 저장 / 순간을 간직해요',feature2:'비행 / 새로운 시선으로',feature3:'순간이동 / 즐거운 곳으로',downloadTitle:'원하는 방식으로 시작하세요.',downloadIntro:'두 가지 다운로드, 같은 x64 버전.<br>편한 설치 방법 하나를 선택하세요.',recommended:'추천 · 간편 설치',exeTitle:'간편 설치 프로그램',exeDescription:'설치 프로그램을 실행하고 게임 폴더를 확인하세요. 설치, 복구, 관련 구성 요소 업데이트를 한곳에서 처리합니다.',exeDownload:'EXE 설치 프로그램 다운로드',githubMirror:'다운로드가 느린가요? GitHub에서 받기 ↗',zipTag:'수동 설치',zipTitle:'전체 ZIP 패키지',zipDescription:'게임 폴더를 잘 아는 플레이어에게 적합합니다. 모든 파일과 폴더를 게임 폴더에 압축 해제하고 덮어쓰세요.',zipDownload:'ZIP 패키지 다운로드',downloadFootnote:'기존 버전에서 전환할 때는 새 설치 프로그램을 실행하거나 ZIP 전체를 덮어쓰세요. 설치 전에 게임을 종료하세요.',compatibility:'현재 x64 지원 기준: 게임 빌드 v109749307 (Unity 2017.4.13f1). 파일 교체 전에 설치 프로그램이 호환성을 확인합니다.',installTitle:'설치하고, 함께 출발해요.',installIntro:'게임 폴더를 찾으면 나머지는 간단해요.<br>두 방법 중 하나만 선택하세요.',exeTab:'EXE 간편 설치',zipTab:'ZIP 압축 해제',exeStep1:'다운로드 후 실행',exeStep1Text:'게임을 종료하고 YxMod-x64-Setup.exe를 실행하세요.',exeStep2:'게임 폴더 확인',exeStep2Text:'안내에 따라 진행하세요. 직접 선택할 경우 Human.exe가 들어 있는 Human Fall Flat 폴더를 고르세요.',exeStep3:'Steam에서 실행',exeStep3Text:'설치가 끝나면 평소처럼 Steam에서 게임을 시작하세요.',zipStep1:'게임 로컬 폴더 열기',zipStep1Text:'Steam 라이브러리 → Human Fall Flat 우클릭 → 관리 → 로컬 파일 탐색.',zipStep2:'전체 압축 해제 및 덮어쓰기',zipStep2Text:'게임을 종료하세요. ZIP의 모든 파일과 폴더를 Human.exe와 같은 위치에 풀고 기존 파일을 덮어쓰세요.',zipStep3:'Steam에서 다시 시작',zipStep3Text:'모드 DLL만 복사하지 말고 전체 패키지를 설치하세요. 별도의 하위 폴더 안에 넣지 마세요.',pathLabel:'게임 폴더 예시',zoomGuide:'설치 이미지 확대',imageTitle:'ZIP 설치 이미지 안내',imageDescription:'게임 폴더 찾기 → 전체 파일 압축 해제 및 덮어쓰기',imageZoom:'원본 이미지 보기 ↗',imageNote:'이미지의 파일 목록은 예시입니다. 현재 ZIP 패키지의 전체 내용을 설치하세요.',updateTitle:'업데이트는 더 간편하게.',updateIntro:'새 x64 버전은 게임 시작 시 업데이트를 확인합니다.',updateMod:'모드만 바뀌었나요? 가볍게 업데이트.',updateModText:'YxMod만 변경되면 모드 DLL만 다운로드하여 교체합니다.',updateComponents:'관련 파일 변경은 설치 프로그램이 처리해요.',updateComponentsText:'관련 DLL이나 실행 파일이 바뀌면 새 설치 프로그램을 다운로드하고 검증합니다. 현재 실행이 종료되고 업데이트가 끝나면 안내에 따라 다시 시작하세요.',updateRepair:'32비트로 돌아갔나요? 자동 복구.',updateRepairText:'Steam 파일 검사나 재다운로드 후 복구 진입점이 남아 있으면 실행 시 x64로 복구합니다. 게임 폴더 전체를 삭제했다면 YxMod를 다시 설치하세요.',faqTitle:'알아 두면 좋은 내용',faq1:'EXE와 ZIP을 모두 받아야 하나요?',faq1Text:'아니요. 하나만 선택하세요. EXE는 안내에 따라 설치하고, ZIP은 전체 내용을 수동으로 압축 해제합니다. 둘 다 x64 버전입니다.',faq2:'자동 업데이트를 잠시 끄려면?',faq2Text:'Human.exe 옆에 skip_update.flag를 만들면 온라인 업데이트를 건너뜁니다. 삭제하면 다시 확인합니다. 누락된 모드의 오프라인 복원과 32비트 되돌림 복구는 계속 작동합니다.',faq3:'기존 사용자는 어떻게 새 업데이트 기능을 쓰나요?',faq3Text:'이 페이지의 새 x64 설치 프로그램을 한 번 실행하거나 새 ZIP 전체를 게임 폴더에 덮어쓰세요. 이후 모드만 바뀌면 DLL을, 관련 구성 요소가 바뀌면 설치 프로그램을 통해 업데이트합니다.',faq4:'무료인가요? 문제는 어디에 문의하나요?',faq4Text:'YxMod는 무료이며 후원은 전적으로 선택 사항입니다. 설치나 사용에 문제가 있다면 아래 커뮤니티 또는 GitHub에 알려 주세요.',legacyTitle:'아직 32비트를 사용하나요?',legacyText:'기존 32비트 버전도 별도로 다운로드할 수 있습니다. 사용 중인 버전에 맞게 설치하세요.',legacyDownload:'32비트 ZIP 다운로드',legacyMirror:'GitHub에서 받기 ↗',legacyGuide:'32비트 설치 이미지 ↗',communityTitle:'함께하면 더 즐거워요.',communityIntro:'함께할 친구를 찾고, 아이디어를 나누고, 문제를 알려 주세요.<br>커뮤니티에서 만나요.',qqLabel:'QQ 그룹',discordLabel:'서버 참여',feedback:'문제 제보 ↗',panorama:'파노라마 뷰어 ↗',support:'YxMod 후원 ♡',freeNote:'무료로 이용하고, 후원은 자유롭게.',footerNote:'Human Fall Flat 플레이어를 위한 모드. 게임 공식 제품이 아닙니다.',backTop:'맨 위로 ↑',close:'닫기',supportTitle:'마음에 드셨다면 커피 한 잔.',supportText:'YxMod는 무료입니다. 자발적인 후원은 꾸준한 개발에 도움이 됩니다.',afdian:'Afdian ↗'
    }
  };
  const nodes = [...document.querySelectorAll('[data-i18n]')];
  const chinese = new Map(nodes.map(node => [node, node.innerHTML]));
  const ariaNodes = [...document.querySelectorAll('[data-i18n-aria]')];
  const chineseAria = new Map(ariaNodes.map(node => [node, node.getAttribute('aria-label')]));
  const valid = value => ['zh','en','ko'].includes(value);
  function applyLanguage(language) {
    const dict = translations[language];
    nodes.forEach(node => { node.innerHTML = language === 'zh' ? chinese.get(node) : (dict[node.dataset.i18n] || chinese.get(node)); });
    ariaNodes.forEach(node => node.setAttribute('aria-label', language === 'zh' ? chineseAria.get(node) : (dict[node.dataset.i18nAria] || chineseAria.get(node))));
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    document.title = {zh:'YxMod · 把快乐，玩出新花样',en:'YxMod · Fall into fun. Play your way.',ko:'YxMod · 나만의 방식으로 즐겨요'}[language];
    document.querySelector('#language').value = language;
  }
  let stored;
  try { stored = localStorage.getItem('yxmod-language'); } catch (_) { /* Storage may be disabled. */ }
  const requested = new URLSearchParams(location.search).get('lang');
  const browserLanguage = (navigator.language || 'zh').slice(0,2);
  applyLanguage(valid(requested) ? requested : valid(stored) ? stored : valid(browserLanguage) ? browserLanguage : 'en');
  document.querySelector('#language').addEventListener('change', event => {
    const language = event.target.value;
    applyLanguage(language);
    try { localStorage.setItem('yxmod-language', language); } catch (_) { /* Preference is optional. */ }
    const url = new URL(location.href); url.searchParams.set('lang',language); history.replaceState(null,'',url);
  });
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected',String(active)); item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener('click',() => selectTab(tab));
    tab.addEventListener('keydown',event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[target]); tabs[target].focus();
    });
  });
  for (const [buttonId,dialogId] of [['open-guide','guide-dialog'],['open-support','support-dialog']]) {
    const dialog = document.getElementById(dialogId);
    document.getElementById(buttonId).addEventListener('click',() => { dialog.showModal(); document.body.style.overflow = 'hidden'; });
    dialog.querySelector('[data-close]').addEventListener('click',() => dialog.close());
    dialog.addEventListener('close',() => { document.body.style.overflow = ''; });
    dialog.addEventListener('click',event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  }
})();
