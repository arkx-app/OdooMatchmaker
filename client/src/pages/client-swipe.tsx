import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  X, ArrowLeft, Sparkles, Award, LogOut, ThumbsUp, MessageCircle,
  FolderPlus, Clock, DollarSign, CheckCircle2, AlertCircle, Loader2, Plus,
  Briefcase, ChevronDown, ChevronUp, ExternalLink, LayoutDashboard, 
  Users, BarChart3, Settings, Info, Star, MapPin, Calendar, Building2, Globe,
  Lock, Crown, Zap, User, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "wouter";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import type { Partner, Match, Brief } from "@shared/schema";
import MatchModal from "@/components/match-modal";
import GuideBot from "@/components/guide-bot";
import { AchievementsList } from "@/components/achievement-badge";
import { useGamification } from "@/hooks/use-gamification";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EnrichedMatch extends Match {
  partner?: Partner;
}

const CLIENT_GUIDE_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Client Matching!",
    message: "Swipe right to like a partner or left to skip. When you both like each other, you'll get a match!",
    action: "Use the thumbs up and X buttons below to get started",
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

function ProjectStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
    active: { 
      label: "Active", 
      icon: CheckCircle2, 
      className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" 
    },
    matching: { 
      label: "Matching", 
      icon: Loader2, 
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" 
    },
    archived: { 
      label: "Archived", 
      icon: AlertCircle, 
      className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" 
    },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      <Icon className={`w-3 h-3 mr-1 ${status === 'matching' ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}

export default function ClientSwipe() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedPartner, setMatchedPartner] = useState<Partner | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const { stats, recordSwipe, recordMatch, newAchievements } = useGamification("clientGamification");
  const [showAchievements, setShowAchievements] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showPartnerProfile, setShowPartnerProfile] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    budget: "",
    timelineWeeks: "",
    priority: "medium",
  });
  const [, navigate] = useLocation();
  const { logout, user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const clientId = user?.profile?.id || "";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/client/signup");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("profile");
    navigate("/");
  };

  const { data: partners = [], isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const { data: clientMatches = [] } = useQuery<EnrichedMatch[]>({
    queryKey: ["/api/matches/client", clientId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/client/${clientId}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!clientId,
  });

  const { data: briefsData, isLoading: briefsLoading } = useQuery<{ briefs: Brief[]; clientId?: string }>({
    queryKey: ["/api/my/briefs"],
    queryFn: async () => {
      const res = await fetch("/api/my/briefs", {
        credentials: "include",
      });
      if (!res.ok) return { briefs: [] };
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const clientBriefs = briefsData?.briefs || [];

  const createBriefMutation = useMutation({
    mutationFn: async (data: typeof newProject) => {
      const response = await apiRequest("POST", "/api/briefs", {
        clientId,
        title: data.title,
        description: data.description,
        budget: data.budget,
        timelineWeeks: parseInt(data.timelineWeeks) || 4,
        priority: data.priority,
        modules: [],
        painPoints: [],
        integrations: [],
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/briefs"] });
      setShowProjectDialog(false);
      setNewProject({
        title: "",
        description: "",
        budget: "",
        timelineWeeks: "",
        priority: "medium",
      });
      toast({
        title: "Project Created",
        description: "Your project has been posted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const likedPartners = clientMatches.filter((m) => m.clientLiked && m.partner);

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
      queryClient.invalidateQueries({ queryKey: ["/api/matches/client", clientId] });
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

  if (currentIndex >= partners.length && partners.length > 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold">Great job! You've reviewed all partners</h2>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-lg font-medium">Your Session Stats</p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary" data-testid="text-swipes-count">{stats.totalSwipes}</p>
                <p className="text-muted-foreground">Swipes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-500 dark:text-pink-400" data-testid="text-likes-count">{stats.totalLikes}</p>
                <p className="text-muted-foreground">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500 dark:text-green-400" data-testid="text-matches-count">{stats.totalMatches}</p>
                <p className="text-muted-foreground">Matches</p>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Head to your dashboard to manage your liked partners and matches.
          </p>
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate("/client/dashboard")}
              data-testid="button-dashboard"
            >
              Go to Dashboard
            </Button>
            <Link href="/client/briefs">
              <Button variant="outline" size="lg" data-testid="button-create-brief">
                Create Project Brief
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-card shrink-0">
        <div className="px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/client/dashboard")}
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent">
              Partner Discovery
            </h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-client-from/20 text-client-from text-sm">
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
              <DropdownMenuItem onClick={() => navigate("/client/swipe")} data-testid="menu-matching">
                <Search className="w-4 h-4 mr-2" />
                Find Partners
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/client/dashboard")} data-testid="menu-dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/client/briefs")} data-testid="menu-briefs">
                <Briefcase className="w-4 h-4 mr-2" />
                Create Brief
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
            <h2 className="font-semibold">Find Partners</h2>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {partners.length}
            </span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
            <div className="relative w-full max-w-xs h-[380px]">
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
                      <Card className="h-full overflow-hidden rounded-xl shadow-lg border" data-testid={`card-partner-${partner.id}`}>
                        <div className="h-full flex flex-col">
                          <div className="h-24 bg-gradient-to-br from-partner-from to-partner-to flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <span className="text-2xl font-bold text-partner-via">
                                {partner.company.charAt(0)}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                            <div className="space-y-0.5">
                              <h2 className="text-lg font-bold leading-tight" data-testid={`text-company-${partner.id}`}>
                                {partner.company}
                              </h2>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`text-xs ${i < (partner.rating || 3) ? "text-yellow-500" : "text-muted"}`}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ({partner.reviewCount})
                                </span>
                                <Badge variant="secondary" className="text-xs ml-auto">
                                  {partner.industry}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {partner.services.slice(0, 3).map((service, i) => (
                                  <Badge key={i} variant="outline" className="rounded-full text-xs">
                                    {service}
                                  </Badge>
                                ))}
                                {partner.services.length > 3 && (
                                  <Badge variant="outline" className="rounded-full text-xs">
                                    +{partner.services.length - 3}
                                  </Badge>
                                )}
                              </div>

                              {partner.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{partner.description}</p>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPartner(partner);
                                  setShowPartnerProfile(true);
                                }}
                                data-testid={`button-learn-more-${partner.id}`}
                              >
                                <Info className="w-4 h-4 mr-2" />
                                Learn More
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

            {/* Action Buttons - directly under the card */}
            <div className="flex justify-center gap-4 mt-4">
              <Button
                size="icon"
                variant="outline"
                className="w-14 h-14 rounded-full shadow-md border-2 bg-background"
                onClick={() => handleAction("skip")}
                data-testid="button-skip"
                disabled={likeMutation.isPending}
              >
                <X className="w-6 h-6 text-danger-from" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="w-14 h-14 rounded-full shadow-md border-2 bg-background"
                onClick={() => handleAction("like")}
                data-testid="button-like"
                disabled={likeMutation.isPending}
              >
                <ThumbsUp className="w-6 h-6 text-success-from" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Tabbed Likes & Projects */}
        <div className="w-[45%] flex flex-col bg-card">
          <Tabs defaultValue="likes" className="flex flex-col h-full">
            <div className="px-3 py-2 border-b">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="likes" className="gap-2" data-testid="tab-likes">
                  <ThumbsUp className="w-4 h-4" />
                  Likes
                  {likedPartners.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {likedPartners.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-2" data-testid="tab-projects">
                  <Briefcase className="w-4 h-4" />
                  Projects
                  {clientBriefs.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {clientBriefs.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              {/* Likes Tab Content */}
              <TabsContent value="likes" className="m-0 p-3 space-y-2">
                {/* Sample demo likes - free for all clients */}
                {(() => {
                  const sampleLikes = [
                    { id: "demo-1", company: "OdooTech Solutions", industry: "Technology", rating: 4.8, matched: true },
                    { id: "demo-2", company: "ERP Masters Inc", industry: "Manufacturing", rating: 4.6, matched: true },
                    { id: "demo-3", company: "CloudFirst Partners", industry: "Retail", rating: 4.9, matched: false },
                    { id: "demo-4", company: "Digital Transform Co", industry: "Healthcare", rating: 4.7, matched: true },
                    { id: "demo-5", company: "Agile ERP Group", industry: "Finance", rating: 4.5, matched: false },
                    { id: "demo-6", company: "NextGen Solutions", industry: "E-commerce", rating: 4.8, matched: true },
                    { id: "demo-7", company: "Enterprise Hub", industry: "Logistics", rating: 4.4, matched: false },
                  ];

                  return (
                    <>
                      {/* Likes header */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">
                          {sampleLikes.length} partners liked
                        </p>
                      </div>

                      {/* All liked partners */}
                      {sampleLikes.map((like) => (
                        <Card key={like.id} className="p-3 overflow-visible hover-elevate" data-testid={`liked-partner-${like.id}`}>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-partner-from to-partner-to flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-white">
                                {like.company.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{like.company}</h3>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground truncate">{like.industry}</p>
                                <div className="flex items-center gap-0.5">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs text-muted-foreground">{like.rating}</span>
                                </div>
                              </div>
                              {like.matched && (
                                <Badge variant="secondary" className="mt-1 text-xs bg-success-from/10 text-success-from border-success-from/20">
                                  Matched
                                </Badge>
                              )}
                            </div>
                            {like.matched && (
                              <Button size="icon" variant="ghost" data-testid={`button-message-${like.id}`}>
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}

                      {/* Also show any real liked partners from API */}
                      {likedPartners.length > 0 && (
                        <>
                          <div className="pt-2 border-t mt-4">
                            <p className="text-xs text-muted-foreground mb-2">Your Recent Likes</p>
                          </div>
                          {likedPartners.map((match) => (
                            <Card key={match.id} className="p-3 overflow-visible hover-elevate" data-testid={`liked-partner-${match.partnerId}`}>
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-partner-from to-partner-to flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-white">
                                    {match.partner?.company?.charAt(0) || "?"}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm truncate">
                                    {match.partner?.company || "Unknown Partner"}
                                  </h3>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {match.partner?.industry}
                                  </p>
                                  {match.partnerAccepted && (
                                    <Badge variant="secondary" className="mt-1 text-xs bg-success-from/10 text-success-from border-success-from/20">
                                      Matched
                                    </Badge>
                                  )}
                                </div>
                                {match.partnerAccepted && (
                                  <Link href={`/messages/${match.id}`}>
                                    <Button size="icon" variant="ghost" data-testid={`button-message-${match.id}`}>
                                      <MessageCircle className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </Card>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
              </TabsContent>

              {/* Projects Tab Content */}
              <TabsContent value="projects" className="m-0 p-4 space-y-4">
                {/* Dashboard Preview Card */}
                <Card className="overflow-hidden bg-gradient-to-br from-client-from/5 via-client-via/5 to-client-to/5 border-client-via/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-client-from to-client-to flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Project Dashboard</h3>
                        <p className="text-xs text-muted-foreground">Manage all your projects</p>
                      </div>
                    </div>

                    {/* Dashboard Features Preview */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-2 rounded-md bg-background/60">
                        <Users className="w-4 h-4 text-client-via" />
                        <span className="text-xs">Partner Matches</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md bg-background/60">
                        <BarChart3 className="w-4 h-4 text-client-via" />
                        <span className="text-xs">Project Analytics</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md bg-background/60">
                        <MessageCircle className="w-4 h-4 text-client-via" />
                        <span className="text-xs">Conversations</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md bg-background/60">
                        <Settings className="w-4 h-4 text-client-via" />
                        <span className="text-xs">Project Settings</span>
                      </div>
                    </div>

                    {/* Open Dashboard Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-client-from to-client-to text-white"
                      onClick={() => navigate("/client/dashboard")}
                      data-testid="button-open-dashboard"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Full Dashboard
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm">Your Projects</h4>
                    <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid="button-new-project">
                          <Plus className="w-4 h-4 mr-1" />
                          New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                          Describe your project to find the perfect Odoo partner
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="project-title">Project Title</Label>
                          <Input
                            id="project-title"
                            placeholder="e.g., ERP Implementation for Manufacturing"
                            value={newProject.title}
                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                            data-testid="input-project-title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="project-description">Description</Label>
                          <Textarea
                            id="project-description"
                            placeholder="Describe your project requirements, goals, and any specific needs..."
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            data-testid="input-project-description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="project-budget">Budget</Label>
                            <Select 
                              value={newProject.budget} 
                              onValueChange={(v) => setNewProject({ ...newProject, budget: v })}
                            >
                              <SelectTrigger data-testid="select-project-budget">
                                <SelectValue placeholder="Select budget" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="$5k-10k">$5k - $10k</SelectItem>
                                <SelectItem value="$10k-25k">$10k - $25k</SelectItem>
                                <SelectItem value="$25k-50k">$25k - $50k</SelectItem>
                                <SelectItem value="$50k-100k">$50k - $100k</SelectItem>
                                <SelectItem value="$100k+">$100k+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="project-timeline">Timeline (weeks)</Label>
                            <Input
                              id="project-timeline"
                              type="number"
                              placeholder="e.g., 12"
                              value={newProject.timelineWeeks}
                              onChange={(e) => setNewProject({ ...newProject, timelineWeeks: e.target.value })}
                              data-testid="input-project-timeline"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select 
                            value={newProject.priority} 
                            onValueChange={(v) => setNewProject({ ...newProject, priority: v })}
                          >
                            <SelectTrigger data-testid="select-project-priority">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low - Flexible timeline</SelectItem>
                              <SelectItem value="medium">Medium - Standard priority</SelectItem>
                              <SelectItem value="high">High - Urgent need</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowProjectDialog(false)}
                          data-testid="button-cancel-project"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => createBriefMutation.mutate(newProject)}
                          disabled={!newProject.title || !newProject.description || !newProject.budget || createBriefMutation.isPending}
                          data-testid="button-submit-project"
                        >
                          {createBriefMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Project"
                          )}
                        </Button>
                      </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Project List */}
                  {briefsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Loading projects...</p>
                    </div>
                  ) : clientBriefs.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderPlus className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">No projects yet</p>
                      <p className="text-xs text-muted-foreground">
                        Create a project to start matching
                      </p>
                    </div>
                  ) : (
                    clientBriefs.map((brief) => (
                      <Card key={brief.id} className="overflow-visible hover-elevate" data-testid={`card-project-${brief.id}`}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-sm line-clamp-1">
                                {brief.title}
                              </h3>
                              <ProjectStatusBadge status={brief.status || "active"} />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {brief.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {brief.budget && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {brief.budget}
                                </span>
                              )}
                              {brief.timelineWeeks && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {brief.timelineWeeks} weeks
                                </span>
                              )}
                            </div>
                            {brief.modules && brief.modules.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {brief.modules.slice(0, 2).map((module) => (
                                  <Badge key={module} variant="outline" className="text-xs">
                                    {module}
                                  </Badge>
                                ))}
                                {brief.modules.length > 2 && (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">
                                    +{brief.modules.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}

                  {clientBriefs.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-muted-foreground"
                      onClick={() => navigate("/client/dashboard")}
                      data-testid="button-view-all-projects"
                    >
                      View all {clientBriefs.length} projects
                    </Button>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>

      {/* Achievements Sidebar */}
      {showAchievements && (
        <div className="fixed left-0 top-0 bottom-0 w-96 bg-card border-r shadow-lg overflow-y-auto pt-20 z-40">
          <div className="p-6">
            <AchievementsList achievements={stats.achievements} />
          </div>
        </div>
      )}

      {/* Partner Profile Dialog */}
      <Dialog open={showPartnerProfile} onOpenChange={setShowPartnerProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
          {selectedPartner && (
            <ScrollArea className="max-h-[90vh]">
              <div className="p-6">
                <DialogHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-partner-from to-partner-to flex items-center justify-center text-white font-bold text-2xl shrink-0">
                      {selectedPartner.company.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-xl">{selectedPartner.company}</DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < (selectedPartner.rating || 3) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {selectedPartner.rating?.toFixed(1) || "3.0"} ({selectedPartner.reviewCount} reviews)
                        </span>
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        <Building2 className="w-3 h-3 mr-1" />
                        {selectedPartner.industry}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-6 pb-4">
                  {/* About Section */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      About
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedPartner.description || "This partner specializes in Odoo implementations and provides comprehensive ERP solutions tailored to your business needs."}
                    </p>
                  </div>

                  {/* Services Section */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Services Offered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartner.services.map((service, i) => (
                        <Badge key={i} variant="outline" className="rounded-full">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{selectedPartner.reviewCount}</div>
                      <div className="text-xs text-muted-foreground">Total Reviews</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{selectedPartner.rating?.toFixed(1) || "3.0"}</div>
                      <div className="text-xs text-muted-foreground">Avg Rating</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{Math.floor((selectedPartner.reviewCount || 10) * 1.5)}</div>
                      <div className="text-xs text-muted-foreground">Projects Done</div>
                    </Card>
                  </div>

                  {/* Reviews Section */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Recent Reviews
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: "Sarah M.", rating: 5, text: "Excellent implementation partner. They understood our requirements perfectly and delivered on time.", date: "2 weeks ago" },
                        { name: "Michael R.", rating: 4, text: "Great team to work with. Very responsive and professional throughout the project.", date: "1 month ago" },
                        { name: "Lisa K.", rating: 5, text: "Highly recommend! They helped us transition smoothly to Odoo with minimal disruption.", date: "2 months ago" },
                      ].map((review, i) => (
                        <Card key={i} className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                                {review.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{review.name}</p>
                                <p className="text-xs text-muted-foreground">{review.date}</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Star
                                  key={j}
                                  className={`w-3 h-3 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.text}</p>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Contact Information
                    </h3>
                    <Card className="p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>Available for remote and on-site projects</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Typically responds within 24 hours</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background">
                    <Button variant="outline" className="flex-1" onClick={() => setShowPartnerProfile(false)}>
                      Close
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-success-from to-success-to text-white"
                      onClick={() => {
                        setShowPartnerProfile(false);
                        handleAction("like");
                      }}
                      data-testid="button-like-from-profile"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Like This Partner
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

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
