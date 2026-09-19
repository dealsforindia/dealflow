import os
import json
import urllib.request
import urllib.error

gkey = os.getenv("GROQ_API_KEY", "")

cerebras_key = os.getenv("CEREBRAS_API_KEY", "")

test_cases = [
    {
        "name": "Kotak 811 Bank Promo",
        "text": "SMART BANKING, BIGGER SAVINGS!\nOpen Kotak 811 Savings Account now & get ₹6,000 Cashback + 5.75% Interest\nBenefits: ₹6000 cashback, 100% digital KYC\nOpen Account Now: https://bilty.co/HapWR5"
    },
    {
        "name": "boAt Airdopes Deal",
        "text": "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds with 42H Playtime, Beast Mode @ ₹999 (75% OFF)\n👉 https://amzn.to/3xyz"
    },
    {
        "name": "Crypto/Survey App Install",
        "text": "🔥 Earn ₹500 Daily! Install CoinSwitch Kuber and get ₹100 Free Bitcoin on signup. Complete KYC and refer friends to get ₹250 per refer. Link: https://coinswitch.co/invite"
    },
    {
        "name": "Telegram Channel Cross Promo",
        "text": "Join our VIP Private Channel for exclusive cricket match predictions and tricks! Click here to join for free: https://t.me/+joinchat123"
    },
    {
        "name": "Puma Shoes Deal",
        "text": "Puma Men's Smashic Casual Shoes at ₹1,499 (MRP ₹4,499) 66% off!\nApply coupon PUMA20 for extra ₹200 off\n👉 https://myntr.it/shoe123"
    }
]

system_prompt = """You are an ultra-fast, highly accurate AI Deal Intelligence Classifier for an Indian e-commerce shopping curation engine.
Your task: evaluate whether an incoming post is a GENUINE RETAIL CONSUMER PRODUCT DEAL (physical/digital merchandise being sold with a discounted price on a verified shopping store like Amazon, Flipkart, Myntra, Ajio, Swiggy, Blinkit, Croma, etc.) OR a NON-DEAL / SPAM / PROMO (banking, savings account, credit card, personal loan, Demat/trading account, crypto, refer-and-earn app install, betting/fantasy, survey/task, channel cross-promo, or fake cashback).

Respond ONLY with a JSON object:
{
  "is_retail_deal": true/false,
  "category": "retail_product" | "financial_lead" | "referral_app" | "betting_gaming" | "spam_promo",
  "confidence": 0.0 - 1.0,
  "reason": "Brief reason",
  "clean_product_name": "Name of product or null",
  "real_price": number or null
}
"""

gem_key = os.getenv("GEMINI_API_KEY", "")
cerebras_key = os.getenv("CEREBRAS_API_KEY", "")

for tc in test_cases:
    print(f"\n--- Testing: {tc['name']} ---")
    prompt = f"{system_prompt}\n\nPost Text:\n{tc['text']}\n\nRespond ONLY with JSON:"
    # Test Cerebras
    payload = {
        "model": "llama3.1-8b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": 150
    }
    req = urllib.request.Request(
        "https://api.cerebras.ai/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {cerebras_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            content = res_data["choices"][0]["message"]["content"]
            # Extract JSON block
            import re
            m = re.search(r'\{.*\}', content, re.DOTALL)
            if m:
                data = json.loads(m.group(0))
                print("  [Cerebras] is_retail_deal:", data.get("is_retail_deal"))
                print("  [Cerebras] category:", data.get("category"))
                print("  [Cerebras] reason:", data.get("reason"))
                print("  [Cerebras] clean_title:", data.get("clean_product_name"))
                print("  [Cerebras] real_price:", data.get("real_price"))
            else:
                print("  [Cerebras] raw:", content)
    except Exception as e:
        print("  [Cerebras] Error:", e)
