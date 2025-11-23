import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Split from "@/pages/split";
import ClientSwipe from "@/pages/client-swipe";
import ClientSignup from "@/pages/client-signup";
import PartnerSignup from "@/pages/partner-signup";
import Pricing from "@/pages/pricing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/split" component={Split} />
      <Route path="/client/swipe" component={ClientSwipe} />
      <Route path="/client-swipe" component={ClientSwipe} />
      <Route path="/client/signup" component={ClientSignup} />
      <Route path="/client-signup" component={ClientSignup} />
      <Route path="/partner/signup" component={PartnerSignup} />
      <Route path="/partner-signup" component={PartnerSignup} />
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
