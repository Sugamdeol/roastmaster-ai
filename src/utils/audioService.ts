
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
 * Parse a stream chunk to extract text and audio data
 */
export const parseStreamChunk = (chunk: Uint8Array): { text?: string; audio?: Int16Array } => {
  try {
    // Convert to string and parse as JSON
    const jsonString = new TextDecoder().decode(chunk);
    
    // Skip empty chunks
    if (!jsonString.trim()) {
      return {};
    }
    
    try {
      const data = JSON.parse(jsonString);
      
      // Extract text and audio if available
      return {
        text: data.text || undefined,
        audio: data.audio ? new Int16Array(data.audio) : undefined
      };
    } catch (e) {
      // If it's not valid JSON, check if it contains audio data in binary format
      if (chunk.byteLength > 4) {
        // Assume it's raw audio data
        const audioArray = new Int16Array(chunk.buffer, chunk.byteOffset, Math.floor(chunk.byteLength / 2));
        return { audio: audioArray };
      }
      return {};
    }
  } catch (error) {
    console.error('Error parsing stream chunk:', error);
    return {};
  }
};

/**
 * Stream audio response from the Pollinations API
 */
export const streamRoastAudio = async (
  prompt: string,
  voice: RoastVoice = DEFAULT_VOICE,
  onTranscript: (text: string) => void,
  onAudio: (chunk: Int16Array) => void,
  model: string = "mistral" // Updated to use mistral instead of mistralai-large
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

  public addChunk(pcmData: Int16Array): void {
    // Convert Int16Array to Uint8Array for storage
    const uint8Data = new Uint8Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
    this.audioChunks.push(uint8Data);
    
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
        // Convert stored Uint8Array back to Int16Array for playback
        const int16Data = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / 2);
        this.playChunk(int16Data);
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

  private playChunk(pcmData: Int16Array): void {
    if (this.isPaused) return;
    
    const numSamples = pcmData.length;
    const floatData = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      floatData[i] = pcmData[i] / 32768; // Normalize to [-1, 1]
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
