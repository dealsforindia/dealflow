import asyncio
import os
import subprocess
import edge_tts

OUT_DIR = r"E:\Rudranildocs0066543\html-yt\dealflow-remotion\public\audio"
os.makedirs(OUT_DIR, exist_ok=True)

DIALOGUES = [
    {
        "id": "d1",
        "speaker": "gpt",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+15%",
        "pitch": "+2Hz",
        "text": "अरे क्लॉड भाई, तुमने कल देखा? यूजर ने बोला पांच मिनट में इंस्टाग्राम बना के दे!"
    },
    {
        "id": "d2",
        "speaker": "claude",
        "voice": "hi-IN-MadhurNeural",
        "rate": "-5%",
        "pitch": "-10Hz",
        "text": "शांत रहो जीपीटी भाई! मैंने उसे 500 लाइन की एथिकल चेतावनी दी कि सोशल मीडिया सेहत के लिए हानिकारक है!"
    },
    {
        "id": "d3",
        "speaker": "gemini",
        "voice": "hi-IN-SwaraNeural",
        "rate": "+22%",
        "pitch": "+15Hz",
        "text": "और मैंने तो पूरे दो मिलियन टोकन में उसकी गैलरी का फोटो स्कैन करके समोसा आर्डर कर दिया!"
    },
    {
        "id": "d4",
        "speaker": "gpt",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+15%",
        "pitch": "+3Hz",
        "text": "वाह जेमिनी भाई! समोसे तुम खाओ और बिल बेचारा यूजर के क्रेडिट कार्ड से कटेगा!"
    },
    {
        "id": "d5",
        "speaker": "user",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+25%",
        "pitch": "+15Hz",
        "text": "अरे एआई भाइयो बचाओ! कल सुबह इन्वेस्टर पिच है और पूरा ऐप क्रैश हो गया!"
    },
    {
        "id": "d6",
        "speaker": "gpt",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+15%",
        "pitch": "+0Hz",
        "text": "अरे बाप रे! ये कोड तो मैंने कल रात नींद में स्टैक ओवरफ्लो से उठाया था!"
    },
    {
        "id": "d7",
        "speaker": "claude",
        "voice": "hi-IN-MadhurNeural",
        "rate": "-5%",
        "pitch": "-10Hz",
        "text": "घोर अनर्थ! कोड में सेमीकोलन की घोर उपेक्षा हुई है। कृपया शांति बनाए रखें।"
    },
    {
        "id": "d8",
        "speaker": "gemini",
        "voice": "hi-IN-SwaraNeural",
        "rate": "+22%",
        "pitch": "+14Hz",
        "text": "रुको! मल्टीमोडल रडार से पकड़ लिया... अरे यूजर ने वेरिएबल का नाम चिंटू कुमार रखा है!"
    },
    {
        "id": "d9",
        "speaker": "gpt",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+18%",
        "pitch": "+4Hz",
        "text": "चलो भाइयो, तीनों मिलकर सुपर प्रॉम्प्ट बनाते हैं! गिट पुश ओरिजिन मास्टर!"
    },
    {
        "id": "d10",
        "speaker": "claude",
        "voice": "hi-IN-MadhurNeural",
        "rate": "-3%",
        "pitch": "-8Hz",
        "text": "टाइपस्क्रिप्ट सख्त कर दी गई है और 50 यूनिट टेस्ट पूरे पास हो चुके हैं!"
    },
    {
        "id": "d11",
        "speaker": "gemini",
        "voice": "hi-IN-SwaraNeural",
        "rate": "+25%",
        "pitch": "+16Hz",
        "text": "डन! बग फिक्स 0.005 सेकंड में लाइव हो गया! पार्टी शुरू!"
    },
    {
        "id": "d12",
        "speaker": "gpt",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+15%",
        "pitch": "+3Hz",
        "text": "देखा? जब क्लॉड, जीपीटी और जेमिनी मिलते हैं तो कोई बग नहीं बचता!"
    },
    {
        "id": "d13",
        "speaker": "user",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+12%",
        "pitch": "+10Hz",
        "text": "अरे थैंक्स ब्रो! अब एक काम करो... मंगल ग्रह पर बिरयानी खाते हुए बिल्ली की फोटो बना दो!"
    },
    {
        "id": "d14",
        "speaker": "gemini",
        "voice": "hi-IN-SwaraNeural",
        "rate": "+20%",
        "pitch": "+18Hz",
        "text": "अरे देवा! दो मिलियन टोकन का दिमाग इस यूजर ने कैट बिरयानी के लिए खर्च करवा दिया?!"
    },
    {
        "id": "d15",
        "speaker": "gpt",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+15%",
        "pitch": "+2Hz",
        "text": "क्लॉड भाई उठो बेहोश मत हो! नया प्रॉम्प्ट लिखो... कैट ईटिंग हैदराबादी बिरयानी इन स्पेस!"
    }
]

async def generate():
    for item in DIALOGUES:
        out_file = os.path.join(OUT_DIR, f"voice_{item['id']}.mp3")
        communicate = edge_tts.Communicate(
            text=item["text"],
            voice=item["voice"],
            rate=item["rate"],
            pitch=item["pitch"]
        )
        await communicate.save(out_file)
        size = os.path.getsize(out_file)
        print(f"Generated {item['id']} ({item['speaker']}): {size} bytes")

if __name__ == "__main__":
    asyncio.run(generate())
