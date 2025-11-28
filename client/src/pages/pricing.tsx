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
    description: "Perfect for new ERP partners building their client base",
    monthlyPrice: 29,
    yearlyPrice: 279,
    features: [
      "Up to 50 qualified client leads per month",
      "Basic profile visibility",
      "Email notifications for matches",
      "Standard support",
      "Match history (30 days)",
      "Client filtering by budget",
    ],
  },
  {
    name: "Professional",
    description: "Ideal for established partners seeking consistent growth",
    monthlyPrice: 79,
    yearlyPrice: 759,
    features: [
      "Unlimited qualified client leads",
      "Enhanced profile visibility & featured placement",
      "Priority matching algorithm",
      "Real-time notifications",
      "Match history (unlimited)",
      "Advanced filtering by industry & project size",
      "Client messaging system",
      "Priority support",
      "Performance analytics",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    description: "For agencies and consultancies managing multiple partners",
    monthlyPrice: 199,
    yearlyPrice: 1910,
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom matching criteria",
      "API access for integration",
      "Team management (multiple users)",
      "Advanced analytics dashboard",
      "White-label options",
      "Bulk operations",
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
          <h1 className="text-xl font-bold">Partner Pricing</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold">
            Partner Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your ERP business with high-quality, pre-qualified client leads. For clients, ERP Matcher is completely free.
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

        <div className="bg-card/50 border rounded-lg p-6 text-center space-y-2">
          <p className="text-lg font-semibold">💡 Pricing for Partners Only</p>
          <p className="text-muted-foreground">
            If you're a client looking for ERP partners, you can browse and match for completely free. No hidden charges, no credit card required.
          </p>
          <Link href="/split">
            <Button variant="outline" size="sm" className="mt-4">
              Browse as a Client
            </Button>
          </Link>
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
                      Billed ${plan.yearlyPrice} annually (save {savings(plan)}%)
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
                    ? "bg-gradient-to-r from-partner-from via-partner-from to-partner-to"
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

        <div className="bg-gradient-to-r from-partner-from/10 to-partner-to/10 border rounded-lg p-12 text-center space-y-4">
          <h2 className="text-3xl font-bold">Not sure which plan is right for you?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our team can help you find the perfect plan for your Odoo partnership business. Let's connect and discuss your goals.
          </p>
          <Button variant="outline" size="lg">
            Schedule a Demo
          </Button>
        </div>
      </main>
    </div>
  );
}
