"""Validate the deployed site without downloading or republishing release files."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / 'docs'


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.targets = []
        self.ids = []
        self.catalog = []
        self.in_catalog = False

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'script' and attrs.get('id') == 'version-catalog':
            self.in_catalog = True
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for key in ('src', 'href'):
            if key in attrs:
                self.targets.append(attrs[key])


    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_catalog = False

    def handle_data(self, data):
        if self.in_catalog:
            self.catalog.append(data)


def check_page(name):
    page = Links()
    page.feed((SITE / name).read_text(encoding='utf-8'))
    assert len(page.ids) == len(set(page.ids)), 'Duplicate page element IDs'
    for target in page.targets:
        if target.startswith('./'):
            relative = target[2:].split('#', 1)[0].split('?', 1)[0]
            assert (SITE / relative).is_file(), f'Missing site asset: {target}'
        elif target.startswith('#') and target != '#':
            assert target[1:] in page.ids, f'Missing anchor: {target}'
    return page


def main():
    page = check_page('index.html')
    history = check_page('history.html')
    base = 'https://fxclient.oss-cn-beijing.aliyuncs.com/YxModDll/'
    downloads = [base + 'x64/YxMod-x64-Setup.exe', base + 'x64/YxModRelease-x64.zip', base + 'YxModRelease.zip']
    assert all(url in page.targets for url in downloads), 'Missing independent EXE / ZIP / x32 download'
    assert page.targets.index(downloads[2]) > page.targets.index(downloads[1]), 'Classic x32 belongs after x64'
    catalog = json.loads((SITE / 'history-versions.json').read_text(encoding='utf-8'))
    assert json.loads(''.join(history.catalog)) == catalog, 'Embedded version list differs from the generated index'
    assert catalog['schema'] == 1 and catalog['repository'] == 'kang-png/YxModDll-Static'
    for channel, path in (('x64', 'x64/YxModDll-x64.dll'), ('x32', 'YxModDll.dll')):
        assert catalog['channels'][channel]['path'] == path
        versions = catalog['channels'][channel]['versions']
        assert versions and len({version['blob'] for version in versions}) == len(versions)
        for version in versions:
            assert all(re.fullmatch('[0-9a-f]{40}', version[key]) for key in ('commit', 'blob', 'build'))
    for name in ('index.html', 'site.css', 'site.js', 'favicon.svg', 'site-background.jpg',
                 'install-guide-x64.png', 'install-guide.png', 'support-qr.jpg', 'invite.html',
                 'history.html', 'history.css', 'history.js', 'history-versions.json'):
        assert (ROOT / name).read_bytes() == (SITE / name).read_bytes(), f'Root/docs mirror differs: {name}'
    print('Site assets, anchors, x64/x32 downloads, embedded DLL history and root/docs mirrors passed.')


if __name__ == '__main__':
    main()
