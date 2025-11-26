import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Heart, ArrowLeft, Sparkles, Award, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import type { Partner } from "@shared/schema";
import MatchModal from "@/components/match-modal";
import GuideBot from "@/components/guide-bot";
import { AchievementsList } from "@/components/achievement-badge";
import { useGamification } from "@/hooks/use-gamification";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CLIENT_GUIDE_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Client Matching!",
    message: "Swipe right to like a partner or left to skip. When you both like each other, you'll get a match!",
    action: "Use the heart and X buttons below to get started",
  },
  {
    id: "profile_review",
    title: "Review Profiles Carefully",
    message: "Check each partner's services, industry experience, and ratings before making your decision.",
    action: "Look for partners that match your project needs",
  },
  {
    id: "matching_rewards",
    title: "Earn Achievements",
    message: "Complete swipes and get matches to unlock badges and earn points!",
    action: "View your achievements in the sidebar",
  },
  {
    id: "messaging",
    title: "Start Conversations",
    message: "Once matched, you can message the partner to discuss project details.",
    action: "Look for the message button on matched profiles",
  },
];

export default function ClientSwipe() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedPartner, setMatchedPartner] = useState<Partner | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [clientId] = useState(() => `client-${Date.now()}`);
  const { stats, recordSwipe, recordMatch, newAchievements } = useGamification("clientGamification");
  const [showAchievements, setShowAchievements] = useState(false);
  const [, navigate] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("profile");
    navigate("/");
  };

  const { data: partners = [], isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const likeMutation = useMutation({
    mutationFn: async ({ partnerId, liked }: { partnerId: string; liked: boolean }) => {
      recordSwipe(liked);
      const response = await apiRequest("POST", "/api/matches", {
        clientId,
        partnerId,
        liked,
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.matched) {
        recordMatch();
        const partner = partners.find(p => p.id === data.partnerId);
        if (partner) {
          setTimeout(() => {
            setMatchedPartner(partner);
            setShowMatch(true);
          }, 300);
        }
      }
    },
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const currentPartner = partners[currentIndex];

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      const swipeDirection = info.offset.x > 0 ? "right" : "left";
      setDirection(swipeDirection);
      
      if (currentPartner) {
        likeMutation.mutate({
          partnerId: currentPartner.id,
          liked: swipeDirection === "right",
        });
      }
      
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setDirection(null);
      }, 300);
    }
  };

  const handleAction = (action: "skip" | "like") => {
    setDirection(action === "like" ? "right" : "left");
    
    if (currentPartner) {
      likeMutation.mutate({
        partnerId: currentPartner.id,
        liked: action === "like",
      });
    }
    
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading partners...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= partners.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">You've seen all partners!</h2>
          <p className="text-muted-foreground">Total Swipes: {stats.totalSwipes} | Likes: {stats.totalLikes} | Matches: {stats.totalMatches}</p>
          <p className="text-muted-foreground text-lg">
            Check back later for new matches, or explore our pricing plans to unlock premium features.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/">
              <Button variant="outline" size="lg" data-testid="button-home">
                Back to Home
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" data-testid="button-pricing">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent">
              Odoo Matchmaker
            </h1>
            <p className="text-xs text-muted-foreground">Swipes: {stats.totalSwipes} | Points: {stats.totalPoints}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAchievements(!showAchievements)}
              data-testid="button-achievements"
            >
              <Award className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-12 relative">
        <div className="relative h-[600px]">
          <AnimatePresence>
            {partners.slice(currentIndex, currentIndex + 3).map((partner, idx) => {
              const isTop = idx === 0;
              const zIndex = 3 - idx;
              const scale = 1 - idx * 0.05;
              const yOffset = idx * 10;

              return (
                <motion.div
                  key={partner.id}
                  className="absolute inset-0"
                  style={{
                    zIndex,
                    x: isTop ? x : 0,
                    rotate: isTop ? rotate : 0,
                    opacity: isTop ? opacity : 1,
                  }}
                  initial={{ scale, y: yOffset }}
                  animate={{
                    scale: isTop && direction ? 0.95 : scale,
                    y: yOffset,
                    x: isTop && direction ? (direction === "right" ? 300 : -300) : 0,
                    rotate: isTop && direction ? (direction === "right" ? 20 : -20) : 0,
                    opacity: isTop && direction ? 0 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={isTop ? handleDragEnd : undefined}
                >
                  <Card className="h-full overflow-hidden rounded-3xl shadow-2xl border-2" data-testid={`card-partner-${partner.id}`}>
                    <div className="h-full flex flex-col">
                      <div className="h-48 bg-gradient-to-br from-partner-from to-partner-to flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <span className="text-5xl font-bold text-partner-via">
                            {partner.company.charAt(0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold" data-testid={`text-company-${partner.id}`}>
                            {partner.company}
                          </h2>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < (partner.rating || 3) ? "text-yellow-500" : "text-muted"}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({partner.reviewCount} reviews)
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Badge variant="secondary" className="text-sm">
                            {partner.industry}
                          </Badge>
                          
                          <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Services Offered</h3>
                            <div className="flex flex-wrap gap-2">
                              {partner.services.map((service, i) => (
                                <Badge key={i} className="rounded-full">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {partner.description && (
                            <div className="space-y-2">
                              <h3 className="font-semibold text-sm text-muted-foreground">About</h3>
                              <p className="text-sm leading-relaxed">{partner.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-6 z-50">
          <Button
            size="icon"
            variant="outline"
            className="w-16 h-16 rounded-full bg-card shadow-xl border-2 hover:scale-110 transition-transform"
            onClick={() => handleAction("skip")}
            data-testid="button-skip"
            disabled={likeMutation.isPending}
          >
            <X className="w-8 h-8 text-danger-from" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="w-16 h-16 rounded-full bg-card shadow-xl border-2 hover:scale-110 transition-transform"
            onClick={() => handleAction("like")}
            data-testid="button-like"
            disabled={likeMutation.isPending}
          >
            <Heart className="w-8 h-8 text-success-from" />
          </Button>
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          {currentIndex + 1} / {partners.length} partners
        </div>
      </main>

      {/* Achievements Sidebar */}
      {showAchievements && (
        <div className="fixed left-0 top-0 bottom-0 w-96 bg-card border-r shadow-lg overflow-y-auto pt-20 z-40">
          <div className="p-6">
            <AchievementsList achievements={stats.achievements} />
          </div>
        </div>
      )}

      {/* New Achievement Popup */}
      {newAchievements.map((achievement) => (
        <div
          key={achievement.id}
          className="fixed top-20 right-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce"
          data-testid={`achievement-popup-${achievement.id}`}
        >
          <p className="font-bold">{achievement.name}</p>
          <p className="text-sm">+{achievement.points} points</p>
        </div>
      ))}

      <MatchModal
        open={showMatch}
        onClose={() => setShowMatch(false)}
        partner={matchedPartner}
      />

      {/* Guide Bot */}
      <GuideBot 
        steps={CLIENT_GUIDE_STEPS} 
        isPartner={false}
      />
    </div>
  );
}
