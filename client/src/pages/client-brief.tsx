import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { LogOut, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const modules = ["Accounting", "CRM", "Sales", "Inventory", "HR", "Manufacturing", "Website"];

interface BriefsResponse {
  briefs: any[];
  hasProfile: boolean;
  clientId?: string;
}

export default function ClientBrief() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: briefsData, isLoading: briefsLoading } = useQuery<BriefsResponse>({
    queryKey: ["/api/my/briefs"],
    queryFn: async () => {
      const res = await fetch("/api/my/briefs", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch briefs");
      }
      return res.json();
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/client/signup");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (briefsData && briefsData.briefs && briefsData.briefs.length > 0) {
      navigate("/client/swipe");
    }
  }, [briefsData, navigate]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("profile");
    navigate("/");
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    timelineWeeks: "",
    modules: [] as string[],
    painPoints: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!briefsData?.clientId) {
      toast({ title: "Please complete your profile first", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientId: briefsData.clientId,
          ...formData,
          timelineWeeks: parseInt(formData.timelineWeeks) || undefined,
        }),
      }).then((r) => r.json());

      queryClient.invalidateQueries({ queryKey: ["/api/briefs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my/briefs"] });
      toast({ title: "Brief created! Matches are being generated..." });
      navigate("/client/swipe");
    } catch (error) {
      toast({ title: "Failed to create brief", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleModule = (module: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter((m) => m !== module)
        : [...prev.modules, module],
    }));
  };

  if (authLoading || briefsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!briefsData?.hasProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <p className="text-muted-foreground">
            Please complete your client profile before creating a project brief.
          </p>
          <Link href="/client/signup">
            <Button className="w-full" data-testid="button-complete-profile">
              Complete Profile
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent">
            Create Project Brief
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Describe Your Project</h2>
          <p className="text-muted-foreground">
            Help us find the perfect partner for your Odoo implementation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Project Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Title</label>
                <Input
                  placeholder="e.g., Odoo ERP Implementation for Retail"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  data-testid="input-title"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your project needs, goals, and any specific requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  data-testid="input-description"
                  className="min-h-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Budget</label>
                  <Input
                    placeholder="e.g., $50,000 - $100,000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                    data-testid="input-budget"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Timeline (weeks)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    value={formData.timelineWeeks}
                    onChange={(e) => setFormData({ ...formData, timelineWeeks: e.target.value })}
                    data-testid="input-timeline"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Odoo Modules Needed</h2>
            <div className="grid grid-cols-2 gap-3">
              {modules.map((module) => (
                <button
                  key={module}
                  type="button"
                  onClick={() => toggleModule(module)}
                  className={`p-3 rounded-lg border transition-colors ${
                    formData.modules.includes(module)
                      ? "bg-client-from text-white border-client-from"
                      : "bg-card border-border hover:bg-card/80"
                  }`}
                  data-testid={`button-module-${module}`}
                >
                  {module}
                </button>
              ))}
            </div>
          </Card>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-client-from to-client-to text-white"
            size="lg"
            disabled={isSubmitting}
            data-testid="button-submit"
          >
            {isSubmitting ? "Creating brief..." : "Find Partners"}
          </Button>
        </form>
      </div>
    </div>
  );
}
