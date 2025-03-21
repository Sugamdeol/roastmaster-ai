
/**
 * Service for generating audio roasts using OpenAI's TTS API through Pollinations
 */

import { toast } from 'sonner';
import { PCM16AudioManager } from './audioStreaming';

// Re-export PCM16AudioManager
export { PCM16AudioManager };

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
        // Properly handle binary data
        return { audio: new Int16Array(chunk.buffer, 0, Math.floor(chunk.byteLength / 2)) };
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
  model: string = "tts-1" // Updated model parameter
): Promise<void> => {
  try {
    // Use the specific audio TTS endpoint
    const endpoint = 'https://text.pollinations.ai/audio/tts';
    
    const requestBody = {
      input: prompt,
      voice: voice,
      model: model,
      response_format: "pcm"
    };
    
    console.log("Sending TTS request with:", JSON.stringify(requestBody));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("TTS API error:", errorText);
      throw new Error(`Failed to stream audio: ${response.statusText || errorText}`);
    }
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    const reader = response.body.getReader();
    let transcript = prompt; // Use the input prompt as the transcript
    onTranscript(transcript); // Immediately show the transcript
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      if (!value || value.length === 0) continue;
      
      // For PCM data, we can directly pass it to the audio player
      if (value.length > 0) {
        const audioData = new Int16Array(value.buffer, 0, Math.floor(value.length / 2));
        if (audioData.length > 0) {
          onAudio(audioData);
        }
      }
    }
  } catch (error) {
    console.error('Error streaming audio:', error);
    toast.error('Failed to stream audio roast');
    throw error;
  }
};
