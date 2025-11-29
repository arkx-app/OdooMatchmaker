import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MessageCircle, Send, Plus, Clock, CheckCircle2,
  AlertCircle, ArrowLeft, Loader2, User, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SupportTicket, TicketComment } from "@shared/schema";

interface HelpdeskSectionProps {
  userType: "client" | "partner";
}

const CATEGORIES = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing Question" },
  { value: "matching", label: "Matching Help" },
  { value: "account", label: "Account Issue" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function getStatusIcon(status: string | null | undefined) {
  switch (status) {
    case "fixed":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "assigned":
      return <Clock className="w-4 h-4 text-blue-500" />;
    case "issue":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-yellow-500" />;
  }
}

function getStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "fixed":
      return "Resolved";
    case "assigned":
      return "In Progress";
    case "issue":
      return "Needs Info";
    default:
      return "Open";
  }
}

function getStatusBadgeVariant(status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "fixed":
      return "secondary";
    case "assigned":
      return "default";
    case "issue":
      return "destructive";
    default:
      return "outline";
  }
}

function NewTicketDialog({ 
  userType, 
  onSuccess 
}: { 
  userType: "client" | "partner";
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "general",
    priority: "medium",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || "User",
          email: user?.email || "",
          userType: userType,
          userId: user?.id,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create ticket");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket created",
        description: "Your support request has been submitted.",
      });
      setFormData({ subject: "", message: "", category: "general", priority: "medium" });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-ticket">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            Describe your issue and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger data-testid="select-ticket-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger data-testid="select-ticket-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              data-testid="input-ticket-subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Please describe your issue in detail..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="min-h-[120px]"
              data-testid="input-ticket-message"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-ticket">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Ticket"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TicketChat({ 
  ticket, 
  onBack 
}: { 
  ticket: SupportTicket;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading, refetch } = useQuery<TicketComment[]>({
    queryKey: ['/api/tickets', ticket.id, 'messages'],
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/tickets/${ticket.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      setNewMessage("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/tickets/my'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage.trim());
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isResolved = ticket.status === "fixed";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back-to-tickets">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{ticket.subject}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs">
              {getStatusIcon(ticket.status)}
              <span className="ml-1">{getStatusLabel(ticket.status)}</span>
            </Badge>
            <span className="capitalize">{ticket.category}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden py-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{ticket.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d, h:mm a") : ""}
                  </span>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{ticket.message}</p>
              </div>
            </div>

            {messages.map((msg) => {
              const isAdmin = msg.userName?.includes("Admin") || msg.userId !== ticket.userId;
              return (
                <div key={msg.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isAdmin ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {isAdmin ? (
                      <Shield className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{msg.userName}</span>
                      {isAdmin && (
                        <Badge variant="secondary" className="text-xs">Support</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {msg.createdAt ? format(new Date(msg.createdAt), "MMM d, h:mm a") : ""}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {ticket.resolution && (
        <div className="py-3 px-4 border rounded-md bg-green-50 dark:bg-green-950 mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
            <CheckCircle2 className="w-4 h-4" />
            Resolution
          </div>
          <p className="text-sm mt-1 text-green-600 dark:text-green-400">{ticket.resolution}</p>
        </div>
      )}

      {!isResolved && (
        <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sendMutation.isPending}
            data-testid="input-chat-message"
          />
          <Button 
            type="submit" 
            disabled={sendMutation.isPending || !newMessage.trim()}
            data-testid="button-send-message"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      )}

      {isResolved && (
        <div className="py-3 text-center text-sm text-muted-foreground border-t">
          This ticket has been resolved. Create a new ticket if you need further assistance.
        </div>
      )}
    </div>
  );
}

export function HelpdeskSection({ userType }: HelpdeskSectionProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const { data: tickets = [], isLoading, refetch } = useQuery<SupportTicket[]>({
    queryKey: ['/api/tickets/my'],
    refetchInterval: 10000,
  });

  if (selectedTicket) {
    return (
      <TicketChat 
        ticket={selectedTicket} 
        onBack={() => {
          setSelectedTicket(null);
          refetch();
        }} 
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Support Tickets</h2>
          <p className="text-sm text-muted-foreground">
            View your support requests and chat with our team
          </p>
        </div>
        <NewTicketDialog userType={userType} onSuccess={refetch} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Tickets Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Need help? Create a new ticket and we'll get back to you.
            </p>
            <NewTicketDialog userType={userType} onSuccess={refetch} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
              data-testid={`ticket-card-${ticket.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{ticket.subject}</h3>
                      <Badge variant={getStatusBadgeVariant(ticket.status)} className="flex-shrink-0">
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{getStatusLabel(ticket.status)}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
                      <span>
                        {ticket.updatedAt 
                          ? `Updated ${format(new Date(ticket.updatedAt), "MMM d, h:mm a")}`
                          : ticket.createdAt
                            ? `Created ${format(new Date(ticket.createdAt), "MMM d, h:mm a")}`
                            : ""
                        }
                      </span>
                    </div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default HelpdeskSection;
