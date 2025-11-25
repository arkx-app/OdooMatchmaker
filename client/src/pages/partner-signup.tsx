import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { insertPartnerSchema, type InsertPartner } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const availableServices = [
  "Implementation",
  "Customization",
  "Integration",
  "Training",
  "Support",
  "Consulting",
  "Migration",
  "Development",
];

export default function PartnerSignup() {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");

  const form = useForm<InsertPartner>({
    resolver: zodResolver(insertPartnerSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      industry: "",
      services: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertPartner) => {
      const response = await apiRequest("POST", "/api/partners", data);
      return await response.json();
    },
    onSuccess: (responseData: any) => {
      localStorage.setItem("partnerProfile", JSON.stringify(responseData));
      setSuccess(true);
      toast({
        title: "Partner profile created!",
        description: "You're now part of our network.",
      });
      setTimeout(() => {
        window.location.href = "/partner/dashboard";
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addService = (service: string) => {
    if (service && !selectedServices.includes(service)) {
      const newServices = [...selectedServices, service];
      setSelectedServices(newServices);
      form.setValue("services", newServices);
      setServiceInput("");
    }
  };

  const removeService = (service: string) => {
    const newServices = selectedServices.filter((s) => s !== service);
    setSelectedServices(newServices);
    form.setValue("services", newServices);
  };

  const onSubmit = (data: InsertPartner) => {
    if (selectedServices.length === 0) {
      toast({
        title: "Services required",
        description: "Please add at least one service you offer.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({ ...data, services: selectedServices });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-success-from/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-success-from" />
          </div>
          <h2 className="text-3xl font-bold">Welcome to the Network!</h2>
          <p className="text-muted-foreground">
            Redirecting you to your dashboard to start receiving client matches...
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
          <h1 className="text-xl font-bold">Partner Sign Up</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-partner-from to-partner-to bg-clip-text text-transparent">
              Join Our Partner Network
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect with clients actively seeking Odoo expertise
            </p>
          </div>

          <Card className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@partner.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Partner Solutions Inc" {...field} data-testid="input-company" />
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
                      <FormLabel>Primary Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-industry">
                            <SelectValue placeholder="Select your primary industry" />
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

                <FormItem>
                  <FormLabel>Services Offered</FormLabel>
                  <FormDescription>
                    Select from common services or add your own
                  </FormDescription>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {availableServices.map((service) => (
                        <Button
                          key={service}
                          type="button"
                          variant={selectedServices.includes(service) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (selectedServices.includes(service)) {
                              removeService(service);
                            } else {
                              addService(service);
                            }
                          }}
                          data-testid={`button-service-${service}`}
                        >
                          {service}
                        </Button>
                      ))}
                    </div>

                    {selectedServices.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-md">
                        {selectedServices.map((service) => (
                          <Badge key={service} variant="secondary" className="gap-1" data-testid={`badge-service-${service}`}>
                            {service}
                            <button
                              type="button"
                              onClick={() => removeService(service)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom service..."
                        value={serviceInput}
                        onChange={(e) => setServiceInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addService(serviceInput);
                          }
                        }}
                        data-testid="input-custom-service"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => addService(serviceInput)}
                        data-testid="button-add-service"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </FormItem>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-partner-from to-partner-to hover:opacity-90"
                  size="lg"
                  disabled={mutation.isPending}
                  data-testid="button-submit"
                >
                  {mutation.isPending ? "Creating Profile..." : "Join Network"}
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
