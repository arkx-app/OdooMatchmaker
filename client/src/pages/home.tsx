import { Link } from "wouter";
import { Users, Briefcase, Zap, Award, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "AI-Driven Matching",
    description: "No more guessing. Our system aligns client needs with partner expertise in seconds.",
  },
  {
    icon: Award,
    title: "Verified Odoo Partners",
    description: "Only trusted and experienced professionals make it into the network.",
  },
  {
    icon: Check,
    title: "Fun, Modern UX",
    description: "Swipe like Tinder. Match like magic.",
  },
  {
    icon: Users,
    title: "Win-Win for Everyone",
    description: "Clients get clarity. Partners get qualified leads. Everyone wins.",
  },
];

const clientBenefits = [
  "Discover vetted Odoo partners",
  "Match by industry, budget, and expertise",
  "Swipe to like or skip partners",
  "Get connected instantly when there's a match",
];

const partnerBenefits = [
  "Receive clients that match your skillset",
  "Filter by modules, industries, or project size",
  "Swipe through projects you want to accept",
  "Get matched with clients ready to move",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-client-from/20 via-partner-from/20 to-partner-to/20 opacity-30" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_60%)]" aria-hidden="true" />
        
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
            Your Perfect Odoo Match Starts Here
          </h1>
          
          <p className="text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-client-from via-client-to to-partner-to bg-clip-text text-transparent">
            AI-powered matchmaking that instantly connects Odoo Clients with the right Odoo Partners.
            Fast. Smart. Accurate.
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're looking to implement Odoo, expand your modules, or find high-quality clients, Odoo Matchmaker uses intelligent matching to connect the right people—every time.
          </p>
        </div>
      </section>

      {/* Vertical Split Section */}
      <section className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-6 py-20">
        {/* Client Side */}
        <Link href="/split" data-testid="link-home-client">
          <Card className="relative group h-full min-h-[500px] overflow-hidden cursor-pointer hover-elevate active-elevate-2">
            <div className="absolute inset-0 bg-gradient-to-br from-client-from via-client-via to-client-to opacity-10" />
            <div className="relative h-full flex flex-col justify-center p-12 space-y-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-client-from/20 flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-client-from" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  I'm a Client
                </h2>
                <p className="text-lg text-muted-foreground">
                  Find the perfect Odoo expert for your project.
                </p>
              </div>

              <ul className="space-y-3">
                {clientBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-client-from flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-client-from to-client-to text-white"
                  size="lg"
                  data-testid="button-home-client"
                >
                  I'm a Client
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Completely free. No credit card needed.
              </p>
            </div>
          </Card>
        </Link>

        {/* Partner Side */}
        <Link href="/partner/signup" data-testid="link-home-partner">
          <Card className="relative group h-full min-h-[500px] overflow-hidden cursor-pointer hover-elevate active-elevate-2">
            <div className="absolute inset-0 bg-gradient-to-br from-partner-from via-partner-via to-partner-to opacity-10" />
            <div className="relative h-full flex flex-col justify-center p-12 space-y-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-partner-from/20 flex items-center justify-center">
                  <Users className="w-10 h-10 text-partner-from" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  I'm a Partner
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get high-quality, qualified Odoo leads—effortlessly.
                </p>
              </div>

              <ul className="space-y-3">
                {partnerBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-partner-from flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-partner-from to-partner-to text-white"
                  size="lg"
                  data-testid="button-home-partner"
                >
                  I'm a Partner
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Flexible plans starting at $29/month
              </p>
            </div>
          </Card>
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold">What Makes Us #1</h2>
            <p className="text-xl text-muted-foreground">The platform built by Odoo experts, for Odoo experts</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-8 hover-elevate active-elevate-2">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-client-from to-partner-to">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-client-from/10 via-transparent to-partner-to/10" aria-hidden="true" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Choose Your Path and Let AI Find Your Perfect Odoo Match
            </h2>
            <p className="text-xl text-muted-foreground">
              Your next opportunity is just one swipe away
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <Link href="/split">
              <Button 
                className="w-full bg-gradient-to-r from-client-from to-client-to text-white"
                size="lg"
                data-testid="button-cta-client"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                I'm a Client
              </Button>
            </Link>
            <Link href="/partner/signup">
              <Button 
                className="w-full bg-gradient-to-r from-partner-from to-partner-to text-white"
                size="lg"
                data-testid="button-cta-partner"
              >
                <Users className="w-4 h-4 mr-2" />
                I'm a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
