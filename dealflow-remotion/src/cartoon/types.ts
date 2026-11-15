export interface CharacterProps {
  x: number;
  y: number;
  scale?: number;
  isSpeaking?: boolean;
  emotion?: 'happy' | 'talking' | 'shocked' | 'proud' | 'fainting' | 'thinking';
  gesture?: 'idle' | 'pointing' | 'flexing' | 'typing' | 'shrugging' | 'jumping';
  frame: number;
  fps: number;
}

export interface DialogueLine {
  id: string;
  speaker: 'gpt' | 'claude' | 'gemini' | 'user' | 'narrator';
  hindiText: string;
  hinglishText: string;
  startFrame: number;
  endFrame: number;
  x?: number;
  y?: number;
}
