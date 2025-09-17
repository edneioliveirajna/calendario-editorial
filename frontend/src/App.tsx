import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ModalProvider } from "@/contexts/ModalContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ModalProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rota raiz - Redirecionar baseado na autenticação */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            {/* Rotas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota para usuários não autenticados tentando acessar rotas protegidas */}
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
                  <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
                  <a 
                    href="/login" 
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Ir para Login
                  </a>
                </div>
              </div>
            } />
            
            {/* Rota de página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
        </ModalProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
