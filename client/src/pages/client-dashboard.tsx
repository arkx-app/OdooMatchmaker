import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Home, Heart, Bookmark, Users, ArrowLeft, LogOut, Award, 
  Star, Building2, MessageCircle, Calendar, FileText,
  Clock, Sparkles, ChevronRight, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/use-gamification";
import { AchievementsList } from "@/components/achievement-badge";
import GuideBot from "@/components/guide-bot";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Partner, Match } from "@shared/schema";

interface EnrichedMatch extends Match {
  partner?: Partner;
}

const CLIENT_GUIDE_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Your Dashboard!",
    message: "This is your central hub for managing partner connections. Browse, like, and connect with Odoo partners.",
    action: "Explore the tabs to see your matches and saved partners",
  },
  {
    id: "overview",
    title: "Overview Tab",
    message: "Get a quick snapshot of your activity - liked partners, saved for later, and confirmed matches.",
    action: "Click on any card to see full details",
  },
  {
    id: "browse",
    title: "Find Partners",
    message: "Use the Swipe tab to browse new partners, or check Liked and Saved tabs to review your selections.",
    action: "Try swiping right on partners you're interested in",
  },
  {
    id: "connect",
    title: "Connect with Partners",
    message: "When both you and a partner express interest, you become a match! Then you can message them directly.",
    action: "Look for the message button on matched profiles",
  },
];

function PartnerCard({ 
  partner, 
  match,
  onSave, 
  onMessage,
  onRequestProposal,
  onBookCall,
  isSaving,
}: { 
  partner: Partner;
  match?: EnrichedMatch;
  onSave?: (matchId: string, saved: boolean) => void;
  onMessage?: (matchId: string) => void;
  onRequestProposal?: (matchId: string) => void;
  onBookCall?: (matchId: string) => void;
  isSaving?: boolean;
}) {
  const isSaved = match?.clientSaved;
  const isMatched = match?.status === "matched" || (match?.clientLiked && match?.partnerAccepted);
  
  return (
    <Card className="p-4 hover-elevate transition-all" data-testid={`card-partner-${partner.id}`}>
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
          {partner.company?.charAt(0) || partner.name?.charAt(0) || "P"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-base truncate">{partner.company || partner.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {partner.industry && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {partner.industry}
                  </span>
                )}
                {partner.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {partner.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isMatched && (
                <Badge variant="default" className="bg-green-500 text-white text-xs">
                  Matched
                </Badge>
              )}
              {match?.score && (
                <Badge variant="secondary" className="text-xs">
                  {match.score}% fit
                </Badge>
              )}
            </div>
          </div>
          
          {partner.services && partner.services.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {partner.services.slice(0, 3).map((service) => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {partner.services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{partner.services.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {partner.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {partner.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {match && onSave && (
              <Button 
                size="sm" 
                variant={isSaved ? "default" : "outline"}
                onClick={() => onSave(match.id, !isSaved)}
                disabled={isSaving}
                data-testid={`button-save-${partner.id}`}
              >
                <Bookmark className={`w-4 h-4 mr-1 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>
            )}
            {isMatched && onMessage && match && (
              <Button 
                size="sm" 
                variant="default"
                onClick={() => onMessage(match.id)}
                data-testid={`button-message-${partner.id}`}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>
            )}
            {isMatched && onRequestProposal && match && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onRequestProposal(match.id)}
                data-testid={`button-proposal-${partner.id}`}
              >
                <FileText className="w-4 h-4 mr-1" />
                Request Proposal
              </Button>
            )}
            {isMatched && onBookCall && match && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onBookCall(match.id)}
                data-testid={`button-book-call-${partner.id}`}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Book Call
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext,
  color = "blue",
}: { 
  icon: typeof Heart; 
  label: string; 
  value: number; 
  subtext?: string;
  color?: "blue" | "pink" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    pink: "from-pink-500 to-rose-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-600",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </div>
    </Card>
  );
}

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAchievements, setShowAchievements] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { logout, user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { stats, newAchievements } = useGamification("clientGamification");
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

  const { data: clientMatches = [], isLoading: matchesLoading } = useQuery<EnrichedMatch[]>({
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

  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const enrichedMatches: EnrichedMatch[] = clientMatches.map(match => ({
    ...match,
    partner: partners.find(p => p.id === match.partnerId),
  }));

  const likedPartners = enrichedMatches.filter((m) => m.clientLiked && m.partner);
  const savedPartners = enrichedMatches.filter((m) => m.clientSaved && m.partner);
  const confirmedMatches = enrichedMatches.filter((m) => 
    (m.status === "matched" || (m.clientLiked && m.partnerAccepted)) && m.partner
  );

  const saveMutation = useMutation({
    mutationFn: async ({ matchId, saved }: { matchId: string; saved: boolean }) => {
      const response = await apiRequest("PATCH", `/api/matches/${matchId}`, {
        clientSaved: saved,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches/client", clientId] });
      toast({
        title: "Updated",
        description: "Partner saved status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (matchId: string, saved: boolean) => {
    saveMutation.mutate({ matchId, saved });
  };

  const handleMessage = (matchId: string) => {
    navigate(`/messages/${matchId}`);
  };

  const handleRequestProposal = (matchId: string) => {
    toast({
      title: "Proposal Requested",
      description: "The partner has been notified of your proposal request.",
    });
  };

  const handleBookCall = (matchId: string) => {
    toast({
      title: "Call Request Sent",
      description: "The partner will receive your call request and get back to you.",
    });
  };

  const filteredLiked = likedPartners.filter(m => 
    !searchQuery || 
    m.partner?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSaved = savedPartners.filter(m => 
    !searchQuery || 
    m.partner?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMatches = confirmedMatches.filter(m => 
    !searchQuery || 
    m.partner?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || matchesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between gap-4 h-14 px-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">My Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {stats.totalPoints} points | {confirmedMatches.length} matches
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAchievements(!showAchievements)}
              data-testid="button-achievements"
            >
              <Award className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <Home className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="liked" data-testid="tab-liked">
                <Heart className="w-4 h-4 mr-2" />
                Liked ({likedPartners.length})
              </TabsTrigger>
              <TabsTrigger value="saved" data-testid="tab-saved">
                <Bookmark className="w-4 h-4 mr-2" />
                Saved ({savedPartners.length})
              </TabsTrigger>
              <TabsTrigger value="matches" data-testid="tab-matches">
                <Users className="w-4 h-4 mr-2" />
                Matches ({confirmedMatches.length})
              </TabsTrigger>
            </TabsList>

            {activeTab !== "overview" && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            )}
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Heart} label="Liked" value={likedPartners.length} color="pink" />
              <StatCard icon={Bookmark} label="Saved" value={savedPartners.length} color="blue" />
              <StatCard icon={Users} label="Matches" value={confirmedMatches.length} color="green" />
              <StatCard icon={Sparkles} label="Points" value={stats.totalPoints} color="purple" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Recent Matches
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab("matches")}
                    data-testid="button-view-all-matches"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {confirmedMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No matches yet</p>
                    <p className="text-sm text-muted-foreground">Start swiping to find partners</p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate("/client/swipe")}
                      data-testid="button-start-swiping"
                    >
                      Start Swiping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {confirmedMatches.slice(0, 3).map((match) => (
                      match.partner && (
                        <PartnerCard
                          key={match.id}
                          partner={match.partner}
                          match={match}
                          onSave={handleSave}
                          onMessage={handleMessage}
                          isSaving={saveMutation.isPending}
                        />
                      )
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Bookmark className="w-5 h-5" />
                    Saved Partners
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab("saved")}
                    data-testid="button-view-all-saved"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {savedPartners.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No saved partners</p>
                    <p className="text-sm text-muted-foreground">Save partners to review later</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedPartners.slice(0, 3).map((match) => (
                      match.partner && (
                        <PartnerCard
                          key={match.id}
                          partner={match.partner}
                          match={match}
                          onSave={handleSave}
                          onMessage={handleMessage}
                          isSaving={saveMutation.isPending}
                        />
                      )
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                Quick Actions
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate("/client/swipe")}
                  data-testid="button-quick-swipe"
                >
                  <Heart className="w-6 h-6" />
                  <span>Find Partners</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate("/client/briefs")}
                  data-testid="button-quick-brief"
                >
                  <FileText className="w-6 h-6" />
                  <span>Create Brief</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setActiveTab("matches")}
                  data-testid="button-quick-matches"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>View Messages</span>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="liked" className="space-y-4">
            {filteredLiked.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {searchQuery ? "No partners found" : "No liked partners yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "Start swiping to like partners you're interested in"
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate("/client/swipe")} data-testid="button-start-swiping-liked">
                    Start Swiping
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredLiked.map((match) => (
                  match.partner && (
                    <PartnerCard
                      key={match.id}
                      partner={match.partner}
                      match={match}
                      onSave={handleSave}
                      onMessage={handleMessage}
                      onRequestProposal={handleRequestProposal}
                      onBookCall={handleBookCall}
                      isSaving={saveMutation.isPending}
                    />
                  )
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {filteredSaved.length === 0 ? (
              <Card className="p-8 text-center">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {searchQuery ? "No partners found" : "No saved partners yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "Save partners to review and compare later"
                  }
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSaved.map((match) => (
                  match.partner && (
                    <PartnerCard
                      key={match.id}
                      partner={match.partner}
                      match={match}
                      onSave={handleSave}
                      onMessage={handleMessage}
                      onRequestProposal={handleRequestProposal}
                      onBookCall={handleBookCall}
                      isSaving={saveMutation.isPending}
                    />
                  )
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            {filteredMatches.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">
                  {searchQuery ? "No partners found" : "No confirmed matches yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "When you and a partner both express interest, you'll become a match"
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate("/client/swipe")} data-testid="button-find-partners">
                    Find Partners
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredMatches.map((match) => (
                  match.partner && (
                    <PartnerCard
                      key={match.id}
                      partner={match.partner}
                      match={match}
                      onSave={handleSave}
                      onMessage={handleMessage}
                      onRequestProposal={handleRequestProposal}
                      onBookCall={handleBookCall}
                      isSaving={saveMutation.isPending}
                    />
                  )
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {showAchievements && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowAchievements(false)}>
          <div 
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-lg p-6 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6" />
                Achievements
              </h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowAchievements(false)}
                data-testid="button-close-achievements"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
            <AchievementsList achievements={stats.achievements} />
          </div>
        </div>
      )}

      <GuideBot steps={CLIENT_GUIDE_STEPS} />
    </div>
  );
}
