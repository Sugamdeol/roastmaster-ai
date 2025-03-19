
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, MessageSquare, Swords } from "lucide-react";
import { toast } from 'sonner';
import RoastResult from '@/components/RoastResult';
import SelfieTab from '@/components/tabs/SelfieTab';
import TextTab from '@/components/tabs/TextTab';
import RoastBattle from '@/components/RoastBattle';
import CounterStats from '@/components/CounterStats';
import FeaturesOverview from '@/components/FeaturesOverview';
import Header from '@/components/Header';
import { dataURLToBase64 } from '@/utils/imageUtils';
import { generateImageRoast, generateTextRoast } from '@/utils/apiService';
import { incrementRoastCount, incrementEgoCrushedCount } from '@/utils/counterUtils';
import { SupportedLanguage } from '@/components/LanguageSelector';

const Index = () => {
  const [activeTab, setActiveTab] = useState("selfie");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [roastIntensity, setRoastIntensity] = useState<'light' | 'medium' | 'dark'>('medium');
  const [aiPersona, setAiPersona] = useState('Savage Comedian');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roastResult, setRoastResult] = useState<{
    roast: string;
    finalBurn: string;
    ratings: Record<string, number>;
  } | null>(null);

  const handleImageSelected = (base64Image: string) => {
    setImageUrl(base64Image);
  };

  const updateCounters = () => {
    incrementRoastCount();
    incrementEgoCrushedCount();
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
        aiPersona,
        selectedLanguage
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
        aiPersona,
        selectedLanguage
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
      <Header />
      
      <div className="w-full max-w-2xl mx-auto px-4">
        {roastResult ? (
          <RoastResult
            imageUrl={imageUrl || undefined}
            roast={roastResult.roast}
            finalBurn={roastResult.finalBurn}
            ratings={roastResult.ratings}
            onRoastAgain={handleRoastAgain}
            language={selectedLanguage}
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
                <SelfieTab
                  imageUrl={imageUrl}
                  onImageSelected={handleImageSelected}
                  roastIntensity={roastIntensity}
                  setRoastIntensity={setRoastIntensity}
                  aiPersona={aiPersona}
                  setAiPersona={setAiPersona}
                  isGenerating={isGenerating}
                  handleRoastSelfie={handleRoastSelfie}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                />
              </TabsContent>
              
              <TabsContent value="text" className="mt-0">
                <TextTab
                  textInput={textInput}
                  setTextInput={setTextInput}
                  roastIntensity={roastIntensity}
                  setRoastIntensity={setRoastIntensity}
                  aiPersona={aiPersona}
                  setAiPersona={setAiPersona}
                  isGenerating={isGenerating}
                  handleRoastText={handleRoastText}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                />
              </TabsContent>
              
              <TabsContent value="battle" className="mt-0">
                <RoastBattle />
              </TabsContent>
            </Tabs>
            
            <CounterStats />
          </>
        )}
      </div>
      
      <FeaturesOverview />
    </div>
  );
};

export default Index;
