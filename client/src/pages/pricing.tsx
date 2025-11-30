import { useState } from "react";
import { ArrowLeft, Check, Users, Sparkles, Zap, Briefcase, Star, MessageCircle, Shield, Gift } from "lucide-react";
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
    icon: Zap,
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
    icon: Users,
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
    icon: Sparkles,
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
    icon: Briefcase,
    title: "Browse Vetted Partners",
    description: "Access our curated network of qualified ERP implementation experts",
  },
  {
    icon: Star,
    title: "Smart Matching",
    description: "Get matched with partners based on your industry, budget, and project needs",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description: "Communicate directly with matched partners through our platform",
  },
  {
    icon: Shield,
    title: "Verified Reviews",
    description: "Read authentic reviews from other businesses who worked with partners",
  },
  {
    icon: Users,
    title: "Unlimited Matches",
    description: "Like and connect with as many partners as you need - no restrictions",
  },
  {
    icon: Gift,
    title: "Always Free",
    description: "No hidden fees, no credit card required - completely free forever",
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [isPartnerView, setIsPartnerView] = useState(true);

  const savings = (plan: typeof partnerPlans[0]) => {
    const yearlyCost = plan.monthlyPrice * 12;
    const savingsAmount = yearlyCost - plan.yearlyPrice;
    const percentage = Math.round((savingsAmount / yearlyCost) * 100);
    return percentage;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
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
        {/* Client/Partner Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-full">
            <button
              onClick={() => setIsPartnerView(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                !isPartnerView
                  ? "bg-gradient-to-r from-client-from to-client-to text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="toggle-client-view"
            >
              I'm a Client
            </button>
            <button
              onClick={() => setIsPartnerView(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                isPartnerView
                  ? "bg-gradient-to-r from-partner-from to-partner-to text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="toggle-partner-view"
            >
              I'm a Partner
            </button>
          </div>
        </div>

        {/* Client Pricing View */}
        {!isPartnerView && (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <Badge className="bg-gradient-to-r from-client-from to-client-to text-white">
                100% Free for Clients
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold">
                Find Your Perfect ERP Partner
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our platform is completely free for clients. No hidden fees, no premium tiers, no credit card required.
              </p>
            </div>

            {/* Free Pricing Card */}
            <div className="max-w-lg mx-auto">
              <Card className="p-8 space-y-6 border-2 border-client-from/30 bg-gradient-to-b from-card via-card to-client-from/5 shadow-xl">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-client-from to-client-to">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Client Access</h3>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-6xl font-bold bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent" data-testid="text-client-price">
                        Free
                      </span>
                    </div>
                    <p className="text-muted-foreground">Forever. No credit card needed.</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-center mb-4">Everything you need to find the right partner:</p>
                  <ul className="space-y-3">
                    {[
                      "Unlimited partner browsing",
                      "Smart matching algorithm",
                      "Detailed partner profiles",
                      "Direct messaging with matches",
                      "Project brief creation",
                      "Partner reviews & ratings",
                      "Email notifications",
                      "Full dashboard access",
                    ].map((feature, i) => (
                      <li key={i} className="flex gap-3">
                        <Check className="w-5 h-5 text-client-from flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/client/signup">
                  <Button
                    className="w-full bg-gradient-to-r from-client-from to-client-to text-white"
                    size="lg"
                    data-testid="button-client-signup"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Client Features Grid */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-center">What's Included</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientFeatures.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={i} className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-client-from/10 to-client-to/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-client-from" />
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Partner CTA for clients */}
            <div className="bg-gradient-to-r from-partner-from/10 to-partner-to/10 border rounded-lg p-8 md:p-12 text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Are You an ERP Partner?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Join our network to connect with qualified clients looking for implementation partners.
              </p>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setIsPartnerView(true)}
                data-testid="button-view-partner-pricing"
              >
                View Partner Pricing
              </Button>
            </div>
          </div>
        )}

        {/* Partner Pricing View */}
        {isPartnerView && (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <Badge className="bg-gradient-to-r from-partner-from to-partner-to text-white">
                For Partners Only
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold">
                Grow Your ERP Practice
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with qualified clients looking for Odoo implementation partners. 
                Clients use our platform for free - partners pay to unlock premium features.
              </p>

              <div className="flex items-center justify-center gap-4 pt-4">
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
                    Save up to 20%
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {partnerPlans.map((plan) => {
                const Icon = plan.icon;
                return (
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
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          plan.featured 
                            ? "bg-gradient-to-br from-partner-from to-partner-to" 
                            : "bg-muted"
                        }`}>
                          <Icon className={`w-5 h-5 ${plan.featured ? "text-white" : "text-foreground"}`} />
                        </div>
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                      </div>
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

                    <Link href={`/checkout?plan=${plan.name.toLowerCase()}&billing=${isYearly ? "yearly" : "monthly"}`}>
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
                    </Link>
                  </Card>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-partner-from/10 to-partner-to/10 border rounded-lg p-8 md:p-12 text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">Not sure which plan is right for you?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Our team can help you find the perfect plan for your Odoo partnership business. Let's connect and discuss your goals.
              </p>
              <Link href="/book-demo">
                <Button variant="outline" size="lg" data-testid="button-schedule-demo">
                  Schedule a Demo
                </Button>
              </Link>
            </div>

            <div className="text-center space-y-4 py-8 border-t">
              <h3 className="text-xl font-semibold">Looking to Find an ERP Partner?</h3>
              <p className="text-muted-foreground">
                If you're a client looking for an Odoo implementation partner, our platform is completely free for you.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsPartnerView(false)}
                data-testid="button-view-client-pricing"
              >
                View Client Pricing (Free)
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
