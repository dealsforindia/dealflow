"""Read current handler ASTs and exercise them with in-memory doubles only.
No API imports, network calls, production writes, credentials, or broadcasts.
Run from the workspace root: python scratch/system_review_probes.py
"""
import ast
import asyncio
import copy
import json
import logging
import os
import socket
import sys
import time
import warnings
from pathlib import Path
from types import SimpleNamespace

if sys.platform == 'win32':
    warnings.filterwarnings('ignore', category=DeprecationWarning)
    _orig_socketpair = socket.socketpair
    def _resilient_socketpair(*args, **kwargs):
        for _ in range(10):
            try:
                return _orig_socketpair(*args, **kwargs)
            except OSError as e:
                if getattr(e, 'winerror', None) == 10013 or '10013' in str(e):
                    time.sleep(0.05)
                    continue
                raise
        return _orig_socketpair(*args, **kwargs)
    socket.socketpair = _resilient_socketpair
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

ROOT = Path(__file__).resolve().parents[1]
API = ast.parse((ROOT / 'dealbot_backend/dealbot/api.py').read_text(encoding='utf-8-sig'))
WORKER = ast.parse((ROOT / 'dealbot_backend/dealbot/worker.py').read_text(encoding='utf-8-sig'))

def load(node, scope):
    node = copy.deepcopy(node)
    node.decorator_list = []
    node.returns = None
    for arg in node.args.args + node.args.kwonlyargs:
        arg.annotation = None
    node.args.defaults = [ast.Constant(True) for _ in node.args.defaults]
    module = ast.fix_missing_locations(ast.Module(body=[node], type_ignores=[]))
    exec(compile(module, 'isolated-current-handler', 'exec'), scope)
    return scope[node.name]

class HTTPError(Exception):
    def __init__(self, status, detail): self.status, self.detail = status, detail

class Collection:
    def __init__(self, doc): self.doc = copy.deepcopy(doc); self.updates = []
    async def update_one(self, query, update, **kwargs):
        self.updates.append(copy.deepcopy(update))
        if self.doc is not None: self.doc.update(update.get('$set', {}))
        return SimpleNamespace(modified_count=int(self.doc is not None), matched_count=int(self.doc is not None))
    async def find_one(self, *args, **kwargs): return copy.deepcopy(self.doc)
    async def update_many(self, *args, **kwargs): return SimpleNamespace(modified_count=0)

class Redis:
    def __init__(self, fail=False): self.fail = fail; self.events = []
    def publish(self, channel, payload):
        if self.fail: raise ConnectionError('simulated broker failure')
        self.events.append(channel)
        return 1

class Manager:
    async def broadcast(self, data): pass

async def approve_probe(doc, body, fail=False):
    collection = Collection(doc)
    redis = Redis(fail)
    scope = {'get_db': lambda: SimpleNamespace(UniqueDeals=collection),
             'build_deal_id_query': lambda fp: {'fp_hash': fp},
             'time': time, 'os': os, 'json': json, 'log': logging.getLogger('probe'),
             'HTTPException': HTTPError, 'manager': Manager(), '_redis': redis}
    node = next(n for n in API.body if isinstance(n, ast.AsyncFunctionDef) and n.name == 'approve_deal')
    fn = load(node, scope)
    async def request_json(): return body
    result = await fn('fixture-id', SimpleNamespace(json=request_json))
    return {'response': result, 'stored': collection.doc, 'events': redis.events}

async def rules_probe():
    collection = Collection({'enabled': True, 'rules': []})
    scope = {'get_db': lambda: SimpleNamespace(SystemSettings=collection),
             'time': time, 'json': json, 'log': logging.getLogger('probe'), '_redis': Redis(), 'HTTPException': HTTPError}
    node = next(n for n in API.body if isinstance(n, ast.AsyncFunctionDef) and n.name in ('update_auto_rules_endpoint', 'update_auto_rules'))
    await load(node, scope)({'enabled': False, 'rules': [{'id': 'fixture-rule'}]})
    return {'requested_enabled': False, 'stored_enabled': collection.doc['enabled'], 'update': collection.updates}

class StopProbe(BaseException): pass

async def worker_probe():
    original = next(n for n in WORKER.body if isinstance(n, ast.AsyncFunctionDef) and n.name == 'worker_loop')
    node = copy.deepcopy(original)
    start = next(i for i,n in enumerate(node.body) if isinstance(n, ast.Assign) and any(isinstance(t,ast.Name) and t.id=='deal_semaphore' for t in n.targets))
    node.body = node.body[start:]
    state = {'polls': 0, 'processed': 0}
    class Queue:
        def blpop(self, *args, **kwargs):
            state['polls'] += 1
            if state['polls'] == 1: return ('queue:deals', '{}')
            if state['polls'] < 5: return None
            raise StopProbe()
    async def process(raw): state['processed'] += 1
    scope = {'asyncio': asyncio, '_redis': Queue(), 'QUEUE_KEY': 'queue:deals',
             'process_deal': process, 'json': json, 'log': logging.getLogger('probe')}
    try: await load(node, scope)()
    except StopProbe: pass
    before = state['processed']
    await asyncio.sleep(0)
    return {'queue_polls': state['polls'], 'processed_before_forced_yield': before, 'processed_after_forced_yield': state['processed']}

async def main():
    results = {}
    stock = await approve_probe({'fp_hash': 'fixture-id', 'is_oos': True, 'in_stock': False}, {'destinations': ['storefront_only']})
    results['approval_overwrites_stock'] = {k: stock['stored'].get(k) for k in ['status','is_oos','in_stock','stock_status']}
    try:
        missing = await approve_probe(None, {'destinations': ['storefront_only']})
    except HTTPError as e:
        missing = {'status': e.status, 'detail': e.detail}
    results['approval_missing_record'] = missing
    broker = await approve_probe({'fp_hash': 'fixture-id'}, {}, True)
    results['approval_broker_failure'] = {'response_status': broker['response']['status'], 'stored_status': broker['stored']['status'], 'warning': broker['response'].get('warning')}
    results['master_rule_disable'] = await rules_probe()
    results['worker_event_loop'] = await worker_probe()
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    asyncio.run(main())
