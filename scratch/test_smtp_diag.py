import socket
import smtplib
import ssl

print("--- DNS resolution for smtp.gmail.com ---")
try:
    infos = socket.getaddrinfo('smtp.gmail.com', 587, socket.AF_UNSPEC, socket.SOCK_STREAM)
    for info in infos:
        family, socktype, proto, canonname, sockaddr = info
        fam_str = 'IPv4' if family == socket.AF_INET else 'IPv6'
        print(f"Family: {fam_str}, Sockaddr: {sockaddr}")
except Exception as e:
    print(f"DNS error: {e}")

print("\n--- Testing port 587 (STARTTLS) ---")
try:
    s = smtplib.SMTP('smtp.gmail.com', 587, timeout=12)
    s.set_debuglevel(1)
    s.ehlo()
    s.starttls(context=ssl.create_default_context())
    s.ehlo()
    s.login('pottemasshippo@gmail.com', 'icubbngpnsxgvewy')
    print("587 LOGIN SUCCESS!")
    s.quit()
except Exception as e:
    print(f"587 FAILED: {type(e).__name__}: {e}")

print("\n--- Testing port 465 (SSL) ---")
try:
    s = smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=12, context=ssl.create_default_context())
    s.set_debuglevel(1)
    s.login('pottemasshippo@gmail.com', 'icubbngpnsxgvewy')
    print("465 LOGIN SUCCESS!")
    s.quit()
except Exception as e:
    print(f"465 FAILED: {type(e).__name__}: {e}")
