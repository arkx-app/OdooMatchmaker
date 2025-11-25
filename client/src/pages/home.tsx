import { Link } from "wouter";
import { ArrowRight, Sparkles, Users, Zap, Shield, TrendingUp, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Matching",
    description: "Our intelligent algorithm analyzes your needs and connects you with the perfect Odoo partner in seconds.",
  },
  {
    icon: Shield,
    title: "Verified Partners Only",
    description: "Every partner in our network is vetted and verified for quality and expertise.",
  },
  {
    icon: TrendingUp,
    title: "Proven Results",
    description: "Join thousands of successful matches that have transformed businesses worldwide.",
  },
  {
    icon: Star,
    title: "Premium Experience",
    description: "Enjoy a modern, intuitive interface that makes finding your match effortless.",
  },
];

const stats = [
  { value: "1K+", label: "Active Partners" },
  { value: "5K+", label: "Successful Matches" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Support Available" },
];

const benefits = [
  "No credit card required to get started",
  "Free for clients, flexible pricing for partners",
  "Instant matching with verified professionals",
  "Secure and confidential platform",
  "Real-time notifications and updates",
  "Dedicated support team",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Partner Colors */}
      <section className="relative overflow-hidden min-h-[45vh] flex items-center justify-center px-6">
        {/* Gradient Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-partner-from via-partner-via to-partner-to opacity-95"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_60%)]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(139,92,246,0.2),transparent_50%)]" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-4 py-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">AI-Powered Matchmaking</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Odoo Match
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Connect with verified Odoo partners or discover qualified clients. 
            Our intelligent platform makes finding the right match effortless.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/get-started">
              <Button 
                size="lg"
                className="bg-white text-partner-from hover:bg-white/90 text-base px-8 py-3 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 text-base px-8 py-3 h-auto font-semibold"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-partner-from to-partner-to bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Why Choose Odoo Matchmaker?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most trusted platform for connecting Odoo clients with expert partners
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-8 hover-elevate active-elevate-2 border-2 hover:border-partner-from/50 transition-colors">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-partner-from to-partner-to shadow-lg">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-partner-from/5 via-partner-via/5 to-partner-to/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground">
              A platform designed with your success in mind
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card/50 hover-elevate">
                <CheckCircle2 className="w-5 h-5 text-partner-from flex-shrink-0 mt-0.5" />
                <span className="text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-partner-from/10 via-partner-via/10 to-partner-to/10" aria-hidden="true" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="space-y-4 mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users who have found their ideal Odoo partnership
            </p>
          </div>

          <Link href="/get-started" className="inline-block">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-partner-from to-partner-to text-white hover:opacity-90 text-base px-12 py-3 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 mt-12 mb-12"
              data-testid="button-cta-get-started"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
