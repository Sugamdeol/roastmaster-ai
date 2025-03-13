
import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Download, Twitter, Facebook, Link2 } from "lucide-react";
import { toast } from 'sonner';

interface ShareOptionsProps {
  imageUrl?: string;
  roastText: string;
}

const ShareOptions: React.FC<ShareOptionsProps> = ({ imageUrl, roastText }) => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My RoastGPT Roast',
          text: roastText,
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(roastText);
        toast.success('Roast copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!imageUrl) {
      toast.error('No image available to download');
      return;
    }

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'roastgpt-roast.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full my-6">
      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          onClick={handleShare}
          variant="outline"
          className="flex items-center gap-2 border-white/20 hover:bg-white/5"
        >
          <Share2 size={16} />
          Share
        </Button>
        
        {imageUrl && (
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2 border-white/20 hover:bg-white/5"
          >
            <Download size={16} />
            Download
          </Button>
        )}
        
        <Button 
          onClick={handleCopyLink}
          variant="outline"
          className="flex items-center gap-2 border-white/20 hover:bg-white/5"
        >
          <Link2 size={16} />
          Copy Link
        </Button>
        
        <Button 
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(roastText)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
          variant="outline"
          className="flex items-center gap-2 border-white/20 hover:bg-white/5"
        >
          <Twitter size={16} />
          Twitter
        </Button>
        
        <Button 
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
          variant="outline"
          className="flex items-center gap-2 border-white/20 hover:bg-white/5"
        >
          <Facebook size={16} />
          Facebook
        </Button>
      </div>
    </div>
  );
};

export default ShareOptions;
