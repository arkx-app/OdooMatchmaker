import { Link } from "wouter";
import { ArrowLeft, Check, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  "Receive high-quality, pre-qualified client leads",
  "Match by industry, budget, and project size",
  "Review client needs and decide what to accept",
  "Get matched with serious clients ready to move forward",
  "Flexible pricing plans for all business sizes",
];

const features = [
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Access consistent streams of qualified leads without spending on marketing",
  },
  {
    icon: Check,
    title: "Smart Matching",
    description: "Our AI connects you with clients that match your expertise and capacity",
  },
  {
    icon: Users,
    title: "Professional Network",
    description: "Join a verified community of trusted ERP partners",
  },
];

export default function PartnerHome() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Grow Your ERP Business</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-partner-from/10 flex items-center justify-center">
              <Users className="w-12 h-12 text-partner-from" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-partner-from to-partner-to bg-clip-text text-transparent">
              Get High-Quality ERP Leads
            </h1>
            <p className="text-2xl text-muted-foreground">
              Grow your ERP partnership business with qualified client matches
            </p>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop spending time and money on marketing. ERP Matcher delivers pre-qualified clients directly to you—matched by industry, budget, and project requirements. Browse opportunities, accept what fits, and get connected instantly.
          </p>
        </section>

        {/* Benefits Card */}
        <Card className="p-12 bg-gradient-to-br from-partner-from/5 via-transparent to-partner-to/5">
          <h2 className="text-2xl font-bold mb-6">Why Partner With Us?</h2>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-6 h-6 text-partner-from flex-shrink-0 mt-0.5" />
                <span className="text-lg">{benefit}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover-elevate active-elevate-2">
                <div className="flex flex-col items-start gap-4">
                  <div className="p-3 rounded-lg bg-partner-from/10">
                    <Icon className="w-6 h-6 text-partner-from" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <section className="space-y-6 text-center">
          <div>
            <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join our network of verified Odoo partners and start receiving qualified leads today
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link href="/partner/signup">
              <Button 
                className="w-full bg-gradient-to-r from-partner-from to-partner-to text-white"
                size="lg"
                data-testid="button-signup"
              >
                Create Profile
              </Button>
            </Link>
            <Link href="/pricing">
              <Button 
                variant="outline"
                size="lg"
                data-testid="button-pricing"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            Questions? <a href="mailto:support@odoomatchmaker.com" className="text-partner-from hover:underline">Contact us</a>
          </p>
        </section>
      </main>
    </div>
  );
}
