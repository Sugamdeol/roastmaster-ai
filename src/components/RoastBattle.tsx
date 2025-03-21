import React, { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Volume2, Pause, Play, VolumeX, Loader2, Swords, RefreshCw } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SupportedLanguage, SUPPORTED_LANGUAGES } from './LanguageSelector';

interface RoastBattleProps {
  language?: SupportedLanguage;
}

const RoastBattle: React.FC<RoastBattleProps> = ({ language = 'en' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<RoastVoice>(DEFAULT_VOICE);
  const [userPrompt, setUserPrompt] = useState("");
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [battleHistory, setBattleHistory] = useState<Array<{
    text: string;
    isUser: boolean;
    timestamp: number;
  }>>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const battleEndRef = useRef<HTMLDivElement>(null);
  
  const audioManagerRef = useRef<PCM16AudioManager | null>(null);

  useEffect(() => {
    if (battleEndRef.current) {
      battleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [battleHistory]);
  
  useEffect(() => {
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.reset();
      }
    };
  }, []);

  const handleSubmitPrompt = async () => {
    if (!userPrompt.trim() || !isUserTurn || isGenerating) return;
    
    setBattleHistory(prev => [
      ...prev, 
      { text: userPrompt, isUser: true, timestamp: Date.now() }
    ]);
    
    const userMessage = userPrompt;
    setUserPrompt("");
    
    setIsUserTurn(false);
    
    try {
      setIsGenerating(true);
      
      if (!audioManagerRef.current) {
        audioManagerRef.current = new PCM16AudioManager((playing) => {
          setIsPlaying(playing);
        });
      } else {
        audioManagerRef.current.reset();
      }
      
      setCurrentTranscript("");
      
      const languageName = SUPPORTED_LANGUAGES[language];
      const promptInLanguage = `You're in a roast battle. Respond to this with the most savage comeback in ${languageName}: ${userMessage}`;
      
      await streamRoastAudio(
        promptInLanguage,
        selectedVoice,
        (text) => {
          setCurrentTranscript(text);
        },
        (audioChunk) => {
          if (audioManagerRef.current) {
            audioManagerRef.current.addChunk(audioChunk);
          }
        },
        "openai-audio"
      );
      
      if (audioManagerRef.current) {
        audioManagerRef.current.startPlayback();
        setIsPlaying(true);
      }
      
      incrementAudioRoastCount();
      
      if (currentTranscript) {
        setBattleHistory(prev => [
          ...prev, 
          { text: currentTranscript, isUser: false, timestamp: Date.now() }
        ]);
      }
      
      setIsUserTurn(true);
      
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate AI response');
      setIsUserTurn(true);
    } finally {
      setIsGenerating(false);
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

  const startNewBattle = () => {
    setCurrentTranscript("");
    setUserPrompt("");
    setBattleHistory([]);
    setIsUserTurn(true);
    if (audioManagerRef.current) {
      audioManagerRef.current.reset();
    }
    setIsPlaying(false);
    toast.success('Started a new roast battle!');
  };

  return (
    <div className="space-y-4">
      <div className="roast-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">AI Roast Battle ({language.toUpperCase()})</h3>
          
          <div className="flex items-center gap-3">
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
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startNewBattle}
              className="text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              New Battle
            </Button>
          </div>
        </div>
        
        {battleHistory.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto mb-4 space-y-4 p-2 bg-black/20 rounded-md">
            {battleHistory.map((entry, index) => (
              <div key={index} className={`flex ${entry.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 ${entry.isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                  <Avatar className={`h-8 w-8 ${entry.isUser ? 'bg-blue-600' : 'bg-[#FF5722]'}`}>
                    <AvatarFallback>{entry.isUser ? 'YOU' : 'AI'}</AvatarFallback>
                  </Avatar>
                  <div className={`p-3 rounded-lg ${entry.isUser ? 'bg-blue-600/30' : 'bg-[#FF5722]/30'}`}>
                    <p className="text-sm">{entry.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {!isUserTurn && currentTranscript && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <Avatar className="h-8 w-8 bg-[#FF5722]">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-[#FF5722]/30">
                    <p className="text-sm">{currentTranscript}</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={battleEndRef} />
          </div>
        )}
        
        {isPlaying && (
          <div className="flex items-center justify-center gap-4 mb-4">
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
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">
              {isUserTurn ? "Your Turn" : "AI is responding..."}
            </h4>
          </div>
          
          <Textarea
            placeholder="Enter your roast to battle the AI..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={!isUserTurn || isGenerating}
            className="min-h-[80px] bg-secondary border-white/10 text-sm"
          />
          
          <Button
            onClick={handleSubmitPrompt}
            disabled={isGenerating || !userPrompt.trim() || !isUserTurn}
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
        </div>
        
        <p className="text-xs text-white/60 text-center mt-4">
          Challenge the AI to a never-ending roast battle! Keep exchanging burns until you're ready to stop.
        </p>
      </div>
    </div>
  );
};

export default RoastBattle;
