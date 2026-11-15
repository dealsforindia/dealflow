import sys

path = r'rudranil-deals-web/src/components/ProfilePage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. E35: User auth state requires idh_auth_token
old_user_email = """  // User auth state
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('idh_user_email') || '';
    } catch {
      return '';
    }
  });"""

new_user_email = """  // User auth state: strictly authenticated only if idh_auth_token exists
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      const token = localStorage.getItem('idh_auth_token');
      if (!token) return '';
      return localStorage.getItem('idh_user_email') || '';
    } catch {
      return '';
    }
  });"""

# Guest alert email should not set authenticated userEmail state
old_guest_alert = """      if (!userEmail) {
        setUserEmail(cleanEmail);
        try {
          localStorage.setItem('idh_user_email', cleanEmail);
        } catch {}
      }"""

new_guest_alert = """      if (!userEmail) {
        try {
          localStorage.setItem('idh_last_alert_email', cleanEmail);
        } catch {}
      }"""

# 2. E38: Alert deletion failure handling
old_del_alert = """      if (res.ok) {
        setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
        onShowToast?.('Price scraper stopped and removed from radar.');
      } else {
        setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch {
      setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }"""

new_del_alert = """      if (res.ok) {
        setTrackedAlerts((prev) => prev.filter((a) => a.id !== alertId));
        onShowToast?.('Price scraper stopped and removed from radar.');
      } else {
        const errData = await res.json().catch(() => null);
        const errMsg = errData?.detail || 'Failed to remove alert from server. Please try again.';
        onShowToast?.(errMsg);
      }
    } catch {
      onShowToast?.('Network error: Could not remove alert from server.');
    }"""

norm_text = text.replace('\r\n', '\n')
norm_text = norm_text.replace(old_user_email.replace('\r\n', '\n'), new_user_email.replace('\r\n', '\n'))
norm_text = norm_text.replace(old_guest_alert.replace('\r\n', '\n'), new_guest_alert.replace('\r\n', '\n'))
norm_text = norm_text.replace(old_del_alert.replace('\r\n', '\n'), new_del_alert.replace('\r\n', '\n'))

with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(norm_text.replace('\n', '\r\n'))

print("ProfilePage.tsx patched successfully!")

