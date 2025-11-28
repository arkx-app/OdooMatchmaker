import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, CreditCard, Lock, Mail, User, Building2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const plans: Record<string, { name: string; monthlyPrice: number; yearlyPrice: number; features: string[] }> = {
  starter: {
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 279,
    features: [
      "Up to 50 qualified client leads per month",
      "Basic profile visibility",
      "Email notifications for matches",
      "Standard support",
    ],
  },
  professional: {
    name: "Professional",
    monthlyPrice: 79,
    yearlyPrice: 759,
    features: [
      "Unlimited qualified client leads",
      "Enhanced profile visibility",
      "Priority matching algorithm",
      "Client messaging system",
    ],
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: 199,
    yearlyPrice: 1910,
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom matching criteria",
      "API access for integration",
    ],
  },
};

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().min(2, "Company name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Checkout() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const planId = searchParams.get("plan") || "starter";
  const billingPeriod = searchParams.get("billing") || "monthly";
  
  const plan = plans[planId] || plans.starter;
  const isYearly = billingPeriod === "yearly";
  const price = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
  const totalPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: "", lastName: "", email: "", company: "", password: "", confirmPassword: "" },
  });

  const onLogin = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast({
        title: "Welcome back!",
        description: "You can now complete your purchase.",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast({
        title: "Account created!",
        description: "You can now complete your purchase.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = () => {
    toast({
      title: "Payment Integration Coming Soon",
      description: "Stripe payment processing will be integrated here. For now, contact us to complete your subscription.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-partner-from border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/pricing">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Checkout</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Secure checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-8">
            {!isAuthenticated ? (
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Sign in or create an account</h2>
                <p className="text-muted-foreground mb-6">
                  To complete your purchase, please sign in to your existing account or create a new one.
                </p>

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" data-testid="tab-signup">Create Account</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="email"
                                    placeholder="you@company.com"
                                    className="pl-10"
                                    data-testid="input-login-email"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10"
                                    data-testid="input-login-password"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-partner-from to-partner-to"
                          disabled={isSubmitting}
                          data-testid="button-login-submit"
                        >
                          {isSubmitting ? "Signing in..." : "Sign In & Continue"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={signupForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="John"
                                    data-testid="input-signup-firstname"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={signupForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Smith"
                                    data-testid="input-signup-lastname"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="email"
                                    placeholder="you@company.com"
                                    className="pl-10"
                                    data-testid="input-signup-email"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Your Company"
                                    className="pl-10"
                                    data-testid="input-signup-company"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    className="pl-10 pr-10"
                                    data-testid="input-signup-password"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    className="pl-10"
                                    data-testid="input-signup-confirm"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-partner-from to-partner-to"
                          disabled={isSubmitting}
                          data-testid="button-signup-submit"
                        >
                          {isSubmitting ? "Creating account..." : "Create Account & Continue"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </Card>
            ) : (
              <Card className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Payment Details</h2>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    Logged in as {user?.email}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="p-6 border-2 border-dashed border-partner-from/30 rounded-lg text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-partner-from/10 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-partner-from" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Payment Integration</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Stripe payment processing will be integrated here for secure credit card payments.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-partner-from to-partner-to"
                    size="lg"
                    data-testid="button-complete-payment"
                  >
                    Complete Payment - ${totalPrice}{isYearly ? "/year" : "/month"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By completing this purchase, you agree to our{" "}
                    <a href="#" className="underline hover:text-foreground">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
                  </p>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{plan.name} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      Billed {isYearly ? "annually" : "monthly"}
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-partner-from to-partner-to">
                    {plan.name}
                  </Badge>
                </div>

                <Separator />

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-partner-from flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${price}/mo</span>
                  </div>
                  {isYearly && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Annual discount</span>
                      <span>-{Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100)}%</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <div className="text-right">
                    <span>${totalPrice}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                </div>

                {isYearly && (
                  <p className="text-xs text-muted-foreground text-center">
                    That's just ${Math.round(plan.yearlyPrice / 12)}/month
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
