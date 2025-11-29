import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Home, Users, Inbox, BarChart3, Settings, LogOut,
  Building2, Briefcase, MessageCircle, Clock, Search, Filter,
  User, Mail, Calendar, ChevronDown, ChevronRight, X,
  AlertCircle, CheckCircle2, AlertTriangle, XCircle,
  Shield, TrendingUp, Activity, Layers, FileText,
  Eye, Edit, Trash2, RefreshCw
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
import type { SupportTicket, User as UserType } from "@shared/schema";

interface AdminAnalytics {
  totalClients: number;
  totalPartners: number;
  totalMatches: number;
  mutualMatches: number;
  totalMessages: number;
  openTickets: number;
  activeUsers: number;
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

function TicketStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof AlertCircle }> = {
    open: { variant: "destructive", icon: AlertCircle },
    in_progress: { variant: "default", icon: Clock },
    resolved: { variant: "secondary", icon: CheckCircle2 },
    closed: { variant: "outline", icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.open;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ')}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { className: string; icon: typeof AlertTriangle }> = {
    low: { className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: ChevronDown },
    medium: { className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", icon: AlertTriangle },
    high: { className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", icon: AlertCircle },
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

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({
        title: "Ticket updated",
        description: "The support ticket has been updated successfully.",
      });
      setTicketDialogOpen(false);
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
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={Users}
                      label="Total Clients"
                      value={analytics?.totalClients || 0}
                      subtext="Registered clients"
                      color="blue"
                    />
                    <StatCard
                      icon={Building2}
                      label="Total Partners"
                      value={analytics?.totalPartners || 0}
                      subtext="Active partners"
                      color="purple"
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Total Matches"
                      value={analytics?.totalMatches || 0}
                      subtext={`${analytics?.mutualMatches || 0} mutual`}
                      color="green"
                    />
                    <StatCard
                      icon={Inbox}
                      label="Open Tickets"
                      value={analytics?.openTickets || 0}
                      subtext="Needs attention"
                      color="orange"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Platform Activity
                        </CardTitle>
                        <CardDescription>Key metrics at a glance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Active Users (30 days)</span>
                          <span className="font-medium">{analytics?.activeUsers || 0}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Messages</span>
                          <span className="font-medium">{analytics?.totalMessages || 0}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Match Rate</span>
                          <span className="font-medium">
                            {analytics?.totalMatches && analytics.totalMatches > 0 
                              ? Math.round((analytics.mutualMatches / analytics.totalMatches) * 100) 
                              : 0}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Inbox className="w-5 h-5" />
                          Recent Tickets
                        </CardTitle>
                        <CardDescription>Latest support requests</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          {ticketsLoading ? (
                            <div className="text-center py-8 text-muted-foreground">
                              Loading tickets...
                            </div>
                          ) : tickets.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              No tickets yet
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {tickets.slice(0, 5).map((ticket) => (
                                <div 
                                  key={ticket.id}
                                  className="flex items-start gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                    setTicketDialogOpen(true);
                                  }}
                                  data-testid={`ticket-preview-${ticket.id}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{ticket.subject}</p>
                                    <p className="text-xs text-muted-foreground truncate">{ticket.email}</p>
                                  </div>
                                  <TicketStatusBadge status={ticket.status || "open"} />
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                        {tickets.length > 5 && (
                          <Button
                            variant="ghost"
                            className="w-full mt-4"
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
                <div className="space-y-6">
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[150px]" data-testid="select-priority-filter">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Card>
                    <ScrollArea className="h-[calc(100vh-280px)]">
                      {ticketsLoading ? (
                        <div className="text-center py-16 text-muted-foreground">
                          Loading tickets...
                        </div>
                      ) : filteredTickets.length === 0 ? (
                        <div className="text-center py-16">
                          <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No tickets found</p>
                          {searchQuery || statusFilter !== "all" || priorityFilter !== "all" ? (
                            <Button
                              variant="ghost"
                              className="mt-2"
                              onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                                setPriorityFilter("all");
                              }}
                              data-testid="button-clear-filters"
                            >
                              Clear filters
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredTickets.map((ticket) => (
                            <div 
                              key={ticket.id}
                              className="p-4 hover-elevate cursor-pointer"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setTicketDialogOpen(true);
                              }}
                              data-testid={`ticket-row-${ticket.id}`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-medium">{ticket.subject}</h3>
                                    <TicketStatusBadge status={ticket.status || "open"} />
                                    <PriorityBadge priority={ticket.priority || "medium"} />
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {ticket.message}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {ticket.email}
                                    </span>
                                    {ticket.name && (
                                      <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {ticket.name}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Layers className="w-3 h-3" />
                                      {ticket.category}
                                    </span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" data-testid={`button-view-ticket-${ticket.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </Card>
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

      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Ticket Details
            </DialogTitle>
            <DialogDescription>
              View and manage support ticket
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <TicketStatusBadge status={selectedTicket.status || "open"} />
                <PriorityBadge priority={selectedTicket.priority || "medium"} />
                <Badge variant="outline">{selectedTicket.category || "general"}</Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {selectedTicket.email}
                  </span>
                  {selectedTicket.name && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedTicket.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : "N/A"}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Message</Label>
                <p className="mt-2 text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                  {selectedTicket.message}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Update Status</Label>
                  <Select
                    value={selectedTicket.status || "open"}
                    onValueChange={(value) => {
                      updateTicketMutation.mutate({
                        id: selectedTicket.id,
                        updates: { status: value as any },
                      });
                    }}
                  >
                    <SelectTrigger className="mt-2" data-testid="select-update-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Update Priority</Label>
                  <Select
                    value={selectedTicket.priority || "medium"}
                    onValueChange={(value) => {
                      updateTicketMutation.mutate({
                        id: selectedTicket.id,
                        updates: { priority: value as any },
                      });
                    }}
                  >
                    <SelectTrigger className="mt-2" data-testid="select-update-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTicket.adminNotes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <p className="mt-2 text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {selectedTicket.adminNotes}
                  </p>
                </div>
              )}

              {selectedTicket.resolution && (
                <div>
                  <Label className="text-sm font-medium">Resolution</Label>
                  <p className="mt-2 text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {selectedTicket.resolution}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDialogOpen(false)} data-testid="button-close-dialog">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
