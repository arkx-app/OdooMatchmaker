import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { 
  Home, ThumbsUp, Bookmark, Users, ArrowLeft, LogOut, Award, 
  Star, Building2, MessageCircle, Calendar, FileText,
  Clock, Sparkles, ChevronRight, Search, Filter, X,
  Briefcase, Settings, HelpCircle, Globe, 
  DollarSign, Shield, ChevronDown, CheckCircle2, AlertCircle,
  Zap, TrendingUp, BarChart3, Target, Layers, ArrowRight,
  Edit, Plus, ExternalLink, Mail, Phone, MapPin, BadgeCheck,
  User, Send, StickyNote, Calculator, Save, Eye, XCircle,
  Inbox, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
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
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/use-gamification";
import { AchievementsList } from "@/components/achievement-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Partner, Match, Client, Brief, Message } from "@shared/schema";

interface EnrichedMatch extends Match {
  client?: Client;
  brief?: Brief;
}

const SERVICES_LIST = [
  "Implementation",
  "Customization", 
  "Integration",
  "Training",
  "Support",
  "Migration",
  "Consulting",
  "Development",
];

const INDUSTRY_LIST = [
  "Manufacturing",
  "Retail",
  "Healthcare",
  "Finance",
  "Education",
  "Services",
  "Technology",
  "Construction",
  "Logistics",
  "Other",
];

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext,
  trend,
  color = "blue",
}: { 
  icon: typeof ThumbsUp; 
  label: string; 
  value: number | string; 
  subtext?: string;
  trend?: string;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-600",
    orange: "from-orange-500 to-amber-500",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          {trend && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </Badge>
          )}
        </div>
        {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

function LeadCard({ 
  match, 
  onAccept, 
  onDecline, 
  onViewDetails,
  isPending,
}: { 
  match: EnrichedMatch;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onViewDetails: (match: EnrichedMatch) => void;
  isPending: boolean;
}) {
  const client = match.client;
  const brief = match.brief;

  return (
    <Card className="overflow-visible hover-elevate transition-all" data-testid={`card-lead-${match.id}`}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-md bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {client?.company?.charAt(0) || client?.name?.charAt(0) || "C"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-semibold text-base">{client?.company || "Unknown Company"}</h3>
                <p className="text-sm text-muted-foreground">{client?.name}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 flex-wrap">
                {match.score && (
                  <Badge variant="outline" className="text-xs font-medium">
                    {match.score}% match
                  </Badge>
                )}
                <Badge 
                  variant={match.status === "suggested" ? "secondary" : match.status === "accepted" ? "default" : "outline"}
                  className="text-xs"
                >
                  {match.status === "suggested" ? "New Lead" : match.status}
                </Badge>
              </div>
            </div>
            
            {brief && (
              <div className="mt-2">
                <p className="text-sm font-medium">{brief.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {brief.description}
                </p>
              </div>
            )}

            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {client?.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {client.industry}
                </span>
              )}
              {brief?.budget && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {brief.budget}
                </span>
              )}
              {brief?.timelineWeeks && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {brief.timelineWeeks} weeks
                </span>
              )}
            </div>

            {brief?.modules && brief.modules.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {brief.modules.slice(0, 4).map((module) => (
                  <Badge key={module} variant="outline" className="text-xs">
                    {module}
                  </Badge>
                ))}
                {brief.modules.length > 4 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{brief.modules.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {match.status === "suggested" && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => onAccept(match.id)}
                    disabled={isPending}
                    data-testid={`button-accept-${match.id}`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept Lead
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onDecline(match.id)}
                    disabled={isPending}
                    data-testid={`button-decline-${match.id}`}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </>
              )}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onViewDetails(match)}
                data-testid={`button-view-details-${match.id}`}
              >
                View Details
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchCard({ 
  match, 
  onMessage, 
  onManage,
  onViewDetails,
}: { 
  match: EnrichedMatch;
  onMessage: (matchId: string) => void;
  onManage: (match: EnrichedMatch) => void;
  onViewDetails: (match: EnrichedMatch) => void;
}) {
  const client = match.client;
  const brief = match.brief;
  const isAccepted = match.partnerAccepted && match.clientLiked;

  return (
    <Card className="overflow-visible hover-elevate transition-all" data-testid={`card-match-${match.id}`}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-md bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {client?.company?.charAt(0) || "C"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-semibold text-base">{client?.company || "Unknown Company"}</h3>
                <p className="text-sm text-muted-foreground">{client?.name}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 flex-wrap">
                {isAccepted ? (
                  <Badge variant="default" className="bg-green-500 text-white text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Matched
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Waiting for client
                  </Badge>
                )}
              </div>
            </div>

            {brief && (
              <div className="mt-2">
                <p className="text-sm font-medium">{brief.title}</p>
              </div>
            )}

            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {match.expectedRevenue && (
                <span className="flex items-center gap-1 text-green-600">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${match.expectedRevenue.toLocaleString()}
                </span>
              )}
              {match.expectedClosingDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Close: {new Date(match.expectedClosingDate).toLocaleDateString()}
                </span>
              )}
              {brief?.budget && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Budget: {brief.budget}
                </span>
              )}
            </div>

            {match.partnerNotes && (
              <div className="mt-2 p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  <StickyNote className="w-3 h-3 inline mr-1" />
                  {match.partnerNotes}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {isAccepted && (
                <Button 
                  size="sm" 
                  onClick={() => onMessage(match.id)}
                  data-testid={`button-message-${match.id}`}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onManage(match)}
                data-testid={`button-manage-${match.id}`}
              >
                <Edit className="w-4 h-4 mr-1" />
                Manage
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onViewDetails(match)}
                data-testid={`button-view-${match.id}`}
              >
                View Details
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PartnerDashboard() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  const { stats: gamificationStats, recordSwipe, recordMatch } = useGamification("partnerGamification");
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMatch, setSelectedMatch] = useState<EnrichedMatch | null>(null);
  const [showMatchSheet, setShowMatchSheet] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [manageForm, setManageForm] = useState({
    expectedClosingDate: "",
    expectedRevenue: "",
    partnerNotes: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    company: "",
    industry: "",
    services: [] as string[],
    description: "",
    hourlyRateMin: "",
    hourlyRateMax: "",
    capacity: "",
    website: "",
  });

  // Fetch current user and partner profile from API
  const { data: currentUser, isLoading: userLoading } = useQuery<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profile: Partner | null;
  }>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    retry: 1,
  });

  const partnerProfile = currentUser?.profile as Partner | undefined;
  const partnerId = partnerProfile?.id;

  // Role-based protection: redirect non-partners to appropriate dashboard
  useEffect(() => {
    if (!userLoading) {
      if (!currentUser) {
        navigate("/auth");
      } else if (currentUser.role === "client") {
        navigate("/client/dashboard");
      }
    }
  }, [userLoading, currentUser, navigate]);

  useEffect(() => {
    if (partnerProfile?.id) {
      setProfileForm({
        name: partnerProfile.name || "",
        email: partnerProfile.email || "",
        company: partnerProfile.company || "",
        industry: partnerProfile.industry || "",
        services: partnerProfile.services || [],
        description: partnerProfile.description || "",
        hourlyRateMin: partnerProfile.hourlyRateMin?.toString() || "",
        hourlyRateMax: partnerProfile.hourlyRateMax?.toString() || "",
        capacity: partnerProfile.capacity || "available",
        website: partnerProfile.website || "",
      });
    }
  }, [partnerProfile?.id]);

  const { data: matches = [], isLoading: matchesLoading } = useQuery<EnrichedMatch[]>({
    queryKey: ["/api/matches/partner", partnerId],
    queryFn: async () => {
      if (!partnerId) return [];
      const res = await fetch(`/api/matches/partner/${partnerId}`, { credentials: "include" });
      return res.json();
    },
    enabled: !!partnerId,
    refetchInterval: 5000,
  });

  const newLeads = matches.filter(m => m.status === "suggested" || (!m.partnerAccepted && m.clientLiked));
  const activeMatches = matches.filter(m => m.partnerAccepted);
  const mutualMatches = matches.filter(m => m.partnerAccepted && m.clientLiked);

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedMatch?.id],
    queryFn: async () => {
      if (!selectedMatch?.id) return [];
      const res = await fetch(`/api/messages/match/${selectedMatch.id}`, { credentials: "include" });
      return res.json();
    },
    enabled: !!selectedMatch?.id && showMatchSheet,
    refetchInterval: 3000,
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/matches/${matchId}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      if (variables.data.partnerAccepted) {
        recordSwipe(true);
        recordMatch();
        toast({
          title: "Lead Accepted",
          description: "You've accepted this lead. The client will be notified.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/matches/partner", partnerId] });
      setShowManageDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update match. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMatch || !currentUser?.id) return null;
      const res = await apiRequest("POST", "/api/messages", {
        matchId: selectedMatch.id,
        fromUserId: currentUser.id,
        toUserId: selectedMatch.clientId,
        body: messageText,
      });
      return res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedMatch?.id] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/partners/${partnerId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setShowProfileDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    // Cancel all queries to stop polling before logout
    queryClient.cancelQueries({ queryKey: ["/api/matches"] });
    queryClient.cancelQueries({ queryKey: ["/api/messages"] });
    queryClient.cancelQueries({ queryKey: ["/api/auth/user"] });
    
    await logout();
    
    // Clear all cached data after logout
    queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
    queryClient.removeQueries({ queryKey: ["/api/matches"] });
    queryClient.removeQueries({ queryKey: ["/api/messages"] });
    
    navigate("/");
  };

  const handleAcceptLead = (matchId: string) => {
    updateMatchMutation.mutate({
      matchId,
      data: { partnerAccepted: true, partnerResponded: true, status: "accepted" },
    });
  };

  const handleDeclineLead = (matchId: string) => {
    updateMatchMutation.mutate({
      matchId,
      data: { partnerAccepted: false, partnerResponded: true, status: "rejected" },
    });
    recordSwipe(false);
  };

  const handleManageMatch = (match: EnrichedMatch) => {
    setSelectedMatch(match);
    setManageForm({
      expectedClosingDate: match.expectedClosingDate 
        ? new Date(match.expectedClosingDate).toISOString().split('T')[0] 
        : "",
      expectedRevenue: match.expectedRevenue?.toString() || "",
      partnerNotes: match.partnerNotes || "",
    });
    setShowManageDialog(true);
  };

  const handleSaveManagement = () => {
    if (!selectedMatch) return;
    updateMatchMutation.mutate({
      matchId: selectedMatch.id,
      data: {
        expectedClosingDate: manageForm.expectedClosingDate 
          ? new Date(manageForm.expectedClosingDate).toISOString() 
          : null,
        expectedRevenue: manageForm.expectedRevenue 
          ? parseFloat(manageForm.expectedRevenue) 
          : null,
        partnerNotes: manageForm.partnerNotes || null,
      },
    });
  };

  const handleViewDetails = (match: EnrichedMatch) => {
    setSelectedMatch(match);
    setShowMatchSheet(true);
  };

  const handleMessage = (matchId: string) => {
    navigate(`/messages/${matchId}`);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      name: profileForm.name,
      email: profileForm.email,
      company: profileForm.company,
      industry: profileForm.industry,
      services: profileForm.services,
      description: profileForm.description,
      hourlyRateMin: profileForm.hourlyRateMin ? parseInt(profileForm.hourlyRateMin) : null,
      hourlyRateMax: profileForm.hourlyRateMax ? parseInt(profileForm.hourlyRateMax) : null,
      capacity: profileForm.capacity,
      website: profileForm.website,
    });
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessageMutation.mutate();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const totalRevenue = activeMatches.reduce((sum, m) => sum + (m.expectedRevenue || 0), 0);
  const conversionRate = matches.length > 0 
    ? Math.round((mutualMatches.length / matches.length) * 100) 
    : 0;

  const formatMessageTime = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "leads", label: "New Leads", icon: Inbox, badge: newLeads.length },
    { id: "matches", label: "Active Matches", icon: Users, badge: mutualMatches.length },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "profile", label: "My Profile", icon: User },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  if (userLoading || matchesLoading || !partnerProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {partnerProfile.company?.charAt(0) || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{partnerProfile.company || "Partner"}</p>
                <p className="text-xs text-muted-foreground truncate">{partnerProfile.name}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => {
                          if (item.id === "analytics") {
                            navigate("/partner/analytics");
                          } else if (item.id === "profile") {
                            setShowProfileDialog(true);
                          } else {
                            setActiveTab(item.id);
                          }
                        }}
                        className={activeTab === item.id ? "bg-sidebar-accent" : ""}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Gamification</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setShowAchievements(!showAchievements)}
                      data-testid="nav-achievements"
                    >
                      <Award className="w-4 h-4" />
                      <span>Achievements</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {gamificationStats.totalPoints} pts
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {partnerProfile.name?.charAt(0) || user.firstName?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{partnerProfile.name || "Partner"}</p>
                    <p className="text-xs text-muted-foreground truncate">{partnerProfile.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("overview")} data-testid="menu-dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowProfileDialog(true)} data-testid="menu-profile">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
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
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-destructive focus:text-destructive"
                  data-testid="menu-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-xl font-bold">Partner Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {newLeads.length} new leads | {mutualMatches.length} active matches
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {showAchievements ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Achievements</h2>
                  <Button variant="ghost" onClick={() => setShowAchievements(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
                <AchievementsList achievements={gamificationStats.achievements} />
              </div>
            ) : activeTab === "overview" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={Inbox}
                    label="New Leads"
                    value={newLeads.length}
                    subtext="Awaiting your response"
                    color="orange"
                  />
                  <StatCard
                    icon={Users}
                    label="Active Matches"
                    value={mutualMatches.length}
                    subtext="Mutual connections"
                    color="green"
                  />
                  <StatCard
                    icon={DollarSign}
                    label="Pipeline Value"
                    value={`$${totalRevenue.toLocaleString()}`}
                    subtext="Expected revenue"
                    color="blue"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Conversion"
                    value={`${conversionRate}%`}
                    subtext="Lead to match rate"
                    color="purple"
                  />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Inbox className="w-4 h-4" />
                        Recent Leads
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {newLeads.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Inbox className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No new leads at the moment</p>
                          <p className="text-sm">Check back soon</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {newLeads.slice(0, 3).map((match) => (
                            <div 
                              key={match.id} 
                              className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                              onClick={() => handleViewDetails(match)}
                            >
                              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                                {match.client?.company?.charAt(0) || "C"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{match.client?.company}</p>
                                <p className="text-xs text-muted-foreground truncate">{match.brief?.title}</p>
                              </div>
                              {match.score && (
                                <Badge variant="outline" className="text-xs">{match.score}%</Badge>
                              )}
                            </div>
                          ))}
                          {newLeads.length > 3 && (
                            <Button 
                              variant="ghost" 
                              className="w-full"
                              onClick={() => setActiveTab("leads")}
                            >
                              View all {newLeads.length} leads
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Active Matches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mutualMatches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No active matches yet</p>
                          <p className="text-sm">Accept leads to get matched</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {mutualMatches.slice(0, 3).map((match) => (
                            <div 
                              key={match.id} 
                              className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                              onClick={() => handleViewDetails(match)}
                            >
                              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                {match.client?.company?.charAt(0) || "C"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{match.client?.company}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {match.expectedRevenue ? `$${match.expectedRevenue.toLocaleString()}` : match.brief?.budget}
                                </p>
                              </div>
                              <Button size="sm" variant="ghost" onClick={(e) => {
                                e.stopPropagation();
                                handleMessage(match.id);
                              }}>
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          {mutualMatches.length > 3 && (
                            <Button 
                              variant="ghost" 
                              className="w-full"
                              onClick={() => setActiveTab("matches")}
                            >
                              View all {mutualMatches.length} matches
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : activeTab === "leads" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">New Leads</h2>
                    <p className="text-muted-foreground">
                      {newLeads.length} potential clients waiting for your response
                    </p>
                  </div>
                </div>
                
                {newLeads.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Inbox className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No new leads</h3>
                    <p className="text-muted-foreground">
                      When clients match with your profile, they'll appear here.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {newLeads.map((match) => (
                      <LeadCard
                        key={match.id}
                        match={match}
                        onAccept={handleAcceptLead}
                        onDecline={handleDeclineLead}
                        onViewDetails={handleViewDetails}
                        isPending={updateMatchMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === "matches" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Active Matches</h2>
                    <p className="text-muted-foreground">
                      {activeMatches.length} matches | {mutualMatches.length} mutual connections
                    </p>
                  </div>
                </div>
                
                {activeMatches.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No active matches</h3>
                    <p className="text-muted-foreground">
                      Accept leads to start building your pipeline.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab("leads")}
                    >
                      View Leads
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {activeMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onMessage={handleMessage}
                        onManage={handleManageMatch}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === "messages" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Messages</h2>
                    <p className="text-muted-foreground">
                      Communicate with your matched clients
                    </p>
                  </div>
                </div>
                
                {mutualMatches.length === 0 ? (
                  <Card className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                    <p className="text-muted-foreground">
                      Get matched with clients to start messaging.
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {mutualMatches.map((match) => (
                      <Card 
                        key={match.id} 
                        className="overflow-visible hover-elevate cursor-pointer"
                        onClick={() => handleMessage(match.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                              {match.client?.company?.charAt(0) || "C"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold">{match.client?.company}</h3>
                              <p className="text-sm text-muted-foreground truncate">{match.brief?.title}</p>
                            </div>
                            <Button size="sm">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Open Chat
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </main>
        </div>
      </div>

      <Sheet open={showMatchSheet} onOpenChange={setShowMatchSheet}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Lead Details</SheetTitle>
            <SheetDescription>
              View complete information about this opportunity
            </SheetDescription>
          </SheetHeader>
          
          {selectedMatch && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Client Information
                </h3>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold">
                        {selectedMatch.client?.company?.charAt(0) || "C"}
                      </div>
                      <div>
                        <p className="font-semibold">{selectedMatch.client?.company}</p>
                        <p className="text-sm text-muted-foreground">{selectedMatch.client?.name}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Industry</p>
                        <p className="font-medium">{selectedMatch.client?.industry || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Company Size</p>
                        <p className="font-medium">{selectedMatch.client?.companySize || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">{selectedMatch.client?.budget || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Match Score</p>
                        <p className="font-medium">{selectedMatch.score}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedMatch.brief && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Project Brief
                  </h3>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="font-semibold">{selectedMatch.brief.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedMatch.brief.description}
                        </p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Budget</p>
                          <p className="font-medium">{selectedMatch.brief.budget}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Timeline</p>
                          <p className="font-medium">
                            {selectedMatch.brief.timelineWeeks} weeks
                          </p>
                        </div>
                      </div>
                      {selectedMatch.brief.modules && selectedMatch.brief.modules.length > 0 && (
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Required Modules</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedMatch.brief.modules.map((module) => (
                              <Badge key={module} variant="outline" className="text-xs">
                                {module}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedMatch.brief.painPoints && selectedMatch.brief.painPoints.length > 0 && (
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Pain Points</p>
                          <ul className="text-sm space-y-1">
                            {selectedMatch.brief.painPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertCircle className="w-3 h-3 mt-1 text-orange-500" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedMatch.reasons && selectedMatch.reasons.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Why You're a Great Fit
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      <ul className="space-y-2">
                        {selectedMatch.reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedMatch.partnerNotes && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" />
                    Your Notes
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm">{selectedMatch.partnerNotes}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedMatch.status === "suggested" && (
                  <>
                    <Button 
                      className="flex-1" 
                      onClick={() => handleAcceptLead(selectedMatch.id)}
                      disabled={updateMatchMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept Lead
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDeclineLead(selectedMatch.id)}
                      disabled={updateMatchMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </>
                )}
                {selectedMatch.partnerAccepted && selectedMatch.clientLiked && (
                  <>
                    <Button 
                      className="flex-1" 
                      onClick={() => handleMessage(selectedMatch.id)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowMatchSheet(false);
                        handleManageMatch(selectedMatch);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Opportunity</DialogTitle>
            <DialogDescription>
              Track your progress and add notes for this client
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="closingDate">Expected Closing Date</Label>
              <Input
                id="closingDate"
                type="date"
                value={manageForm.expectedClosingDate}
                onChange={(e) => setManageForm({ ...manageForm, expectedClosingDate: e.target.value })}
                data-testid="input-closing-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Expected Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                placeholder="e.g. 15000"
                value={manageForm.expectedRevenue}
                onChange={(e) => setManageForm({ ...manageForm, expectedRevenue: e.target.value })}
                data-testid="input-expected-revenue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add your notes about this opportunity..."
                value={manageForm.partnerNotes}
                onChange={(e) => setManageForm({ ...manageForm, partnerNotes: e.target.value })}
                rows={4}
                data-testid="input-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveManagement}
              disabled={updateMatchMutation.isPending}
              data-testid="button-save-management"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your partner profile information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profileName">Contact Name</Label>
                <Input
                  id="profileName"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  data-testid="input-profile-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileEmail">Email</Label>
                <Input
                  id="profileEmail"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  data-testid="input-profile-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profileCompany">Company Name</Label>
                <Input
                  id="profileCompany"
                  value={profileForm.company}
                  onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                  data-testid="input-profile-company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileIndustry">Industry Focus</Label>
                <Select 
                  value={profileForm.industry} 
                  onValueChange={(v) => setProfileForm({ ...profileForm, industry: v })}
                >
                  <SelectTrigger data-testid="select-profile-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_LIST.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Services Offered</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICES_LIST.map((service) => (
                  <Badge
                    key={service}
                    variant={profileForm.services.includes(service) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (profileForm.services.includes(service)) {
                        setProfileForm({
                          ...profileForm,
                          services: profileForm.services.filter(s => s !== service)
                        });
                      } else {
                        setProfileForm({
                          ...profileForm,
                          services: [...profileForm.services, service]
                        });
                      }
                    }}
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileDescription">Company Description</Label>
              <Textarea
                id="profileDescription"
                placeholder="Describe your company and expertise..."
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                rows={3}
                data-testid="input-profile-description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profileRateMin">Min Hourly Rate ($)</Label>
                <Input
                  id="profileRateMin"
                  type="number"
                  value={profileForm.hourlyRateMin}
                  onChange={(e) => setProfileForm({ ...profileForm, hourlyRateMin: e.target.value })}
                  data-testid="input-rate-min"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileRateMax">Max Hourly Rate ($)</Label>
                <Input
                  id="profileRateMax"
                  type="number"
                  value={profileForm.hourlyRateMax}
                  onChange={(e) => setProfileForm({ ...profileForm, hourlyRateMax: e.target.value })}
                  data-testid="input-rate-max"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileCapacity">Availability</Label>
                <Select 
                  value={profileForm.capacity} 
                  onValueChange={(v) => setProfileForm({ ...profileForm, capacity: v })}
                >
                  <SelectTrigger data-testid="select-profile-capacity">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="full">Fully Booked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileWebsite">Website</Label>
              <Input
                id="profileWebsite"
                type="url"
                placeholder="https://your-company.com"
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                data-testid="input-profile-website"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
