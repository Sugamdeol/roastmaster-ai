
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Volume2, Pause, Play, VolumeX, Loader2 } from "lucide-react";
import { 
  DEFAULT_VOICE, 
  ROAST_VOICES,
  RoastVoice,
  generateRoastAudio,
  streamRoastAudio,
  PCM16AudioManager
} from '@/utils/audioService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from 'sonner';
import { incrementAudioRoastCount } from '@/utils/counterUtils';

interface AudioRoastPlayerProps {
  roastText: string;
  finalBurn: string;
  apiKey: string;
}

const AudioRoastPlayer: React.FC<AudioRoastPlayerProps> = ({ 
  roastText, 
  finalBurn,
  apiKey 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<RoastVoice>(DEFAULT_VOICE);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [useStreaming, setUseStreaming] = useState<boolean>(true);
  
  // Legacy audio player ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // PCM streaming audio manager
  const audioManagerRef = useRef<PCM16AudioManager | null>(null);
  
  // Cleanup function for either audio player
  useEffect(() => {
    return () => {
      if (audioRef.current && audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      if (audioManagerRef.current) {
        audioManagerRef.current.reset();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!apiKey) {
      toast.error('Please enter your OpenAI API key first');
      return;
    }

    if (isGenerating) return;

    try {
      setIsGenerating(true);
      
      // Combine roast text and final burn for the audio
      const fullRoastText = `${roastText} And for the final burn: ${finalBurn}`;
      
      if (useStreaming) {
        // Initialize streaming audio manager if needed
        if (!audioManagerRef.current) {
          audioManagerRef.current = new PCM16AudioManager((playing) => {
            setIsPlaying(playing);
          });
        } else {
          audioManagerRef.current.reset();
        }
        
        setCurrentTranscript("");
        
        // Start streaming
        await streamRoastAudio(
          fullRoastText,
          selectedVoice,
          apiKey,
          (text) => {
            setCurrentTranscript(text);
          },
          (audioChunk) => {
            if (audioManagerRef.current) {
              audioManagerRef.current.addChunk(audioChunk);
            }
          }
        );
        
        // Start playback automatically
        if (audioManagerRef.current) {
          audioManagerRef.current.startPlayback();
          setIsPlaying(true);
        }
      } else {
        // Legacy non-streaming method
        const generatedAudioUrl = await generateRoastAudio(fullRoastText, selectedVoice, apiKey);
        
        // Create new audio element
        audioRef.current = new Audio(generatedAudioUrl);
        
        // Set up event listeners
        audioRef.current.onplay = () => setIsPlaying(true);
        audioRef.current.onpause = () => setIsPlaying(false);
        audioRef.current.onended = () => setIsPlaying(false);
        
        // Auto-play the audio
        audioRef.current.play();
        setIsPlaying(true);
      }
      
      // Update counters
      incrementAudioRoastCount();
      
      toast.success('Audio roast generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio roast');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (useStreaming) {
      if (audioManagerRef.current) {
        audioManagerRef.current.togglePlayback();
      }
    } else {
      if (!audioRef.current) return;
      
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (useStreaming) {
      if (audioManagerRef.current) {
        audioManagerRef.current.setMuted(!isMuted);
        setIsMuted(!isMuted);
      }
    } else {
      if (!audioRef.current) return;
      
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="roast-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Audio Roast</h3>
        
        <Select 
          value={selectedVoice} 
          onValueChange={(value) => setSelectedVoice(value as RoastVoice)}
        >
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROAST_VOICES).map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {!isPlaying && !isGenerating && (
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !apiKey}
          className="w-full button-gradient"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Audio...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Generate Audio Roast
            </>
          )}
        </Button>
      )}
      
      {(isPlaying || isGenerating) && (
        <>
          {currentTranscript && (
            <div className="p-2 bg-black/20 rounded-md text-sm max-h-24 overflow-y-auto">
              <p className="text-left text-white/80">{currentTranscript}</p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={togglePlayPause}
              variant="secondary"
              size="icon"
              className="w-10 h-10 rounded-full"
              disabled={isGenerating}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={handleGenerate}
              variant="outline"
              size="sm"
              disabled={isGenerating}
              className="text-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate'
              )}
            </Button>
          </div>
        </>
      )}
      
      <p className="text-xs text-white/60 text-center">
        {useStreaming ? 
          "Uses OpenAI's streaming TTS model for real-time audio roasts!" : 
          "Uses OpenAI's TTS model to voice your roast!"}
      </p>
    </div>
  );
};

export default AudioRoastPlayer;
