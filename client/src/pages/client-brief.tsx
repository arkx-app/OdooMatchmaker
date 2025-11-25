import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const modules = ["Accounting", "CRM", "Sales", "Inventory", "HR", "Manufacturing", "Website"];
const industries = ["Technology", "Retail", "Finance", "Healthcare", "Manufacturing", "Education", "Real Estate"];

export default function ClientBrief() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    try {
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: profile.id,
          ...formData,
          timelineWeeks: parseInt(formData.timelineWeeks) || undefined,
        }),
      }).then((r) => r.json());

      queryClient.invalidateQueries({ queryKey: ["/api/briefs"] });
      toast({ title: "Brief created! Matches are being generated..." });
      navigate("/client/swipe");
    } catch (error) {
      toast({ title: "Failed to create brief", variant: "destructive" });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Describe Your Project</h1>
        <p className="text-muted-foreground mb-8">
          Help us find the perfect partner for your Odoo implementation
        </p>

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
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? "Creating brief..." : "Find Partners"}
          </Button>
        </form>
      </div>
    </div>
  );
}
