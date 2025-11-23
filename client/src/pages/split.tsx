import { Link } from "wouter";
import { Users, Briefcase, ArrowRight } from "lucide-react";

export default function Split() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 grid-cols-1">
      <Link href="/client-home" data-testid="link-split-client">
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
                I'm a Client
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 max-w-md mx-auto">
                Find the perfect Odoo Partner for your business needs
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-white/80 text-lg">
              <span>Start swiping</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>

      <Link href="/partner-home" data-testid="link-split-partner">
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
                I'm a Partner
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 max-w-md mx-auto">
                Connect with clients seeking your expertise
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-white/80 text-lg">
              <span>Join our network</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
