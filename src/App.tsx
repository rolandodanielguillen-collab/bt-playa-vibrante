import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import TournamentDetails from "./pages/TournamentDetails";
import TournamentBrackets from "./pages/TournamentBrackets";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Tournaments from "./pages/admin/Tournaments";
import Categories from "./pages/admin/Categories";
import Players from "./pages/admin/Players";
import Teams from "./pages/admin/Teams";
import Courts from "./pages/admin/Courts";
import Registrations from "./pages/admin/Registrations";
import Payments from "./pages/admin/Payments";
import Ranking from "./pages/admin/Ranking";
import Brackets from "./pages/admin/Brackets";

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
            <Route path="/torneo/:id" element={<TournamentDetails />} />
            <Route path="/torneo/:id/llaves" element={<TournamentBrackets />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="tournaments" element={<Tournaments />} />
              <Route path="categories" element={<Categories />} />
              <Route path="players" element={<Players />} />
              <Route path="teams" element={<Teams />} />
              <Route path="courts" element={<Courts />} />
              <Route path="registrations" element={<Registrations />} />
              <Route path="payments" element={<Payments />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="brackets" element={<Brackets />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
