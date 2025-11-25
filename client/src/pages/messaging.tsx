import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function Messaging({ matchId }: { matchId?: string }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [messageText, setMessageText] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState(matchId);

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", selectedMatchId],
    queryFn: () =>
      fetch(`/api/messages/match/${selectedMatchId}`).then((r) => r.json()),
    enabled: !!selectedMatchId,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatchId,
          fromUserId: user.id,
          toUserId: "", // Would be the other user's ID
          body: messageText,
        }),
      }).then((r) => r.json()),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedMatchId] });
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      {selectedMatchId && (
        <Card className="p-4 space-y-4">
          <div className="h-96 bg-card rounded-lg p-4 overflow-y-auto space-y-3">
            {messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${msg.fromUserId === user.id ? "justify-end" : "justify-start"}`}
                data-testid={`message-${msg.id}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.fromUserId === user.id
                      ? "bg-client-from text-white"
                      : "bg-card border"
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMutation.mutate();
                }
              }}
              data-testid="input-message"
            />
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={!messageText || sendMutation.isPending}
              size="icon"
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
