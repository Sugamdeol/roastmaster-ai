
/**
 * Service for generating audio roasts using OpenAI's TTS API
 */

import { toast } from 'sonner';

// OpenAI TTS API endpoint
const TTS_API_URL = 'https://api.openai.com/v1/audio/speech';

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

// Generate audio for a roast
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

// Play audio from URL
export const playAudio = (audioUrl: string): HTMLAudioElement => {
  const audio = new Audio(audioUrl);
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
    toast.error('Failed to play audio');
  });
  return audio;
};
