import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Flame, Camera, MessageSquare, Share2, Volume2, Swords } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import UploadSelfie from '@/components/UploadSelfie';
import RoastResult from '@/components/RoastResult';
import RoastIntensity from '@/components/RoastIntensity';
import PersonaSelector from '@/components/PersonaSelector';
import RoastBattle from '@/components/RoastBattle';
import { dataURLToBase64 } from '@/utils/imageUtils';
import { generateImageRoast, generateTextRoast } from '@/utils/apiService';
import { 
  getRoastCount, 
  getEgoCrushedCount,
  getAudioRoastCount,
  incrementRoastCount, 
  incrementEgoCrushedCount 
} from '@/utils/counterUtils';

const Index = () => {
  const [activeTab, setActiveTab] = useState("selfie");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [roastIntensity, setRoastIntensity] = useState<'light' | 'medium' | 'dark'>('medium');
  const [aiPersona, setAiPersona] = useState('Savage Comedian');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roastResult, setRoastResult] = useState<{
    roast: string;
    finalBurn: string;
    ratings: Record<string, number>;
  } | null>(null);
  const [roastCount, setRoastCount] = useState(0);
  const [egoCrushedCount, setEgoCrushedCount] = useState(0);

  useEffect(() => {
    setRoastCount(getRoastCount());
    setEgoCrushedCount(getEgoCrushedCount());
  }, []);

  const handleImageSelected = (base64Image: string) => {
    setImageUrl(base64Image);
  };

  const updateCounters = () => {
    const newRoastCount = incrementRoastCount();
    const newEgoCrushedCount = incrementEgoCrushedCount();
    
    setRoastCount(newRoastCount);
    setEgoCrushedCount(newEgoCrushedCount);
  };

  const handleRoastSelfie = async () => {
    if (!imageUrl) {
      toast.error('Please upload a selfie first');
      return;
    }

    try {
      setIsGenerating(true);
      const base64Data = dataURLToBase64(imageUrl);
      
      const result = await generateImageRoast(
        base64Data,
        roastIntensity,
        aiPersona
      );
      
      setRoastResult(result);
      updateCounters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error generating roast:', error);
      toast.error('Failed to generate roast. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRoastText = async () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text to roast');
      return;
    }

    try {
      setIsGenerating(true);
      
      const result = await generateTextRoast(
        textInput,
        roastIntensity,
        aiPersona
      );
      
      setRoastResult(result);
      updateCounters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error generating roast:', error);
      toast.error('Failed to generate roast. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRoastAgain = () => {
    setRoastResult(null);
    setImageUrl(null);
    setTextInput('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground pb-20">
      <header className="w-full py-6 px-4 flex justify-center">
        <div className="flex items-center">
          <Flame className="h-8 w-8 mr-2 text-[#FF7A50] animate-pulse" />
          <h1 className="text-3xl font-bold text-gradient">RoastGPT</h1>
        </div>
      </header>
      
      <div className="w-full max-w-2xl mx-auto px-4">
        {roastResult ? (
          <RoastResult
            imageUrl={imageUrl || undefined}
            roast={roastResult.roast}
            finalBurn={roastResult.finalBurn}
            ratings={roastResult.ratings}
            onRoastAgain={handleRoastAgain}
          />
        ) : (
          <>
            <Tabs 
              defaultValue="selfie" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="selfie" className="data-[state=active]:bg-[#FF5722]">
                  <Camera className="h-4 w-4 mr-2" />
                  Selfie Roast
                </TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-[#FF5722]">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Text Roast
                </TabsTrigger>
                <TabsTrigger value="battle" className="data-[state=active]:bg-[#FF5722]">
                  <Swords className="h-4 w-4 mr-2" />
                  Roast Battle
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="selfie" className="mt-0">
                <div className="space-y-6">
                  <UploadSelfie onImageSelected={handleImageSelected} />
                  
                  {imageUrl && (
                    <>
                      <RoastIntensity 
                        value={roastIntensity} 
                        onChange={setRoastIntensity} 
                      />
                      
                      <PersonaSelector 
                        value={aiPersona} 
                        onChange={setAiPersona} 
                      />
                      
                      <Button
                        onClick={handleRoastSelfie}
                        disabled={isGenerating}
                        className="button-gradient flex items-center gap-2 px-6 py-6 rounded-full text-lg font-medium w-full"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin mr-2" />
                            Roasting...
                          </>
                        ) : (
                          <>
                            <Flame size={20} className="mr-2" />
                            Roast My Selfie
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="mt-0">
                <div className="space-y-6">
                  <div className="w-full">
                    <Textarea
                      placeholder="Enter a bio, tweet, or message to get roasted..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="min-h-[150px] bg-secondary border-white/10 focus:border-[#FF7A50] resize-none"
                    />
                  </div>
                  
                  <RoastIntensity 
                    value={roastIntensity} 
                    onChange={setRoastIntensity} 
                  />
                  
                  <PersonaSelector 
                    value={aiPersona} 
                    onChange={setAiPersona} 
                  />
                  
                  <Button
                    onClick={handleRoastText}
                    disabled={isGenerating || !textInput.trim()}
                    className="button-gradient flex items-center gap-2 px-6 py-6 rounded-full text-lg font-medium w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin mr-2" />
                        Roasting...
                      </>
                    ) : (
                      <>
                        <Flame size={20} className="mr-2" />
                        Roast My Text
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="battle" className="mt-0">
                <RoastBattle />
              </TabsContent>
            </Tabs>
            
            <div className="mt-12 flex justify-center space-x-8">
              <div className="text-center">
                <p className="text-[#FF7A50] text-xl font-bold">{roastCount.toLocaleString()}</p>
                <p className="text-white/60 text-sm">Roasts Today</p>
              </div>
              
              <div className="text-center">
                <p className="text-[#FF7A50] text-xl font-bold">{egoCrushedCount.toLocaleString()}</p>
                <p className="text-white/60 text-sm">Egos Crushed</p>
              </div>
              
              <div className="text-center">
                <p className="text-[#FF7A50] text-xl font-bold">{getAudioRoastCount().toLocaleString()}</p>
                <p className="text-white/60 text-sm">Audio Roasts</p>
              </div>
            </div>
            
            <div className="mt-8 text-center text-white/60 text-xs px-4">
              <p className="mb-1 flex items-center justify-center">
                <Flame size={12} className="mr-1 text-[#FF7A50]" />
                Warning: Our AI has no filter and will absolutely destroy you
              </p>
              <p>By continuing, you agree to be absolutely decimated</p>
            </div>
            
            <div className="mt-6 text-center text-white/40 text-xs">
              Powered by Pollinations.AI
            </div>
          </>
        )}
      </div>
      
      <div className="w-full max-w-5xl mx-auto mt-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gradient">The Ultimate AI Roast Master</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="roast-card p-6">
            <div className="mb-4 flex justify-center">
              <Camera className="h-8 w-8 text-[#FF7A50]" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-center">Selfie Roast</h3>
            <p className="text-white/70 text-center">
              Upload a selfie and get a savage AI-generated roast based on your appearance.
            </p>
          </div>
          
          <div className="roast-card p-6">
            <div className="mb-4 flex justify-center">
              <MessageSquare className="h-8 w-8 text-[#FF7A50]" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-center">Text Roast</h3>
            <p className="text-white/70 text-center">
              Enter your bio, tweet, or message and let our AI tear it apart with brutal honesty.
            </p>
          </div>
          
          <div className="roast-card p-6">
            <div className="mb-4 flex justify-center">
              <Swords className="h-8 w-8 text-[#FF7A50]" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-center">Roast Battle</h3>
            <p className="text-white/70 text-center">
              Go head-to-head with the AI in a never-ending roast battle until you decide to stop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
