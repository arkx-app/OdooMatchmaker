import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  ArrowLeft, 
  MessageSquare, 
  Building2, 
  User,
  Clock,
  CheckCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Match, Partner, Client, Message } from "@shared/schema";

interface ConversationPartner {
  id: string;
  name: string;
  company: string;
  type: "client" | "partner";
  matchId: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profile: any;
}

export default function Messaging({ matchId }: { matchId?: string }) {
  const [messageText, setMessageText] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState(matchId);
  const [, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user from API
  const { data: currentUser } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    retry: 1,
  });

  const userRole = currentUser?.role;
  const profileId = currentUser?.profile?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all matches for current user to build conversation list
  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches", userRole, profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const endpoint = userRole === "partner" 
        ? `/api/matches/partner/${profileId}`
        : `/api/matches/client/${profileId}`;
      const res = await fetch(endpoint, { credentials: "include" });
      return res.json();
    },
    enabled: !!profileId,
  });

  // Fetch all partners for partner info
  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
    queryFn: async () => {
      const res = await fetch("/api/partners", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch all clients for client info
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Build conversation list from matches
  const conversations: ConversationPartner[] = matches
    .filter(m => m.clientLiked && m.partnerAccepted) // Only show mutual matches
    .map(match => {
      if (userRole === "partner") {
        const client = clients.find(c => c.id === match.clientId);
        return {
          id: match.clientId,
          name: client ? `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Client" : "Client",
          company: client?.company || "Unknown Company",
          type: "client" as const,
          matchId: match.id,
        };
      } else {
        const partner = partners.find(p => p.id === match.partnerId);
        return {
          id: match.partnerId,
          name: partner?.company || "Partner",
          company: partner?.company || "Unknown Company",
          type: "partner" as const,
          matchId: match.id,
        };
      }
    });

  // Get current conversation partner info
  const currentConversation = conversations.find(c => c.matchId === selectedMatchId);
  const currentMatch = matches.find(m => m.id === selectedMatchId);

  // Fetch messages for selected match
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedMatchId],
    queryFn: async () => {
      const res = await fetch(`/api/messages/match/${selectedMatchId}`, { credentials: "include" });
      return res.json();
    },
    enabled: !!selectedMatchId,
    refetchInterval: 3000, // Poll for new messages
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) return null;
      const otherUserId = userRole === "partner" 
        ? currentMatch?.clientId 
        : currentMatch?.partnerId;
      
      return apiRequest("POST", "/api/messages", {
        matchId: selectedMatchId,
        fromUserId: currentUser.id,
        toUserId: otherUserId || "",
        body: messageText,
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedMatchId] });
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (selectedMatchId && currentUser?.id) {
      fetch(`/api/messages/match/${selectedMatchId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: currentUser.id }),
      }).catch(() => {});
    }
  }, [selectedMatchId, currentUser?.id]);

  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const handleSend = () => {
    if (messageText.trim()) {
      sendMutation.mutate();
    }
  };

  // If no conversations and no selected match, show empty state
  if (conversations.length === 0 && !selectedMatchId) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <header className="border-b p-4 flex items-center gap-4 bg-card">
          <Button variant="ghost" size="icon" onClick={() => setLocation(userRole === "partner" ? "/partner/dashboard" : "/client/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Messages</h1>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No conversations yet</h2>
            <p className="text-muted-foreground max-w-sm">
              {userRole === "partner" 
                ? "Accept client matches to start messaging. When you accept a match, you can start a conversation here."
                : "Like partners and wait for them to accept your match request. Once matched, you can start a conversation here."}
            </p>
            <Button 
              onClick={() => setLocation(userRole === "partner" ? "/partner/dashboard" : "/client/dashboard")}
              data-testid="button-find-matches"
            >
              {userRole === "partner" ? "View Incoming Matches" : "Find Partners"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b p-4 flex items-center gap-4 bg-card shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation(userRole === "partner" ? "/partner/dashboard" : "/client/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {currentConversation ? (
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={userRole === "partner" ? "bg-client-from/20 text-client-from" : "bg-partner-from/20 text-partner-from"}>
                {currentConversation.company.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold" data-testid="text-conversation-name">
                {currentConversation.company}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {userRole === "partner" ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                {currentConversation.type === "client" ? "Client" : "Partner"}
              </p>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-semibold">Messages</h1>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-72 border-r bg-card flex flex-col shrink-0">
          <div className="p-3 border-b">
            <h2 className="font-semibold text-sm text-muted-foreground">Conversations</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.matchId}
                  onClick={() => {
                    setSelectedMatchId(conv.matchId);
                    setLocation(`/messages/${conv.matchId}`);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedMatchId === conv.matchId 
                      ? "bg-accent" 
                      : "hover-elevate"
                  }`}
                  data-testid={`conversation-${conv.matchId}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={conv.type === "client" ? "bg-client-from/20 text-client-from" : "bg-partner-from/20 text-partner-from"}>
                        {conv.company.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.company}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage || "Start a conversation"}
                      </p>
                    </div>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}

              {conversations.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No conversations yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedMatchId ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                  {messagesLoading ? (
                    <div className="text-center text-muted-foreground py-8">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <MessageSquare className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.fromUserId === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <div className={`flex gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}>
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className={isOwn 
                                ? (userRole === "partner" ? "bg-partner-from/20 text-partner-from" : "bg-client-from/20 text-client-from")
                                : (userRole === "partner" ? "bg-client-from/20 text-client-from" : "bg-partner-from/20 text-partner-from")
                              }>
                                {isOwn ? "You" : currentConversation?.company.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`space-y-1 ${isOwn ? "items-end" : "items-start"}`}>
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isOwn
                                    ? userRole === "partner"
                                      ? "bg-partner-from text-white rounded-br-md"
                                      : "bg-client-from text-white rounded-br-md"
                                    : "bg-muted rounded-bl-md"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                              </div>
                              <div className={`flex items-center gap-1 text-xs text-muted-foreground ${isOwn ? "justify-end" : ""}`}>
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(msg.createdAt)}</span>
                                {isOwn && msg.read && (
                                  <CheckCheck className="w-3 h-3 text-success-from ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4 bg-card shrink-0">
                <div className="flex gap-3 max-w-2xl mx-auto">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1"
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!messageText.trim() || sendMutation.isPending}
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
