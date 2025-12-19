import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "next-themes";

// Pages
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Map from "@/pages/map";
import Bodega from "@/pages/bodega";
import Checkout from "@/pages/checkout";
import Promo from "@/pages/promo";
import Support from "@/pages/support";
import Safety from "@/pages/safety";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Challenges from "@/pages/challenges";
import Rewards from "@/pages/rewards";
import DriverDashboard from "@/pages/driver-dashboard";
import NotFound from "@/pages/not-found";

// Components
import Header from "@/components/header";
import Footer from "@/components/footer";
import ParticleSystem from "@/components/particle-system";

function Router() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <ParticleSystem />
      <Header />

      <main className="flex-1 relative z-10">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={Auth} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/map" component={Map} />
          <Route path="/bodega" component={Bodega} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/challenges" component={Challenges} />
          <Route path="/rewards" component={Rewards} />
          <Route path="/driver-dashboard" component={DriverDashboard} />
          <Route path="/promo" component={Promo} />
          <Route path="/support" component={Support} />
          <Route path="/safety" component={Safety} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
