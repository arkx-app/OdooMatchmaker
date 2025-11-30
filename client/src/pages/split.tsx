import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Users, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Split() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const handleClientClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Always redirect to client signup - users need to create an account first
    setLocation("/client/signup");
  };

  const handlePartnerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Always redirect to partner signup - users need to create an account first
    setLocation("/partner/signup");
  };
  
  return (
    <div className="min-h-screen grid lg:grid-cols-2 grid-cols-1 relative">
      <div className="absolute top-6 left-6 z-[100]">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/25 backdrop-blur-md hover:bg-white/35 text-white border-2 border-white/50 shadow-xl hover:shadow-2xl transition-all w-10 h-10"
          onClick={() => setLocation("/")}
          data-testid="button-go-back"
          aria-label="Go back to homepage"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
      </div>
      
      <div onClick={handleClientClick} data-testid="link-split-client">
        <div className="relative group min-h-[50vh] lg:min-h-screen flex items-center justify-center overflow-hidden cursor-pointer hover-elevate active-elevate-2">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-client-from via-client-via to-client-to opacity-95"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_50%)]" aria-hidden="true" />
          
          <div className="relative z-10 text-center px-8 py-16 space-y-8 transition-transform duration-300 group-hover:scale-105">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight">
                {t('split.client.title')}
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 max-w-md mx-auto">
                {t('split.client.description')}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-white/80 text-lg">
              <span>{t('split.client.cta')}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>

      <div onClick={handlePartnerClick} data-testid="link-split-partner">
        <div className="relative group min-h-[50vh] lg:min-h-screen flex items-center justify-center overflow-hidden cursor-pointer hover-elevate active-elevate-2">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-partner-from via-partner-via to-partner-to opacity-95"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_50%)]" aria-hidden="true" />
          
          <div className="relative z-10 text-center px-8 py-16 space-y-8 transition-transform duration-300 group-hover:scale-105">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight">
                {t('split.partner.title')}
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 max-w-md mx-auto">
                {t('split.partner.description')}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-white/80 text-lg">
              <span>{t('split.partner.cta')}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
