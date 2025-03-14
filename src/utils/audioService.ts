
/**
 * Service for generating audio roasts using OpenAI's TTS API
 */

import { toast } from 'sonner';

// OpenAI TTS API endpoint
const TTS_API_URL = 'https://api.openai.com/v1/audio/speech';
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

// Generate audio for a roast (non-streaming method)
export const generateRoastAudio = async (
  roastText: string, 
  voice: RoastVoice = DEFAULT_VOICE,
  apiKey: string
): Promise<string> => {
  try {
    // Check if text is too long (OpenAI has a 4096 token limit)
    if (roastText.length > 4000) {
      roastText = roastText.substring(0, 4000);
    }
    
    // Make the API call to OpenAI's TTS endpoint
    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: roastText,
        voice: voice,
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate audio');
    }

    // Convert the audio response to a blob
    const audioData = await response.blob();
    
    // Create a URL for the blob
    const audioUrl = URL.createObjectURL(audioData);
    
    return audioUrl;
  } catch (error) {
    console.error('Error generating audio roast:', error);
    toast.error('Failed to generate audio roast');
    throw error;
  }
};

// Stream audio for a roast
export const streamRoastAudio = async (
  roastText: string,
  voice: RoastVoice = DEFAULT_VOICE,
  apiKey: string,
  onTextUpdate: (text: string) => void,
  onAudioChunk: (audioData: Uint8Array) => void
): Promise<void> => {
  try {
    // Check if text is too long
    if (roastText.length > 4000) {
      roastText = roastText.substring(0, 4000);
    }

    const requestBody = {
      model: "openai-audio",
      modalities: ["text", "audio"],
      stream: true,
      audio: { voice, format: "pcm16" },
      messages: [
        {
          role: "system",
          content: "You are a brutal roast master. Read the following roast with attitude and perfect delivery."
        },
        { role: "user", content: roastText }
      ]
    };

    const response = await fetch(STREAMING_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let accumulatedText = "";

    function pump() {
      return reader.read().then(({ done, value }) => {
        if (done) return;
        
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split("\n");
        
        if (!buffer.endsWith("\n")) {
          buffer = lines.pop() || "";
        } else {
          buffer = "";
        }
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            let jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            
            try {
              const jsonObj = JSON.parse(jsonStr);
              if (jsonObj.choices && jsonObj.choices[0] && jsonObj.choices[0].delta) {
                const delta = jsonObj.choices[0].delta;
                
                // Get text transcript if available
                let textChunk = "";
                if (delta.audio && delta.audio.transcript) {
                  textChunk = delta.audio.transcript;
                } else if (delta.content) {
                  textChunk = delta.content;
                }
                
                if (textChunk) {
                  accumulatedText += textChunk;
                  onTextUpdate(accumulatedText);
                }
                
                // Process audio data if available
                if (delta.audio && delta.audio.data) {
                  const base64Data = delta.audio.data;
                  const binaryStr = atob(base64Data);
                  const len = binaryStr.length;
                  const bytes = new Uint8Array(len);
                  
                  for (let i = 0; i < len; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                  }
                  
                  onAudioChunk(bytes);
                }
              }
            } catch (e) {
              console.error("JSON parse error:", e);
            }
          }
        }
        
        return pump();
      }).catch(error => {
        console.error("Error reading stream:", error);
        throw error;
      });
    }

    return pump();
  } catch (error) {
    console.error('Error streaming audio roast:', error);
    toast.error('Failed to stream audio roast');
    throw error;
  }
};

// Play audio from URL
export const playAudio = (audioUrl: string): HTMLAudioElement => {
  const audio = new Audio(audioUrl);
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
    toast.error('Failed to play audio');
  });
  return audio;
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
