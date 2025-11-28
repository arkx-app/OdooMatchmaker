import { ArrowLeft, Calendar, Clock, Users, CheckCircle2, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  "Personalized walkthrough of the platform",
  "Learn how to maximize your partner reach",
  "Get answers to all your questions",
  "Discover the best plan for your business",
  "No obligation, completely free",
];

export default function BookDemo() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/pricing">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Book a Demo</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Let's Find the Right Plan for You
              </h1>
              <p className="text-xl text-muted-foreground">
                Schedule a free 30-minute demo with our team to discover how ERP Matcher can help grow your Odoo partnership business.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-partner-from" />
                <span>30 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-partner-from" />
                <span>1-on-1 session</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-partner-from" />
                <span>Flexible scheduling</span>
              </div>
            </div>

            <Card className="p-6 space-y-4 bg-gradient-to-br from-partner-from/5 to-partner-to/5">
              <h3 className="font-semibold text-lg">What you'll get from the demo:</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-partner-from flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Prefer to reach out directly?</h3>
              <div className="space-y-3">
                <a 
                  href="mailto:demo@erpmatcher.com" 
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-email"
                >
                  <Mail className="w-5 h-5 text-partner-from" />
                  <span>demo@erpmatcher.com</span>
                </a>
                <a 
                  href="tel:+1234567890" 
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-phone"
                >
                  <Phone className="w-5 h-5 text-partner-from" />
                  <span>+1 (234) 567-890</span>
                </a>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 lg:p-8 min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-partner-from/30">
              <div className="w-20 h-20 rounded-full bg-partner-from/10 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-partner-from" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Booking Calendar</h3>
                <p className="text-muted-foreground max-w-sm">
                  Our booking calendar will be displayed here. Choose a time that works best for you.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground max-w-sm">
                <p>
                  Calendly or similar booking widget integration coming soon. For now, please contact us directly using the email or phone on the left.
                </p>
              </div>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              By scheduling a demo, you agree to our{" "}
              <a href="#" className="underline hover:text-foreground">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
