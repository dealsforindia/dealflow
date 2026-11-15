import sys, unittest
from pathlib import Path
from datetime import date
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'dealbot_backend' / 'dealbot'))
from buyhatke_history import parse_buyhatke_history, _literal

URL = 'https://www.amazon.in/dp/B0DSQ2RF12'
PROVIDER = 'https://www.buyhatke.com/product-example'
def page(pid='B0DSQ2RF12'):
    return f'''<script>productData:{{pid:"{pid}",link:"https://www.amazon.in/dp/{pid}",name:"Dettol, {{example: preserve}}"}},predictedData:{{history:[{{from:"2025-07-16 00:15:26",to:"2025-07-17 00:03:28",price:220}},{{from:"2026-10-12 00:02:13",to:"2026-10-12 00:02:13",price:180}}]}}</script>'''

class BuyhatkeHistory(unittest.TestCase):
    def test_literal_preserves_strings_and_rejects_executable_values(self):
        self.assertEqual(_literal('data:{name:"Hi,{foo:ok}",empty:undefined}', 'data:'), {'name':'Hi,{foo:ok}','empty':None})
        with self.assertRaises(ValueError): _literal('data:{price:process.exit()}', 'data:')
    def test_primary_identity_and_date_coverage(self):
        result=parse_buyhatke_history(page(),URL,PROVIDER,today=date(2026,10,12))
        self.assertEqual(result['interval_count'],2)
        self.assertEqual(result['intervals'][0]['start_date'],'2025-07-16')
        self.assertFalse(result['current_price_verified'])
        with self.assertRaises(ValueError): parse_buyhatke_history(page('B0AAAAAAAA'),URL,PROVIDER)
    def test_future_history_and_untrusted_provider(self):
        result=parse_buyhatke_history(page(),URL,PROVIDER,today=date(2026,10,11))
        self.assertEqual(result['interval_count'],1)
        with self.assertRaises(ValueError): parse_buyhatke_history(page(),URL,'https://buyhatke.com.evil.test/product')

if __name__=='__main__': unittest.main()
