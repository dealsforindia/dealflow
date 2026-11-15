import smtplib
import ssl
from email.mime.text import MIMEText

msg = MIMEText("This is a live test from IndiaDealHunts auth system.")
msg["Subject"] = "IndiaDealHunts SMTP Test"
msg["From"] = "IndiaDealHunts <pottemasshippo@gmail.com>"
msg["To"] = "rudranil204@gmail.com"

s = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
s.ehlo()
s.starttls(context=ssl.create_default_context())
s.ehlo()
s.login("pottemasshippo@gmail.com", "vdblldwbrjhjfijd")
s.sendmail("pottemasshippo@gmail.com", ["rudranil204@gmail.com"], msg.as_string())
s.quit()
print("EMAIL_SENT_SUCCESSFULLY")
