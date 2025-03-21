
/**
 * Service for generating audio roasts using OpenAI's TTS API through Pollinations
 */

import { toast } from 'sonner';
import { PCM16AudioManager } from './audioStreaming';

// Re-export PCM16AudioManager
export { PCM16AudioManager };

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
export const parseStreamChunk = (chunk: Uint8Array): { text?: string; audio?: Uint8Array } => {
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
        audio: data.audio ? new Uint8Array(data.audio) : undefined
      };
    } catch (e) {
      // If it's not valid JSON, it might be binary data
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
  onAudio: (chunk: Uint8Array) => void
): Promise<void> => {
  try {
    // Check if text is too long
    if (prompt.length > 4000) {
      prompt = prompt.substring(0, 4000);
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
        { role: "user", content: prompt }
      ]
    };

    console.log("Sending TTS request with:", JSON.stringify(requestBody));
    
    const response = await fetch(STREAMING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
                  onTranscript(accumulatedText);
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
                  
                  onAudio(bytes);
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
    console.error('Error streaming audio:', error);
    toast.error('Failed to stream audio roast');
    throw error;
  }
};
