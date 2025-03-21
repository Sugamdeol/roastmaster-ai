
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
  model: string = "openai-audio" // Using openai-audio model for compatibility
): Promise<void> => {
  try {
    // Use the proven Pollinations API endpoint
    const endpoint = 'https://text.pollinations.ai/openai';
    
    const requestBody = {
      input: prompt,
      voice: voice,
      stream: true,
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
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    const reader = response.body.getReader();
    let transcript = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      if (!value || value.length === 0) continue;
      
      // Process the chunk
      const { text, audio } = parseStreamChunk(value);
      
      if (text) {
        transcript += text;
        onTranscript(transcript);
      }
      
      if (audio && audio.length > 0) {
        onAudio(audio);
      }
    }
  } catch (error) {
    console.error('Error streaming audio:', error);
    toast.error('Failed to stream audio roast');
    throw error;
  }
};
