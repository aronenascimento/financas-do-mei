import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import BusinessPage from "./pages/BusinessPage";
import PersonalPage from "./pages/PersonalPage";
import ClientsPage from "./pages/ClientsPage";
import IncomePage from "./pages/IncomePage";
import InvestmentsPage from "./pages/InvestmentsPage";
import DREPage from "./pages/DREPage";
import NotFound from "./pages/NotFound";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FinanceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/empresa" element={<BusinessPage />} />
                    <Route path="/pessoal" element={<PersonalPage />} />
                    <Route path="/clientes" element={<ClientsPage />} />
                    <Route path="/recebimentos" element={<IncomePage />} />
                    <Route path="/investimentos" element={<InvestmentsPage />} />
                    <Route path="/dre" element={<DREPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          </BrowserRouter>
        </FinanceProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
