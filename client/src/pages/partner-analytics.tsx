import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, CheckCircle, DollarSign, ArrowLeft } from "lucide-react";

export default function PartnerAnalytics() {
  const [, navigate] = useLocation();
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");

  const { data: metrics = {} } = useQuery({
    queryKey: ["/api/analytics", profile.id],
    queryFn: () =>
      fetch(`/api/analytics/partner/${profile.id}`).then((r) => r.json()),
  });

  const conversionRate =
    metrics.matchesSent > 0
      ? Math.round((metrics.conversions / metrics.matchesSent) * 100)
      : 0;

  const stats = [
    {
      icon: Users,
      label: "Matches Sent",
      value: metrics.matchesSent || 0,
      color: "text-blue-500",
    },
    {
      icon: CheckCircle,
      label: "Conversions",
      value: metrics.conversions || 0,
      color: "text-green-500",
    },
    {
      icon: TrendingUp,
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      color: "text-purple-500",
    },
    {
      icon: DollarSign,
      label: "Total Project Value",
      value: `$${metrics.totalProjectValue || 0}`,
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/partner/dashboard")}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Partner Analytics</h1>
            <p className="text-muted-foreground">
              Your matchmaking performance and ROI tracking
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-6" data-testid={`stat-${stat.label}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-muted`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { week: "Week 1", matches: 4, conversions: 1 },
                { week: "Week 2", matches: 6, conversions: 2 },
                { week: "Week 3", matches: 5, conversions: 1 },
                { week: "Week 4", matches: 8, conversions: 3 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="matches" fill="#3b82f6" />
              <Bar dataKey="conversions" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
