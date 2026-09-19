import unittest
from deal_intelligence import classify_deal_intent, calculate_deal_intelligence_score, is_non_deal_promo

class TestDealIntelligence(unittest.TestCase):

    def test_kotak_811_detected_as_financial_lead(self):
        # Exact message from user's screenshot
        text = """
        📢 SMART BANKING, BIGGER SAVINGS! 📢
        💰 Open Kotak 811 Savings Account now & get ₹6,000 Cashback + 5.75% Interest 😍
        ⭐Benefits You Get :
        ✔️ ₹6,000 Cashback with 811 Super
        ✔️ 5.75%* Interest with ActivMoney
        ✔️ 100% Digital Process (No Branch Visit)
        ✔️ Quick & Secure Online KYC
        🚨 Open your account with just a one-time ₹2,000 deposit!
        🔗 Open Account Now : https://bilty.co/HapWR5
        """
        urls = ["https://www.kotak811.bank.in:443/open-zero-balance-savings-account"]
        res = classify_deal_intent(text, urls)
        self.assertFalse(res["is_deal"])
        self.assertEqual(res["intent"], "FINANCIAL_LEAD")
        self.assertTrue(is_non_deal_promo(text, urls))

    def test_credit_card_detected_as_financial_lead(self):
        text = "🔥 Apply for Axis Bank Lifetime Free Credit Card! Pre-approved limit up to ₹5,00,000. No joining fee!"
        urls = ["https://axisbank.com/credit-cards/apply"]
        res = classify_deal_intent(text, urls)
        self.assertFalse(res["is_deal"])
        self.assertEqual(res["intent"], "FINANCIAL_LEAD")

    def test_demat_account_detected_as_financial_lead(self):
        text = "Open Free Demat Account with Angel One & get ₹500 brokerage cashback! Start trading today."
        urls = ["https://angelone.in/open-demat"]
        res = classify_deal_intent(text, urls)
        self.assertFalse(res["is_deal"])
        self.assertEqual(res["intent"], "FINANCIAL_LEAD")

    def test_personal_loan_detected_as_financial_lead(self):
        text = "Need money fast? Get Instant Personal Loan up to ₹5 Lakhs with zero processing fee on Navi."
        urls = ["https://navi.com/cash-loan"]
        res = classify_deal_intent(text, urls)
        self.assertFalse(res["is_deal"])
        self.assertEqual(res["intent"], "FINANCIAL_LEAD")

    def test_refer_and_earn_detected_as_referral(self):
        text = "🎉 Refer and earn ₹150 per refer! Download app and register now with referral code LOOT50."
        urls = ["https://example.com/invite"]
        res = classify_deal_intent(text, urls)
        self.assertFalse(res["is_deal"])
        self.assertEqual(res["intent"], "REFERRAL_PROMO")

    def test_genuine_product_deal_allowed(self):
        text = "boAt Rockerz 450 Bluetooth On Ear Headphones with Mic (Luscious Black) @ ₹1,299 (67% off) https://amzn.to/3xyz"
        urls = ["https://www.amazon.in/dp/B07PR1CL3S"]
        res = classify_deal_intent(text, urls)
        self.assertTrue(res["is_deal"])
        self.assertEqual(res["intent"], "IS_DEAL")
        self.assertFalse(is_non_deal_promo(text, urls))

    def test_intelligence_scoring(self):
        deal = {
            "prod_name": "Sony WH-1000XM5 Wireless Headphones",
            "price": 19990,
            "mrp": 34990,
            "discount": 43,
            "platforms": ["Amazon"],
            "coupon": "Apply ₹2000 coupon on page",
            "store_img_url": "https://m.media-amazon.com/images/I/xyz.jpg"
        }
        score_data = calculate_deal_intelligence_score(deal)
        self.assertGreaterEqual(score_data["score"], 60)
        self.assertIn(score_data["tier_label"], ["Steal Deal", "Loot Drop"])
        self.assertTrue(score_data["is_worth_posting"])
        self.assertTrue(any("Verified Store" in b for b in score_data["badges"]))
        self.assertTrue(any("Coupon" in b for b in score_data["badges"]))

if __name__ == "__main__":
    unittest.main()
