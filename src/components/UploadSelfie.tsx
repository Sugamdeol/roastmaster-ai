
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { resizeImage } from '@/utils/imageUtils';
import { toast } from 'sonner';

interface UploadSelfieProps {
  onImageSelected: (base64Image: string) => void;
}

const UploadSelfie: React.FC<UploadSelfieProps> = ({ onImageSelected }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    try {
      setIsLoading(true);
      const resizedImage = await resizeImage(file);
      setPreview(resizedImage);
      onImageSelected(resizedImage);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center w-full mx-auto">
      <div 
        className={`relative w-full max-w-lg mx-auto aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
          preview ? 'border-[#FF5722]' : 'border-dashed border-white/20 hover:border-white/40'
        } mb-4`}
      >
        {preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover animate-fade-in"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-secondary/50">
            <Camera size={48} className="mb-4 text-[#FF7A50] animate-pulse-fire" />
            <p className="text-center text-white/80 mb-2">
              Take or upload a selfie to get roasted
            </p>
            <p className="text-center text-white/60 text-sm">
              Your image stays on your device and is processed securely
            </p>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-white/10 border-t-[#FF7A50] rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      <input
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        disabled={isLoading}
      />
      
      <Button 
        onClick={handleCameraClick}
        disabled={isLoading}
        className="button-gradient flex items-center gap-2 px-6 py-6 rounded-full text-lg font-medium w-full max-w-lg mx-auto"
      >
        <Camera size={20} className="mr-2" />
        {preview ? 'Change Photo' : 'Take a Selfie'}
      </Button>
    </div>
  );
};

export default UploadSelfie;
