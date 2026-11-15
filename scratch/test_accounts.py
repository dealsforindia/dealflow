import smtplib
import ssl

accounts = [
    ("pottemasshippo@gmail.com", "icubbngpnsxgvewy"),
    ("pottemasshippo@gmail.com", "vdblldwbrjhjfijd"),
    ("rudranil204@gmail.com", "icubbngpnsxgvewy"),
    ("rudranil204@gmail.com", "vdblldwbrjhjfijd"),
]

for user, pwd in accounts:
    print(f"\n--- Testing account: {user} with pwd {pwd} ---")
    try:
        s = smtplib.SMTP("smtp.gmail.com", 587, timeout=12)
        s.ehlo()
        s.starttls(context=ssl.create_default_context())
        s.ehlo()
        code, resp = s.login(user, pwd)
        print(f"SUCCESS! Code: {code}, Resp: {resp}")
        s.quit()
    except smtplib.SMTPAuthenticationError as e:
        print(f"AUTH FAILED: {e.smtp_code} {e.smtp_error}")
    except smtplib.SMTPServerDisconnected as e:
        print(f"DISCONNECTED after auth rejection: {e}")
    except Exception as e:
        print(f"ERROR: {type(e).__name__} {e}")
