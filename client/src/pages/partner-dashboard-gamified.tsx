import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, MessageSquare, Award, TrendingUp, LogOut } from "lucide-react";
import GuideBot from "@/components/guide-bot";
import { AchievementsList } from "@/components/achievement-badge";
import { useGamification } from "@/hooks/use-gamification";

const PARTNER_GUIDE_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Your Dashboard!",
    message: "This is where client briefs appear. Each brief is a potential opportunity to grow your business.",
    action: "Review briefs and accept those that match your expertise",
  },
  {
    id: "review_briefs",
    title: "Review Client Briefs",
    message: "Check each brief's requirements, budget, and timeline before deciding.",
    action: "Click on a brief to see full details",
  },
  {
    id: "accept_matches",
    title: "Accept Matches",
    message: "Accept briefs that align with your services and capacity. This increases your chances of getting projects.",
    action: "Use the Accept Match button to move forward",
  },
  {
    id: "messaging",
    title: "Start Conversations",
    message: "Once you accept, you can message the client to discuss project details and scope.",
    action: "Look for accepted matches in your dashboard",
  },
  {
    id: "earn_rewards",
    title: "Earn Achievements",
    message: "Accept matches, complete projects, and earn badges and points!",
    action: "Check your achievements in the sidebar",
  },
];

export default function PartnerDashboardGamified() {
  const profile = JSON.parse(localStorage.getItem("partnerProfile") || "{}");
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const { stats, recordSwipe, recordMatch, newAchievements } = useGamification("partnerGamification");

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("partnerProfile");
    navigate("/");
  };

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
    onSuccess: (data, variables) => {
      recordSwipe(variables.status === "accepted");
      if (variables.status === "accepted") {
        recordMatch();
      }
      queryClient.invalidateQueries({ queryKey: ["/api/matches", profile.id] });
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading matches...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Lead Pipeline</h1>
            <p className="text-muted-foreground">
              {matches.length} potential clients | Points: {stats.totalPoints} | Matches: {stats.totalMatches}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowAchievements(!showAchievements)}
              data-testid="button-achievements"
            >
              <Award className="w-6 h-6 mr-2" />
              Achievements
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

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
                  className="p-4 cursor-pointer hover-elevate active-elevate-2 transition-all"
                  onClick={() => setSelectedMatch(match)}
                  data-testid={`card-match-${match.id}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{match.brief?.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {match.brief?.description}
                      </p>
                      <div className="mt-3 flex gap-4 text-sm flex-wrap">
                        <span>💰 Budget: {match.brief?.budget}</span>
                        <span>⏱️ Timeline: {match.brief?.timelineWeeks} weeks</span>
                        <span>🎯 Score: {match.score}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        match.status === "accepted"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
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
          <div className="space-y-4">
            {selectedMatch ? (
              <Card className="p-6 sticky top-4 space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">{selectedMatch.brief?.title}</h3>
                  <div className="space-y-3 text-sm">
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
                </div>

                <div className="space-y-2">
                  {selectedMatch.status === "suggested" && (
                    <>
                      <Button
                        className="w-full bg-gradient-to-r from-partner-from to-partner-to text-white"
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
              <Card className="p-6 text-center text-muted-foreground sticky top-4">
                Select a match to view details
              </Card>
            )}
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
      </div>

      {/* Guide Bot */}
      <GuideBot 
        steps={PARTNER_GUIDE_STEPS} 
        isPartner={true}
      />
    </div>
  );
}
