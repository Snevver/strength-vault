import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import UpperA from "./pages/UpperA";
import UpperB from "./pages/UpperB";
import LowerA from "./pages/LowerA";
import LowerB from "./pages/LowerB";
import Progress from "./pages/Progress";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upper-a" 
            element={
              <ProtectedRoute>
                <UpperA />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upper-b" 
            element={
              <ProtectedRoute>
                <UpperB />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lower-a" 
            element={
              <ProtectedRoute>
                <LowerA />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lower-b" 
            element={
              <ProtectedRoute>
                <LowerB />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
  </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
