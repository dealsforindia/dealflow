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
import { StudioBackground } from './StudioBackground';
import { ClaudeCharacter } from './ClaudeCharacter';
import { GptCharacter } from './GptCharacter';
import { GeminiCharacter } from './GeminiCharacter';
import { CinemaDialogueBar } from './CinemaDialogueBar';
import { MarsCatMinimal } from './MarsCatMinimal';
import { DialogueLine } from './types';

// Complete 90-Second (2700 Frames @ 30 FPS) Clean Hindi Episode
const DIALOGUES: DialogueLine[] = [
  // --- SCENE 1: The Lounge Debate (0s - 22s) ---
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

  // --- SCENE 2: The Bug Incident (22s - 45s) ---
  {
    id: 'd5',
    speaker: 'user',
    hindiText: 'अरे एआई भाइयो बचाओ! कल सुबह इन्वेस्टर पिच है और पूरा ऐप क्रैश हो गया!',
    hinglishText: 'Arre AI bhaiyo bachao! Kal subah investor pitch hai aur poora app crash ho gaya!',
    startFrame: 680,
    endFrame: 820,
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

  // --- SCENE 3: The Unified Fix (45s - 68s) ---
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

  // --- SCENE 4: The Climax (68s - 90s) ---
  {
    id: 'd13',
    speaker: 'user',
    hindiText: 'अरे थैंक्स ब्रो! अब एक काम करो... मंगल ग्रह पर बिरयानी खाते हुए बिल्ली की फोटो बना दो!',
    hinglishText: 'Arre thanks bro! Ab ek kaam karo... Mars par biryani khaate hue billi ki photo bana do!',
    startFrame: 2080,
    endFrame: 2240,
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

export const HindiEpisodeHighEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Active dialogue line
  const currentDialogue = DIALOGUES.find(
    (d) => frame >= d.startFrame && frame <= d.endFrame
  );

  // Scene state definitions
  const isAlarmScene = frame >= 650 && frame <= 1350;
  const isFixingScene = frame > 1350 && frame < 2050;
  const isMarsCatScene = frame >= 2080 && frame <= 2560;

  // Background Mood
  const mood = isAlarmScene ? 'alert' : isFixingScene ? 'success' : 'neutral';

  // --- HIGH-END CINEMATIC CAMERA SYSTEM ---
  // Smooth subtle focal moves without dizzying shakes
  let targetScale = 1.0;
  let targetPanX = 0;
  let targetPanY = 0;

  if (frame >= 175 && frame <= 310) {
    // Elegant slow push-in towards Claude
    targetScale = 1.08;
    targetPanX = 90;
    targetPanY = -20;
  } else if (isAlarmScene) {
    // Subtle tension push-in
    targetScale = 1.06;
    targetPanY = -15;
  } else if (isMarsCatScene && frame < 2270) {
    // Push in slightly on the preview card
    targetScale = 1.05;
    targetPanY = -25;
  }

  // Camera ease spring
  const camScaleSpring = spring({
    frame: frame % 600, // gentle cycle
    fps,
    config: { damping: 20, stiffness: 80, mass: 1 },
  });

  const camScale = targetScale;
  const camPanX = targetPanX;
  const camPanY = targetPanY;

  // Character States & Emotions
  // Claude
  let claudeEmotion: 'happy' | 'talking' | 'shocked' | 'proud' | 'fainting' | 'thinking' = 'happy';
  let claudeGesture: 'idle' | 'pointing' | 'flexing' | 'typing' | 'shrugging' | 'jumping' = 'idle';
  const claudeSpeaking = currentDialogue?.speaker === 'claude';

  if (isAlarmScene) {
    claudeEmotion = 'shocked';
    claudeGesture = 'shrugging';
  } else if (isFixingScene) {
    claudeEmotion = 'proud';
    claudeGesture = 'pointing';
  } else if (frame >= 2270 && frame <= 2580) {
    // Claude smoothly tilts back into a faint
    claudeEmotion = 'fainting';
  }

  // GPT
  let gptEmotion: 'happy' | 'talking' | 'shocked' | 'proud' | 'fainting' | 'thinking' = 'happy';
  let gptGesture: 'idle' | 'pointing' | 'flexing' | 'typing' | 'shrugging' | 'jumping' = 'idle';
  const gptSpeaking = currentDialogue?.speaker === 'gpt';

  if (isAlarmScene) {
    gptEmotion = 'shocked';
    gptGesture = 'typing';
  } else if (isFixingScene) {
    gptEmotion = 'proud';
    gptGesture = 'flexing';
  } else if (frame >= 2260) {
    gptEmotion = 'shocked';
    gptGesture = 'shrugging';
  }

  // Gemini
  let geminiEmotion: 'happy' | 'talking' | 'shocked' | 'proud' | 'fainting' | 'thinking' = 'happy';
  let geminiGesture: 'idle' | 'pointing' | 'flexing' | 'typing' | 'shrugging' | 'jumping' = 'idle';
  const geminiSpeaking = currentDialogue?.speaker === 'gemini';

  if (isAlarmScene) {
    geminiEmotion = 'shocked';
    geminiGesture = 'jumping';
  } else if (isFixingScene) {
    geminiEmotion = 'proud';
    geminiGesture = 'jumping';
  } else if (frame >= 2260) {
    geminiEmotion = 'shocked';
    geminiGesture = 'shrugging';
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#090B10',
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* --- CAMERA RIG CONTAINER --- */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${camPanX}px, ${camPanY}px) scale(${camScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* 1. Clean Studio Background */}
        <StudioBackground frame={frame} mood={mood} />

        {/* --- SCENE 2 SLEEK MINIMAL CODE CARD (The Bug Incident) --- */}
        {isAlarmScene && (
          <div
            style={{
              position: 'absolute',
              top: '130px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '680px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '20px',
              padding: '18px 26px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    boxShadow: '0 0 10px #EF4444',
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    color: '#F87171',
                    textTransform: 'uppercase',
                  }}
                >
                  RUNTIME EXCEPTION
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  fontFamily: 'monospace',
                }}
              >
                src/app.ts:420
              </span>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '15px',
                color: '#FEF2F2',
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: '12px 16px',
                borderRadius: '10px',
                borderLeft: '3px solid #EF4444',
                lineHeight: 1.5,
              }}
            >
              TypeError: Cannot read properties of undefined (reading 'chintu_kumar')
            </div>
          </div>
        )}

        {/* --- SCENE 3 SLEEK RESOLUTION STATUS CARD --- */}
        {isFixingScene && (
          <div
            style={{
              position: 'absolute',
              top: '130px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '680px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '20px',
              padding: '18px 26px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    boxShadow: '0 0 10px #10B981',
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    color: '#34D399',
                    textTransform: 'uppercase',
                  }}
                >
                  FIX DEPLOYED SUCCESSFULLY
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: '#A7F3D0',
                  fontFamily: 'monospace',
                }}
              >
                STATUS: 200 OK
              </span>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#E2E8F0',
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: '12px 16px',
                borderRadius: '10px',
                borderLeft: '3px solid #10B981',
                lineHeight: 1.5,
              }}
            >
              ✓ 50 Unit Tests Passed • Refactored cleanly with zero dependencies • Latency: 0.005s
            </div>
          </div>
        )}

        {/* --- SCENE 4 MARS CAT BIRYANI MINIMAL CARD --- */}
        {isMarsCatScene && <MarsCatMinimal frame={frame} fps={fps} />}

        {/* --- 2. THE THREE CARTOON HEROES --- */}
        {/* CLAUDE (Left) */}
        <ClaudeCharacter
          x={480}
          y={600}
          scale={1.18}
          isSpeaking={claudeSpeaking}
          emotion={claudeEmotion}
          gesture={claudeGesture}
          frame={frame}
          fps={fps}
        />

        {/* GPT (Center) */}
        <GptCharacter
          x={960}
          y={600}
          scale={1.2}
          isSpeaking={gptSpeaking}
          emotion={gptEmotion}
          gesture={gptGesture}
          frame={frame}
          fps={fps}
        />

        {/* GEMINI (Right) */}
        <GeminiCharacter
          x={1440}
          y={600}
          scale={1.18}
          isSpeaking={geminiSpeaking}
          emotion={geminiEmotion}
          gesture={geminiGesture}
          frame={frame}
          fps={fps}
        />
      </div>

      {/* --- 3. FLOATING CINEMA DIALOGUE DECK (Uncluttered & Clean) --- */}
      {currentDialogue && (
        <CinemaDialogueBar
          key={currentDialogue.id}
          dialogue={currentDialogue}
          frame={frame}
          fps={fps}
        />
      )}

      {/* --- 4. SLEEK HEADER BADGE --- */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          left: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 25,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#38BDF8',
              boxShadow: '0 0 8px #38BDF8',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#F8FAFC',
              letterSpacing: '1px',
            }}
          >
            AI ADDA • EPISODE 1
          </span>
        </div>
      </div>

      {/* Sleek Timer Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          right: '36px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#94A3B8',
          zIndex: 25,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.floor(frame / fps)}s / 90s
      </div>

      {/* --- 5. CLEAN OUTRO SLATE --- */}
      {frame >= 2610 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(9, 11, 16, 0.95)',
            backdropFilter: 'blur(20px)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#F8FAFC',
              letterSpacing: '-0.02em',
            }}
          >
            AI ADDA
          </div>
          <div
            style={{
              fontSize: '18px',
              color: '#94A3B8',
              letterSpacing: '0.5px',
            }}
          >
            The Autonomous Coding Trio • Episode 1 Finished
          </div>
        </div>
      )}

      {/* =========================================================================
          --- BALANCED, STUDIO SOUND DESIGN LAYER ---
         ========================================================================= */}

      {/* 1. Warm Lo-Fi BGM with Dialogue Ducking */}
      <Audio
        src={staticFile('audio/bgm.mp3')}
        volume={currentDialogue ? 0.12 : 0.2}
        loop
      />

      {/* 2. Soft, clean pops on dialogue transition */}
      {DIALOGUES.map((d) => (
        <Sequence key={`pop-${d.id}`} from={d.startFrame} durationInFrames={15}>
          <Audio src={staticFile('audio/pop.mp3')} volume={0.4} />
        </Sequence>
      ))}

      {/* 3. Subtle Glasses Glint Ting in Scene 1 */}
      <Sequence from={175} durationInFrames={25}>
        <Audio src={staticFile('audio/bling.wav')} volume={0.5} />
      </Sequence>

      {/* 4. Soft Boing in Scene 1 */}
      <Sequence from={325} durationInFrames={25}>
        <Audio src={staticFile('audio/boing.wav')} volume={0.5} />
      </Sequence>

      {/* 5. Clean Alarm Tone during Scene 2 */}
      <Sequence from={650} durationInFrames={70}>
        <Audio src={staticFile('audio/siren.wav')} volume={0.45} />
      </Sequence>

      {/* 6. Soft Mechanical Keyboard Clicks during Scene 3 */}
      <Sequence from={1370} durationInFrames={40}>
        <Audio src={staticFile('audio/typing_burst.wav')} volume={0.4} />
      </Sequence>

      {/* 7. Soft Sci-Fi Laser Hum during Scene 3 Fix */}
      <Sequence from={1710} durationInFrames={35}>
        <Audio src={staticFile('audio/laser.wav')} volume={0.5} />
      </Sequence>

      {/* 8. Tasteful Vinyl Record Scratch on Mars Cat Prompt */}
      <Sequence from={2080} durationInFrames={25}>
        <Audio src={staticFile('audio/record_scratch.wav')} volume={0.65} />
      </Sequence>

      {/* 9. Soft Slapstick Floor Contact on Claude Faint */}
      <Sequence from={2275} durationInFrames={30}>
        <Audio src={staticFile('audio/thud.wav')} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
