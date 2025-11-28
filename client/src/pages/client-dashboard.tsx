import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { 
  Home, ThumbsUp, Bookmark, Users, ArrowLeft, LogOut, Award, 
  Star, Building2, MessageCircle, Calendar, FileText,
  Clock, Sparkles, ChevronRight, Search, Filter, X,
  Briefcase, Settings, HelpCircle, BookOpen, Globe, 
  DollarSign, Shield, ChevronDown, CheckCircle2, AlertCircle,
  Zap, TrendingUp, BarChart3, Target, Layers, ArrowRight,
  Edit, Plus, ExternalLink, Mail, Phone, MapPin, BadgeCheck,
  Lock, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  SheetTrigger,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { Partner, Match, Brief } from "@shared/schema";

interface EnrichedMatch extends Match {
  partner?: Partner;
}

const ODOO_MODULES = [
  { name: "CRM", description: "Customer Relationship Management for tracking leads, opportunities, and sales pipeline", icon: Target },
  { name: "Sales", description: "Quotations, sales orders, and customer invoicing", icon: DollarSign },
  { name: "Inventory", description: "Warehouse management, stock tracking, and inventory optimization", icon: Layers },
  { name: "Manufacturing", description: "Production planning, MRP, work orders, and shop floor control", icon: Zap },
  { name: "Accounting", description: "Full accounting suite with invoicing, payments, and financial reporting", icon: BarChart3 },
  { name: "HR", description: "Employee management, recruitment, payroll, and time tracking", icon: Users },
  { name: "Project", description: "Project management with tasks, timesheets, and profitability analysis", icon: Briefcase },
  { name: "eCommerce", description: "Online store with product catalog, cart, and payment integration", icon: Globe },
];

const IMPLEMENTATION_STAGES = [
  { stage: "Discovery", description: "Requirements gathering and business analysis", duration: "1-2 weeks" },
  { stage: "Planning", description: "Project scope, timeline, and resource allocation", duration: "1 week" },
  { stage: "Configuration", description: "System setup and module configuration", duration: "2-4 weeks" },
  { stage: "Data Migration", description: "Import existing data into Odoo", duration: "1-2 weeks" },
  { stage: "Testing", description: "User acceptance testing and bug fixes", duration: "1-2 weeks" },
  { stage: "Training", description: "End-user training and documentation", duration: "1 week" },
  { stage: "Go-Live", description: "Production deployment and support", duration: "1 week" },
];

function EnhancedPartnerCard({ 
  partner, 
  match,
  onSave, 
  onMessage,
  onRequestProposal,
  onBookCall,
  onViewProfile,
  isSaving,
  showFullDetails = false,
}: { 
  partner: Partner;
  match?: EnrichedMatch;
  onSave?: (matchId: string, saved: boolean) => void;
  onMessage?: (matchId: string) => void;
  onRequestProposal?: (matchId: string) => void;
  onBookCall?: (matchId: string) => void;
  onViewProfile?: (partnerId: string) => void;
  isSaving?: boolean;
  showFullDetails?: boolean;
}) {
  const isSaved = match?.clientSaved;
  const isMatched = match?.status === "matched" || (match?.clientLiked && match?.partnerAccepted);
  
  return (
    <Card className="overflow-visible hover-elevate transition-all" data-testid={`card-partner-${partner.id}`}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
            {partner.company?.charAt(0) || partner.name?.charAt(0) || "P"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-semibold text-base">{partner.company || partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.name}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 flex-wrap">
                {isMatched && (
                  <Badge variant="default" className="bg-green-500 text-white text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Matched
                  </Badge>
                )}
                {partner.verified && (
                  <Badge variant="secondary" className="text-xs">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {match?.score && (
                  <Badge variant="outline" className="text-xs font-medium">
                    {match.score}% fit
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {partner.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {partner.industry}
                </span>
              )}
              {partner.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {partner.rating.toFixed(1)} ({partner.reviewCount || 0} reviews)
                </span>
              )}
              {partner.capacity && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {partner.capacity === "available" ? "Available now" : partner.capacity === "limited" ? "Limited availability" : "Fully booked"}
                </span>
              )}
            </div>

            {(partner.hourlyRateMin || partner.hourlyRateMax) && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium">
                  ${partner.hourlyRateMin || 0} - ${partner.hourlyRateMax || 0}/hr
                </span>
              </div>
            )}
            
            {partner.services && partner.services.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {partner.services.slice(0, showFullDetails ? 10 : 4).map((service) => (
                  <Badge key={service} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {!showFullDetails && partner.services.length > 4 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{partner.services.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {partner.certifications && partner.certifications.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {partner.certifications.slice(0, 3).map((cert) => (
                  <Badge key={cert} variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            )}

            {partner.description && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {partner.description}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 flex-wrap">
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
              {onViewProfile && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onViewProfile(partner.id)}
                  data-testid={`button-view-profile-${partner.id}`}
                >
                  View Full Profile
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ 
  brief, 
  onEdit,
}: { 
  brief: Brief;
  onEdit?: (briefId: string) => void;
}) {
  const statusColors: Record<string, string> = {
    draft: "bg-gray-500",
    active: "bg-green-500",
    matching: "bg-blue-500",
    completed: "bg-purple-500",
  };

  return (
    <Card className="overflow-visible hover-elevate" data-testid={`card-project-${brief.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold">{brief.title || "Untitled Project"}</h3>
              <Badge className={`${statusColors[brief.status || "draft"]} text-white text-xs`}>
                {brief.status || "Draft"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {brief.description || "No description provided"}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {brief.budget && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {brief.budget}
                </span>
              )}
              {brief.timelineWeeks && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {brief.timelineWeeks} weeks
                </span>
              )}
              {brief.priority && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {brief.priority} priority
                </span>
              )}
            </div>
            {brief.modules && brief.modules.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {brief.modules.slice(0, 5).map((module) => (
                  <Badge key={module} variant="outline" className="text-xs">
                    {module}
                  </Badge>
                ))}
                {brief.modules.length > 5 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{brief.modules.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onEdit(brief.id)}
                data-testid={`button-edit-project-${brief.id}`}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
  value: number; 
  subtext?: string;
  trend?: string;
  color?: "blue" | "pink" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    pink: "from-pink-500 to-rose-500",
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

interface FilterState {
  industry: string;
  budget: string;
  rating: string;
  availability: string;
}

function FilterSheet({
  filters,
  onFiltersChange,
  onClear,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClear: () => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-filters">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {Object.values(filters).some(v => v) && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {Object.values(filters).filter(v => v).length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Partners</SheetTitle>
          <SheetDescription>
            Refine your partner search with these filters
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select 
              value={filters.industry} 
              onValueChange={(v) => onFiltersChange({ ...filters, industry: v })}
            >
              <SelectTrigger data-testid="select-industry">
                <SelectValue placeholder="All industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="services">Professional Services</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="finance">Financial Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Budget Range</Label>
            <Select 
              value={filters.budget} 
              onValueChange={(v) => onFiltersChange({ ...filters, budget: v })}
            >
              <SelectTrigger data-testid="select-budget">
                <SelectValue placeholder="Any budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any budget</SelectItem>
                <SelectItem value="low">$50-100/hr</SelectItem>
                <SelectItem value="medium">$100-150/hr</SelectItem>
                <SelectItem value="high">$150-250/hr</SelectItem>
                <SelectItem value="premium">$250+/hr</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <Select 
              value={filters.rating} 
              onValueChange={(v) => onFiltersChange({ ...filters, rating: v })}
            >
              <SelectTrigger data-testid="select-rating">
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any rating</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
                <SelectItem value="5">5 stars only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Availability</Label>
            <Select 
              value={filters.availability} 
              onValueChange={(v) => onFiltersChange({ ...filters, availability: v })}
            >
              <SelectTrigger data-testid="select-availability">
                <SelectValue placeholder="Any availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any availability</SelectItem>
                <SelectItem value="available">Available now</SelectItem>
                <SelectItem value="limited">Limited availability</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <Button variant="outline" className="w-full" onClick={onClear} data-testid="button-clear-filters">
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function ClientDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [showAchievements, setShowAchievements] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [filters, setFilters] = useState({
    industry: "",
    budget: "",
    rating: "",
    availability: "",
  });
  const [, navigate] = useLocation();
  const { logout, user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { stats, newAchievements } = useGamification("clientGamification");
  const { toast } = useToast();

  const clientId = user?.profile?.id || "";

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/auth");
      } else if (user?.role === "partner") {
        navigate("/partner/dashboard");
      }
    }
  }, [authLoading, isAuthenticated, user?.role, navigate]);

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

  const { data: briefsData } = useQuery<{ briefs: Brief[] }>({
    queryKey: ["/api/my/briefs"],
  });

  const briefs = briefsData?.briefs || [];

  const enrichedMatches: EnrichedMatch[] = clientMatches.map(match => ({
    ...match,
    partner: partners.find(p => p.id === match.partnerId),
  }));

  // Sample demo data for freemium display
  const samplePartners = [
    { id: "demo-1", name: "John Smith", email: "john@odootech.com", company: "OdooTech Solutions", industry: "Technology", services: ["ERP Implementation", "Custom Development", "Training"], rating: 4.8, reviewCount: 127, description: "Leading Odoo partner with 10+ years of experience" },
    { id: "demo-2", name: "Sarah Johnson", email: "sarah@erpmasters.com", company: "ERP Masters Inc", industry: "Manufacturing", services: ["Manufacturing Module", "Inventory", "Quality Control"], rating: 4.6, reviewCount: 89, description: "Specialized in manufacturing and supply chain solutions" },
    { id: "demo-3", name: "Michael Chen", email: "michael@cloudfirst.com", company: "CloudFirst Partners", industry: "Retail", services: ["POS Systems", "E-commerce", "CRM"], rating: 4.9, reviewCount: 156, description: "Expert retail and e-commerce Odoo implementations" },
    { id: "demo-4", name: "Emily Davis", email: "emily@digitaltransform.com", company: "Digital Transform Co", industry: "Healthcare", services: ["Healthcare ERP", "Compliance", "Patient Management"], rating: 4.7, reviewCount: 64, description: "Healthcare industry specialists" },
    { id: "demo-5", name: "Robert Wilson", email: "robert@agileerp.com", company: "Agile ERP Group", industry: "Finance", services: ["Accounting", "Financial Reporting", "Audit"], rating: 4.5, reviewCount: 98, description: "Financial services and accounting experts" },
    { id: "demo-6", name: "Lisa Anderson", email: "lisa@nextgen.com", company: "NextGen Solutions", industry: "E-commerce", services: ["Website Builder", "Payment Integration", "Shipping"], rating: 4.8, reviewCount: 112, description: "E-commerce and online business specialists" },
    { id: "demo-7", name: "David Brown", email: "david@enterprisehub.com", company: "Enterprise Hub", industry: "Logistics", services: ["Fleet Management", "Warehouse", "Distribution"], rating: 4.4, reviewCount: 76, description: "Logistics and supply chain experts" },
  ] as Partner[];

  const sampleLikedMatches = samplePartners.slice(0, 5).map((partner, idx) => ({
    id: `demo-like-${idx}`,
    clientId: clientId || "demo-client",
    partnerId: partner.id,
    clientLiked: true,
    partnerAccepted: idx < 2,
    status: idx < 2 ? "matched" : "pending",
    partner,
  })) as EnrichedMatch[];

  const sampleSavedMatches = samplePartners.slice(2, 5).map((partner, idx) => ({
    id: `demo-saved-${idx}`,
    clientId: clientId || "demo-client",
    partnerId: partner.id,
    clientLiked: true,
    clientSaved: true,
    partnerAccepted: idx === 0,
    status: idx === 0 ? "matched" : "pending",
    partner,
  })) as EnrichedMatch[];

  const sampleConfirmedMatches = samplePartners.slice(0, 3).map((partner, idx) => ({
    id: `demo-match-${idx}`,
    clientId: clientId || "demo-client",
    partnerId: partner.id,
    clientLiked: true,
    partnerAccepted: true,
    status: "matched",
    partner,
  })) as EnrichedMatch[];

  // Combine real data with sample data (sample data shows when no real data)
  const realLikedPartners = enrichedMatches.filter((m) => m.clientLiked && m.partner);
  const realSavedPartners = enrichedMatches.filter((m) => m.clientSaved && m.partner);
  const realConfirmedMatches = enrichedMatches.filter((m) => 
    (m.status === "matched" || (m.clientLiked && m.partnerAccepted)) && m.partner
  );

  // Use sample data if no real data exists
  const likedPartners = realLikedPartners.length > 0 ? realLikedPartners : sampleLikedMatches;
  const savedPartners = realSavedPartners.length > 0 ? realSavedPartners : sampleSavedMatches;
  const confirmedMatches = realConfirmedMatches.length > 0 ? realConfirmedMatches : sampleConfirmedMatches;

  // Free tier limit for premium feature
  const FREE_LIKES_LIMIT = 3;

  const applyFilters = (matches: EnrichedMatch[]) => {
    return matches.filter(m => {
      if (!m.partner) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          m.partner.company?.toLowerCase().includes(query) ||
          m.partner.name?.toLowerCase().includes(query) ||
          m.partner.industry?.toLowerCase().includes(query) ||
          m.partner.services?.some(s => s.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (filters.industry && filters.industry !== "all") {
        if (!m.partner.industry?.toLowerCase().includes(filters.industry)) return false;
      }

      if (filters.rating && filters.rating !== "all") {
        const minRating = parseFloat(filters.rating);
        if ((m.partner.rating || 0) < minRating) return false;
      }

      if (filters.availability && filters.availability !== "all") {
        if (m.partner.capacity !== filters.availability) return false;
      }

      if (filters.budget && filters.budget !== "all") {
        const rate = m.partner.hourlyRateMin || 0;
        if (filters.budget === "low" && (rate < 50 || rate > 100)) return false;
        if (filters.budget === "medium" && (rate < 100 || rate > 150)) return false;
        if (filters.budget === "high" && (rate < 150 || rate > 250)) return false;
        if (filters.budget === "premium" && rate < 250) return false;
      }

      return true;
    });
  };

  const sortMatches = (matches: EnrichedMatch[]) => {
    return [...matches].sort((a, b) => {
      if (sortBy === "match") return (b.score || 0) - (a.score || 0);
      if (sortBy === "rating") return (b.partner?.rating || 0) - (a.partner?.rating || 0);
      if (sortBy === "price-low") return (a.partner?.hourlyRateMin || 0) - (b.partner?.hourlyRateMin || 0);
      if (sortBy === "price-high") return (b.partner?.hourlyRateMax || 0) - (a.partner?.hourlyRateMax || 0);
      return 0;
    });
  };

  const filteredLiked = sortMatches(applyFilters(likedPartners));
  const filteredSaved = sortMatches(applyFilters(savedPartners));
  const filteredMatches = sortMatches(applyFilters(confirmedMatches));

  const saveMutation = useMutation({
    mutationFn: async ({ matchId, saved }: { matchId: string; saved: boolean }) => {
      const response = await apiRequest("PATCH", `/api/matches/${matchId}`, {
        clientSaved: saved,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches/client", clientId] });
      toast({ title: "Updated", description: "Partner saved status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update. Please try again.", variant: "destructive" });
    },
  });

  const handleSave = (matchId: string, saved: boolean) => {
    saveMutation.mutate({ matchId, saved });
  };

  const handleMessage = (matchId: string) => {
    navigate(`/messages/${matchId}`);
  };

  const handleRequestProposal = (matchId: string) => {
    toast({ title: "Proposal Requested", description: "The partner has been notified of your proposal request." });
  };

  const handleBookCall = (matchId: string) => {
    toast({ title: "Call Request Sent", description: "The partner will receive your call request and get back to you." });
  };

  const handleViewProfile = (partnerId: string) => {
    toast({ title: "Opening Profile", description: "Partner profile view coming soon." });
  };

  const handleEditProject = (briefId: string) => {
    navigate("/client/briefs");
  };

  const clearFilters = () => {
    setFilters({ industry: "", budget: "", rating: "", availability: "" });
    setSearchQuery("");
  };

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

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "projects", label: "My Projects", icon: Briefcase },
    { id: "find", label: "Find Partners", icon: Search, action: () => navigate("/client/swipe") },
    { id: "liked", label: "Liked Partners", icon: ThumbsUp, count: likedPartners.length },
    { id: "saved", label: "Saved Partners", icon: Bookmark, count: savedPartners.length },
    { id: "matches", label: "Matches", icon: Users, count: confirmedMatches.length },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "learn", label: "Learn Odoo", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
                E
              </div>
              <div>
                <h2 className="font-semibold text-sm">ERP Matcher</h2>
                <p className="text-xs text-muted-foreground">Client Dashboard</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => item.action ? item.action() : setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.count}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/client/briefs")} data-testid="nav-create-brief">
                      <Plus className="w-4 h-4" />
                      <span>New Project Brief</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setShowAchievements(!showAchievements)} data-testid="nav-achievements">
                      <Award className="w-4 h-4" />
                      <span>Achievements</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {stats.totalPoints}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-3 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2 px-2" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-client-from/20 text-client-from text-sm">
                      {user?.firstName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/client/swipe")} data-testid="menu-matching">
                  <Search className="w-4 h-4 mr-2" />
                  Find Partners
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
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between gap-4 h-14 px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div>
                  <h1 className="font-semibold capitalize">{activeSection === "overview" ? "Dashboard" : activeSection.replace("-", " ")}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => navigate("/client/swipe")}
                  className="bg-gradient-to-r from-client-from to-client-to text-white"
                  data-testid="button-back-to-swiping"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Keep Swiping
                </Button>
                {(activeSection === "liked" || activeSection === "saved" || activeSection === "matches") && (
                  <>
                    <div className="relative w-64 hidden md:block">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search partners..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        data-testid="input-search"
                      />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40" data-testid="select-sort">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match">Best Match</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FilterSheet 
                      filters={filters} 
                      onFiltersChange={setFilters} 
                      onClear={clearFilters}
                    />
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {showAchievements && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Your Achievements
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowAchievements(false)} data-testid="button-close-achievements">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AchievementsList />
                </CardContent>
              </Card>
            )}

            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard icon={Briefcase} label="Projects" value={briefs.length} color="blue" />
                  <StatCard icon={ThumbsUp} label="Liked" value={likedPartners.length} color="pink" />
                  <StatCard icon={Bookmark} label="Saved" value={savedPartners.length} color="orange" />
                  <StatCard icon={Users} label="Matches" value={confirmedMatches.length} color="green" />
                  <StatCard icon={Sparkles} label="Points" value={stats.totalPoints} color="purple" />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          My Projects
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveSection("projects")} data-testid="button-view-all-projects">
                          View All
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {briefs.length === 0 ? (
                        <div className="text-center py-8">
                          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground mb-2">No projects yet</p>
                          <p className="text-sm text-muted-foreground mb-4">Create a project brief to start matching with partners</p>
                          <Button onClick={() => navigate("/client/briefs")} data-testid="button-create-first-project">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {briefs.slice(0, 2).map((brief) => (
                            <ProjectCard key={brief.id} brief={brief} onEdit={handleEditProject} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Recent Matches
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveSection("matches")} data-testid="button-view-all-matches">
                          View All
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {confirmedMatches.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground mb-2">No matches yet</p>
                          <p className="text-sm text-muted-foreground">Use the "Keep Swiping" button above to find partners</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {confirmedMatches.slice(0, 2).map((match) => (
                            match.partner && (
                              <EnhancedPartnerCard
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
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-auto py-6 flex-col gap-2"
                        onClick={() => navigate("/client/briefs")}
                        data-testid="button-quick-brief"
                      >
                        <FileText className="w-6 h-6" />
                        <span>Create Brief</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-6 flex-col gap-2"
                        onClick={() => setActiveSection("matches")}
                        data-testid="button-quick-matches"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span>View Messages</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-6 flex-col gap-2"
                        onClick={() => setActiveSection("learn")}
                        data-testid="button-quick-learn"
                      >
                        <BookOpen className="w-6 h-6" />
                        <span>Learn Odoo</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">My Projects</h2>
                    <p className="text-muted-foreground">Manage your project briefs and requirements</p>
                  </div>
                  <Button onClick={() => navigate("/client/briefs")} data-testid="button-new-project">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </div>

                {briefs.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create a project brief to define your requirements and start matching with qualified Odoo partners.
                    </p>
                    <Button size="lg" onClick={() => navigate("/client/briefs")} data-testid="button-create-project">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {briefs.map((brief) => (
                      <ProjectCard key={brief.id} brief={brief} onEdit={handleEditProject} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "liked" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Liked Partners</h2>
                    <p className="text-muted-foreground">Partners you've expressed interest in</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.min(filteredLiked.length, FREE_LIKES_LIMIT)} of {filteredLiked.length} visible
                    </Badge>
                    <Badge variant="secondary" className="text-xs">Free Tier</Badge>
                  </div>
                </div>

                {filteredLiked.length === 0 ? (
                  <Card className="p-12 text-center">
                    <ThumbsUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery || Object.values(filters).some(v => v) ? "No partners found" : "No liked partners yet"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || Object.values(filters).some(v => v) 
                        ? "Try adjusting your filters" 
                        : "Start swiping to like partners you're interested in"
                      }
                    </p>
                    {!(searchQuery || Object.values(filters).some(v => v)) && (
                      <Button onClick={() => navigate("/client/swipe")} data-testid="button-start-swiping-liked">
                        Start Swiping
                      </Button>
                    )}
                  </Card>
                ) : (
                  <>
                    {/* Visible likes within free tier */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredLiked.slice(0, FREE_LIKES_LIMIT).map((match) => (
                        match.partner && (
                          <EnhancedPartnerCard
                            key={match.id}
                            partner={match.partner}
                            match={match}
                            onSave={handleSave}
                            onMessage={handleMessage}
                            onRequestProposal={handleRequestProposal}
                            onBookCall={handleBookCall}
                            onViewProfile={handleViewProfile}
                            isSaving={saveMutation.isPending}
                          />
                        )
                      ))}
                    </div>

                    {/* Premium upgrade prompt if there are more likes */}
                    {filteredLiked.length > FREE_LIKES_LIMIT && (
                      <>
                        <Card className="p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 border-amber-500/30">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Crown className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold">Unlock All Your Matches</h4>
                                <p className="text-sm text-muted-foreground">
                                  {filteredLiked.length - FREE_LIKES_LIMIT} more partners are interested in working with you
                                </p>
                              </div>
                            </div>
                            <Button 
                              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                              data-testid="button-upgrade-premium-liked"
                              onClick={() => navigate("/client/pricing")}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Upgrade to Premium
                            </Button>
                          </div>
                        </Card>

                        {/* Blurred/locked likes */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {filteredLiked.slice(FREE_LIKES_LIMIT).map((match) => (
                            match.partner && (
                              <Card key={match.id} className="relative overflow-hidden" data-testid={`locked-partner-${match.id}`}>
                                {/* Blur overlay */}
                                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-10 flex items-center justify-center">
                                  <div className="text-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                                      <Lock className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="font-medium text-sm">Premium Only</p>
                                    <p className="text-xs text-muted-foreground">Upgrade to view this partner</p>
                                  </div>
                                </div>
                                {/* Blurred content preview */}
                                <CardContent className="p-4 opacity-50">
                                  <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-partner-from to-partner-to flex items-center justify-center text-white font-bold">
                                      {match.partner.company?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold">{match.partner.company}</h3>
                                      <p className="text-sm text-muted-foreground">{match.partner.industry}</p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs">{match.partner.rating}</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {activeSection === "saved" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Saved Partners</h2>
                  <p className="text-muted-foreground">Partners you've bookmarked for later review</p>
                </div>

                {filteredSaved.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery || Object.values(filters).some(v => v) ? "No partners found" : "No saved partners yet"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || Object.values(filters).some(v => v) 
                        ? "Try adjusting your filters" 
                        : "Save partners to review and compare later"
                      }
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredSaved.map((match) => (
                      match.partner && (
                        <EnhancedPartnerCard
                          key={match.id}
                          partner={match.partner}
                          match={match}
                          onSave={handleSave}
                          onMessage={handleMessage}
                          onRequestProposal={handleRequestProposal}
                          onBookCall={handleBookCall}
                          onViewProfile={handleViewProfile}
                          isSaving={saveMutation.isPending}
                        />
                      )
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "matches" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Confirmed Matches</h2>
                  <p className="text-muted-foreground">Partners who have also expressed interest in working with you</p>
                </div>

                {filteredMatches.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery || Object.values(filters).some(v => v) ? "No partners found" : "No matches yet"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || Object.values(filters).some(v => v) 
                        ? "Try adjusting your filters" 
                        : "When you and a partner both express interest, you'll see them here"
                      }
                    </p>
                    {!(searchQuery || Object.values(filters).some(v => v)) && (
                      <Button onClick={() => navigate("/client/swipe")} data-testid="button-find-matches">
                        Find Partners
                      </Button>
                    )}
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredMatches.map((match) => (
                      match.partner && (
                        <EnhancedPartnerCard
                          key={match.id}
                          partner={match.partner}
                          match={match}
                          onSave={handleSave}
                          onMessage={handleMessage}
                          onRequestProposal={handleRequestProposal}
                          onBookCall={handleBookCall}
                          onViewProfile={handleViewProfile}
                          isSaving={saveMutation.isPending}
                          showFullDetails
                        />
                      )
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "messages" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Messages</h2>
                  <p className="text-muted-foreground">Communicate with your matched partners</p>
                </div>

                {confirmedMatches.length === 0 ? (
                  <Card className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                    <p className="text-muted-foreground">
                      Match with partners to start messaging them. Use the "Keep Swiping" button above to find partners.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {confirmedMatches.map((match) => (
                      match.partner && (
                        <Card 
                          key={match.id} 
                          className="p-4 hover-elevate cursor-pointer"
                          onClick={() => navigate(`/messages/${match.id}`)}
                          data-testid={`card-conversation-${match.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {match.partner.company?.charAt(0) || "P"}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{match.partner.company}</h3>
                              <p className="text-sm text-muted-foreground">Click to open conversation</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </Card>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "learn" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Learn About Odoo</h2>
                  <p className="text-muted-foreground">Understanding Odoo modules and implementation process</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Odoo Modules Overview
                    </CardTitle>
                    <CardDescription>
                      Odoo is a comprehensive business suite with integrated modules for every need
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {ODOO_MODULES.map((module) => (
                        <Card key={module.name} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <module.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{module.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Implementation Roadmap
                    </CardTitle>
                    <CardDescription>
                      Typical phases of an Odoo implementation project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {IMPLEMENTATION_STAGES.map((stage, index) => (
                        <div key={stage.stage} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            {index < IMPLEMENTATION_STAGES.length - 1 && (
                              <div className="w-0.5 h-full bg-border mt-2" />
                            )}
                          </div>
                          <div className="pb-6">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{stage.stage}</h4>
                              <Badge variant="outline" className="text-xs">{stage.duration}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>How long does an Odoo implementation take?</AccordionTrigger>
                        <AccordionContent>
                          A typical implementation takes 8-16 weeks depending on complexity. Simple implementations with 2-3 modules can be done in 6-8 weeks, while complex enterprise projects may take 6+ months.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>What is the cost of Odoo implementation?</AccordionTrigger>
                        <AccordionContent>
                          Costs vary based on partner rates ($75-300/hr), number of modules, customization needs, and data migration complexity. Budget $15,000-$100,000+ for a typical SMB implementation.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Should I use Odoo Community or Enterprise?</AccordionTrigger>
                        <AccordionContent>
                          Community is free and open-source with core functionality. Enterprise includes advanced features like full accounting, marketing automation, IoT, and official support. Most businesses benefit from Enterprise.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger>What should I look for in an Odoo partner?</AccordionTrigger>
                        <AccordionContent>
                          Look for industry experience, relevant certifications (Gold/Silver Partner), case studies in your sector, clear communication, and transparent pricing. Reviews and references are also valuable.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Settings</h2>
                  <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={`${user?.firstName || ""} ${user?.lastName || ""}`} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email || ""} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input value={user?.profile?.company || ""} readOnly />
                      </div>
                      <Button variant="outline" className="mt-4" data-testid="button-edit-profile">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Match Notifications</p>
                          <p className="text-sm text-muted-foreground">Get notified when you have a new match</p>
                        </div>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Message Notifications</p>
                          <p className="text-sm text-muted-foreground">Get notified when you receive a message</p>
                        </div>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Weekly Summary</p>
                          <p className="text-sm text-muted-foreground">Receive a weekly summary of activity</p>
                        </div>
                        <Badge variant="outline">Disabled</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Privacy & Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Profile Visibility</p>
                          <p className="text-sm text-muted-foreground">Who can see your profile</p>
                        </div>
                        <Badge variant="secondary">Partners Only</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                      <Separator />
                      <Button variant="outline" className="text-destructive" data-testid="button-change-password">
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-5 h-5" />
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        These actions are irreversible. Please proceed with caution.
                      </p>
                      <div className="flex gap-4 flex-wrap">
                        <Button variant="outline" className="text-destructive" data-testid="button-export-data">
                          Export My Data
                        </Button>
                        <Button variant="destructive" data-testid="button-delete-account">
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
