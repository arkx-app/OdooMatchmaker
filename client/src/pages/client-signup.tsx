import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

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

const budgetRanges = [
  "< $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000 - $100,000",
  "> $100,000",
];

const projectTimelines = [
  "Urgent (1-3 months)",
  "Soon (3-6 months)",
  "Planned (6-12 months)",
  "Exploratory",
];

const odooModules = [
  "Accounting",
  "CRM",
  "Sales",
  "Inventory",
  "HR",
  "Manufacturing",
  "E-commerce",
  "Project Management",
  "Custom Modules",
  "Other",
];

const clientProfileSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  budget: z.string().min(1, "Budget is required"),
  projectTimeline: z.string().optional(),
  odooModules: z.string().optional(),
});

type ClientProfileForm = z.infer<typeof clientProfileSchema>;

export default function ClientSignup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      sessionStorage.setItem("pendingRole", "client");
      window.location.href = "/api/login";
    }
  }, [isLoading, isAuthenticated]);

  const form = useForm<ClientProfileForm>({
    resolver: zodResolver(clientProfileSchema),
    mode: "onBlur",
    defaultValues: {
      company: "",
      industry: "Technology",
      budget: "$50,000 - $100,000",
      projectTimeline: "Soon (3-6 months)",
      odooModules: "CRM",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ClientProfileForm) => {
      const response = await apiRequest("POST", "/api/auth/complete-signup", {
        role: "client",
        company: data.company,
        industry: data.industry,
        budget: data.budget,
        projectTimeline: data.projectTimeline || null,
        odooModules: data.odooModules || null,
      });
      return await response.json();
    },
    onSuccess: (responseData: any) => {
      localStorage.setItem("clientProfile", JSON.stringify(responseData));
      sessionStorage.removeItem("pendingRole");
      setSuccess(true);
      toast({
        title: "Welcome aboard!",
        description: "Your profile has been created successfully.",
      });
      setTimeout(() => navigate("/client/swipe"), 2000);
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientProfileForm) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-success-from/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-success-from" />
          </div>
          <h2 className="text-3xl font-bold">Welcome!</h2>
          <p className="text-muted-foreground">
            Redirecting you to find your perfect Odoo Partner...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Complete Your Profile</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent">
              Find Your Perfect Partner
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome{user?.firstName ? `, ${user.firstName}` : ''}! Tell us about your business needs
            </p>
          </div>

          <Card className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} data-testid="input-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-industry">
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Budget</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-budget">
                            <SelectValue placeholder="Select your budget range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Help us match you with the right partners by sharing more about your project
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="projectTimeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Timeline</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-timeline">
                            <SelectValue placeholder="When do you need this completed?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projectTimelines.map((timeline) => (
                            <SelectItem key={timeline} value={timeline}>
                              {timeline}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="odooModules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odoo Modules Needed</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-modules">
                            <SelectValue placeholder="Which modules do you need?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {odooModules.map((module) => (
                            <SelectItem key={module} value={module}>
                              {module}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-client-from to-client-to hover:opacity-90"
                  size="lg"
                  disabled={mutation.isPending}
                  data-testid="button-submit"
                >
                  {mutation.isPending ? "Creating Profile..." : "Start Matching"}
                </Button>
              </form>
            </Form>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </main>
    </div>
  );
}
