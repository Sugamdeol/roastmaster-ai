/**
 * Service for generating audio roasts using OpenAI's TTS API through Pollinations
 */

import { toast } from 'sonner';

// Pollinations Streaming API endpoint
const STREAMING_API_URL = 'https://text.pollinations.ai/openai/v1/chat/completions';

// Available voices for roasting
export const ROAST_VOICES = {
  'alloy': 'Alloy (Neutral)',
  'echo': 'Echo (Male)',
  'fable': 'Fable (Male)',
  'onyx': 'Onyx (Male)',
  'nova': 'Nova (Female)',
  'shimmer': 'Shimmer (Female)'
};

// Voice type definition
export type RoastVoice = keyof typeof ROAST_VOICES;

// Default voice
export const DEFAULT_VOICE: RoastVoice = 'nova';

/**
 * Stream audio response from the Pollinations API
 */
export const streamRoastAudio = async (
  prompt: string,
  voice: RoastVoice = DEFAULT_VOICE,
  onTranscript: (text: string) => void,
  onAudio: (chunk: Int16Array) => void,
  model: string = "mistralai-large" // Default to Mistral
): Promise<void> => {
  try {
    const endpoint = 'https://audio.pollinations.ai/tts/live';
    
    const requestBody = {
      message: {
        content: prompt
      },
      voice: voice,
      code: "beesknees",
      model: model
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to stream audio: ${response.statusText}`);
    }
    
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Unable to read response stream');
    
    let transcript = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Process the chunk
      const chunk = new Uint8Array(value);
      const { text, audio } = parseStreamChunk(chunk);
      
      if (text) {
        transcript += text;
        onTranscript(transcript);
      }
      
      if (audio) {
        onAudio(audio);
      }
    }
  } catch (error) {
    console.error('Error streaming audio:', error);
    toast.error('Failed to stream audio roast');
    throw error;
  }
};

// PCM16 Audio Context Manager
export class PCM16AudioManager {
  private audioContext: AudioContext;
  private playbackTimeOffset: number;
  private sampleRate: number = 24000;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private audioChunks: Uint8Array[] = [];
  private onPlayingChange?: (isPlaying: boolean) => void;

  constructor(onPlayingChange?: (isPlaying: boolean) => void) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.playbackTimeOffset = this.audioContext.currentTime;
    this.onPlayingChange = onPlayingChange;
  }

  public reset(): void {
    this.audioChunks = [];
    this.playbackTimeOffset = this.audioContext.currentTime;
    this.isPlaying = false;
    this.isPaused = false;
    if (this.onPlayingChange) {
      this.onPlayingChange(false);
    }
  }

  public addChunk(pcmData: Uint8Array): void {
    this.audioChunks.push(pcmData);
    if (this.isPlaying && !this.isPaused) {
      this.playChunk(pcmData);
    }
  }

  public startPlayback(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.isPaused = false;
      this.playbackTimeOffset = this.audioContext.currentTime;
      
      // Play all accumulated chunks
      for (const chunk of this.audioChunks) {
        this.playChunk(chunk);
      }
      
      if (this.onPlayingChange) {
        this.onPlayingChange(true);
      }
    } else if (this.isPaused) {
      this.isPaused = false;
      this.playbackTimeOffset = this.audioContext.currentTime;
      
      if (this.onPlayingChange) {
        this.onPlayingChange(true);
      }
    }
  }

  public pausePlayback(): void {
    if (this.isPlaying && !this.isPaused) {
      this.isPaused = true;
      
      if (this.onPlayingChange) {
        this.onPlayingChange(false);
      }
    }
  }

  public togglePlayback(): void {
    if (!this.isPlaying || this.isPaused) {
      this.startPlayback();
    } else {
      this.pausePlayback();
    }
  }

  public setMuted(muted: boolean): void {
    if (this.audioContext.destination) {
      (this.audioContext.destination as any).muted = muted;
    }
  }

  private playChunk(pcmData: Uint8Array): void {
    if (this.isPaused) return;
    
    const numSamples = pcmData.byteLength / 2;
    const floatData = new Float32Array(numSamples);
    const dataView = new DataView(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
    
    for (let i = 0; i < numSamples; i++) {
      const sample = dataView.getInt16(i * 2, true);
      floatData[i] = sample / 32768; // Normalize to [-1, 1]
    }
    
    const audioBuffer = this.audioContext.createBuffer(1, numSamples, this.sampleRate);
    audioBuffer.copyToChannel(floatData, 0);
    
    const now = this.audioContext.currentTime;
    if (this.playbackTimeOffset < now) {
      this.playbackTimeOffset = now;
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(this.playbackTimeOffset);
    this.playbackTimeOffset += audioBuffer.duration;
  }
}
