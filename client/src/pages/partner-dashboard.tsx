import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, MessageSquare } from "lucide-react";

export default function PartnerDashboard() {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/matches", profile.id],
    queryFn: () =>
      fetch(`/api/matches/partner/${profile.id}`).then((r) => r.json()),
  });

  const updateMatchMutation = useMutation({
    mutationFn: ({ matchId, status }: { matchId: string; status: string }) =>
      fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", profile.id] });
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading matches...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My Lead Pipeline</h1>
        <p className="text-muted-foreground mb-8">
          {matches.length} potential clients waiting for your response
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Matches List */}
          <div className="lg:col-span-2 space-y-3">
            {matches.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No matches yet. Check back soon!</p>
              </Card>
            ) : (
              matches.map((match: any) => (
                <Card
                  key={match.id}
                  className="p-4 cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setSelectedMatch(match)}
                  data-testid={`card-match-${match.id}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{match.brief?.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {match.brief?.description}
                      </p>
                      <div className="mt-3 flex gap-4 text-sm">
                        <span>Budget: {match.brief?.budget}</span>
                        <span>Score: {match.score}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        match.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`} data-testid={`status-${match.id}`}>
                        {match.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Details Panel */}
          <div>
            {selectedMatch ? (
              <Card className="p-6 sticky top-4">
                <h3 className="font-semibold mb-4">{selectedMatch.brief?.title}</h3>
                <div className="space-y-3 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <p className="font-medium">{selectedMatch.brief?.budget}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeline:</span>
                    <p className="font-medium">{selectedMatch.brief?.timelineWeeks} weeks</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Why This Match:</span>
                    <ul className="mt-2 space-y-1">
                      {(selectedMatch.reasons || []).map((reason: string, i: number) => (
                        <li key={i} className="text-xs">• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedMatch.status === "suggested" && (
                    <>
                      <Button
                        className="w-full bg-partner-from text-white"
                        onClick={() => updateMatchMutation.mutate({ matchId: selectedMatch.id, status: "accepted" })}
                        data-testid="button-accept"
                      >
                        Accept Match
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => updateMatchMutation.mutate({ matchId: selectedMatch.id, status: "rejected" })}
                        data-testid="button-reject"
                      >
                        Skip
                      </Button>
                    </>
                  )}
                  {selectedMatch.status === "accepted" && (
                    <Button className="w-full" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Client
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                Select a match to view details
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
