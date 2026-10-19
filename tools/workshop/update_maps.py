"""Refresh the public HFF map catalog; export-only works with the saved CSV."""
import argparse
import csv
import hashlib
import json
import os
import re
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
APP_ID = 477160
DETAILS_API = 'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/'
BROWSE_URL = 'https://steamcommunity.com/workshop/browse/'
FIELDS = ['id', 'title', 'description', 'file_size', 'subscriptions', 'time_created', 'preview_url']
TSV_FIELDS = ['id', 'file_size', 'file_size_mb', 'subscriptions', 'time_created', 'title']
SIZE_LISTS = [
    ('maps_100_300.tsv', '100–300 MB', 100, 300),
    ('maps_300_500.tsv', '300–500 MB', 300, 500),
    ('maps_100_500.tsv', '100–500 MB', 100, 500),
    ('maps_500_plus.tsv', '500 MB+', 500, None),
]


def clean(value):
    return re.sub(r'\s+', ' ', str(value or '')).strip()


def json_objects(value):
    if isinstance(value, str) and value[:1] in ('{', '['):
        try:
            yield from json_objects(json.loads(value))
        except ValueError:
            pass
    elif isinstance(value, dict):
        yield value
        for child in value.values():
            yield from json_objects(child)
    elif isinstance(value, list):
        for child in value:
            yield from json_objects(child)


def parse_browse(html, expected_page):
    """Steam embeds its query result in valve-ssr-data as nested JSON strings."""
    match = re.search(r'<script\b[^>]*\bid=["\']valve-ssr-data["\'][^>]*>(.*?)</script>', html, re.S)
    if match:
        for data in json_objects(json.loads(match.group(1))):
            if 'results' not in data or 'total_pages' not in data:
                continue
            if int(data.get('eresult', 1)) != 1:
                raise ValueError('Steam browse query failed')
            if int(data['current_page']) != expected_page:
                raise ValueError('Steam returned a different page; refusing a partial catalog')
            ids = [str(item['publishedfileid']) for item in data['results']]
            return list(dict.fromkeys(ids)), int(data['total_pages'])
        raise ValueError('Steam SSR page has no workshop query result')
    ids = re.findall(r'data-publishedfileid="(\d+)"', html)
    if not ids:
        ids = re.findall(r'filedetails/\?id=(\d+)', html)
    if not ids:
        raise ValueError('No workshop IDs found; Steam may have changed its page or blocked the request')
    pages = re.findall(r'[?&]p=(\d+)', html)
    return list(dict.fromkeys(ids)), max(map(int, pages), default=expected_page)


def request(session, method, url, **kwargs):
    for attempt in range(3):
        try:
            response = session.request(method, url, timeout=30, **kwargs)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return response
        except requests.RequestException:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)


def crawl_ids(session, delay):
    all_ids = set()
    page = 1
    total_pages = 1
    while page <= total_pages:
        response = request(session, 'GET', BROWSE_URL, params={
            'appid': APP_ID, 'requiredtags[0]': 'Levels',
            'actualsort': 'mostrecent', 'browsesort': 'mostrecent', 'p': page,
        })
        ids, total_pages = parse_browse(response.text, page)
        new_ids = set(ids) - all_ids
        if not ids or not new_ids or total_pages > 5000:
            raise ValueError(f'Unexpected browse pagination on page {page}; catalog not published')
        all_ids.update(ids)
        if page == 1 or page % 10 == 0 or page == total_pages:
            print(f'Browse {page}/{total_pages}: {len(all_ids)} map IDs', flush=True)
        page += 1
        time.sleep(delay)
    return all_ids


def read_details(path):
    if not path.exists():
        return []
    with path.open(encoding='utf-8-sig', newline='') as file:
        return list(csv.DictReader(file))


def fetch_details(session, ids, delay):
    ids = sorted(ids, key=int)
    rows = []
    for start in range(0, len(ids), 50):
        batch = ids[start:start + 50]
        payload = {'itemcount': str(len(batch))}
        payload.update({f'publishedfileids[{i}]': value for i, value in enumerate(batch)})
        data = request(session, 'POST', DETAILS_API, data=payload).json()
        details = data['response']['publishedfiledetails']
        if {str(item['publishedfileid']) for item in details} != set(batch):
            raise ValueError('Incomplete Steam detail response; catalog not published')
        for item in details:
            result = int(item.get('result', 0))
            if result in (9, 15):
                continue  # Removed/private entries are no longer available to players.
            if result != 1:
                raise ValueError(f"Steam detail result {result} for {item['publishedfileid']}")
            tags = {tag['tag'].casefold() for tag in item.get('tags', [])}
            if int(item.get('consumer_app_id', 0)) != APP_ID or 'levels' not in tags:
                continue
            rows.append({
                'id': str(item['publishedfileid']), 'title': clean(item.get('title')),
                'description': clean(item.get('description')),
                'file_size': str(int(item.get('file_size') or 0)),
                'subscriptions': str(int(item.get('subscriptions') or 0)),
                'time_created': str(int(item.get('time_created') or 0)),
                'preview_url': item.get('preview_url', ''),
            })
        if start % 500 == 0 or start + 50 >= len(ids):
            print(f'Details {min(start + 50, len(ids))}/{len(ids)}: {len(rows)} available maps', flush=True)
        time.sleep(delay)
    return rows


def normalize(rows):
    by_id = {}
    for row in rows:
        map_id = str(row['id']).strip()
        if not map_id.isdigit() or int(row.get('file_size') or 0) <= 0:
            continue
        by_id[map_id] = {key: clean(row.get(key)) for key in FIELDS}
    return sorted(by_id.values(), key=lambda row: (-int(row['subscriptions'] or 0), int(row['id'])))


def classify(row, categories):
    text = (row['title'] + ' ' + row['description']).casefold()
    return [category['id'] for category in categories
            if any(word.casefold() in text for word in category['keywords'])]


def build_catalogs(rows, categories):
    classifications = {row['id']: classify(row, categories) for row in rows}
    ordinary = [row for row in rows if not classifications[row['id']]]
    catalogs = []
    for filename, label, minimum, maximum in SIZE_LISTS:
        selected = [row for row in ordinary if int(row['file_size']) >= minimum * 1024 ** 2
                    and (maximum is None or int(row['file_size']) < maximum * 1024 ** 2)]
        catalogs.append(({'file': filename, 'label': label, 'min_mb': minimum, 'max_mb': maximum}, selected))
    for category in categories:
        selected = [row for row in rows if category['id'] in classifications[row['id']]]
        catalogs.append(({'file': f"maps_{category['id']}.tsv", 'label': category['label'],
                          'category': category['id'], 'min_mb': 0, 'max_mb': None}, selected))
    return catalogs


def publish(rows, categories, destination):
    rows = normalize(rows)
    if not rows:
        raise ValueError('Empty source data; refusing to replace the existing catalog')
    catalogs = build_catalogs(rows, categories)
    destination.mkdir(parents=True, exist_ok=True)
    manifest = {'version': 2, 'generated_at': datetime.now(timezone.utc).isoformat(),
                'source': 'workshop_details.csv', 'source_count': len(rows),
                'classification': 'title and description keywords; categories may overlap', 'files': []}
    with tempfile.TemporaryDirectory(prefix='workshop-', dir=destination.parent) as temporary:
        stage = Path(temporary)
        with (stage / 'workshop_details.csv').open('w', encoding='utf-8', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=FIELDS, lineterminator='\n')
            writer.writeheader()
            writer.writerows(rows)
        for metadata, selected in catalogs:
            path = stage / metadata['file']
            with path.open('w', encoding='utf-8', newline='') as file:
                writer = csv.writer(file, delimiter='\t', lineterminator='\n')
                writer.writerow(TSV_FIELDS)
                for row in selected:
                    writer.writerow([row['id'], row['file_size'], f"{int(row['file_size']) / 1024 ** 2:.1f}",
                                     row['subscriptions'], row['time_created'], row['title']])
            manifest['files'].append({**metadata, 'count': len(selected),
                                      'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
        (stage / 'maps_manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        for path in stage.iterdir():
            os.replace(path, destination / path.name)
    for entry in manifest['files']:
        print(f"{entry['file']}: {entry['count']}", flush=True)
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true', help='Crawl every page and refresh all details before export')
    parser.add_argument('--output', type=Path, default=ROOT / 'WorkshopMaps')
    parser.add_argument('--categories', type=Path, default=Path(__file__).with_name('categories.json'))
    parser.add_argument('--proxy', default='', help='Optional HTTP/SOCKS proxy; Actions connects directly')
    parser.add_argument('--delay', type=float, default=0.5)
    args = parser.parse_args()
    rows = read_details(args.output / 'workshop_details.csv')
    categories = json.loads(args.categories.read_text(encoding='utf-8'))
    if args.refresh:
        with requests.Session() as session:
            session.headers['User-Agent'] = 'YxMod-WorkshopCatalog/2.0 (public HFF map lists)'
            if args.proxy:
                session.proxies.update({'http': args.proxy, 'https': args.proxy})
            ids = crawl_ids(session, args.delay)
            ids.update(row['id'] for row in rows)
            rows = fetch_details(session, ids, args.delay)
    publish(rows, categories, args.output)


if __name__ == '__main__':
    main()
