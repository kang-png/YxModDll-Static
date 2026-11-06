"""Prepare the website and its published DLL archive from this repository."""
import argparse
import json
import re
import subprocess
from shutil import copy2
from datetime import datetime, timezone
from pathlib import Path

REPOSITORY = 'kang-png/YxModDll-Static'
CHANNELS = {'x64': 'x64/YxModDll-x64.dll', 'x32': 'YxModDll.dll'}
SITE_FILES = ('index.html', 'site.css', 'site.js', 'favicon.svg', 'site-background.jpg',
              'install-guide-x64.png', 'install-guide.png', 'support-qr.jpg', 'invite.html',
              'history.html', 'history.css', 'history.js', 'history-versions.json')
HASH = re.compile(r'^[0-9a-f]{40}$')
RAW = re.compile(r'^:\d{6} \d{6} [0-9a-f]{40} ([0-9a-f]{40}) [AM]\t(.+)$')


def git(repository, *arguments):
    return subprocess.check_output(
        ['git', '-C', str(repository), *arguments], encoding='utf-8'
    ).strip()


def records(repository, ref, filename):
    shallow_path = Path(git(repository, 'rev-parse', '--git-path', 'shallow'))
    if not shallow_path.is_absolute():
        shallow_path = repository / shallow_path
    boundaries = set(shallow_path.read_text().split()) if shallow_path.exists() else set()
    log = git(repository, 'log', ref, '--first-parent', '--diff-merges=first-parent',
              '--format=%H%x09%cI%x09%s', '--raw', '--no-abbrev', '--no-renames',
              '--diff-filter=AM', '--', filename)
    commit = None
    for line in log.splitlines():
        if re.match(r'^[0-9a-f]{40}\t', line):
            sha, date, title = line.split('\t', 2)
            date = datetime.fromisoformat(date).astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
            # A shallow boundary shows a whole-tree snapshot, not a release.
            commit = None if sha in boundaries else {'commit': sha, 'date': date, 'title': title}
        elif commit and (match := RAW.match(line)) and match[2] == filename:
            source = re.search(r'发布 YxMod x64 ([0-9a-f]{40})', commit['title'])
            yield {**commit, 'blob': match[1], 'build': source[1] if source else commit['commit']}


def build(repository, ref='HEAD', seed=None):
    previous = {'schema': 1, 'repository': REPOSITORY, 'channels': {}}
    if seed and seed.is_file():
        previous = json.loads(seed.read_text(encoding='utf-8'))
        if previous.get('schema') != 1 or previous.get('repository') != REPOSITORY:
            raise ValueError('Unexpected version history seed')
    channels = {}
    for channel, filename in CHANNELS.items():
        by_blob = {}
        existing = previous['channels'].get(channel, {}).get('versions', [])
        for version in [*existing, *records(repository, ref, filename)]:
            if not all(HASH.fullmatch(version[key]) for key in ('commit', 'blob', 'build')):
                raise ValueError('Invalid version history hash')
            old = by_blob.get(version['blob'])
            if old is None or version['date'] > old['date']:
                by_blob[version['blob']] = version
        versions = sorted(by_blob.values(), key=lambda v: v['date'], reverse=True)
        if not versions:
            raise ValueError(f'No published DLL history for {channel}')
        channels[channel] = {'path': filename, 'versions': versions}
    updated = max(v['date'] for c in channels.values() for v in c['versions'])
    return {'schema': 1, 'repository': REPOSITORY, 'updated': updated, 'channels': channels}


def write_catalog(result, outputs):
    content = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    # Escape '<' so a commit title cannot terminate the embedded JSON script.
    embedded = content.replace('<', '\\u003c')
    pattern = re.compile(r'(<script id="version-catalog" type="application/json">).*?(</script>)', re.S)
    for output in outputs:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(content, encoding='utf-8')
        page = output.parent / 'history.html'
        if page.is_file():
            html, count = pattern.subn(lambda match: match[1] + '\n' + embedded + match[2],
                                       page.read_text(encoding='utf-8'))
            if count != 1:
                raise ValueError(f'Missing or duplicate embedded version catalog: {page}')
            page.write_text(html, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--ref', default='HEAD')
    parser.add_argument('--seed', type=Path)
    parser.add_argument('--output', type=Path, action='append')
    args = parser.parse_args()
    repository = args.repository.resolve()
    outputs = args.output or [repository / 'docs/history-versions.json']
    seed = args.seed or outputs[0]
    result = build(repository, args.ref, seed)
    write_catalog(result, outputs)
    for name in SITE_FILES:
        copy2(repository / 'docs' / name, repository / name)
    print('Published DLL history: ' + ', '.join(
        f'{key}={len(channel["versions"])}' for key, channel in result['channels'].items()))


if __name__ == '__main__':
    main()
