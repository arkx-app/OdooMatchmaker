import { useState } from "react";
import { ArrowLeft, Check, Briefcase, Users, Sparkles, Shield, Zap, MessageCircle, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const partnerPlans = [
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

const clientFeatures = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description: "Our intelligent algorithm connects you with the perfect partner for your needs",
  },
  {
    icon: Shield,
    title: "Verified Partners Only",
    description: "Every partner is vetted and verified for quality and expertise",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description: "Chat directly with partners to discuss your project requirements",
  },
  {
    icon: Zap,
    title: "Instant Connections",
    description: "Get matched and connected with partners in seconds, not days",
  },
  {
    icon: Star,
    title: "Partner Reviews",
    description: "Read reviews and ratings from other clients before you decide",
  },
  {
    icon: Users,
    title: "Multiple Matches",
    description: "Compare multiple partners to find the best fit for your project",
  },
];

export default function Pricing() {
  const [isPartner, setIsPartner] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const savings = (plan: typeof partnerPlans[0]) => {
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

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your role to see the pricing that applies to you
          </p>

          <div className="flex justify-center pt-4">
            <div className="inline-flex rounded-lg border overflow-hidden p-1 bg-muted/50">
              <button
                onClick={() => setIsPartner(false)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                  !isPartner
                    ? "bg-gradient-to-r from-client-from to-client-to text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-select-client"
              >
                <Briefcase className="w-5 h-5" />
                <span>I'm a Client</span>
              </button>
              <button
                onClick={() => setIsPartner(true)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                  isPartner
                    ? "bg-gradient-to-r from-partner-from to-partner-to text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-select-partner"
              >
                <Users className="w-5 h-5" />
                <span>I'm a Partner</span>
              </button>
            </div>
          </div>
        </div>

        {!isPartner ? (
          <div className="space-y-12">
            <Card className="max-w-3xl mx-auto p-8 md:p-12 text-center space-y-8 border-2 border-client-from/30 bg-gradient-to-b from-card via-card to-client-from/5">
              <Badge className="bg-gradient-to-r from-client-from to-client-to text-white text-lg px-4 py-1">
                100% Free
              </Badge>
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent">
                    $0
                  </span>
                  <span className="text-2xl text-muted-foreground font-normal"> / forever</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                  Finding your perfect Odoo partner should be easy and free. No hidden costs, no credit card required.
                </p>
              </div>

              <Link href="/get-started?role=client">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-client-from to-client-to text-white px-8"
                  data-testid="button-get-started-client"
                >
                  Get Started Free
                </Button>
              </Link>
            </Card>

            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-center">Everything You Need, Completely Free</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="p-6 space-y-3">
                      <div className="w-12 h-12 rounded-lg bg-client-from/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-client-from" />
                      </div>
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-r from-client-from/10 to-client-to/10 border rounded-lg p-8 md:p-12 text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Ready to Find Your Perfect Match?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Join thousands of clients who have found their ideal Odoo partner through our platform.
              </p>
              <Link href="/get-started?role=client">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-client-from to-client-to text-white"
                  data-testid="button-start-matching"
                >
                  Start Matching Now
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
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

            <div className="grid md:grid-cols-3 gap-8">
              {partnerPlans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`p-8 space-y-8 relative ${
                    plan.featured
                      ? "border-partner-from border-2 shadow-2xl md:scale-105 bg-gradient-to-b from-card via-card to-partner-from/5"
                      : ""
                  }`}
                  data-testid={`card-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.featured && (
                    <Badge
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-partner-from to-partner-to"
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

            <div className="bg-gradient-to-r from-partner-from/10 to-partner-to/10 border rounded-lg p-8 md:p-12 text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Not sure which plan is right for you?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Our team can help you find the perfect plan for your Odoo partnership business. Let's connect and discuss your goals.
              </p>
              <Button variant="outline" size="lg" data-testid="button-schedule-demo">
                Schedule a Demo
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
