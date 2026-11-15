"""Exercise the API parser without importing API startup or contacting services."""
import ast
from pathlib import Path
import re
import unittest
from typing import Optional

source = Path(__file__).resolve().parents[1] / 'dealbot_backend/dealbot/api.py'
tree = ast.parse(source.read_text(encoding='utf-8-sig'))
function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'parse_universal_multi_deal_items')
scope = {'re': re, 'Optional': Optional, 'AMAZON_AFFILIATE_TAG': 'fixture-21'}
exec(compile(ast.Module(body=[function], type_ignores=[]), str(source), 'exec'), scope)
parse = scope['parse_universal_multi_deal_items']


class MultiOptionsTests(unittest.TestCase):
    def test_markdown_labels_and_destinations(self):
        items = parse('[Blue kurta](https://example.com/blue)\n[Black kurta](https://example.com/black)', 90)
        self.assertEqual([i['label'] for i in items], ['Blue kurta', 'Black kurta'])
        self.assertEqual(items[0]['url'], 'https://example.com/blue')
        self.assertIsNone(items[0]['discount'])

    def test_duplicate_links_do_not_make_multiple_products(self):
        self.assertEqual(parse('[ ](https://example.com/product)\nhttps://example.com/product'), [])

    def test_unlabelled_links_are_not_invented_options(self):
        self.assertEqual(parse('[](https://example.com/a)\nhttps://example.com/b'), [])

    def test_live_kurta_preview_and_merchant_link_are_not_variants(self):
        text = '[ ](https://shoppingenie.in/preview?token=fixture)**₹387**\nhttps://www.amazon.in/dp/B0D5Q9GHJ9?tag=fixture-21'
        self.assertEqual(parse(text, 90), [])

    def test_named_plain_options_keep_individual_prices(self):
        items = parse('Blue kurta @ Rs. 599 20% off: https://example.com/a\nBlack kurta @ Rs. 699: https://example.com/b', 90)
        self.assertEqual([i['price'] for i in items], [599, 699])
        self.assertEqual([i['discount'] for i in items], [20, None])


if __name__ == '__main__':
    unittest.main()
