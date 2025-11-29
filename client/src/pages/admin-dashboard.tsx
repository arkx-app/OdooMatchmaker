import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Users, Inbox, BarChart3, Settings, LogOut,
  Building2, Briefcase, MessageCircle, Clock, Search,
  User, Mail, Calendar, ChevronDown, ChevronRight,
  AlertCircle, CheckCircle2, AlertTriangle, XCircle,
  Shield, TrendingUp, Activity, Layers, FileText,
  Eye, RefreshCw, ArrowRight, Send, UserPlus, Flag,
  ArrowRightCircle, Wrench, Bug
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SupportTicket, User as UserType, TicketComment } from "@shared/schema";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
}

interface AdminAnalytics {
  totals: {
    clients: number;
    partners: number;
    matches: number;
    mutualMatches: number;
    messages: number;
    activeUsers: number;
  };
  conversion: {
    matchConversionRate: number;
    responseRate: number;
    clientResponseRate: number;
    partnerResponseRate: number;
  };
  growth: {
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    newMatchesThisWeek: number;
    newMatchesThisMonth: number;
    userGrowthPercent: number;
    matchGrowthPercent: number;
  };
  revenue: {
    totalPipelineValue: number;
    closedDealsValue: number;
    lostDealsValue: number;
    averageDealSize: number;
    dealsInProgress: number;
  };
  leaderboards: {
    topPartnersByMatches: Array<{ id: string; name: string; company: string; matchCount: number }>;
    topPartnersByConversion: Array<{ id: string; name: string; company: string; conversionRate: number; matchCount: number }>;
  };
  distribution: {
    partnersByIndustry: Array<{ industry: string; count: number }>;
    clientsByIndustry: Array<{ industry: string; count: number }>;
  };
  support: {
    openTickets: number;
    ticketsByCategory: Array<{ category: string; count: number }>;
    ticketsByPriority: Array<{ priority: string; count: number }>;
    averageResolutionHours: number | null;
    resolvedThisWeek: number;
  };
  activity: {
    recentMatches: Array<{ id: string; clientName: string; partnerName: string; createdAt: string }>;
    recentSignups: Array<{ id: string; email: string; role: string; createdAt: string }>;
  };
  lastUpdated: string;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext,
  color = "blue",
}: { 
  icon: typeof Users; 
  label: string; 
  value: number | string; 
  subtext?: string;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-600",
    orange: "from-orange-500 to-amber-500",
  };

  return (
    <Card className="relative overflow-visible">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold" data-testid={`stat-value-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} shrink-0`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pipeline phases configuration
const PIPELINE_PHASES = [
  { id: "incoming", label: "Incoming", icon: Inbox, color: "bg-blue-500" },
  { id: "assigned", label: "Assigned", icon: UserPlus, color: "bg-yellow-500" },
  { id: "fixed", label: "Fixed", icon: Wrench, color: "bg-green-500" },
  { id: "issue", label: "Issue", icon: Bug, color: "bg-red-500" },
] as const;

type PipelinePhase = typeof PIPELINE_PHASES[number]["id"];

function TicketStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof AlertCircle; label: string }> = {
    incoming: { variant: "default", icon: Inbox, label: "Incoming" },
    assigned: { variant: "secondary", icon: UserPlus, label: "Assigned" },
    fixed: { variant: "outline", icon: CheckCircle2, label: "Fixed" },
    issue: { variant: "destructive", icon: Bug, label: "Issue" },
  };

  const config = statusConfig[status] || statusConfig.incoming;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { className: string; icon: typeof AlertTriangle }> = {
    low: { className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: ChevronDown },
    medium: { className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", icon: AlertTriangle },
    high: { className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", icon: AlertCircle },
    urgent: { className: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200", icon: AlertCircle },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      {priority}
    </Badge>
  );
}

// Ticket Detail Dialog with assignment and comments
function TicketDetailDialog({
  ticket,
  open,
  onOpenChange,
  adminUsers,
  onUpdate,
}: {
  ticket: SupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminUsers: AdminUser[];
  onUpdate: (id: string, updates: Partial<SupportTicket>) => void;
}) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  
  // Fetch comments for this ticket
  const { data: comments = [], isLoading: commentsLoading } = useQuery<TicketComment[]>({
    queryKey: ["/api/admin/tickets", ticket?.id, "comments"],
    enabled: !!ticket?.id && open,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/admin/tickets/${ticket?.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isInternal: true }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets", ticket?.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Internal note has been added to the ticket.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ticket Details
          </DialogTitle>
          <DialogDescription>
            View and manage support ticket
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Status and Priority Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <TicketStatusBadge status={ticket.status || "incoming"} />
              <PriorityBadge priority={ticket.priority || "medium"} />
              <Badge variant="outline">{ticket.category || "general"}</Badge>
              <Badge variant="outline" className="capitalize">
                {ticket.userType}
              </Badge>
            </div>

            {/* Ticket Info */}
            <div>
              <h3 className="font-semibold text-lg">{ticket.subject}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {ticket.email}
                </span>
                {ticket.name && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {ticket.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "N/A"}
                </span>
              </div>
            </div>

            <Separator />

            {/* Message */}
            <div>
              <Label className="text-sm font-medium">Message</Label>
              <p className="mt-2 text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {ticket.message}
              </p>
            </div>

            <Separator />

            {/* Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Pipeline Stage</Label>
                <Select
                  value={ticket.status || "incoming"}
                  onValueChange={(value) => onUpdate(ticket.id, { status: value as any })}
                >
                  <SelectTrigger className="mt-2" data-testid="select-update-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={ticket.priority || "medium"}
                  onValueChange={(value) => onUpdate(ticket.id, { priority: value as any })}
                >
                  <SelectTrigger className="mt-2" data-testid="select-update-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assign To</Label>
                <Select
                  value={ticket.assignedTo || "unassigned"}
                  onValueChange={(value) => {
                    const admin = adminUsers.find(a => a.id === value);
                    onUpdate(ticket.id, { 
                      assignedTo: value === "unassigned" ? null : value,
                      assignedToName: value === "unassigned" ? null : 
                        (admin ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email : null),
                      status: value !== "unassigned" && ticket.status === "incoming" ? "assigned" : ticket.status,
                    });
                  }}
                >
                  <SelectTrigger className="mt-2" data-testid="select-assign-to">
                    <SelectValue placeholder="Select admin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {adminUsers.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.firstName} {admin.lastName} ({admin.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ticket.assignedToName && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <UserPlus className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Currently assigned to: <strong>{ticket.assignedToName}</strong></span>
              </div>
            )}

            <Separator />

            {/* Internal Notes / Comments Section */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Internal Notes
              </Label>
              
              <div className="mt-3 space-y-3">
                {commentsLoading ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Loading notes...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No internal notes yet
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "N/A"}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new comment */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add an internal note..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                    data-testid="input-add-comment"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (newComment.trim()) {
                      addCommentMutation.mutate(newComment.trim());
                    }
                  }}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  size="sm"
                  data-testid="button-add-comment"
                >
                  {addCommentMutation.isPending ? (
                    <>Adding...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Add Note
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Resolution field */}
            {ticket.status === "fixed" && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Resolution</Label>
                  <Textarea
                    placeholder="Describe how the issue was resolved..."
                    value={ticket.resolution || ""}
                    onChange={(e) => onUpdate(ticket.id, { resolution: e.target.value })}
                    className="mt-2 min-h-[80px]"
                    data-testid="input-resolution"
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-dialog">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        if (user.role === "partner") {
          navigate("/partner/dashboard");
        } else if (user.role === "client") {
          navigate("/client/dashboard");
        } else {
          navigate("/");
        }
      }
    }
  }, [authLoading, user, isAdmin, navigate]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AdminAnalytics>({
    queryKey: ["/api/admin/analytics"],
    enabled: isAdmin,
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/tickets"],
    enabled: isAdmin,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<Omit<UserType, "passwordHash">[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const { data: adminUsers = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/admins"],
    enabled: isAdmin,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SupportTicket> }) => {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update ticket");
      return res.json();
    },
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
      toast({
        title: "Ticket updated",
        description: "The support ticket has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground mb-4">
              Checking authentication...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
            <p className="text-muted-foreground mb-4">
              Taking you to the right place...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  const filteredUsers = users.filter((u) => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm truncate">Admin Panel</h2>
                <p className="text-xs text-muted-foreground truncate">ERP Matcher</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "overview"}
                      onClick={() => setActiveTab("overview")}
                      data-testid="nav-overview"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "tickets"}
                      onClick={() => setActiveTab("tickets")}
                      data-testid="nav-tickets"
                    >
                      <Inbox className="w-4 h-4" />
                      <span>Support Tickets</span>
                      {analytics?.openTickets ? (
                        <Badge variant="destructive" className="ml-auto">
                          {analytics.openTickets}
                        </Badge>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "users"}
                      onClick={() => setActiveTab("users")}
                      data-testid="nav-users"
                    >
                      <Users className="w-4 h-4" />
                      <span>Users</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "settings"}
                      onClick={() => setActiveTab("settings")}
                      data-testid="nav-settings"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-2 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full" data-testid="button-user-menu">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b flex items-center justify-between gap-4 px-4 shrink-0 bg-background sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Separator orientation="vertical" className="h-4" />
              <h1 className="font-semibold">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "tickets" && "Support Tickets"}
                {activeTab === "users" && "User Management"}
                {activeTab === "settings" && "Settings"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                }}
                data-testid="button-refresh"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Core Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={Users}
                      label="Total Clients"
                      value={analytics?.totals?.clients || 0}
                      subtext="Registered clients"
                      color="blue"
                    />
                    <StatCard
                      icon={Building2}
                      label="Total Partners"
                      value={analytics?.totals?.partners || 0}
                      subtext="Active partners"
                      color="purple"
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Total Matches"
                      value={analytics?.totals?.matches || 0}
                      subtext={`${analytics?.totals?.mutualMatches || 0} mutual`}
                      color="green"
                    />
                    <StatCard
                      icon={Inbox}
                      label="Open Tickets"
                      value={analytics?.support?.openTickets || 0}
                      subtext="Needs attention"
                      color="orange"
                    />
                  </div>

                  {/* Growth & Conversion Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          Conversion Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Match Conversion</span>
                          <span className="font-semibold text-green-600">{analytics?.conversion?.matchConversionRate || 0}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Client Response</span>
                          <span className="font-medium">{analytics?.conversion?.clientResponseRate || 0}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Partner Response</span>
                          <span className="font-medium">{analytics?.conversion?.partnerResponseRate || 0}%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          Growth (30 days)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">New Users</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{analytics?.growth?.newUsersThisMonth || 0}</span>
                            {(analytics?.growth?.userGrowthPercent || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs text-green-600">
                                +{analytics?.growth?.userGrowthPercent}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">New Matches</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{analytics?.growth?.newMatchesThisMonth || 0}</span>
                            {(analytics?.growth?.matchGrowthPercent || 0) > 0 && (
                              <Badge variant="secondary" className="text-xs text-green-600">
                                +{analytics?.growth?.matchGrowthPercent}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">This Week</span>
                          <span className="font-medium">{analytics?.growth?.newUsersThisWeek || 0} users</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-500" />
                          Revenue Pipeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Pipeline Value</span>
                          <span className="font-semibold text-purple-600">
                            ${(analytics?.revenue?.totalPipelineValue || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Closed Deals</span>
                          <span className="font-medium text-green-600">
                            ${(analytics?.revenue?.closedDealsValue || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Avg Deal Size</span>
                          <span className="font-medium">
                            ${(analytics?.revenue?.averageDealSize || 0).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Leaderboards & Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Top Partners by Matches
                        </CardTitle>
                        <CardDescription>Most active partners on the platform</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(analytics?.leaderboards?.topPartnersByMatches?.length || 0) === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No partner data yet
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {analytics?.leaderboards?.topPartnersByMatches?.map((partner, index) => (
                              <div key={partner.id} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                  index === 1 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                  index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{partner.company}</p>
                                  <p className="text-xs text-muted-foreground truncate">{partner.name}</p>
                                </div>
                                <Badge variant="secondary">{partner.matchCount} matches</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Industry Distribution
                        </CardTitle>
                        <CardDescription>Partners and clients by sector</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Partners by Industry</p>
                            {(analytics?.distribution?.partnersByIndustry?.length || 0) === 0 ? (
                              <p className="text-sm text-muted-foreground">No data</p>
                            ) : (
                              <div className="space-y-2">
                                {analytics?.distribution?.partnersByIndustry?.slice(0, 4).map((item) => (
                                  <div key={item.industry} className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                        style={{ 
                                          width: `${Math.min((item.count / (analytics?.totals?.partners || 1)) * 100, 100)}%` 
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-24 truncate">{item.industry}</span>
                                    <span className="text-xs font-medium w-8 text-right">{item.count}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Separator />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Clients by Industry</p>
                            {(analytics?.distribution?.clientsByIndustry?.length || 0) === 0 ? (
                              <p className="text-sm text-muted-foreground">No data</p>
                            ) : (
                              <div className="space-y-2">
                                {analytics?.distribution?.clientsByIndustry?.slice(0, 4).map((item) => (
                                  <div key={item.industry} className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                                        style={{ 
                                          width: `${Math.min((item.count / (analytics?.totals?.clients || 1)) * 100, 100)}%` 
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-24 truncate">{item.industry}</span>
                                    <span className="text-xs font-medium w-8 text-right">{item.count}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity & Support Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Recent Activity
                        </CardTitle>
                        <CardDescription>Latest platform events</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="signups" className="w-full">
                          <TabsList className="w-full">
                            <TabsTrigger value="signups" className="flex-1">Signups</TabsTrigger>
                            <TabsTrigger value="matches" className="flex-1">Matches</TabsTrigger>
                          </TabsList>
                          <TabsContent value="signups" className="mt-4">
                            <ScrollArea className="h-[180px]">
                              {(analytics?.activity?.recentSignups?.length || 0) === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                  No recent signups
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {analytics?.activity?.recentSignups?.map((signup) => (
                                    <div key={signup.id} className="flex items-center gap-3 p-2 rounded-lg border">
                                      <Avatar className="w-8 h-8">
                                        <AvatarFallback className="text-xs">
                                          {signup.email.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{signup.email}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(signup.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <Badge variant="outline" className="text-xs capitalize">{signup.role}</Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                          </TabsContent>
                          <TabsContent value="matches" className="mt-4">
                            <ScrollArea className="h-[180px]">
                              {(analytics?.activity?.recentMatches?.length || 0) === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                  No recent matches
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {analytics?.activity?.recentMatches?.map((match) => (
                                    <div key={match.id} className="flex items-center gap-2 p-2 rounded-lg border">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{match.clientName}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          matched with {match.partnerName}
                                        </p>
                                      </div>
                                      <span className="text-xs text-muted-foreground shrink-0">
                                        {new Date(match.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Inbox className="w-5 h-5" />
                          Support Health
                        </CardTitle>
                        <CardDescription>Ticket status and resolution</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold">{analytics?.support?.openTickets || 0}</p>
                            <p className="text-xs text-muted-foreground">Open Tickets</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold">{analytics?.support?.resolvedThisWeek || 0}</p>
                            <p className="text-xs text-muted-foreground">Resolved This Week</p>
                          </div>
                        </div>
                        {analytics?.support?.averageResolutionHours !== null && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Avg Resolution Time</span>
                            <span className="font-medium">
                              {analytics?.support?.averageResolutionHours || 0}h
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">By Priority</p>
                          <div className="flex gap-2 flex-wrap">
                            {analytics?.support?.ticketsByPriority?.map((item) => (
                              <Badge 
                                key={item.priority} 
                                variant="outline"
                                className={`${
                                  item.priority === 'urgent' ? 'border-red-500 text-red-500' :
                                  item.priority === 'high' ? 'border-orange-500 text-orange-500' :
                                  item.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                  'border-slate-400 text-slate-500'
                                }`}
                              >
                                {item.priority}: {item.count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {tickets.length > 0 && (
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setActiveTab("tickets")}
                            data-testid="button-view-all-tickets"
                          >
                            View all tickets
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "tickets" && (
                <div className="space-y-4 h-full">
                  {/* Search and filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-tickets"
                      />
                    </div>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[150px]" data-testid="select-priority-filter">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
                      }}
                      data-testid="button-refresh-tickets"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  {/* Kanban Pipeline */}
                  {ticketsLoading ? (
                    <div className="text-center py-16 text-muted-foreground">
                      Loading tickets...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-280px)]">
                      {PIPELINE_PHASES.map((phase) => {
                        const phaseTickets = filteredTickets.filter(
                          (t) => (t.status || "incoming") === phase.id
                        );
                        const PhaseIcon = phase.icon;
                        
                        return (
                          <div
                            key={phase.id}
                            className="flex flex-col bg-muted/30 rounded-lg border"
                            data-testid={`pipeline-column-${phase.id}`}
                          >
                            {/* Column Header */}
                            <div className="p-3 border-b flex items-center justify-between gap-2 shrink-0">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${phase.color}`} />
                                <span className="font-medium text-sm">{phase.label}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {phaseTickets.length}
                              </Badge>
                            </div>
                            
                            {/* Column Content */}
                            <ScrollArea className="flex-1 p-2">
                              <div className="space-y-2">
                                {phaseTickets.length === 0 ? (
                                  <div className="text-center py-8 text-muted-foreground text-sm">
                                    <PhaseIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No tickets
                                  </div>
                                ) : (
                                  phaseTickets.map((ticket) => (
                                    <Card
                                      key={ticket.id}
                                      className="cursor-pointer hover-elevate transition-all"
                                      onClick={() => {
                                        setSelectedTicket(ticket);
                                        setTicketDialogOpen(true);
                                      }}
                                      data-testid={`ticket-card-${ticket.id}`}
                                    >
                                      <CardContent className="p-3">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                          <h4 className="font-medium text-sm line-clamp-2 flex-1">
                                            {ticket.subject}
                                          </h4>
                                          <PriorityBadge priority={ticket.priority || "medium"} />
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                          {ticket.message}
                                        </p>
                                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                          <div className="flex items-center gap-1 min-w-0">
                                            <User className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{ticket.name || ticket.email}</span>
                                          </div>
                                          <span className="shrink-0">
                                            {ticket.createdAt
                                              ? new Date(ticket.createdAt).toLocaleDateString()
                                              : "N/A"}
                                          </span>
                                        </div>
                                        {ticket.assignedToName && (
                                          <div className="mt-2 pt-2 border-t flex items-center gap-1 text-xs">
                                            <UserPlus className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">Assigned to:</span>
                                            <span className="font-medium">{ticket.assignedToName}</span>
                                          </div>
                                        )}
                                        {/* Quick action buttons */}
                                        <div className="mt-2 pt-2 border-t flex items-center gap-1 flex-wrap">
                                          {phase.id !== "fixed" && phase.id !== "issue" && (
                                            <>
                                              {phase.id === "incoming" && (
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-7 text-xs"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateTicketMutation.mutate({
                                                      id: ticket.id,
                                                      updates: { status: "assigned" },
                                                    });
                                                  }}
                                                  data-testid={`button-move-${ticket.id}-assigned`}
                                                >
                                                  <ArrowRightCircle className="w-3 h-3 mr-1" />
                                                  Assign
                                                </Button>
                                              )}
                                              {phase.id === "assigned" && (
                                                <>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      updateTicketMutation.mutate({
                                                        id: ticket.id,
                                                        updates: { status: "fixed" },
                                                      });
                                                    }}
                                                    data-testid={`button-move-${ticket.id}-fixed`}
                                                  >
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Fixed
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs text-destructive"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      updateTicketMutation.mutate({
                                                        id: ticket.id,
                                                        updates: { status: "issue" },
                                                      });
                                                    }}
                                                    data-testid={`button-move-${ticket.id}-issue`}
                                                  >
                                                    <Bug className="w-3 h-3 mr-1" />
                                                    Issue
                                                  </Button>
                                                </>
                                              )}
                                            </>
                                          )}
                                          {phase.id === "issue" && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 text-xs"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                updateTicketMutation.mutate({
                                                  id: ticket.id,
                                                  updates: { status: "assigned" },
                                                });
                                              }}
                                              data-testid={`button-move-${ticket.id}-back`}
                                            >
                                              <ArrowRightCircle className="w-3 h-3 mr-1" />
                                              Re-assign
                                            </Button>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "users" && (
                <div className="space-y-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-users"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Total Users</div>
                        <div className="text-2xl font-bold">{users.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Partners</div>
                        <div className="text-2xl font-bold">
                          {users.filter(u => u.role === "partner").length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Clients</div>
                        <div className="text-2xl font-bold">
                          {users.filter(u => u.role === "client").length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <ScrollArea className="h-[calc(100vh-380px)]">
                      {usersLoading ? (
                        <div className="text-center py-16 text-muted-foreground">
                          Loading users...
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-16">
                          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No users found</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredUsers.map((u) => (
                            <div 
                              key={u.id}
                              className="p-4 flex items-center gap-4"
                              data-testid={`user-row-${u.id}`}
                            >
                              <Avatar>
                                <AvatarFallback className="bg-muted">
                                  {u.firstName?.[0]}{u.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">
                                  {u.firstName} {u.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                              </div>
                              <Badge variant={
                                u.role === "admin" ? "default" :
                                u.role === "partner" ? "secondary" : "outline"
                              }>
                                {u.role}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </Card>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="max-w-2xl">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Settings</CardTitle>
                      <CardDescription>
                        Configure platform-wide settings and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center py-8 text-muted-foreground">
                        <Settings className="w-12 h-12 mx-auto mb-4" />
                        <p>Settings configuration coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <TicketDetailDialog
        ticket={selectedTicket}
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        adminUsers={adminUsers}
        onUpdate={(id, updates) => updateTicketMutation.mutate({ id, updates })}
      />
    </SidebarProvider>
  );
}
