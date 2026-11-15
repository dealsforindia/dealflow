path = 'dealbot_backend/dealbot/api.py'
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()

old_s = '''                    if c_info["type"] == "percent":
                        d["coupon_discount"] = round(sale * (c_info["value"] / 100.0), 2)
                        d["effective_price"] = round(sale - d["coupon_discount"], 2)
                    elif c_info["type"] == "fixed":
                        d["coupon_discount"] = float(c_info["value"])
                        d["effective_price"] = max(0.0, round(sale - d["coupon_discount"], 2))'''

new_s = '''                    if c_info["type"] == "percent":
                        d["coupon_discount"] = round(sale * (c_info["value"] / 100.0))
                        d["effective_price"] = max(0, round(sale - d["coupon_discount"]))
                    elif c_info["type"] == "fixed":
                        d["coupon_discount"] = round(float(c_info["value"]))
                        d["effective_price"] = max(0, round(sale - d["coupon_discount"]))'''

assert old_s in s, "old_s not found"
s = s.replace(old_s, new_s, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(s)

print("api.py coupon rounding updated successfully!")
