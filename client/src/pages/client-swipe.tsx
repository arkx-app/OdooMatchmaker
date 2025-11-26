import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  X, Heart, ArrowLeft, Sparkles, Award, LogOut, ThumbsUp, MessageCircle,
  FolderPlus, Clock, DollarSign, CheckCircle2, AlertCircle, Loader2, Plus,
  Briefcase, ChevronDown, ChevronUp, ExternalLink, LayoutDashboard, 
  Users, BarChart3, Settings
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent">
              Client Dashboard
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

      <div className="flex-1 flex">
        {/* Left Panel - Swipe Cards */}
        <div className="w-1/2 lg:w-3/5 border-r bg-muted/20 flex flex-col">
          <div className="p-4 border-b bg-card">
            <h2 className="text-lg font-semibold">Find Partners</h2>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} / {partners.length} partners
            </p>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-6 relative">
            <div className="relative w-full max-w-sm h-[520px]">
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
                      <Card className="h-full overflow-hidden rounded-2xl shadow-xl border" data-testid={`card-partner-${partner.id}`}>
                        <div className="h-full flex flex-col">
                          <div className="h-32 bg-gradient-to-br from-partner-from to-partner-to flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <span className="text-3xl font-bold text-partner-via">
                                {partner.company.charAt(0)}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                            <div className="space-y-1">
                              <h2 className="text-xl font-bold" data-testid={`text-company-${partner.id}`}>
                                {partner.company}
                              </h2>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`text-sm ${i < (partner.rating || 3) ? "text-yellow-500" : "text-muted"}`}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ({partner.reviewCount} reviews)
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Badge variant="secondary" className="text-xs">
                                {partner.industry}
                              </Badge>
                              
                              <div className="space-y-1">
                                <h3 className="font-semibold text-xs text-muted-foreground">Services</h3>
                                <div className="flex flex-wrap gap-1">
                                  {partner.services.slice(0, 4).map((service, i) => (
                                    <Badge key={i} variant="outline" className="rounded-full text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                  {partner.services.length > 4 && (
                                    <Badge variant="outline" className="rounded-full text-xs">
                                      +{partner.services.length - 4}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {partner.description && (
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-xs text-muted-foreground">About</h3>
                                  <p className="text-xs leading-relaxed line-clamp-3">{partner.description}</p>
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
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t bg-card flex justify-center gap-4">
            <Button
              size="icon"
              variant="outline"
              className="w-14 h-14 rounded-full shadow-lg border-2"
              onClick={() => handleAction("skip")}
              data-testid="button-skip"
              disabled={likeMutation.isPending}
            >
              <X className="w-6 h-6 text-danger-from" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="w-14 h-14 rounded-full shadow-lg border-2"
              onClick={() => handleAction("like")}
              data-testid="button-like"
              disabled={likeMutation.isPending}
            >
              <Heart className="w-6 h-6 text-success-from" />
            </Button>
          </div>
        </div>

        {/* Right Panel - Tabbed Likes & Projects */}
        <div className="w-1/2 lg:w-2/5 flex flex-col">
          <Tabs defaultValue="likes" className="flex flex-col h-full">
            <div className="p-3 border-b bg-card">
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
              <TabsContent value="likes" className="m-0 p-4 space-y-3">
                {likedPartners.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">No likes yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Swipe right on partners you like
                    </p>
                  </div>
                ) : (
                  <>
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
