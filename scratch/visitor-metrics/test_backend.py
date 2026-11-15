import ast, asyncio, pathlib, re, hashlib
from types import SimpleNamespace

class HTTPException(Exception):
    def __init__(self, status_code, detail): self.status_code=status_code
class Response:
    def __init__(self, status_code=200, headers=None): self.status_code=status_code; self.headers=headers or {}
class Pipeline:
    def __init__(self, redis): self.redis=redis; self.ops=[]
    def __enter__(self): return self
    def __exit__(self,*args): pass
    def __getattr__(self,name):
        def enqueue(*args): self.ops.append((name,args)); return self
        return enqueue
    def execute(self):
        results=[]
        for name,args in self.ops:
            if name=='sadd':
                bucket=self.redis.sets.setdefault(args[0],set()); before=len(bucket); bucket.add(args[1]); results.append(len(bucket)-before)
            elif name=='incr':
                self.redis.attempts+=1; results.append(self.redis.attempts)
            elif name=='expire': self.redis.expirations[args[0]]=args[1]; results.append(True)
        return results
class Redis:
    def __init__(self): self.sets={}; self.expirations={}; self.attempts=0
    def pipeline(self): return Pipeline(self)
    def scard(self,key): return len(self.sets.get(key,set()))

source=ast.parse(pathlib.Path('dealbot_backend/dealbot/api.py').read_text(encoding='utf-8'))
names={'record_storefront_visit','storefront_visitors'}
nodes=[n for n in source.body if isinstance(n,ast.AsyncFunctionDef) and n.name in names]
for node in nodes:
    node.decorator_list=[]; node.returns=None
    for arg in node.args.args: arg.annotation=None
    node.args.defaults=[]
redis=Redis()
ns=dict(asyncio=asyncio,re=re,hashlib=hashlib,_redis=redis,HTTPException=HTTPException,Response=Response)
exec(compile(ast.Module(body=nodes,type_ignores=[]),'<visitor-endpoints>','exec'),ns)
request=SimpleNamespace(headers={'origin':'https://www.indiadealhunts.me'},client=SimpleNamespace(host='test-client'))
async def main():
    record=ns['record_storefront_visit']; read=ns['storefront_visitors']
    visit=SimpleNamespace(visitor_id='a'*32)
    assert (await record(visit,request)).status_code==204
    await record(visit,request)
    assert (await read(Response(),True))['visitors_today']==1
    await record(SimpleNamespace(visitor_id='b'*32),request)
    result=await read(Response(),True)
    assert result['visitors_today']==2 and result['timezone']=='Asia/Kolkata'
    assert 172800 in redis.expirations.values()
    for bad,req,expected in [(SimpleNamespace(visitor_id='bad'),request,422),(visit,SimpleNamespace(headers={'origin':'https://other.example'}),403)]:
        try: await record(bad,req); raise AssertionError('Expected rejection')
        except HTTPException as e: assert e.status_code==expected
    redis.attempts=120
    try: await record(visit,request); raise AssertionError('Expected rate limit')
    except HTTPException as e: assert e.status_code==429
    def unavailable(*args): raise ConnectionError()
    redis.scard=unavailable
    try: await read(Response(),True); raise AssertionError('Expected unavailable')
    except HTTPException as e: assert e.status_code==503
    print('PASS: daily deduplication, distinct browsers, retention, invalid ID, origin restriction, rate limit, Redis outage')
asyncio.run(main())
