import React, { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Volume2, Pause, Play, VolumeX, Loader2 } from "lucide-react";
import { 
  DEFAULT_VOICE, 
  ROAST_VOICES,
  RoastVoice,
  streamRoastAudio,
  PCM16AudioManager
} from '@/utils/audioService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from 'sonner';
import { incrementAudioRoastCount } from '@/utils/counterUtils';
import { SupportedLanguage } from './LanguageSelector';

interface AudioRoastPlayerProps {
  roastText: string;
  finalBurn: string;
  language?: SupportedLanguage;
}

const AudioRoastPlayer: React.FC<AudioRoastPlayerProps> = ({ 
  roastText, 
  finalBurn,
  language = 'en'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<RoastVoice>(DEFAULT_VOICE);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  
  const audioManagerRef = useRef<PCM16AudioManager | null>(null);
  
  useEffect(() => {
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.reset();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      
      const fullRoastText = `${roastText} And for the final burn: ${finalBurn}`;
      await generateAudio(fullRoastText);
      
      incrementAudioRoastCount();
      
      toast.success('Audio roast generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio roast');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async (text: string) => {
    if (!audioManagerRef.current) {
      audioManagerRef.current = new PCM16AudioManager((playing) => {
        setIsPlaying(playing);
      });
    } else {
      audioManagerRef.current.reset();
    }
    
    setCurrentTranscript("");
    
    await streamRoastAudio(
      text,
      selectedVoice,
      (text) => {
        setCurrentTranscript(text);
      },
      (audioChunk) => {
        if (audioManagerRef.current) {
          audioManagerRef.current.addChunk(audioChunk);
        }
      }
    );
    
    if (audioManagerRef.current) {
      audioManagerRef.current.startPlayback();
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.togglePlayback();
    }
  };

  const toggleMute = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="roast-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Audio Roast ({language.toUpperCase()})</h3>
        
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
          disabled={isGenerating}
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
        Uses streaming TTS to voice your roast in real-time!
      </p>
    </div>
  );
};

export default AudioRoastPlayer;
