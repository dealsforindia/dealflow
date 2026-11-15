import wave
import struct
import math
import os

sample_rate = 44100
bpm = 132
beat_len = int(sample_rate * (60.0 / bpm)) # samples per beat (~20,045 samples)
sixteenth = beat_len // 4

total_beats = 24 # ~11 seconds
total_samples = beat_len * total_beats

# Buffer
left = [0.0] * total_samples
right = [0.0] * total_samples

def add_sample(t, l_val, r_val):
    if 0 <= t < total_samples:
        left[t] += l_val
        right[t] += r_val

# 1. Synthesize 808 Kick
def trigger_808_kick(start_sample, punch=1.0):
    duration = int(sample_rate * 0.45)
    for i in range(duration):
        p = i / duration
        # Pitch envelope drops rapidly from 180Hz to 48Hz
        freq = 48 + 140 * math.exp(-i / (sample_rate * 0.05))
        phase = 2 * math.pi * freq * (i / sample_rate)
        env = math.exp(-i / (sample_rate * 0.18))
        raw = math.sin(phase) * env * punch
        # Soft saturation / distortion
        distorted = math.tanh(raw * 1.8) * 0.9
        add_sample(start_sample + i, distorted, distorted)

# 2. Synthesize 808 Snare / Clap
def trigger_snare(start_sample):
    duration = int(sample_rate * 0.2)
    import random
    for i in range(duration):
        env = math.exp(-i / (sample_rate * 0.04))
        # Tone + noise
        tone = math.sin(2 * math.pi * 185 * (i / sample_rate)) * env * 0.3
        noise = (random.random() * 2 - 1) * env * 0.6
        val = tone + noise
        add_sample(start_sample + i, val * 0.8, val * 0.8)

# 3. Synthesize Hi-Hat
def trigger_hihat(start_sample, accent=0.4):
    duration = int(sample_rate * 0.05)
    import random
    for i in range(duration):
        env = math.exp(-i / (sample_rate * 0.015))
        noise = (random.random() * 2 - 1) * env * accent
        add_sample(start_sample + i, noise * 0.6, noise * 0.8)

# 4. Synthesize Memphis Cowbell
# Traditional 808 cowbell frequencies: two square waves at f1 and f2 = 1.48 * f1
cowbell_scale = [587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25]

def trigger_cowbell(start_sample, pitch_freq=587.33):
    duration = int(sample_rate * 0.35)
    f1 = pitch_freq
    f2 = f1 * 1.485
    for i in range(duration):
        env = math.exp(-i / (sample_rate * 0.08))
        # Mix two band-limited harmonized square waves
        sq1 = 1.0 if math.sin(2 * math.pi * f1 * (i / sample_rate)) > 0 else -1.0
        sq2 = 1.0 if math.sin(2 * math.pi * f2 * (i / sample_rate)) > 0 else -1.0
        val = (sq1 * 0.5 + sq2 * 0.5) * env * 0.45
        add_sample(start_sample + i, val * 0.9, val * 0.7)

# BUILD THE PHONK TRACK:
# Beats 0 to 7: Build-up with hi-hats, cowbell, and heartbeats
# Beat 7.5: Sudden mute / silence ("Wait for it...")
# Beat 8 to 24: HEAVY DROP with 808s, Cowbell riff, distorted bass

for b in range(total_beats):
    t_beat = b * beat_len
    
    # Drop happens at beat 8
    is_drop = b >= 8
    
    # Hi-Hats on every 16th
    if b < 7 or is_drop:
        for step in range(4):
            t_16 = t_beat + step * sixteenth
            trigger_hihat(t_16, accent=0.35 if step % 2 == 0 else 0.2)
            
    # Cowbell melody
    note_idx = b % len(cowbell_scale)
    if b < 7 or is_drop:
        trigger_cowbell(t_beat, cowbell_scale[note_idx])
        # Syncopated hit on the 3rd sixteenth
        if b % 2 == 1:
            trigger_cowbell(t_beat + 2 * sixteenth, cowbell_scale[(note_idx + 2) % len(cowbell_scale)])

    # Snare on beats 2, 4 (relative to bar of 4)
    if is_drop and (b % 4 == 1 or b % 4 == 3):
        trigger_snare(t_beat)

    # 808 Kick Pattern
    if is_drop:
        if b % 4 == 0:
            trigger_808_kick(t_beat, punch=1.2)
        elif b % 4 == 2 and (b // 4) % 2 == 1:
            trigger_808_kick(t_beat, punch=1.1)
        elif b % 4 == 2:
            trigger_808_kick(t_beat + 2 * sixteenth, punch=1.0)
    elif b < 7 and b % 2 == 0:
        # Subtle sub-bass thud during build-up
        trigger_808_kick(t_beat, punch=0.5)

# Output WAV
out_dir = r"e:\Rudranildocs0066543\html-yt\dealflow-remotion\public\audio"
out_path = os.path.join(out_dir, "phonk_beat.wav")

with wave.open(out_path, "w") as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2) # 16-bit
    wav.setframerate(sample_rate)
    
    frames = bytearray()
    for i in range(total_samples):
        # Master limiter
        l_val = max(-0.95, min(0.95, left[i]))
        r_val = max(-0.95, min(0.95, right[i]))
        l_int = int(l_val * 32767)
        r_int = int(r_val * 32767)
        frames.extend(struct.pack("<hh", l_int, r_int))
        
    wav.writeframes(frames)

print(f"Generated phonk beat: {out_path} ({len(frames)} bytes)")
