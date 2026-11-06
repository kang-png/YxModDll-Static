'use strict';
(() => {
  const channels = {x64: {path: 'x64/YxModDll-x64.dll', filename: 'YxModDll-x64.dll'}, x32: {path: 'YxModDll.dll', filename: 'YxModDll.dll'}};
  const routes = [{id: 'direct', key: 'routeDirect', prefix: ''}, {id: 'mirror', key: 'routeMirror', prefix: 'https://gh-proxy.com/'}];
  const text = {
    zh: {
      pageTitle: '历史版本 · YxMod', skip: '跳到版本列表', backHome: '返回官网下载', language: '语言',
      title: '找到你想用的那一版。', intro: '按发布日期选择，直接下载旧版 Mod DLL。',
      installNote: '请先安装对应位数的完整 YxMod，再退出游戏，将 DLL 覆盖到 Human.exe 同级目录。保持原文件名；配套组件不同的版本可能需要完整安装包。',
      flagTitle: '保留旧版，先暂停自动更新。', flagBefore: '启动前在 Human.exe 同级目录创建空文件',
      flagAfter: '，避免被更新回最新版。确认文件名不是 skip_update.flag.txt；删除标记即可恢复更新。离线补齐和运行环境自动修复仍然有效。',
      listTitle: '历史版本', searchLabel: '搜索日期或构建号', routeLabel: '下载线路', routeAuto: '自动选择', routeDirect: 'GitHub 直连', routeMirror: 'GH-Proxy 镜像',
      routeNote: '自动模式会探测直连和镜像，选择可用线路；下载失败自动换线，保存前核对文件内容。',
      cancel: '取消下载', loading: '正在读取版本列表…', retry: '重新读取', loadMore: '显示更多版本 ↓',
      refresh: '刷新列表 ↻', catalogChecking: '正在自动检查版本清单更新…', catalogUpdated: '已检查更新 · 清单最新发布时间：{date} GMT+8', catalogOffline: '暂时无法读取远端清单，当前显示页面自带的版本。',
      footer: 'Human Fall Flat 娱乐模组 · 历史版本仅提供 Mod DLL', backTop: '回到顶部 ↑',
      count: '{shown} / {total} 个版本', build: '构建 {build}', latest: '最新发布', download: '下载 DLL ↓',
      empty: '没有匹配的版本，请更换搜索条件。', listError: '版本列表读取失败，请重新读取。', choosing: '正在探测下载线路…',
      downloading: '正在通过{route}下载 · {size}', verifying: '下载完成，正在校验文件…', saved: '文件校验通过，已开始保存 {file}（{route}）。',
      switching: '{route}下载失败，正在切换备用线路…', failed: '下载失败。请稍后重试，或手动切换下载线路。', cancelled: '已取消下载。'
    },
    en: {
      pageTitle: 'Version history · YxMod', skip: 'Skip to versions', backHome: 'Back to downloads', language: 'Language',
      title: 'Find the version you want.', intro: 'Browse release dates. Download an older Mod DLL right here.',
      installNote: 'Install the complete YxMod package for your architecture first. Close the game, then replace the DLL beside Human.exe, keeping its original name. Versions with different companion components may need a complete package.',
      flagTitle: 'Pause updates to keep an older version.', flagBefore: 'Before launching, create an empty file beside Human.exe named',
      flagAfter: '. Make sure it is not named skip_update.flag.txt. Delete the flag to resume updates. Offline restoration and automatic runtime repair still work.',
      listTitle: 'Version history', searchLabel: 'Search date or build', routeLabel: 'Download route', routeAuto: 'Automatic', routeDirect: 'GitHub direct', routeMirror: 'GH-Proxy mirror',
      routeNote: 'Automatic mode checks direct and mirror connections, switches routes on failure, and verifies the file before saving.',
      cancel: 'Cancel', loading: 'Loading versions…', retry: 'Reload versions', loadMore: 'Show more versions ↓',
      refresh: 'Refresh ↻', catalogChecking: 'Checking for version list updates…', catalogUpdated: 'Update check complete · Latest release: {date} GMT+8', catalogOffline: 'The remote list is unavailable. Showing the versions included with this page.',
      footer: 'Human Fall Flat fun mod · Mod DLL downloads only', backTop: 'Back to top ↑',
      count: '{shown} / {total} versions', build: 'Build {build}', latest: 'Latest release', download: 'Download DLL ↓',
      empty: 'No matching versions. Try another search.', listError: 'Could not load the version list. Please reload it.', choosing: 'Checking download routes…',
      downloading: 'Downloading via {route} · {size}', verifying: 'Download complete. Verifying the file…', saved: 'File verified. Saving {file} ({route}).',
      switching: '{route} failed. Trying the other route…', failed: 'Download failed. Try again later or choose another route.', cancelled: 'Download cancelled.'
    },
    ko: {
      pageTitle: '이전 버전 · YxMod', skip: '버전 목록으로 이동', backHome: '다운로드로 돌아가기', language: '언어',
      title: '원하는 버전을 찾아보세요.', intro: '배포 날짜를 확인하고 이전 모드 DLL을 바로 다운로드하세요.',
      installNote: '먼저 비트 수에 맞는 전체 YxMod 패키지를 설치하세요. 게임을 종료하고 Human.exe 옆의 DLL을 원래 이름 그대로 교체하세요. 관련 구성 요소가 다른 버전은 전체 패키지가 필요할 수 있습니다.',
      flagTitle: '이전 버전을 유지하려면 업데이트를 멈추세요.', flagBefore: '실행 전에 Human.exe 옆에 다음 이름의 빈 파일을 만드세요:',
      flagAfter: '. 파일 이름이 skip_update.flag.txt가 아닌지 확인하세요. 삭제하면 업데이트가 다시 시작됩니다. 오프라인 복원과 실행 환경 자동 복구는 계속 작동합니다.',
      listTitle: '이전 버전', searchLabel: '날짜 또는 빌드 검색', routeLabel: '다운로드 경로', routeAuto: '자동 선택', routeDirect: 'GitHub 직접 연결', routeMirror: 'GH-Proxy 미러',
      routeNote: '자동 모드는 직접 연결과 미러를 확인하고, 실패하면 경로를 변경하며, 저장 전에 파일을 검증합니다.',
      cancel: '취소', loading: '버전 목록 불러오는 중…', retry: '다시 불러오기', loadMore: '이전 버전 더 보기 ↓',
      refresh: '새로고침 ↻', catalogChecking: '버전 목록 업데이트 확인 중…', catalogUpdated: '업데이트 확인 완료 · 최신 배포: {date} GMT+8', catalogOffline: '원격 목록을 읽을 수 없어 페이지에 포함된 버전을 표시합니다.',
      footer: 'Human Fall Flat 모드 · 모드 DLL만 다운로드', backTop: '맨 위로 ↑',
      count: '{shown} / {total}개 버전', build: '빌드 {build}', latest: '최신 배포', download: 'DLL 다운로드 ↓',
      empty: '일치하는 버전이 없습니다. 검색어를 바꿔보세요.', listError: '버전 목록을 불러오지 못했습니다. 다시 시도하세요.', choosing: '다운로드 경로 확인 중…',
      downloading: '{route} 다운로드 중 · {size}', verifying: '다운로드 완료. 파일 검증 중…', saved: '검증 완료. {file} 저장 중 ({route}).',
      switching: '{route} 실패. 다른 경로로 전환 중…', failed: '다운로드에 실패했습니다. 나중에 다시 시도하거나 다른 경로를 선택하세요.', cancelled: '다운로드가 취소되었습니다.'
    }
  };
  const $ = selector => document.querySelector(selector);
  const url = new URL(location.href);
  const validLanguage = value => Object.hasOwn(text, value);
  let stored;
  try { stored = localStorage.getItem('yxmod-language'); } catch (_) { /* Storage is optional. */ }
  let language = [url.searchParams.get('lang'), stored, (navigator.language || '').slice(0, 2), 'en'].find(validLanguage);
  let architecture = url.searchParams.get('arch') === 'x32' ? 'x32' : 'x64';
  let catalog;
  let catalogState = 'loading';
  let catalogRefreshing = false;
  let catalogNote;
  let limit = 20;
  let activeDownload;
  let statusKey;
  let statusValues;
  let statusError = false;
  const t = (key, values = {}) => text[language][key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  const releaseDate = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'});

  function status(key, values = {}, error = false) {
    statusKey = key; statusValues = values; statusError = error;
    $('#status-panel').hidden = false;
    $('#status-panel').dataset.error = String(error);
    $('#download-status').textContent = t(key, values);
  }

  function applyLanguage() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    document.title = t('pageTitle');
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
    $('#history-language').value = language;
    $('#version-search').placeholder = t('searchLabel');
    document.querySelectorAll('[data-home]').forEach(link => {
      const target = new URL(link.href); target.searchParams.set('lang', language); link.href = target.href;
    });
    if (catalog) render();
    else $('#list-state').textContent = t(catalogState);
    if (catalogNote) showCatalogNote(catalogNote);
    if (statusKey) status(statusKey, statusValues, statusError);
  }

  function saveQuery() {
    const target = new URL(location.href);
    target.searchParams.set('lang', language); target.searchParams.set('arch', architecture);
    history.replaceState(null, '', target);
  }

  function render() {
    const query = $('#version-search').value.trim().toLowerCase();
    const all = catalog.channels[architecture].versions;
    const versions = all.filter(version => `${releaseDate.format(new Date(version.date))} ${version.build} ${version.commit} ${version.title}`.toLowerCase().includes(query));
    const list = $('#version-list'); list.replaceChildren();
    for (const version of versions.slice(0, limit)) {
      const row = document.createElement('li'); row.className = 'version-row';
      const date = document.createElement('div'); date.className = 'version-date';
      const time = document.createElement('time'); time.dateTime = version.date;
      const dateParts = releaseDate.format(new Date(version.date)).split(' ');
      time.textContent = dateParts[0];
      const hour = document.createElement('small'); hour.textContent = `${dateParts[1]} GMT+8`;
      date.append(time, hour);
      const info = document.createElement('div'); info.className = 'version-info';
      const title = document.createElement('h3'); title.textContent = t('build', {build: version.build.slice(0, 7)});
      if (version === all[0]) { const tag = document.createElement('span'); tag.className = 'latest-tag'; tag.textContent = t('latest'); title.append(tag); }
      const details = document.createElement('p');
      const hash = document.createElement('code'); hash.textContent = version.commit.slice(0, 7);
      details.append(`${channels[architecture].filename} · `, hash);
      info.append(title, details);
      const button = document.createElement('button'); button.type = 'button'; button.className = 'button button-blue version-download';
      button.textContent = t('download'); button.disabled = Boolean(activeDownload);
      button.setAttribute('aria-label', `${t('download')} · ${architecture} · ${dateParts[0]} ${dateParts[1]} · ${version.build.slice(0, 7)}`);
      const channel = architecture;
      button.addEventListener('click', () => download(version, channel));
      row.append(date, info, button); list.append(row);
    }
    document.querySelectorAll('[data-architecture]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.architecture === architecture)));
    $('#version-count').textContent = t('count', {shown: Math.min(limit, versions.length), total: versions.length});
    $('#list-state').hidden = versions.length > 0;
    $('#list-state').textContent = t('empty');
    $('#load-more').hidden = versions.length <= limit;
  }

  function validateCatalog(data) {
    if (data.schema !== 1 || data.repository !== 'kang-png/YxModDll-Static' || !Number.isFinite(Date.parse(data.updated))) throw new Error('Invalid version index');
    for (const channel of Object.keys(channels)) {
      const entries = data.channels[channel].versions;
      if (!entries.length || data.channels[channel].path !== channels[channel].path) throw new Error('Invalid channel');
      for (const version of entries) {
        if (!['commit', 'blob', 'build'].every(key => /^[0-9a-f]{40}$/.test(version[key])) || !Number.isFinite(Date.parse(version.date)) || typeof version.title !== 'string') throw new Error('Invalid version');
      }
    }
    return data;
  }

  function loadCatalog() {
    catalogState = 'loading';
    $('#reload-list').hidden = true; $('#list-state').hidden = false; $('#list-state').textContent = t('loading');
    try {
      catalog = validateCatalog(JSON.parse($('#version-catalog').textContent)); render();
    } catch (_) {
      catalogState = 'listError';
      $('#list-state').textContent = t('listError'); $('#reload-list').hidden = false;
    }
  }

  function showCatalogNote(key) {
    catalogNote = key;
    $('#catalog-source').textContent = t(key, {date: catalog ? releaseDate.format(new Date(catalog.updated)) : ''});
  }

  async function refreshCatalog() {
    if (catalogRefreshing) return;
    catalogRefreshing = true; $('#refresh-catalog').disabled = true; showCatalogNote('catalogChecking');
    const raw = 'https://raw.githubusercontent.com/kang-png/YxModDll-Static/main/docs/history-versions.json';
    const candidates = routes.map(route => route.prefix + raw);
    candidates.unshift(['http:', 'https:'].includes(location.protocol)
      ? new URL('./history-versions.json', location.href).href
      : 'https://yxmod.cc/history-versions.json');
    try {
      const results = await Promise.allSettled(candidates.map(async target => {
        const response = await fetch(target, {cache: 'no-cache', credentials: 'omit', signal: AbortSignal.timeout(8000)});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return validateCatalog(await response.json());
      }));
      const available = results.filter(result => result.status === 'fulfilled').map(result => result.value);
      if (available.length) {
        if (catalog) available.push(catalog);
        available.sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated) ||
          (b.channels.x64.versions.length + b.channels.x32.versions.length) - (a.channels.x64.versions.length + a.channels.x32.versions.length));
        catalog = available[0]; $('#reload-list').hidden = true; render(); showCatalogNote('catalogUpdated');
      } else showCatalogNote('catalogOffline');
    } finally {
      catalogRefreshing = false; $('#refresh-catalog').disabled = false;
    }
  }

  function fileUrl(route, version, channel) {
    return `${route.prefix}https://raw.githubusercontent.com/kang-png/YxModDll-Static/${version.commit}/${channels[channel].path}`;
  }

  async function readFile(route, version, channel, signal, probe = false) {
    const probeBytes = 65536;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, {once: true});
    if (signal.aborted) controller.abort();
    let timer = setTimeout(abort, probe ? 8000 : 20000);
    try {
      const response = await fetch(fileUrl(route, version, channel), {
        signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer',
        cache: probe ? 'no-store' : 'default', headers: probe ? {Range: `bytes=0-${probeBytes - 1}`} : {}
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body.getReader();
      const chunks = []; let length = 0;
      const total = Number(response.headers.get('Content-Length'));
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value); length += value.byteLength;
        if (probe && length >= 2) {
          const prefix = chunks[0].length >= 2 ? chunks[0] : new Uint8Array([chunks[0][0], chunks[1][0]]);
          if (prefix[0] !== 0x4d || prefix[1] !== 0x5a) throw new Error('Not a DLL');
          if (length >= probeBytes) return route;
        }
        if (!probe) {
          clearTimeout(timer); timer = setTimeout(abort, 20000);
          const size = `${(length / 1048576).toFixed(1)} MiB${total ? ` / ${(total / 1048576).toFixed(1)} MiB` : ''}`;
          status('downloading', {route: t(route.key), size});
        }
      }
      if (probe) {
        if (length >= 2) return route;
        throw new Error('Empty probe');
      }
      const bytes = new Uint8Array(length); let offset = 0;
      chunks.forEach(chunk => { bytes.set(chunk, offset); offset += chunk.length; });
      return bytes;
    } finally {
      clearTimeout(timer); signal.removeEventListener('abort', abort); controller.abort();
    }
  }

  async function chooseRoutes(version, channel, signal) {
    const probes = new AbortController();
    const abort = () => probes.abort(); signal.addEventListener('abort', abort, {once: true});
    if (signal.aborted) probes.abort();
    try {
      const winner = await Promise.any(routes.map(route => readFile(route, version, channel, probes.signal, true)));
      return [winner, ...routes.filter(route => route !== winner)];
    } catch (error) {
      if (signal.aborted) throw error;
      // A failed range probe must not prevent an otherwise working full download.
      return routes;
    } finally {
      signal.removeEventListener('abort', abort); probes.abort();
    }
  }

  async function verify(bytes, blob) {
    if (bytes[0] !== 0x4d || bytes[1] !== 0x5a) throw new Error('Not a DLL');
    // Git's blob ID fixes the exact bytes of this historical binary, on either route.
    const prefix = new TextEncoder().encode(`blob ${bytes.length}\0`);
    const object = new Uint8Array(prefix.length + bytes.length); object.set(prefix); object.set(bytes, prefix.length);
    const digest = await crypto.subtle.digest('SHA-1', object);
    const hash = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
    if (hash !== blob) throw new Error('DLL hash mismatch');
  }

  async function download(version, channel) {
    if (activeDownload) return;
    const controller = new AbortController(); activeDownload = controller;
    document.querySelectorAll('.version-download').forEach(button => { button.disabled = true; });
    $('#cancel-download').hidden = false;
    try {
      const selected = $('#download-route').value;
      status('choosing');
      const candidates = selected === 'auto' ? await chooseRoutes(version, channel, controller.signal) : routes.filter(route => route.id === selected);
      for (let index = 0; index < candidates.length; index++) {
        const route = candidates[index];
        try {
          const bytes = await readFile(route, version, channel, controller.signal);
          if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
          status('verifying'); await verify(bytes, version.blob);
          if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
          const objectUrl = URL.createObjectURL(new Blob([bytes], {type: 'application/octet-stream'}));
          const link = document.createElement('a'); link.href = objectUrl; link.download = channels[channel].filename;
          document.body.append(link); link.click(); link.remove();
          setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
          status('saved', {file: channels[channel].filename, route: t(route.key)});
          return;
        } catch (error) {
          if (controller.signal.aborted || index === candidates.length - 1) throw error;
          status('switching', {route: t(route.key)});
        }
      }
    } catch (_) {
      status(controller.signal.aborted ? 'cancelled' : 'failed', {}, !controller.signal.aborted);
    } finally {
      activeDownload = undefined; $('#cancel-download').hidden = true;
      document.querySelectorAll('.version-download').forEach(button => { button.disabled = false; });
    }
  }

  $('#history-language').addEventListener('change', event => {
    language = event.target.value; applyLanguage(); saveQuery();
    try { localStorage.setItem('yxmod-language', language); } catch (_) { /* Storage is optional. */ }
  });
  document.querySelectorAll('[data-architecture]').forEach(button => button.addEventListener('click', () => {
    architecture = button.dataset.architecture; limit = 20; saveQuery(); if (catalog) render();
  }));
  $('#version-search').addEventListener('input', () => { limit = 20; if (catalog) render(); });
  $('#load-more').addEventListener('click', () => { limit += 20; render(); });
  $('#cancel-download').addEventListener('click', () => activeDownload?.abort());
  $('#reload-list').addEventListener('click', () => location.reload());
  $('#refresh-catalog').addEventListener('click', refreshCatalog);
  window.addEventListener('pagehide', () => activeDownload?.abort());
  applyLanguage(); loadCatalog(); refreshCatalog();
})();
