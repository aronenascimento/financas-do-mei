import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "@/components/AuthProvider";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import BusinessPage from "./pages/BusinessPage";
import PersonalPage from "./pages/PersonalPage";
import ClientsPage from "./pages/ClientsPage";
import IncomePage from "./pages/IncomePage";
import InvestmentsPage from "./pages/InvestmentsPage";
import DREPage from "./pages/DREPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { FinanceProvider } from "./contexts/FinanceContext"; // Import FinanceProvider

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // If user is authenticated, wrap the main application layout with FinanceProvider
  return (
    <FinanceProvider>
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
    </FinanceProvider>
  );
}

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;