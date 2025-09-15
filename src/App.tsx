import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { AuthGuard } from "./components/AuthGuard";
import Auth from "./pages/Auth";
import Errors from "./pages/Errors";
import ErrorDetails from "./pages/ErrorDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <AuthGuard>
              <div className="min-h-screen flex w-full bg-background">
                <Sidebar />
                <main className="flex-1 p-6 overflow-auto">
                  <Errors />
                </main>
              </div>
            </AuthGuard>
          } />
          <Route path="/error/:id" element={
            <AuthGuard>
              <div className="min-h-screen flex w-full bg-background">
                <Sidebar />
                <main className="flex-1 p-6 overflow-auto">
                  <ErrorDetails />
                </main>
              </div>
            </AuthGuard>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
