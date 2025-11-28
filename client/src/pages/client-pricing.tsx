import { useState } from "react";
import { ArrowLeft, Check, Crown, Zap, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const clientPlans = [
  {
    name: "Basic",
    description: "Get started with essential partner matching",
    monthlyPrice: 9.99,
    yearlyPrice: 99,
    icon: Zap,
    features: [
      "View up to 10 partner matches",
      "Basic partner profiles",
      "Email match notifications",
      "Standard support",
      "Save favorite partners",
      "1 active project brief",
    ],
  },
  {
    name: "Pro",
    description: "Perfect for businesses actively seeking implementation",
    monthlyPrice: 24.99,
    yearlyPrice: 249,
    icon: Crown,
    features: [
      "Unlimited partner matches",
      "Full partner profiles & ratings",
      "Priority matching algorithm",
      "Direct messaging with partners",
      "Match history (unlimited)",
      "Up to 5 active project briefs",
      "Partner comparison tools",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    description: "For organizations with complex implementation needs",
    monthlyPrice: 49.99,
    yearlyPrice: 499,
    icon: Sparkles,
    features: [
      "Everything in Pro",
      "Dedicated success manager",
      "Custom matching criteria",
      "Multi-department briefs",
      "Team collaboration features",
      "Advanced analytics",
      "RFP management tools",
      "Vendor assessment reports",
      "24/7 premium support",
    ],
  },
];

export default function ClientPricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [, setLocation] = useLocation();

  const savings = (plan: typeof clientPlans[0]) => {
    const yearlyCost = plan.monthlyPrice * 12;
    const savings = yearlyCost - plan.yearlyPrice;
    const percentage = Math.round((savings / yearlyCost) * 100);
    return percentage;
  };

  const handleSelectPlan = (planName: string) => {
    localStorage.setItem("selectedClientPlan", planName);
    setLocation("/client/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/client/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Upgrade Your Account</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-6">
          <Badge className="bg-gradient-to-r from-client-from to-client-to text-white">
            Client Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            Find Your Perfect ERP Partner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock more matches, direct messaging, and advanced tools to find the right ERP implementation partner for your business.
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              data-testid="switch-billing-period"
            />
            <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="default" className="bg-gradient-to-r from-success-from to-success-to">
                Save up to 17%
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {clientPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`p-6 lg:p-8 space-y-6 relative ${
                  plan.featured
                    ? "border-client-from border-2 shadow-2xl md:scale-105 bg-gradient-to-b from-card via-card to-client-from/5"
                    : ""
                }`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.featured && (
                  <Badge
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-client-from to-client-to text-white"
                    data-testid="badge-popular"
                  >
                    Most Popular
                  </Badge>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.featured 
                        ? "bg-gradient-to-br from-client-from to-client-to text-white"
                        : "bg-muted"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold" data-testid={`text-price-${plan.name.toLowerCase()}`}>
                        ${isYearly ? (plan.yearlyPrice / 12).toFixed(2) : plan.monthlyPrice.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {isYearly && (
                      <p className="text-sm text-muted-foreground">
                        Billed ${plan.yearlyPrice} annually (save {savings(plan)}%)
                      </p>
                    )}
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.featured ? "text-client-from" : "text-success-from"
                      }`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.featured
                      ? "bg-gradient-to-r from-client-from to-client-to text-white"
                      : ""
                  }`}
                  variant={plan.featured ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleSelectPlan(plan.name)}
                  data-testid={`button-select-${plan.name.toLowerCase()}`}
                >
                  {plan.featured ? "Get Pro" : `Get ${plan.name}`}
                </Button>
              </Card>
            );
          })}
        </div>

        <Card className="p-8 bg-muted/30 border-dashed">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Still on the free plan?</h3>
              <p className="text-muted-foreground">
                You can browse up to 3 partners for free. Upgrade anytime to unlock more matches and features.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/client/swipe">
                <Button variant="outline" data-testid="button-continue-free">
                  Continue Free
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <div className="text-center space-y-4 py-8">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            <div className="p-4 rounded-lg bg-card border">
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <h4 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
