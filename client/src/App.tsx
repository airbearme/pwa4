import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";

// Pages
const Home = lazy(() => import("@/pages/home"));
const Auth = lazy(() => import("@/pages/auth"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Map = lazy(() => import("@/pages/map"));
const Bodega = lazy(() => import("@/pages/bodega"));
const Checkout = lazy(() => import("@/pages/checkout"));
const Promo = lazy(() => import("@/pages/promo"));
const Support = lazy(() => import("@/pages/support"));
const Safety = lazy(() => import("@/pages/safety"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Challenges = lazy(() => import("@/pages/challenges"));
const Rewards = lazy(() => import("@/pages/rewards"));
const DriverDashboard = lazy(() => import("@/pages/driver-dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Components
import Header from "@/components/header";
import Footer from "@/components/footer";
import ParticleSystem from "@/components/particle-system";
import ErrorBoundary from "@/components/error-boundary";
import AirbearWheel from "@/components/airbear-wheel";

function Router() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <ParticleSystem />
      <Header />

      <main className="flex-1 relative z-10">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <AirbearWheel size="lg" animated className="text-primary opacity-50" />
            </div>
          }>
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
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Global AirBear mascot - visible on every page */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <img
          src="/airbear-mascot.png"
          alt="AirBear mascot"
          className="w-16 h-16 opacity-80 hover:opacity-100 transition-opacity duration-300"
          onError={(e) => {
            console.warn('AirBear mascot image failed to load');
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

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
