"""Validate the deployed site without downloading or republishing release files."""
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / 'docs'


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.targets = []
        self.ids = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for key in ('src', 'href'):
            if key in attrs:
                self.targets.append(attrs[key])


def main():
    page = Links()
    page.feed((SITE / 'index.html').read_text(encoding='utf-8'))
    assert len(page.ids) == len(set(page.ids)), 'Duplicate page element IDs'
    for target in page.targets:
        if target.startswith('./'):
            relative = target[2:].split('#', 1)[0].split('?', 1)[0]
            assert (SITE / relative).is_file(), f'Missing site asset: {target}'
        elif target.startswith('#') and target != '#':
            assert target[1:] in page.ids, f'Missing anchor: {target}'
    base = 'https://fxclient.oss-cn-beijing.aliyuncs.com/YxModDll/'
    downloads = [base + 'x64/YxMod-x64-Setup.exe', base + 'x64/YxModRelease-x64.zip', base + 'YxModRelease.zip']
    assert all(url in page.targets for url in downloads), 'Missing independent EXE / ZIP / x32 download'
    assert page.targets.index(downloads[2]) > page.targets.index(downloads[1]), 'Classic x32 belongs after x64'
    for name in ('index.html', 'site.css', 'site.js', 'favicon.svg', 'install-guide-x64.png'):
        assert (ROOT / name).read_bytes() == (SITE / name).read_bytes(), f'Root/docs mirror differs: {name}'
    print('Site assets, anchors, x64 EXE/ZIP, classic x32 and root/docs mirror passed.')


if __name__ == '__main__':
    main()
