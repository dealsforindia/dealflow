import asyncio
import edge_tts

async def main():
    voices = await edge_tts.list_voices()
    indian_voices = [v for v in voices if 'IN' in v['ShortName']]
    for v in indian_voices:
        print(f"{v['ShortName']} ({v['Gender']}) - {v.get('FriendlyName', '')}")

if __name__ == '__main__':
    asyncio.run(main())
