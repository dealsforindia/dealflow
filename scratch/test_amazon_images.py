import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'dealbot_backend' / 'dealbot'))
from amazon_images import extract_amazon_image, amazon_cdn_image

class AmazonImages(unittest.TestCase):
    def test_primary_gallery_largest_image(self):
        html = '''<link rel="canonical" href="https://www.amazon.in/dp/B0DSQ2RF12">
          <img data-a-dynamic-image='{ "https://m.media-amazon.com/images/I/small.jpg": [100,100], "https://m.media-amazon.com/images/I/large.jpg": [1500,1500] }' id="landingImage">
          <img data-old-hires="https://m.media-amazon.com/images/I/recommendation.jpg">'''
        self.assertEqual(extract_amazon_image(html, 'https://www.amazon.in/dp/B0DSQ2RF12'), 'https://m.media-amazon.com/images/I/large.jpg')
    def test_wrong_product_and_blocked_page(self):
        html = '<input id="ASIN" value="B0AAAAAAAA"><img id="landingImage" src="https://m.media-amazon.com/images/I/wrong.jpg">'
        self.assertIsNone(extract_amazon_image(html, 'https://www.amazon.in/dp/B0DSQ2RF12'))
        self.assertIsNone(extract_amazon_image('<input id="captchacharacters">', 'https://www.amazon.in/dp/B0DSQ2RF12'))
    def test_untrusted_and_brand_images_rejected(self):
        self.assertIsNone(amazon_cdn_image('https://m.media-amazon.com.evil.test/images/I/a.jpg'))
        self.assertIsNone(amazon_cdn_image('https://m.media-amazon.com/images/G/logo.jpg'))
        self.assertIsNone(amazon_cdn_image('http://m.media-amazon.com/images/I/a.jpg'))

if __name__ == '__main__': unittest.main()
