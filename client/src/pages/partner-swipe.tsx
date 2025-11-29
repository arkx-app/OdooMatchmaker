import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  X, ArrowLeft, Sparkles, Award, LogOut, ThumbsUp, MessageCircle,
  Clock, DollarSign, CheckCircle2, AlertCircle, Loader2,
  Briefcase, ChevronDown, ChevronUp, ExternalLink, LayoutDashboard, 
  Users, BarChart3, Info, Star, MapPin, Calendar, Building2, Globe,
  User, Search, FileText, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "wouter";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import type { Client, Match, Brief } from "@shared/schema";
import MatchModal from "@/components/match-modal";
import { useGamification } from "@/hooks/use-gamification";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface SwipeableClient {
  client: Client;
  match: Match;
  brief: Brief | null;
}

interface EnrichedMatch extends Match {
  client?: Client;
  brief?: Brief;
}

const PARTNER_GUIDE_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Client Discovery!",
    message: "Review interested clients and swipe right to connect or left to pass. When you both express interest, you'll create a match!",
    action: "Use the thumbs up and X buttons below to get started",
  },
  {
    id: "profile_review",
    title: "Review Client Briefs",
    message: "Check each client's budget, timeline, and project requirements before making your decision.",
    action: "Look for projects that match your expertise",
  },
  {
    id: "matching_rewards",
    title: "Earn Achievements",
    message: "Complete swipes and get matches to unlock badges and earn points!",
    action: "View your achievements in the menu",
  },
  {
    id: "messaging",
    title: "Start Conversations",
    message: "Once matched, you can message the client to discuss project details and scope.",
    action: "Look for the message button on matched profiles",
  },
];

function formatBudget(budget: string): string {
  const budgetLabels: Record<string, string> = {
    "0-10000": "Up to €10,000",
    "10000-25000": "€10,000 - €25,000",
    "25000-50000": "€25,000 - €50,000",
    "50000-100000": "€50,000 - €100,000",
    "100000-250000": "€100,000 - €250,000",
    "250000+": "€250,000+",
  };
  return budgetLabels[budget] || budget;
}

export default function PartnerSwipe() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedClient, setMatchedClient] = useState<Client | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const { stats, recordSwipe, recordMatch, newAchievements } = useGamification("partnerGamification");
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SwipeableClient | null>(null);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [, navigate] = useLocation();
  const { logout, user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const partnerId = user?.profile?.id || "";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/partner/signup");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!authLoading && user?.role !== "partner") {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("profile");
    navigate("/");
  };

  const { data: swipeableClients = [], isLoading, refetch: refetchClients } = useQuery<SwipeableClient[]>({
    queryKey: ["/api/clients/swipe", partnerId],
    queryFn: async () => {
      if (!partnerId) return [];
      const res = await fetch(`/api/clients/swipe/${partnerId}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!partnerId,
  });

  const { data: partnerMatches = [] } = useQuery<EnrichedMatch[]>({
    queryKey: ["/api/matches/partner", partnerId],
    queryFn: async () => {
      if (!partnerId) return [];
      const res = await fetch(`/api/matches/partner/${partnerId}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!partnerId,
  });

  const acceptedMatches = partnerMatches.filter(
    (m) => m.clientLiked && m.partnerAccepted && m.client
  );

  const swipeMutation = useMutation({
    mutationFn: async ({ matchId, accepted }: { matchId: string; accepted: boolean }) => {
      recordSwipe(accepted);
      const response = await apiRequest("POST", "/api/matches/partner-swipe", {
        matchId,
        accepted,
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients/swipe", partnerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches/partner", partnerId] });
      if (data.matched) {
        recordMatch();
        const clientData = swipeableClients.find(sc => sc.match.id === data.match.id);
        if (clientData) {
          setTimeout(() => {
            setMatchedClient(clientData.client);
            setShowMatch(true);
          }, 300);
        }
      }
    },
    onError: (error) => {
      console.error("Swipe error:", error);
      toast({
        title: "Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const currentClient = swipeableClients[currentIndex];

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      const swipeDirection = info.offset.x > 0 ? "right" : "left";
      setDirection(swipeDirection);
      
      if (currentClient) {
        swipeMutation.mutate({
          matchId: currentClient.match.id,
          accepted: swipeDirection === "right",
        });
      }
      
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setDirection(null);
      }, 300);
    }
  };

  const handleAction = (action: "skip" | "accept") => {
    setDirection(action === "accept" ? "right" : "left");
    
    if (currentClient) {
      swipeMutation.mutate({
        matchId: currentClient.match.id,
        accepted: action === "accept",
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
          <p className="text-muted-foreground">Loading interested clients...</p>
        </div>
      </div>
    );
  }

  if (swipeableClients.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold">No New Client Requests</h2>
          <p className="text-muted-foreground">
            When clients express interest in working with you, they'll appear here for you to review.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-lg font-medium">Your Stats</p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary" data-testid="text-swipes-count">{stats.totalSwipes}</p>
                <p className="text-muted-foreground">Reviewed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500 dark:text-blue-400" data-testid="text-likes-count">{stats.totalLikes}</p>
                <p className="text-muted-foreground">Accepted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500 dark:text-green-400" data-testid="text-matches-count">{stats.totalMatches}</p>
                <p className="text-muted-foreground">Matches</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate("/partner/dashboard")}
              data-testid="button-dashboard"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= swipeableClients.length && swipeableClients.length > 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold">Great job! You've reviewed all interested clients</h2>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-lg font-medium">Your Session Stats</p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary" data-testid="text-swipes-count">{stats.totalSwipes}</p>
                <p className="text-muted-foreground">Reviewed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500 dark:text-blue-400" data-testid="text-likes-count">{stats.totalLikes}</p>
                <p className="text-muted-foreground">Accepted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500 dark:text-green-400" data-testid="text-matches-count">{stats.totalMatches}</p>
                <p className="text-muted-foreground">Matches</p>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Head to your dashboard to manage your matches and messages.
          </p>
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate("/partner/dashboard")}
              data-testid="button-dashboard"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "P";

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-card shrink-0">
        <div className="px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/partner/dashboard")}
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Client Discovery
            </h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/partner/swipe")} data-testid="menu-matching">
                <Search className="w-4 h-4 mr-2" />
                Find Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/partner/dashboard")} data-testid="menu-dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/partner/analytics")} data-testid="menu-analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAchievements(!showAchievements)} data-testid="menu-achievements">
                <Award className="w-4 h-4 mr-2" />
                Achievements
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="menu-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Swipe Cards */}
        <div className="w-[55%] border-r bg-muted/10 flex flex-col">
          <div className="px-4 py-2 border-b bg-card flex items-center justify-between gap-2">
            <h2 className="font-semibold">Interested Clients</h2>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {swipeableClients.length}
            </span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
            <div className="relative w-full max-w-xs h-[420px]">
              <AnimatePresence>
                {swipeableClients.slice(currentIndex, currentIndex + 3).map((clientData, idx) => {
                  const isTop = idx === 0;
                  const zIndex = 3 - idx;
                  const scale = 1 - idx * 0.05;
                  const yOffset = idx * 10;
                  const { client, brief, match } = clientData;

                  return (
                    <motion.div
                      key={match.id}
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
                      <Card className="h-full overflow-hidden rounded-xl shadow-lg border" data-testid={`card-client-${client.id}`}>
                        <div className="h-full flex flex-col">
                          <div className="h-20 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <span className="text-xl font-bold text-blue-600">
                                {client.company.charAt(0)}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                            <div className="space-y-0.5">
                              <h2 className="text-lg font-bold leading-tight" data-testid={`text-company-${client.id}`}>
                                {client.company}
                              </h2>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {client.industry}
                                </Badge>
                                {client.companySize && (
                                  <Badge variant="outline" className="text-xs">
                                    {client.companySize === 'startup' ? 'Startup' : 
                                     client.companySize === 'smb' ? 'SMB' : 'Enterprise'}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              {/* Budget */}
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span className="font-medium">{formatBudget(client.budget)}</span>
                              </div>

                              {/* Timeline */}
                              {client.projectTimeline && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{client.projectTimeline}</span>
                                </div>
                              )}

                              {/* Modules requested */}
                              {client.odooModules && client.odooModules.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {client.odooModules.slice(0, 3).map((module, i) => (
                                    <Badge key={i} variant="outline" className="rounded-full text-xs">
                                      {module}
                                    </Badge>
                                  ))}
                                  {client.odooModules.length > 3 && (
                                    <Badge variant="outline" className="rounded-full text-xs">
                                      +{client.odooModules.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Brief info if available */}
                              {brief && (
                                <div className="bg-muted/50 rounded-md p-2 space-y-1">
                                  <div className="flex items-center gap-1 text-xs font-medium">
                                    <FileText className="w-3 h-3" />
                                    Project Brief
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {brief.title}
                                  </p>
                                </div>
                              )}

                              {/* Match Score if available */}
                              {match.score && (
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    {match.score}% Match Score
                                  </span>
                                </div>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedClient(clientData);
                                  setShowClientProfile(true);
                                }}
                                data-testid={`button-learn-more-${client.id}`}
                              >
                                <Info className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-4">
              <Button
                size="icon"
                variant="outline"
                className="w-14 h-14 rounded-full shadow-md border-2 bg-background"
                onClick={() => handleAction("skip")}
                data-testid="button-skip"
                disabled={swipeMutation.isPending}
              >
                <X className="w-6 h-6 text-red-500" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="w-14 h-14 rounded-full shadow-md border-2 bg-background"
                onClick={() => handleAction("accept")}
                data-testid="button-accept"
                disabled={swipeMutation.isPending}
              >
                <ThumbsUp className="w-6 h-6 text-green-500" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Matches */}
        <div className="w-[45%] flex flex-col bg-card">
          <Tabs defaultValue="matches" className="flex flex-col h-full">
            <div className="px-3 py-2 border-b">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="matches" className="gap-2" data-testid="tab-matches">
                  <CheckCircle2 className="w-4 h-4" />
                  Matches
                  {acceptedMatches.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {acceptedMatches.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
                  <Clock className="w-4 h-4" />
                  Pending
                  {swipeableClients.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {swipeableClients.length - currentIndex}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              {/* Matches Tab Content */}
              <TabsContent value="matches" className="m-0 p-3 space-y-2">
                {acceptedMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No mutual matches yet. Accept clients who have shown interest to create matches!
                    </p>
                  </div>
                ) : (
                  acceptedMatches.map((match) => (
                    <Card 
                      key={match.id} 
                      className="overflow-hidden hover-elevate cursor-pointer"
                      onClick={() => navigate(`/messages/${match.id}`)}
                      data-testid={`card-match-${match.id}`}
                    >
                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                            {match.client?.company.charAt(0) || "C"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-sm truncate">
                                {match.client?.company || "Client"}
                              </h3>
                              <Badge variant="secondary" className="text-xs shrink-0 bg-green-500/10 text-green-600">
                                Matched
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {match.client?.industry}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              <span>{formatBudget(match.client?.budget || "")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/messages/${match.id}`);
                            }}
                            data-testid={`button-message-${match.id}`}
                          >
                            <MessageCircle className="w-3 h-3" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Pending Tab Content */}
              <TabsContent value="pending" className="m-0 p-3 space-y-2">
                {swipeableClients.slice(currentIndex).length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      All caught up! Check back later for new client requests.
                    </p>
                  </div>
                ) : (
                  swipeableClients.slice(currentIndex).map((clientData, index) => (
                    <Card 
                      key={clientData.match.id} 
                      className="overflow-hidden"
                      data-testid={`card-pending-${clientData.client.id}`}
                    >
                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center font-bold shrink-0 text-blue-600">
                            {clientData.client.company.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-sm truncate">
                                {clientData.client.company}
                              </h3>
                              <Badge variant="outline" className="text-xs shrink-0">
                                #{currentIndex + index + 1}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {clientData.client.industry}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              <span>{formatBudget(clientData.client.budget)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>

      {/* Client Profile Dialog */}
      <Dialog open={showClientProfile} onOpenChange={setShowClientProfile}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {selectedClient?.client.company.charAt(0) || "C"}
              </div>
              <div>
                <div className="text-xl">{selectedClient?.client.company}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {selectedClient?.client.industry}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Contact Information</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedClient.client.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedClient.client.email}</span>
                  </div>
                  {selectedClient.client.website && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={selectedClient.client.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedClient.client.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Project Details</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{formatBudget(selectedClient.client.budget)}</span>
                  </div>
                  {selectedClient.client.projectTimeline && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedClient.client.projectTimeline}</span>
                    </div>
                  )}
                  {selectedClient.client.urgency && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="capitalize">{selectedClient.client.urgency}</span>
                    </div>
                  )}
                  {selectedClient.client.companySize && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="capitalize">{selectedClient.client.companySize}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modules */}
              {selectedClient.client.odooModules && selectedClient.client.odooModules.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Required Modules</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedClient.client.odooModules.map((module, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Brief Details */}
              {selectedClient.brief && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Project Brief</h4>
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      <h5 className="font-medium">{selectedClient.brief.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedClient.brief.description}
                      </p>
                      {selectedClient.brief.painPoints && selectedClient.brief.painPoints.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-medium">Pain Points:</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedClient.brief.painPoints.map((point, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {point}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Match Score */}
              {selectedClient.match.score && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Match Analysis</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: `${selectedClient.match.score}%` }}
                      />
                    </div>
                    <span className="font-bold text-sm">{selectedClient.match.score}%</span>
                  </div>
                  {selectedClient.match.reasons && selectedClient.match.reasons.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {selectedClient.match.reasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Match Celebration Modal */}
      {showMatch && matchedClient && (
        <MatchModal
          open={showMatch}
          onClose={() => {
            setShowMatch(false);
            setMatchedClient(null);
          }}
          matchName={matchedClient.company}
          matchType="client"
        />
      )}
    </div>
  );
}
