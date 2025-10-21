import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary, handleErrorBoundaryError } from "./components/ErrorBoundary";
import { PHAProvider } from "@/contexts/PHAContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Discussions from "./pages/Discussions";
import DiscussionDetail from "./pages/DiscussionDetail";
import KnowledgeBase from "./pages/KnowledgeBase";
import Chat from "./pages/Chat";
import Polls from "./pages/Polls";
import Benchmarks from "./pages/Benchmarks";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary onError={handleErrorBoundaryError}>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <PHAProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_relativeSplatPath: true }}>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/discussions" element={<Discussions />} />
                  <Route path="/discussions/:slug" element={<DiscussionDetail />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/polls" element={<Polls />} />
                  <Route path="/benchmarks" element={<Benchmarks />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
        </PHAProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
