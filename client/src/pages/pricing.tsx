import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small businesses exploring Odoo partnerships",
    monthlyPrice: 29,
    yearlyPrice: 279,
    features: [
      "Up to 50 swipes per month",
      "Basic profile visibility",
      "Email notifications",
      "Standard support",
      "Match history (30 days)",
    ],
  },
  {
    name: "Professional",
    description: "Ideal for growing companies seeking quality matches",
    monthlyPrice: 79,
    yearlyPrice: 759,
    features: [
      "Unlimited swipes",
      "Enhanced profile visibility",
      "Priority matching algorithm",
      "Real-time notifications",
      "Match history (unlimited)",
      "Advanced filtering",
      "Messaging system",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    description: "For organizations requiring comprehensive solutions",
    monthlyPrice: 199,
    yearlyPrice: 1910,
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom matching criteria",
      "API access",
      "Analytics dashboard",
      "White-label options",
      "Bulk user management",
      "24/7 premium support",
      "SLA guarantees",
    ],
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const savings = (plan: typeof plans[0]) => {
    const yearlyCost = plan.monthlyPrice * 12;
    const savings = yearlyCost - plan.yearlyPrice;
    const percentage = Math.round((savings / yearlyCost) * 100);
    return percentage;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Pricing</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your business. Upgrade or downgrade anytime.
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
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 space-y-8 relative ${
                plan.featured
                  ? "border-primary border-2 shadow-2xl scale-105 bg-gradient-to-b from-card via-card to-primary/5"
                  : ""
              }`}
              data-testid={`card-plan-${plan.name.toLowerCase()}`}
            >
              {plan.featured && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary"
                  data-testid="badge-popular"
                >
                  Most Popular
                </Badge>
              )}

              <div className="space-y-4">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold" data-testid={`text-price-${plan.name.toLowerCase()}`}>
                      ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-muted-foreground">
                      Billed ${plan.yearlyPrice} annually
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-3">
                    <Check className="w-5 h-5 text-success-from flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.featured
                    ? "bg-gradient-to-r from-primary via-primary to-primary/90"
                    : ""
                }`}
                variant={plan.featured ? "default" : "outline"}
                size="lg"
                data-testid={`button-select-${plan.name.toLowerCase()}`}
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4 pt-8">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="text-primary hover:underline">
              Compare all features
            </a>
            <a href="#" className="text-primary hover:underline">
              Enterprise solutions
            </a>
            <a href="#" className="text-primary hover:underline">
              Contact sales
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
