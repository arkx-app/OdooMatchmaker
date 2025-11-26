import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Mail, Lock, User, Globe, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  "Purchase",
  "Point of Sale",
  "Website Builder",
  "Marketing Automation",
  "Helpdesk",
  "Field Service",
  "Custom Modules",
];

const odooExperienceLevels = [
  { value: "none", label: "No experience - New to Odoo" },
  { value: "beginner", label: "Beginner - Basic understanding" },
  { value: "intermediate", label: "Intermediate - Used Odoo before" },
  { value: "advanced", label: "Advanced - Extensive Odoo experience" },
];

const urgencyLevels = [
  { value: "asap", label: "ASAP - Need it immediately" },
  { value: "soon", label: "Soon - Within the next month" },
  { value: "flexible", label: "Flexible - No rush, within 3 months" },
  { value: "exploratory", label: "Exploratory - Just researching options" },
];

const clientSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  company: z.string().min(1, "Company name is required"),
  website: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  budget: z.string().min(1, "Budget is required"),
  projectTimeline: z.string().optional(),
  odooModules: z.array(z.string()).min(1, "Please select at least one module"),
  odooExperience: z.string().min(1, "Please select your experience level"),
  urgency: z.string().min(1, "Please select your urgency level"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ClientSignupForm = z.infer<typeof clientSignupSchema>;

export default function ClientSignup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  const form = useForm<ClientSignupForm>({
    resolver: zodResolver(clientSignupSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      company: "",
      website: "",
      industry: "Technology",
      budget: "$50,000 - $100,000",
      projectTimeline: "Soon (3-6 months)",
      odooModules: [],
      odooExperience: "",
      urgency: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ClientSignupForm) => {
      const registerResponse = await apiRequest("POST", "/api/auth/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        if (registerResponse.status === 409) {
          throw new Error("This email is already registered. Please sign in instead.");
        }
        throw new Error(error.message || "Registration failed");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      const profileResponse = await apiRequest("POST", "/api/auth/complete-signup", {
        role: "client",
        company: data.company,
        website: data.website || null,
        industry: data.industry,
        budget: data.budget,
        projectTimeline: data.projectTimeline || null,
        odooModules: data.odooModules,
        odooExperience: data.odooExperience,
        urgency: data.urgency,
      });
      
      if (!profileResponse.ok) {
        const error = await profileResponse.json();
        throw new Error(error.message || "Profile creation failed");
      }
      
      return await profileResponse.json();
    },
    onSuccess: (responseData: any) => {
      localStorage.setItem("clientProfile", JSON.stringify(responseData));
      sessionStorage.removeItem("pendingRole");
      setSuccess(true);
      toast({
        title: "Welcome aboard!",
        description: "Your account and profile have been created successfully.",
      });
      setTimeout(() => navigate("/client/swipe"), 2000);
    },
    onError: (error: any) => {
      console.error("Signup error:", error);
      const isEmailExists = error?.message?.includes("already registered");
      toast({
        title: isEmailExists ? "Email Already Registered" : "Error",
        description: isEmailExists 
          ? "This email is already registered. Please sign in instead."
          : error?.message || "Failed to create account. Please try again.",
        variant: "destructive",
        action: isEmailExists ? (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        ) : undefined,
      });
    },
  });

  const onSubmit = (data: ClientSignupForm) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/client/swipe");
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold">Welcome!</h2>
          <p className="text-muted-foreground">
            Redirecting you to create your first project brief...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/get-started">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Client Sign Up</h1>
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
              Create your account and tell us about your business needs
            </p>
          </div>

          <Card className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="John" className="pl-10" {...field} data-testid="input-first-name" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="email" placeholder="you@company.com" className="pl-10" {...field} data-testid="input-email" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="Min 6 characters" className="pl-10" {...field} data-testid="input-password" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="Confirm password" className="pl-10" {...field} data-testid="input-confirm-password" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Company Information</h3>

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
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Website</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://yourcompany.com" className="pl-10" {...field} data-testid="input-website" />
                          </div>
                        </FormControl>
                        <FormDescription>Optional - helps partners learn about your business</FormDescription>
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
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Odoo Modules Needed</h3>
                  <p className="text-sm text-muted-foreground">
                    Select all the modules you need for your project
                  </p>

                  <FormField
                    control={form.control}
                    name="odooModules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modules</FormLabel>
                        <div className="space-y-3">
                          {field.value && field.value.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {field.value.map((module) => (
                                <Badge key={module} variant="secondary" className="gap-1">
                                  {module}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      field.onChange(field.value?.filter((m) => m !== module) || []);
                                    }}
                                    className="ml-1 rounded-full hover:bg-muted"
                                    data-testid={`button-remove-module-${module}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {odooModules.map((module) => {
                              const isSelected = field.value?.includes(module);
                              return (
                                <div key={module} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`module-${module}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), module]);
                                      } else {
                                        field.onChange(field.value?.filter((m) => m !== module) || []);
                                      }
                                    }}
                                    data-testid={`checkbox-module-${module}`}
                                  />
                                  <label
                                    htmlFor={`module-${module}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {module}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Your Experience & Timeline</h3>
                  <p className="text-sm text-muted-foreground">
                    Help us match you with the right partners
                  </p>

                  <FormField
                    control={form.control}
                    name="odooExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Odoo Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-experience">
                              <SelectValue placeholder="How familiar are you with Odoo?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {odooExperienceLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
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
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How Soon Do You Need This?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-urgency">
                              <SelectValue placeholder="What's your timeline?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {urgencyLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
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
                    name="projectTimeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-timeline">
                              <SelectValue placeholder="How long do you expect this project to take?" />
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
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-client-from to-client-to hover:opacity-90"
                  size="lg"
                  disabled={mutation.isPending}
                  data-testid="button-submit"
                >
                  {mutation.isPending ? "Creating Account..." : "Create Account & Get Started"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
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
