import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LogOut, ArrowLeft, Euro } from "lucide-react";

const modules = ["Accounting", "CRM", "Sales", "Inventory", "HR", "Manufacturing", "Website"];

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Education",
  "Real Estate",
  "Other",
];

const BUDGET_STEPS = [
  0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
  2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000,
  4200, 4400, 4600, 4800, 5000, 5500, 6000, 6500, 7000, 7500,
  8000, 8500, 9000, 9500, 10000,
  10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000, 14500, 15000,
  16000, 17000, 18000, 19000, 20000, 22000, 24000, 26000, 28000, 30000,
  32000, 34000, 36000, 38000, 40000, 42000, 44000, 46000, 48000, 50000,
  52500, 55000, 57500, 60000, 62500, 65000, 67500, 70000, 75000, 80000,
  85000, 90000, 95000, 100000, 110000, 120000, 130000, 140000, 150000,
  160000, 170000, 180000, 190000, 200000, 210000, 220000, 230000, 240000, 250000
];

function BudgetSlider({ 
  value, 
  onChange, 
  className = "" 
}: { 
  value: number; 
  onChange: (value: number) => void;
  className?: string;
}) {
  const sliderIndex = useMemo(() => {
    let closest = 0;
    let minDiff = Math.abs(BUDGET_STEPS[0] - value);
    for (let i = 1; i < BUDGET_STEPS.length; i++) {
      const diff = Math.abs(BUDGET_STEPS[i] - value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    }
    return closest;
  }, [value]);

  const handleSliderChange = useCallback((values: number[]) => {
    const index = values[0];
    onChange(BUDGET_STEPS[index]);
  }, [onChange]);

  const formatBudget = (amount: number) => {
    if (amount >= 1000) {
      return new Intl.NumberFormat('de-DE', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-center">
        <div className="text-3xl font-bold bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent">
          {formatBudget(value)}
        </div>
      </div>
      <Slider
        value={[sliderIndex]}
        onValueChange={handleSliderChange}
        max={BUDGET_STEPS.length - 1}
        step={1}
        className="w-full"
        data-testid="slider-budget"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatBudget(0)}</span>
        <span>{formatBudget(50000)}</span>
        <span>{formatBudget(150000)}</span>
        <span>{formatBudget(250000)}</span>
      </div>
    </div>
  );
}

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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: 50000,
    timelineWeeks: "",
    modules: [] as string[],
    painPoints: [] as string[],
  });

  const [profileData, setProfileData] = useState({
    company: "",
    industry: "Technology",
    budget: 50000,
  });

  const formatBudgetString = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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

  const profileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const response = await apiRequest("POST", "/api/auth/complete-signup", {
        role: "client",
        company: data.company,
        industry: data.industry,
        budget: formatBudgetString(data.budget),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Profile creation failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/briefs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile completed!",
        description: "You can now create your project brief.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to complete profile",
        variant: "destructive",
      });
    },
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.company) {
      toast({ title: "Please enter your company name", variant: "destructive" });
      return;
    }
    profileMutation.mutate(profileData);
  };

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
          budget: formatBudgetString(formData.budget),
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
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/client/dashboard")}
              data-testid="button-back-profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout-profile"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>
        
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Almost There!</h2>
            <p className="text-muted-foreground">
              Complete your profile to start creating project briefs
            </p>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <Card className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  placeholder="Acme Corporation"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  required
                  data-testid="input-profile-company"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Industry</label>
                <Select
                  value={profileData.industry}
                  onValueChange={(value) => setProfileData({ ...profileData, industry: value })}
                >
                  <SelectTrigger data-testid="select-profile-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Project Budget</label>
                <BudgetSlider
                  value={profileData.budget}
                  onChange={(value) => setProfileData({ ...profileData, budget: value })}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-client-from to-client-to text-white"
                disabled={profileMutation.isPending}
                data-testid="button-complete-profile"
              >
                {profileMutation.isPending ? "Saving..." : "Complete Profile"}
              </Button>
            </Card>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/client/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
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
            Help us find the perfect partner for your ERP implementation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Project Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Title</label>
                <Input
                  placeholder="e.g., ERP Implementation for Retail"
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

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Project Budget</label>
                  <BudgetSlider
                    value={formData.budget}
                    onChange={(value) => setFormData({ ...formData, budget: value })}
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
            <h2 className="text-lg font-semibold mb-4">ERP Modules Needed</h2>
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
