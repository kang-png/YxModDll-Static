import csv
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

import update_maps as maps


def row(map_id, mb, title='普通地图', description='', subscriptions=1):
    return dict(id=str(map_id), title=title, description=description,
                file_size=str(int(mb * 1024 ** 2)), subscriptions=str(subscriptions),
                time_created='123', preview_url='')


def ssr_page(page=1, total=2, ids=('123', '456')):
    query = {'eresult': 1, 'current_page': page, 'total_pages': total,
             'results': [{'publishedfileid': value} for value in ids]}
    state = {'queries': [{'state': {'data': query}}]}
    data = {'loaderData': [json.dumps({'cache': json.dumps(state)})]}
    return '<script type="application/json" id="valve-ssr-data">' + json.dumps(data) + '</script>'


class MapCatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.categories = json.loads(Path(maps.__file__).with_name('categories.json').read_text(encoding='utf-8'))

    def catalogs(self, rows):
        return {meta['file']: selected for meta, selected in maps.build_catalogs(maps.normalize(rows), self.categories)}

    def test_new_steam_nested_ssr(self):
        self.assertEqual(maps.parse_browse(ssr_page(), 1), (['123', '456'], 2))

    def test_wrong_page_or_missing_results_fails(self):
        for html in [ssr_page(page=2), '<html>Access denied</html>',
                     '<script id="valve-ssr-data">{"loaderData":[]}</script>']:
            with self.assertRaises(ValueError):
                maps.parse_browse(html, 1)

    def test_legacy_page(self):
        self.assertEqual(maps.parse_browse('<a data-publishedfileid="123"></a><a href="?p=3">3</a>', 1),
                         (['123'], 3))

    def test_300_500_boundaries_and_large_maps(self):
        catalogs = self.catalogs([row(1, 99), row(2, 100), row(3, 299.99),
                                  row(4, 300), row(5, 499.99), row(6, 500), row(7, 6144)])
        ids = lambda name: {r['id'] for r in catalogs[name]}
        self.assertEqual(ids('maps_100_300.tsv'), {'2', '3'})
        self.assertEqual(ids('maps_300_500.tsv'), {'4', '5'})
        self.assertEqual(ids('maps_100_500.tsv'), {'2', '3', '4', '5'})
        self.assertEqual(ids('maps_500_plus.tsv'), {'6', '7'})

    def test_categories_overlap_and_include_small_maps(self):
        catalogs = self.catalogs([row(1, 30, '躲猫猫感染者'), row(2, 700, '普通', '解密 / 解谜'),
                                  row(3, 200, 'BHOP'), row(4, 200, '恐怖听歌猜歌')])
        self.assertEqual([r['id'] for r in catalogs['maps_hide_seek.tsv']], ['1'])
        self.assertEqual([r['id'] for r in catalogs['maps_infection.tsv']], ['1'])
        self.assertEqual([r['id'] for r in catalogs['maps_puzzle.tsv']], ['2'])
        self.assertEqual([r['id'] for r in catalogs['maps_bhop.tsv']], ['3'])
        self.assertEqual([r['id'] for r in catalogs['maps_horror.tsv']], ['4'])
        self.assertEqual([r['id'] for r in catalogs['maps_guess_song.tsv']], ['4'])
        self.assertFalse(catalogs['maps_100_500.tsv'])
        self.assertFalse(catalogs['maps_500_plus.tsv'])

    def test_export_counts_hashes_sort_and_tsv_safe_titles(self):
        with tempfile.TemporaryDirectory() as temp:
            destination = Path(temp) / 'WorkshopMaps'
            rows = [row(1, 200, '标题\t有\n换行', subscriptions=5), row(2, 200, subscriptions=8),
                    row(2, 200, subscriptions=9), row(3, 0)]
            manifest = maps.publish(rows, self.categories, destination)
            self.assertEqual(manifest['source_count'], 2)
            self.assertEqual(len(manifest['files']), 10)
            for entry in manifest['files']:
                data = (destination / entry['file']).read_bytes()
                self.assertEqual(hashlib.sha256(data).hexdigest(), entry['sha256'])
                lines = list(csv.DictReader(data.decode().splitlines(), delimiter='\t'))
                self.assertEqual(len(lines), entry['count'])
                self.assertTrue(all(len(line) == 6 and None not in line for line in lines))
            lines = (destination / 'maps_100_500.tsv').read_text(encoding='utf-8').splitlines()
            self.assertTrue(lines[1].startswith('2\t'))
            self.assertTrue(lines[2].endswith('标题 有 换行'))
            self.assertFalse(list(Path(temp).glob('workshop-*')))

    def test_empty_source_keeps_existing_files(self):
        with tempfile.TemporaryDirectory() as temp:
            existing = Path(temp) / 'maps_manifest.json'
            existing.write_text('unchanged')
            with self.assertRaises(ValueError):
                maps.publish([], self.categories, Path(temp))
            self.assertEqual(existing.read_text(), 'unchanged')

    def test_incomplete_detail_response_fails(self):
        response = Mock()
        response.json.return_value = {'response': {'publishedfiledetails': [{'publishedfileid': '1', 'result': 9}]}}
        with patch.object(maps, 'request', return_value=response):
            with self.assertRaises(ValueError):
                maps.fetch_details(Mock(), {'1', '2'}, 0)

    def test_removed_private_other_app_and_non_level_are_excluded(self):
        base = dict(publishedfileid='1', result=1, consumer_app_id=477160, file_size=100,
                    tags=[{'tag': 'Levels'}], title='地图', description='')
        details = [base, {**base, 'publishedfileid': '2', 'result': 9},
                   {**base, 'publishedfileid': '3', 'result': 15},
                   {**base, 'publishedfileid': '4', 'consumer_app_id': 1},
                   {**base, 'publishedfileid': '5', 'tags': [{'tag': 'Skins'}]}]
        response = Mock()
        response.json.return_value = {'response': {'publishedfiledetails': details}}
        with patch.object(maps, 'request', return_value=response):
            self.assertEqual([r['id'] for r in maps.fetch_details(Mock(), set('12345'), 0)], ['1'])

    def test_repeated_pagination_is_not_silently_accepted(self):
        response = Mock(text=ssr_page())
        with patch.object(maps, 'request', return_value=response):
            with self.assertRaises(ValueError):
                maps.crawl_ids(Mock(), 0)


if __name__ == '__main__':
    unittest.main()
