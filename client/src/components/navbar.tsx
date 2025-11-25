import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  return (
    <nav className="h-[10vh] min-h-[60px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-partner-from to-partner-to">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-partner-from to-partner-to bg-clip-text text-transparent">
              Odoo Matchmaker
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 h-full">
            <Link 
              href="/" 
              className={`relative inline-block px-3 text-foreground hover:text-foreground transition-colors pb-1 ${
                isActive("/") ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-partner-from" : ""
              }`}
            >
              Home
            </Link>
            <Link 
              href="/pricing" 
              className={`relative inline-block px-3 text-foreground hover:text-foreground transition-colors pb-1 ${
                isActive("/pricing") ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-partner-from" : ""
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/get-started" 
              className={`relative inline-block px-3 text-foreground hover:text-foreground transition-colors pb-1 ${
                isActive("/get-started") ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-partner-from" : ""
              }`}
            >
              Get Started
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="h-9 hidden sm:flex">
                Login
              </Button>
            </Link>
            <Link href="/get-started?signup=true">
              <Button className="h-9 bg-gradient-to-r from-partner-from to-partner-to text-white hover:opacity-90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

