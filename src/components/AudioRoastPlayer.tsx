
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Volume2, Pause, Play, VolumeX, Loader2, Swords } from "lucide-react";
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
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface AudioRoastPlayerProps {
  roastText: string;
  finalBurn: string;
}

const AudioRoastPlayer: React.FC<AudioRoastPlayerProps> = ({ 
  roastText, 
  finalBurn
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<RoastVoice>(DEFAULT_VOICE);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  
  // Battle mode states
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [isUserTurn, setIsUserTurn] = useState(true);
  
  // PCM streaming audio manager
  const audioManagerRef = useRef<PCM16AudioManager | null>(null);
  
  // Cleanup function for audio player
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
      
      if (!isBattleMode) {
        // Standard mode - combines roast text and final burn for the audio
        const fullRoastText = `${roastText} And for the final burn: ${finalBurn}`;
        await generateAudio(fullRoastText);
      } else {
        // Battle mode - use the user prompt
        if (!userPrompt.trim()) {
          toast.error('Please enter something to battle about');
          setIsGenerating(false);
          return;
        }
        await generateAudio(`You're in a roast battle. Respond to this with the most savage comeback: ${userPrompt}`);
        setIsUserTurn(false);
      }
      
      // Update counters
      incrementAudioRoastCount();
      
      toast.success(isBattleMode ? 'The AI has responded!' : 'Audio roast generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio roast');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async (text: string) => {
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
    
    // Start playback automatically
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

  const handleSubmitPrompt = async () => {
    if (!userPrompt.trim() || !isUserTurn || isGenerating) return;
    await handleGenerate();
  };

  const startNewBattle = () => {
    setCurrentTranscript("");
    setUserPrompt("");
    setIsUserTurn(true);
    if (audioManagerRef.current) {
      audioManagerRef.current.reset();
    }
    setIsPlaying(false);
  };

  return (
    <div className="roast-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Audio Roast</h3>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch 
              id="battle-mode" 
              checked={isBattleMode} 
              onCheckedChange={setIsBattleMode}
            />
            <Label htmlFor="battle-mode" className="text-sm">Battle Mode</Label>
          </div>
          
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
      </div>
      
      {isBattleMode && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">
              {isUserTurn ? "Your Turn" : "AI Responded"}
            </h4>
            {!isUserTurn && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startNewBattle}
                className="text-xs"
              >
                New Battle
              </Button>
            )}
          </div>
          
          <Textarea
            placeholder="Enter your roast to battle the AI..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={!isUserTurn || isGenerating}
            className="min-h-[80px] bg-secondary border-white/10 text-sm"
          />
          
          {isUserTurn && (
            <Button
              onClick={handleSubmitPrompt}
              disabled={isGenerating || !userPrompt.trim()}
              className="w-full button-gradient"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI is thinking...
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4 mr-2" />
                  Battle!
                </>
              )}
            </Button>
          )}
        </div>
      )}
      
      {!isBattleMode && !isPlaying && !isGenerating && (
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
      
      {(isPlaying || isGenerating || (isBattleMode && !isUserTurn)) && (
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
            
            {!isBattleMode && (
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
            )}
          </div>
        </>
      )}
      
      <p className="text-xs text-white/60 text-center">
        {isBattleMode ? 
          "Challenge the AI to a roast battle! Take turns exchanging roasts." : 
          "Uses streaming TTS to voice your roast in real-time!"}
      </p>
    </div>
  );
};

export default AudioRoastPlayer;
