import { Link } from "wouter";
import { ArrowLeft, Check, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  "Discover vetted ERP partners",
  "Match by industry, budget, and expertise",
  "Swipe to like or skip partners",
  "Get connected instantly when there's a match",
  "Completely free - no credit card needed",
];

export default function ClientHome() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Find Your Partner</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-client-from/10 flex items-center justify-center">
              <Briefcase className="w-12 h-12 text-client-from" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-client-from to-client-to bg-clip-text text-transparent">
              Find Your Perfect ERP Partner
            </h1>
            <p className="text-2xl text-muted-foreground">
              Discover vetted ERP experts matched to your business needs
            </p>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ERP Matcher uses intelligent matching to connect you with the right partners—based on your industry, budget, and expertise needs. Browse profiles, swipe to like or skip, and get matched instantly.
          </p>
        </section>

        {/* Benefits Card */}
        <Card className="p-12 bg-gradient-to-br from-client-from/5 via-transparent to-client-to/5">
          <h2 className="text-2xl font-bold mb-6">Why Choose ERP Matcher?</h2>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-6 h-6 text-client-from flex-shrink-0 mt-0.5" />
                <span className="text-lg">{benefit}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* CTA Section */}
        <section className="space-y-6 text-center">
          <div>
            <h2 className="text-3xl font-bold mb-3">Ready to Find Your Match?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start swiping and connect with qualified ERP partners today
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link href="/client/signup">
              <Button 
                className="w-full bg-gradient-to-r from-client-from to-client-to text-white"
                size="lg"
                data-testid="button-signup"
              >
                Create Profile
              </Button>
            </Link>
            <Link href="/">
              <Button 
                variant="outline"
                size="lg"
                data-testid="button-back-to-split"
              >
                Back to Options
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/auth" className="text-client-from hover:underline">Sign in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
