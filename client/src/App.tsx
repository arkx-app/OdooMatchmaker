import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Split from "@/pages/split";
import ClientHome from "@/pages/client-home";
import PartnerHome from "@/pages/partner-home";
import ClientSwipe from "@/pages/client-swipe";
import ClientSignup from "@/pages/client-signup";
import PartnerSignup from "@/pages/partner-signup";
import Pricing from "@/pages/pricing";
import Auth from "@/pages/auth";
import ClientBrief from "@/pages/client-brief";
import ClientDashboard from "@/pages/client-dashboard";
import PartnerDashboard from "@/pages/partner-dashboard";
import PartnerSwipe from "@/pages/partner-swipe";
import Messaging from "@/pages/messaging";
import PartnerAnalytics from "@/pages/partner-analytics";
import BookDemo from "@/pages/book-demo";
import Checkout from "@/pages/checkout";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/get-started" component={Split} />
      <Route path="/auth" component={Auth} />
      <Route path="/client-home" component={ClientHome} />
      <Route path="/partner-home" component={PartnerHome} />
      <Route path="/client/swipe" component={ClientSwipe} />
      <Route path="/client-swipe" component={ClientSwipe} />
      <Route path="/client/signup" component={ClientSignup} />
      <Route path="/client-signup" component={ClientSignup} />
      <Route path="/client/briefs" component={ClientBrief} />
      <Route path="/client/dashboard" component={ClientDashboard} />
      <Route path="/partner/signup" component={PartnerSignup} />
      <Route path="/partner-signup" component={PartnerSignup} />
      <Route path="/partner/dashboard" component={PartnerDashboard} />
      <Route path="/partner/swipe" component={PartnerSwipe} />
      <Route path="/partner/analytics" component={PartnerAnalytics} />
      <Route path="/messages/:id" component={({ id }: any) => <Messaging matchId={id} />} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/book-demo" component={BookDemo} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Show navbar on public pages (home, pricing, get-started, book-demo, auth)
  // Don't show on dashboards (they have their own sidebars) or signup/brief forms (they have back buttons)
  const showNavbar = [
    "/",
    "/pricing",
    "/get-started",
    "/book-demo",
    "/client-home",
    "/partner-home",
  ].includes(location) || location === "/auth";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {showNavbar && <Navbar />}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
