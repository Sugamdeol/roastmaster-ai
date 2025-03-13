
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="roast-card p-8 max-w-md w-full animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="bg-white/10 p-3 rounded-full mb-6">
            <AlertTriangle className="h-10 w-10 text-[#FF5722]" />
          </div>
          
          <h1 className="text-4xl font-bold mb-2 text-gradient">404</h1>
          <p className="text-xl mb-6">Oops! This page got roasted too hard</p>
          
          <p className="text-white/70 mb-8">
            Even our AI couldn't come up with a good roast for this page because it doesn't exist.
          </p>
          
          <Button 
            asChild
            className="button-gradient px-6 py-4 rounded-full"
          >
            <a href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Roasting
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
