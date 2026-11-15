import urllib.request
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


class NoAuthRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        new_req = super().redirect_request(req, fp, code, msg, headers, newurl)
        if 'Authorization' in new_req.headers:
            del new_req.headers['Authorization']
        return new_req

import os

token = os.getenv("GITHUB_TOKEN", "")
opener = urllib.request.build_opener(NoAuthRedirect)
req = urllib.request.Request(
    'https://api.github.com/repos/dealsforindia/dealflow/actions/jobs/105880609377/logs',
    headers={'Authorization': f'Bearer {token}', 'User-Agent': 'test'} if token else {'User-Agent': 'test'}
)
log = opener.open(req).read().decode('utf-8', 'replace')
print(log[-12000:])

