
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Volume2, Pause, Play, VolumeX } from "lucide-react";
import { 
  DEFAULT_VOICE, 
  ROAST_VOICES,
  RoastVoice,
  generateRoastAudio, 
  playAudio 
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<RoastVoice>(DEFAULT_VOICE);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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
      
      // Generate the audio
      const generatedAudioUrl = await generateRoastAudio(fullRoastText, selectedVoice, apiKey);
      
      // Update state with the new audio URL
      setAudioUrl(generatedAudioUrl);
      
      // Create new audio element
      audioRef.current = new Audio(generatedAudioUrl);
      
      // Set up event listeners
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onended = () => setIsPlaying(false);
      
      // Auto-play the audio
      audioRef.current.play();
      setIsPlaying(true);
      
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
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
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
      
      {!audioUrl ? (
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !apiKey}
          className="w-full button-gradient"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin mr-2" />
              Generating Audio...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Generate Audio Roast
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={togglePlayPause}
            variant="secondary"
            size="icon"
            className="w-10 h-10 rounded-full"
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
            {isGenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      )}
      
      <p className="text-xs text-white/60 text-center">
        Uses OpenAI's TTS model to voice your roast!
      </p>
    </div>
  );
};

export default AudioRoastPlayer;
