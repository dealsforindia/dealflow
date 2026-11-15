"""Read-only public HN collection; no accounts, votes, messages or Reddit."""
import csv
import datetime as dt
import html
import json
import re
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ROOT.mkdir(exist_ok=True, parents=True)
IST = dt.timezone(dt.timedelta(hours=5, minutes=30))
START = int(dt.datetime(2026, 10, 1, tzinfo=IST).timestamp())
END = int(dt.datetime(2026, 10, 29, tzinfo=IST).timestamp())
QUERIES = ['AI coding', 'coding agents', 'junior', 'software engineer', 'vibe coding',
           'programming', 'LLM code', 'developer jobs', 'code review', 'learn programming',
           'AI developer', 'software development', 'AI hiring', 'AI skills', 'AI code',
           'Claude Code', 'Codex', 'engineering AI']

def get_json(url):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'CareerResearch/1.0 (public-read-only)'}), timeout=20) as response:
                return json.load(response)
        except Exception:
            if attempt == 2:
                raise
            time.sleep(1 + attempt)

def clean(text):
    return html.unescape(re.sub('<[^>]+>', ' ', text or '')).strip()

def search(query):
    params = {'query': query, 'tags': 'story', 'numericFilters': f'created_at_i>={START},created_at_i<{END}', 'hitsPerPage': 100, 'page': 0}
    result = get_json('https://hn.algolia.com/api/v1/search?' + urllib.parse.urlencode(params))
    return query, result

all_rows = {}
search_log = []
with ThreadPoolExecutor(max_workers=4) as pool:
    for future in as_completed([pool.submit(search, q) for q in QUERIES]):
        try:
            query, result = future.result()
            search_log.append({'query': query, 'nbHits': result.get('nbHits'), 'retrieved': len(result.get('hits', []))})
            for hit in result.get('hits', []):
                key = str(hit['objectID'])
                row = all_rows.setdefault(key, {
                    'id': key, 'title': clean(hit.get('title')), 'author': hit.get('author'),
                    'created_at': hit.get('created_at'), 'created_at_i': hit.get('created_at_i'),
                    'points': hit.get('points'), 'num_comments': hit.get('num_comments'),
                    'url': hit.get('url'), 'discussion_url': f'https://news.ycombinator.com/item?id={key}',
                    'story_text': clean(hit.get('story_text')), 'queries': [],
                    'author_seniority': 'unverified', 'likes': None, 'love_reactions': None,
                })
                row['queries'].append(query)
            print(f'{query}: {len(result.get("hits", []))} retrieved; unique {len(all_rows)}', flush=True)
        except Exception as error:
            search_log.append({'error': str(error)})

# Explicit topic screen; not a judgement of positive/negative sentiment or truth.
coding = re.compile(r'\b(code|coding|programming|programmer|programmers|developer|developers|engineer|engineers|engineering|software|debugging|debug|vibe|codex|copilot|agentic|LLM|Claude|junior|intern|hiring)\b', re.I)
excluded_domains = re.compile(r'(^|\.)reddit\.com$|(^|\.)redd\.it$', re.I)
rows = []
for row in all_rows.values():
    if not (START <= int(row.get('created_at_i') or 0) < END):
        continue
    if excluded_domains.search(urllib.parse.urlsplit(row.get('url') or '').hostname or ''):
        continue
    if not coding.search(row['title'] + ' ' + row['story_text']):
        continue
    content = row['title'] + ' ' + row['story_text']
    ai = re.search(r'\b(AI|LLM|LLMs|agent|agents|agentic|Claude|Codex|Copilot|vibe|vibecoding|ChatGPT|GPT|Opus|Gemini|Anthropic)\b', content, re.I)
    work = re.search(r'\b(junior|juniors|career|careers|hiring|jobs|job|intern|internship|learn|learning|skill|skills|code review|coding|programming|developer|developers|engineer|engineers|software)\b', content, re.I)
    career = re.search(r'junior|career|hiring|learn.*program|developer.*job', row['title'], re.I)
    if not ((ai and work) or career):
        continue
    rows.append(row)
rows.sort(key=lambda r: (-int(r.get('points') or 0), -int(r.get('num_comments') or 0), r['id']))
selected = rows[:500]
(ROOT / 'candidates.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
(ROOT / 'posts_500.json').write_text(json.dumps(selected, ensure_ascii=False, indent=2), encoding='utf-8')
(ROOT / 'collection_log.json').write_text(json.dumps({'start_ist': '2026-10-01T00:00:00+05:30', 'end_exclusive_ist': '2026-10-29T00:00:00+05:30', 'collected_at_utc': dt.datetime.now(dt.timezone.utc).isoformat(), 'raw_unique': len(all_rows), 'eligible': len(rows), 'selected': len(selected), 'queries': search_log}, indent=2), encoding='utf-8')
fields = ['id', 'title', 'author', 'created_at', 'points', 'num_comments', 'url', 'discussion_url', 'author_seniority', 'likes', 'love_reactions', 'queries']
with (ROOT / 'posts_500.csv').open('w', newline='', encoding='utf-8-sig') as file:
    writer = csv.DictWriter(file, fieldnames=fields, extrasaction='ignore')
    writer.writeheader()
    for row in selected:
        writer.writerow(row | {'queries': '|'.join(sorted(row['queries']))})
print(json.dumps({'raw_unique': len(all_rows), 'eligible': len(rows), 'selected': len(selected)}), flush=True)

# Fetch discussion content for each selected submission so analysis is not only titles.
def thread(row):
    data = get_json('https://hn.algolia.com/api/v1/items/' + row['id'])
    comments = []
    def walk(children, depth=0):
        for child in children:
            if len(comments) >= 12:
                return
            text = clean(child.get('text'))
            if text:
                comments.append({'id': child.get('id'), 'author': child.get('author'), 'created_at': child.get('created_at'), 'depth': depth, 'text': text[:6000], 'author_seniority': 'unverified'})
            walk(child.get('children') or [], depth + 1)
    walk(data.get('children') or [])
    return {'id': row['id'], 'title': row['title'], 'story_text': clean(data.get('text')), 'comments': comments, 'linked_article_read': False}

output = ROOT / 'discussion_samples.jsonl'
existing = {}
if output.exists():
    for line in output.read_text(encoding='utf-8').splitlines():
        try:
            record = json.loads(line)
            if record.get('id'):
                existing[record['id']] = record
        except ValueError:
            pass
with output.open('a', encoding='utf-8') as file, ThreadPoolExecutor(max_workers=4) as pool:
    done = 0
    missing = [row for row in selected if row['id'] not in existing]
    for future in as_completed({pool.submit(thread, row): row['id'] for row in missing}):
        try:
            result = future.result()
        except Exception as error:
            result = {'fetch_error': str(error)}
        file.write(json.dumps(result, ensure_ascii=False) + '\n')
        file.flush()
        done += 1
        if done % 50 == 0:
            print(f'Thread samples {done}/{len(selected)}', flush=True)
