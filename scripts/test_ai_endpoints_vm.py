import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from run_on_vm import run_ssh_command

cmd = """python3 -c "
import asyncio, os, aiohttp, json
from dotenv import load_dotenv
load_dotenv('/home/rudranil777/dealbot/.env')

prompt = '''Rate this deal in JSON:
{
  \"score\": <1-10>,
  \"summary\": \"<short reason>\",
  \"is_spam\": <true/false>
}
Text: Apple iPhone 15 at 49,999 on Flipkart'''

async def test_groq():
    keys = [k.strip() for k in os.getenv('GROQ_KEYS', '').split(',') if k.strip()]
    for i, k in enumerate(keys):
        for model in ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b']:
            try:
                async with aiohttp.ClientSession() as s:
                    async with s.post('https://api.groq.com/openai/v1/chat/completions',
                        headers={'Authorization': f'Bearer {k}', 'Content-Type': 'application/json'},
                        json={'model': model, 'max_tokens': 150, 'temperature': 0.1, 'messages': [{'role': 'user', 'content': prompt}]},
                        timeout=aiohttp.ClientTimeout(total=8)) as r:
                        body = await r.text()
                        print(f'Groq key {i} model {model}: status {r.status}')
                        if r.status != 200:
                            print(f'  Err body: {body[:150]}')
                        else:
                            print(f'  Success! Content: {json.loads(body)[\"choices\"][0][\"message\"][\"content\"][:100]}')
                            return
            except Exception as e:
                print(f'Groq key {i} model {model} exception: {e}')

async def test_gemini():
    gk = os.getenv('GEMINI_API_KEY') or os.getenv('GEMINI_KEY')
    for model in ['gemini-2.5-flash-lite', 'gemini-flash-latest']:
        try:
            async with aiohttp.ClientSession() as s:
                async with s.post(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gk}',
                    json={'contents': [{'parts': [{'text': prompt}]}], 'generationConfig': {'maxOutputTokens': 150, 'temperature': 0.1}},
                    timeout=aiohttp.ClientTimeout(total=8)) as r:
                    body = await r.text()
                    print(f'Gemini model {model}: status {r.status}')
                    if r.status != 200:
                        print(f'  Gemini err: {body[:150]}')
                    else:
                        cand = json.loads(body).get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                        print(f'  Gemini success: {cand[:100]}')
        except Exception as e:
            print(f'Gemini exception: {e}')

async def test_cerebras():
    ck = os.getenv('CEREBRAS_API_KEY') or os.getenv('CEREBRAS_KEY')
    for model in ['qwen-3.8-27b', 'gpt-oss-120b', 'gemma-4-31b']:
        try:
            async with aiohttp.ClientSession() as s:
                async with s.post('https://api.cerebras.ai/v1/chat/completions',
                    headers={'Authorization': f'Bearer {ck}', 'Content-Type': 'application/json'},
                    json={'model': model, 'max_tokens': 150, 'temperature': 0.1, 'messages': [{'role': 'user', 'content': prompt}]},
                    timeout=aiohttp.ClientTimeout(total=8)) as r:
                    body = await r.text()
                    print(f'Cerebras model {model}: status {r.status}')
                    if r.status != 200:
                        print(f'  Cerebras err: {body[:150]}')
                    else:
                        print(f'  Cerebras success: {json.loads(body)[\"choices\"][0][\"message\"][\"content\"][:100]}')
        except Exception as e:
            print(f'Cerebras exception: {e}')

asyncio.run(test_groq())
asyncio.run(test_gemini())
asyncio.run(test_cerebras())
"
"""

if __name__ == "__main__":
    run_ssh_command(cmd)
