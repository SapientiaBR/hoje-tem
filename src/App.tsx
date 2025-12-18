import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthOrganizador from "./pages/AuthOrganizador";
import Organizador from "./pages/Organizador";
import NovoEvento from "./pages/NovoEvento";
import SugerirEvento from "./pages/SugerirEvento";
import Locais from "./pages/Locais";
import LocalDetalhe from "./pages/LocalDetalhe";
import ClaimLocal from "./pages/ClaimLocal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/organizador" element={<AuthOrganizador />} />
            <Route path="/organizador" element={<Organizador />} />
            <Route path="/organizador/novo-evento" element={<NovoEvento />} />
            <Route path="/sugerir-evento" element={<SugerirEvento />} />
            <Route path="/locais" element={<Locais />} />
            <Route path="/local/:id" element={<LocalDetalhe />} />
            <Route path="/local/:id/claim" element={<ClaimLocal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;