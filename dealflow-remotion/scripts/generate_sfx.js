const fs = require('fs');
const path = require('path');

// Helper to write a 16-bit mono PCM WAV file
function createWav(filename, sampleRate, duration, generateSample) {
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels (1 = mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = generateSample(t, duration, i);
    // Clamp to -1..1
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  const outDir = path.join(__dirname, '../public/audio');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`✓ Generated ${filename} (${buffer.length} bytes)`);
}

const SR = 44100;

// 1. siren.wav (Emergency alarm siren klaxon)
createWav('siren.wav', SR, 2.0, (t, dur) => {
  const f = 450 + 350 * Math.sin(2 * Math.PI * 2.5 * t);
  const tone = Math.sin(2 * Math.PI * f * t);
  const squareMod = Math.sin(2 * Math.PI * f * t) > 0 ? 0.3 : -0.3;
  return (tone * 0.7 + squareMod * 0.3) * 0.6;
});

// 2. laser.wav (Cosmic Gemini sci-fi laser beam)
createWav('laser.wav', SR, 1.2, (t, dur) => {
  const freq = 1200 * Math.exp(-3.5 * t) + 200 * Math.sin(2 * Math.PI * 40 * t);
  const env = Math.exp(-2.5 * t);
  const shimmer = Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.3;
  return (Math.sin(2 * Math.PI * freq * t) * 0.7 + shimmer) * env * 0.7;
});

// 3. boing.wav (Cartoon bouncy boing spring)
createWav('boing.wav', SR, 0.8, (t, dur) => {
  const vibrato = 25 * Math.sin(2 * Math.PI * 30 * t);
  const freq = 200 + 400 * (t / dur) + vibrato;
  const env = Math.exp(-3.0 * t);
  return Math.sin(2 * Math.PI * freq * t) * env * 0.8;
});

// 4. record_scratch.wav (Comedic record scratch when user asks for Mars Cat)
createWav('record_scratch.wav', SR, 0.7, (t, dur) => {
  const noise = (Math.random() * 2 - 1) * 0.6;
  const vinylChirp = Math.sin(2 * Math.PI * (800 * (1 - t / dur)) * t);
  const env = t < 0.1 ? t / 0.1 : Math.exp(-4.5 * (t - 0.1));
  return (noise * 0.6 + vinylChirp * 0.4) * env * 0.8;
});

// 5. thud.wav (Heavy cartoon slapstick floor thud when Claude faints)
createWav('thud.wav', SR, 0.8, (t, dur) => {
  const freq = 85 * Math.exp(-8 * t);
  const bass = Math.sin(2 * Math.PI * freq * t);
  const noiseThump = (Math.random() * 2 - 1) * Math.exp(-14 * t);
  const env = Math.exp(-4 * t);
  return (bass * 0.85 + noiseThump * 0.4) * env * 0.9;
});

// 6. bling.wav (Anime glasses glint / star sparkle)
createWav('bling.wav', SR, 0.9, (t, dur) => {
  const f1 = 2093; // C7
  const f2 = 2793; // F7
  const f3 = 3520; // A7
  const env1 = Math.exp(-6 * t);
  const env2 = t > 0.08 ? Math.exp(-5 * (t - 0.08)) : 0;
  const env3 = t > 0.16 ? Math.exp(-4 * (t - 0.16)) : 0;
  return (
    Math.sin(2 * Math.PI * f1 * t) * env1 * 0.4 +
    Math.sin(2 * Math.PI * f2 * t) * env2 * 0.4 +
    Math.sin(2 * Math.PI * f3 * t) * env3 * 0.4
  ) * 0.7;
});

// 7. typing_burst.wav (Fast mechanical keyboard clatter)
createWav('typing_burst.wav', SR, 1.5, (t, dur) => {
  // Rapid clicks at 14Hz
  const clickPeriod = 1 / 14;
  const clickPhase = (t % clickPeriod) / clickPeriod;
  const clickEnv = Math.exp(-40 * clickPhase);
  const clickFreq = 1400 + 400 * Math.sin(t * 80);
  return Math.sin(2 * Math.PI * clickFreq * t) * clickEnv * 0.65;
});
