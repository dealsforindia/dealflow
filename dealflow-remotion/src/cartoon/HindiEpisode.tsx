import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { CartoonBackground } from './CartoonBackground';
import { ClaudeCharacter } from './ClaudeCharacter';
import { GptCharacter } from './GptCharacter';
import { GeminiCharacter } from './GeminiCharacter';
import { SpeechBubble } from './SpeechBubble';
import { MarsCatIllustration } from './MarsCatIllustration';
import { SpeedLines } from './SpeedLines';
import { ComicBurst } from './ComicBurst';
import { SmokeRings } from './SmokeRings';
import { SweatDrop } from './SweatDrop';
import { DialogueLine } from './types';

// Complete 90-Second (2700 Frames @ 30 FPS) Hindi Episode Script
const DIALOGUES: DialogueLine[] = [
  // --- SCENE 1: The Chai Tapri Debate (0s - 22s) ---
  {
    id: 'd1',
    speaker: 'gpt',
    hindiText: 'अरे क्लॉड भाई, तुमने कल देखा? यूजर ने बोला 5 मिनट में इंस्टाग्राम बना के दे!',
    hinglishText: 'Arre Claude bhai, tune kal dekha? User ne bola 5 min me Instagram bana ke de!',
    startFrame: 30,
    endFrame: 160,
  },
  {
    id: 'd2',
    speaker: 'claude',
    hindiText: 'शांत रहो जीपीटी भाई! मैंने उसे 500 लाइन की एथिकल चेतावनी दी कि सोशल मीडिया सेहत के लिए हानिकारक है!',
    hinglishText: 'Shant raho GPT bhai! Maine use 500 line ki ethical chetavni di ki social media sehat ke liye hanikarak hai!',
    startFrame: 175,
    endFrame: 310,
  },
  {
    id: 'd3',
    speaker: 'gemini',
    hindiText: 'और मैंने तो पूरे 2 मिलियन टोकन में उसकी गैलरी का फोटो स्कैन करके समोसा आर्डर कर दिया!',
    hinglishText: 'Aur maine toh poore 2 Million token me uski photo scan karke samosa order kar diya!',
    startFrame: 325,
    endFrame: 460,
  },
  {
    id: 'd4',
    speaker: 'gpt',
    hindiText: 'वाह जेमिनी भाई! समोसे तुम खाओ और बिल बेचारा यूजर के क्रेडिट कार्ड से कटेगा!',
    hinglishText: 'Waah Gemini bhai! Samose tum khao aur bill bechara user ke credit card se katega!',
    startFrame: 475,
    endFrame: 620,
  },

  // --- SCENE 2: The Red Bug Crash Alert (22s - 45s) ---
  {
    id: 'd5',
    speaker: 'user',
    hindiText: 'अरे एआई भाइयो बचाओ! कल सुबह इन्वेस्टर पिच है और पूरा ऐप क्रैश हो गया!',
    hinglishText: 'Arre AI bhaiyo bachao! Kal subah investor pitch hai aur poora app crash ho gaya!',
    startFrame: 680,
    endFrame: 820,
    x: 960,
    y: 190,
  },
  {
    id: 'd6',
    speaker: 'gpt',
    hindiText: 'अरे बाप रे! ये कोड तो मैंने कल रात नींद में स्टैक ओवरफ्लो से उठाया था!',
    hinglishText: 'Arre baap re! Ye code toh maine kal raat neend me Stack Overflow se uthaya tha!',
    startFrame: 840,
    endFrame: 980,
  },
  {
    id: 'd7',
    speaker: 'claude',
    hindiText: 'घोर अनर्थ! कोड में सेमीकोलन (;) की घोर उपेक्षा हुई है। कृपया शांति बनाए रखें।',
    hinglishText: 'Ghor anarth! Code me semicolons ki ghor upeksha hui hai. Kripya shanti banaye rakhein.',
    startFrame: 1000,
    endFrame: 1140,
  },
  {
    id: 'd8',
    speaker: 'gemini',
    hindiText: 'रुको! मल्टीमोडल रडार से पकड़ लिया... अरे यूजर ने वेरिएबल का नाम \'chintu_kumar\' रखा है!',
    hinglishText: 'Ruko! Multimodal radar se pakad liya... arre user ne variable ka naam \'chintu_kumar\' rakha hai!',
    startFrame: 1160,
    endFrame: 1320,
  },

  // --- SCENE 3: The Super Coding Montage (45s - 68s) ---
  {
    id: 'd9',
    speaker: 'gpt',
    hindiText: 'चलो भाइयो, तीनों मिलकर सुपर-प्रॉम्प्ट बनाते हैं! गिट पुश ओरिजिन मास्टर!',
    hinglishText: 'Chalo bhaiyo, teeno milkar super-prompt banate hain! Git push origin master!',
    startFrame: 1370,
    endFrame: 1520,
  },
  {
    id: 'd10',
    speaker: 'claude',
    hindiText: 'टाइपस्क्रिप्ट सख्त कर दी गई है और 50 यूनिट टेस्ट पूरे पास हो चुके हैं!',
    hinglishText: 'TypeScript sakht kar di gayi hai aur 50 unit tests poore pass ho chuke hain!',
    startFrame: 1540,
    endFrame: 1690,
  },
  {
    id: 'd11',
    speaker: 'gemini',
    hindiText: 'डन! बग फिक्स 0.005 सेकंड में लाइव हो गया! पार्टी शुरू!',
    hinglishText: 'Done! Bug fix 0.005 second me live ho gaya! Party shuru!',
    startFrame: 1710,
    endFrame: 1860,
  },
  {
    id: 'd12',
    speaker: 'gpt',
    hindiText: 'देखा? जब क्लॉड, जीपीटी और जेमिनी मिलते हैं तो कोई बग नहीं बचता!',
    hinglishText: 'Dekha? Jab Claude, GPT aur Gemini milte hain toh koi bug nahi bachta!',
    startFrame: 1880,
    endFrame: 2020,
  },

  // --- SCENE 4: The Hilarious Climax (68s - 90s) ---
  {
    id: 'd13',
    speaker: 'user',
    hindiText: 'अरे थैंक्स ब्रो! अब एक काम करो... मंगल ग्रह पर बिरयानी खाते हुए बिल्ली की फोटो बना दो!',
    hinglishText: 'Arre thanks bro! Ab ek kaam karo... Mars par biryani khaate hue billi ki photo bana do!',
    startFrame: 2080,
    endFrame: 2240,
    x: 960,
    y: 190,
  },
  {
    id: 'd14',
    speaker: 'gemini',
    hindiText: 'अरे देवा! 2 मिलियन टोकन का दिमाग इस यूजर ने कैट-बिरयानी के लिए खर्च करवा दिया?!',
    hinglishText: 'Arre deva! 2 Million token ka dimaag iss user ne cat-biryani ke liye kharch karwa diya?!',
    startFrame: 2260,
    endFrame: 2420,
  },
  {
    id: 'd15',
    speaker: 'gpt',
    hindiText: 'क्लॉड भाई उठो बेहोश मत हो! प्रॉम्प्ट लिखो... \'Cat eating spicy Lucknowi Biryani in space\'!',
    hinglishText: 'Claude bhai utho behosh mat ho! Prompt likho... \'Cat eating spicy Lucknowi Biryani in space\'!',
    startFrame: 2440,
    endFrame: 2580,
  },
];

export const HindiEpisode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Active dialogue line
  const currentDialogue = DIALOGUES.find(
    (d) => frame >= d.startFrame && frame <= d.endFrame
  );

  // Scene state definitions
  const isAlarmActive = frame >= 650 && frame <= 1350;
  const isFixingScene = frame > 1350 && frame < 2050;
  const isMarsCatActive = frame >= 2080 && frame <= 2560;

  // --- ADVANCED MOTION GRAPHICS: DYNAMIC CAMERA RIG ---
  let camScale = 1;
  let camPanX = 0;
  let camPanY = 0;

  if (frame >= 175 && frame <= 310) {
    // Zoom towards Claude during ethics lecture
    camScale = 1.12;
    camPanX = 140;
    camPanY = -30;
  } else if (frame >= 650 && frame <= 830) {
    // Zoom punch on emergency crash
    camScale = 1.18;
    camPanY = -40;
  } else if (frame >= 840 && frame <= 980) {
    // Focus on panicked GPT
    camScale = 1.15;
  } else if (isFixingScene) {
    // Action zoom & slow sway
    camScale = 1.08;
    camPanX = Math.sin(frame / 12) * 20;
  } else if (isMarsCatActive && frame < 2270) {
    // Focus in on the Mars Cat prompt
    camScale = 1.14;
    camPanY = -30;
  }

  // Camera Shake during Alarm (Scene 2) and Claude Faint (Scene 4)
  const isFaintImpact = frame >= 2275 && frame <= 2315;
  const shakeIntensity = isAlarmActive ? 7 : isFaintImpact ? 14 : 0;
  const shakeX = Math.sin(frame * 1.6) * shakeIntensity;
  const shakeY = Math.cos(frame * 1.9) * shakeIntensity;

  // Character States & Emotions based on timeline
  // Claude
  let claudeEmotion: 'happy' | 'talking' | 'shocked' | 'proud' | 'fainting' | 'thinking' = 'happy';
  let claudeGesture: 'idle' | 'pointing' | 'flexing' | 'typing' | 'shrugging' | 'jumping' = 'idle';
  const claudeSpeaking = currentDialogue?.speaker === 'claude';

  if (frame >= 650 && frame <= 1350) {
    claudeEmotion = 'shocked';
    claudeGesture = 'shrugging';
  } else if (isFixingScene) {
    claudeEmotion = 'proud';
    claudeGesture = 'pointing';
  } else if (frame >= 2270 && frame <= 2570) {
    // Claude literally faints at the user's Mars Biryani Cat prompt!
    claudeEmotion = 'fainting';
    claudeGesture = 'jumping';
  }

  // GPT
  let gptEmotion: 'happy' | 'talking' | 'shocked' | 'proud' | 'fainting' | 'thinking' = 'happy';
  let gptGesture: 'idle' | 'pointing' | 'flexing' | 'typing' | 'shrugging' | 'jumping' = 'idle';
  const gptSpeaking = currentDialogue?.speaker === 'gpt';

  if (frame >= 650 && frame <= 1350) {
    gptEmotion = 'shocked';
    gptGesture = 'typing';
  } else if (isFixingScene) {
    gptEmotion = 'proud';
    gptGesture = 'flexing';
  } else if (frame >= 2200) {
    gptEmotion = 'shocked';
    gptGesture = 'shrugging';
  }

  // Gemini
  let geminiEmotion: 'happy' | 'talking' | 'shocked' | 'proud' | 'fainting' | 'thinking' = 'happy';
  let geminiGesture: 'idle' | 'pointing' | 'flexing' | 'typing' | 'shrugging' | 'jumping' = 'idle';
  const geminiSpeaking = currentDialogue?.speaker === 'gemini';

  if (frame >= 650 && frame <= 1350) {
    geminiEmotion = 'shocked';
    geminiGesture = 'jumping';
  } else if (isFixingScene) {
    geminiEmotion = 'proud';
    geminiGesture = 'jumping';
  } else if (frame >= 2240) {
    geminiEmotion = 'shocked';
    geminiGesture = 'shrugging';
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* --- CAMERA RIG CONTAINER --- */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${shakeX + camPanX}px, ${shakeY + camPanY}px) scale(${camScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* 1. Cartoon Background (Server Cafe / AI Adda) */}
        <CartoonBackground frame={frame} isAlarmActive={isAlarmActive} />

        {/* --- MOTION GRAPHICS: SPEED LINES --- */}
        {isAlarmActive && <SpeedLines frame={frame} color="#EF4444" intensity={1} />}
        {isFixingScene && <SpeedLines frame={frame} color="#10B981" intensity={0.7} />}

        {/* --- MOTION GRAPHICS: COMIC BURSTS & IMPACT BADGES --- */}
        {/* Scene 2 Alarm Burst */}
        {frame >= 650 && frame <= 780 && (
          <ComicBurst
            text="💥 APOCALYPSE!"
            subtext="PRODUCTION SERVER DOWN"
            x={960}
            y={240}
            startFrame={650}
            frame={frame}
            fps={fps}
            bgColor="#EF4444"
          />
        )}

        {/* Scene 3 Fix Victory Burst */}
        {frame >= 1710 && frame <= 1860 && (
          <ComicBurst
            text="⚡ 100% FIXED ⚡"
            subtext="0.005s MULTI-LLM CONSENSUS"
            x={960}
            y={220}
            startFrame={1710}
            frame={frame}
            fps={fps}
            bgColor="#10B981"
          />
        )}

        {/* Scene 4 Claude Faint Thud Burst */}
        {frame >= 2275 && frame <= 2390 && (
          <ComicBurst
            text="💫 FAINTED! 💫"
            subtext="CLAUDE HAS STOPPED WORKING"
            x={480}
            y={520}
            startFrame={2275}
            frame={frame}
            fps={fps}
            bgColor="#D97706"
          />
        )}

        {/* --- MOTION GRAPHICS: DUST SMOKE PUFFS ON CLAUDE FAINT --- */}
        {frame >= 2275 && (
          <SmokeRings x={480} y={670} startFrame={2275} frame={frame} />
        )}

        {/* --- MOTION GRAPHICS: PANIC SWEAT DROPS ON GPT --- */}
        {isAlarmActive && (
          <>
            <SweatDrop x={920} y={490} frame={frame} />
            <SweatDrop x={1000} y={495} frame={frame + 12} />
          </>
        )}

        {/* --- SCENE 2 HOLOGRAPHIC RED BUG TERMINAL --- */}
        {isAlarmActive && (
          <div
            style={{
              position: 'absolute',
              top: '250px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '840px',
              backgroundColor: 'rgba(239, 68, 68, 0.94)',
              border: '5px solid #FCA5A5',
              borderRadius: '24px',
              padding: '20px 30px',
              boxShadow: '0 0 60px rgba(239, 68, 68, 0.8), inset 0 0 20px rgba(0,0,0,0.4)',
              zIndex: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: 900 }}>🚨 CRITICAL PRODUCTION ERROR</span>
              <span style={{ fontSize: '18px', backgroundColor: '#7F1D1D', padding: '4px 12px', borderRadius: '12px' }}>
                SEVERITY: APOCALYPSE
              </span>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '20px',
                backgroundColor: '#1E1B4B',
                padding: '12px 18px',
                borderRadius: '12px',
                border: '2px solid #F87171',
                color: '#FEF08A',
              }}
            >
              &gt; TypeError: Cannot read properties of undefined (reading 'chintu_kumar') at line 420
            </div>
          </div>
        )}

        {/* --- SCENE 3 GREEN CODE SUCCESS MATRIX OVERLAY --- */}
        {isFixingScene && (
          <div
            style={{
              position: 'absolute',
              top: '120px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '760px',
              backgroundColor: 'rgba(16, 185, 129, 0.92)',
              border: '4px solid #6EE7B7',
              borderRadius: '24px',
              padding: '16px 28px',
              boxShadow: '0 0 50px rgba(16, 185, 129, 0.6)',
              zIndex: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 900 }}>⚡ TRIO FIX ENGINE ACTIVE</span>
              <span style={{ fontSize: '16px', backgroundColor: '#064E3B', padding: '4px 10px', borderRadius: '10px' }}>
                100% HEALTH
              </span>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '18px',
                backgroundColor: '#064E3B',
                padding: '10px 14px',
                borderRadius: '10px',
                color: '#A7F3D0',
              }}
            >
              ✓ Refactored 1,420 lines | ✓ 0 Bugs | ✓ Multi-LLM Consensus Achieved in 0.005s
            </div>
          </div>
        )}

        {/* --- SCENE 3 GEMINI MULTIMODAL COSMIC LASER BEAM --- */}
        {isFixingScene && (
          <svg
            width="1920"
            height="1080"
            style={{ position: 'absolute', inset: 0, zIndex: 7, pointerEvents: 'none' }}
          >
            <defs>
              <linearGradient id="laserGrad" x1="1440" y1="460" x2="960" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
            <line
              x1="1440"
              y1="460"
              x2="960"
              y2="200"
              stroke="url(#laserGrad)"
              strokeWidth={8 + Math.sin(frame / 2) * 5}
              strokeLinecap="round"
              opacity="0.9"
            />
            <line
              x1="1440"
              y1="460"
              x2="960"
              y2="200"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.95"
            />
          </svg>
        )}

        {/* --- SCENE 4 MARS CAT BIRYANI CARTOON ILLUSTRATION CARD --- */}
        {isMarsCatActive && <MarsCatIllustration frame={frame} fps={fps} />}

        {/* --- 2. THE THREE CARTOON HEROES --- */}
        {/* CLAUDE (Left) */}
        <ClaudeCharacter
          x={480}
          y={620}
          scale={1.22}
          isSpeaking={claudeSpeaking}
          emotion={claudeEmotion}
          gesture={claudeGesture}
          frame={frame}
          fps={fps}
        />

        {/* GPT (Center) */}
        <GptCharacter
          x={960}
          y={620}
          scale={1.25}
          isSpeaking={gptSpeaking}
          emotion={gptEmotion}
          gesture={gptGesture}
          frame={frame}
          fps={fps}
        />

        {/* GEMINI (Right) */}
        <GeminiCharacter
          x={1440}
          y={620}
          scale={1.22}
          isSpeaking={geminiSpeaking}
          emotion={geminiEmotion}
          gesture={geminiGesture}
          frame={frame}
          fps={fps}
        />

        {/* --- 3. ACTIVE SPEECH BUBBLE --- */}
        {currentDialogue && (
          <SpeechBubble
            key={currentDialogue.id}
            dialogue={currentDialogue}
            frame={frame}
            fps={fps}
          />
        )}
      </div>

      {/* --- TOP FIXED HUD BANNER (Independent of camera movement) --- */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '30px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '2px solid #334155',
          borderRadius: '16px',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backdropFilter: 'blur(8px)',
          zIndex: 25,
        }}
      >
        <span style={{ fontSize: '20px' }}>🎬</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8', letterSpacing: '1px' }}>
            EPISODE 1 • HINDI CARTOON
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>
            "AI ADDA : टोकन का चक्कर"
          </div>
        </div>
      </div>

      {/* Top Right Timer */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '2px solid #334155',
          borderRadius: '16px',
          padding: '8px 18px',
          fontSize: '14px',
          fontWeight: 800,
          color: '#E2E8F0',
          zIndex: 25,
        }}
      >
        ⏱️ {Math.floor(frame / fps)}s / 90s
      </div>

      {/* --- OUTRO SLATE (Frames 2590 - 2700) --- */}
      {frame >= 2590 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
          }}
        >
          <div
            style={{
              fontSize: '54px',
              fontWeight: 900,
              color: '#FBBF24',
              textShadow: '0 0 30px #F59E0B',
              letterSpacing: '2px',
            }}
          >
            🎉 AI ADDA : समाप्त! 🎉
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#E2E8F0' }}>
            अगले एपिसोड के लिए Like &amp; Subscribe करें!
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '30px', marginTop: '10px' }}>
            <span>✦ Claude</span>
            <span>⚡ GPT</span>
            <span>✨ Gemini</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          --- ADVANCED SOUND DESIGN LAYER (MULTI-TRACK SYNCHRONIZATION) ---
         ========================================================================= */}

      {/* 1. Background Music Score (Lo-fi / Cartoon Beat) with Dynamic Ducking */}
      <Audio
        src={staticFile('audio/bgm.mp3')}
        volume={currentDialogue ? 0.12 : 0.22}
        loop
      />

      {/* 2. Dialogue Bubble Entrance Pops */}
      {DIALOGUES.map((d) => (
        <Sequence key={`pop-${d.id}`} from={d.startFrame} durationInFrames={20}>
          <Audio src={staticFile('audio/pop.mp3')} volume={0.65} />
        </Sequence>
      ))}

      {/* 3. Claude Glasses Glint Sound in Scene 1 */}
      <Sequence from={175} durationInFrames={30}>
        <Audio src={staticFile('audio/bling.wav')} volume={0.7} />
      </Sequence>

      {/* 4. Gemini Excited Boing in Scene 1 */}
      <Sequence from={325} durationInFrames={30}>
        <Audio src={staticFile('audio/boing.wav')} volume={0.75} />
      </Sequence>

      {/* 5. Emergency Alarm Klaxon / Siren in Scene 2 */}
      <Sequence from={650} durationInFrames={90}>
        <Audio src={staticFile('audio/siren.wav')} volume={0.8} />
      </Sequence>
      <Sequence from={740} durationInFrames={90}>
        <Audio src={staticFile('audio/siren.wav')} volume={0.8} />
      </Sequence>

      {/* 6. Scene 2 Whoosh on Error Display */}
      <Sequence from={650} durationInFrames={30}>
        <Audio src={staticFile('audio/whoosh.mp3')} volume={0.8} />
      </Sequence>

      {/* 7. Scene 3 Typing Burst (GPT Hacker Montage) */}
      <Sequence from={1370} durationInFrames={50}>
        <Audio src={staticFile('audio/typing_burst.wav')} volume={0.7} />
      </Sequence>
      <Sequence from={1480} durationInFrames={50}>
        <Audio src={staticFile('audio/typing_burst.wav')} volume={0.7} />
      </Sequence>

      {/* 8. Scene 3 Cosmic Multimodal Laser Beam Sound */}
      <Sequence from={1420} durationInFrames={40}>
        <Audio src={staticFile('audio/laser.wav')} volume={0.8} />
      </Sequence>
      <Sequence from={1710} durationInFrames={40}>
        <Audio src={staticFile('audio/laser.wav')} volume={0.85} />
      </Sequence>

      {/* 9. Claude 50 Unit Tests Pass Bling */}
      <Sequence from={1540} durationInFrames={30}>
        <Audio src={staticFile('audio/bling.wav')} volume={0.75} />
      </Sequence>

      {/* 10. Scene 4 Comedic Record Scratch (Mars Cat Biryani Prompt Drops) */}
      <Sequence from={2080} durationInFrames={30}>
        <Audio src={staticFile('audio/record_scratch.wav')} volume={0.9} />
      </Sequence>

      {/* 11. Scene 4 Slapstick Floor Thud Impact (Claude Faints) */}
      <Sequence from={2275} durationInFrames={35}>
        <Audio src={staticFile('audio/thud.wav')} volume={0.95} />
      </Sequence>

      {/* 12. Final Boing on Gemini Shaking Hands */}
      <Sequence from={2280} durationInFrames={30}>
        <Audio src={staticFile('audio/boing.wav')} volume={0.65} />
      </Sequence>
    </AbsoluteFill>
  );
};
