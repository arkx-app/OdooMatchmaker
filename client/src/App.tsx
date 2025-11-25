import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Split from "@/pages/split";
import ClientHome from "@/pages/client-home";
import PartnerHome from "@/pages/partner-home";
import ClientSwipe from "@/pages/client-swipe";
import ClientSignup from "@/pages/client-signup";
import PartnerSignup from "@/pages/partner-signup";
import Pricing from "@/pages/pricing";
import AuthLogin from "@/pages/auth-login";
import ClientBrief from "@/pages/client-brief";
import PartnerDashboard from "@/pages/partner-dashboard";
import Messaging from "@/pages/messaging";
import PartnerAnalytics from "@/pages/partner-analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Split} />
      <Route path="/auth/login" component={AuthLogin} />
      <Route path="/client-home" component={ClientHome} />
      <Route path="/partner-home" component={PartnerHome} />
      <Route path="/client/swipe" component={ClientSwipe} />
      <Route path="/client-swipe" component={ClientSwipe} />
      <Route path="/client/signup" component={ClientSignup} />
      <Route path="/client-signup" component={ClientSignup} />
      <Route path="/client/briefs" component={ClientBrief} />
      <Route path="/partner/signup" component={PartnerSignup} />
      <Route path="/partner-signup" component={PartnerSignup} />
      <Route path="/partner/dashboard" component={PartnerDashboard} />
      <Route path="/partner/analytics" component={PartnerAnalytics} />
      <Route path="/messages/:id" component={({ id }: any) => <Messaging matchId={id} />} />
      <Route path="/pricing" component={Pricing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
