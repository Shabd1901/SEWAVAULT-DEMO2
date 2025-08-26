import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Deposit from "@/pages/deposit";
import Return from "@/pages/return";
import NotFound from "@/pages/not-found";
import { QrCode } from "lucide-react";

function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-md">
        <div className="flex items-center space-x-3">
          <QrCode size={24} />
          <h1 className="text-xl font-medium">SEWAVAULT DEMO2</h1>
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/deposit" component={Deposit} />
      <Route path="/return" component={Return} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-md">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
