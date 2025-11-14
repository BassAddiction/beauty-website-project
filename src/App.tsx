
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import GetAccess from "./pages/GetAccess";
import Admin from "./pages/Admin";
import AdminUpdate from "./pages/AdminUpdate";
import AdminUsers from "./pages/AdminUsers";
import TestWebhook from "./pages/TestWebhook";
import Terms from "./pages/Terms";
import SubscriptionBuilder from "./pages/SubscriptionBuilder";
import Reviews from "./pages/Reviews";
import News from "./pages/News";
import VpnYoutube from "./pages/VpnYoutube";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/get-access" element={<GetAccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/update" element={<AdminUpdate />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/test-webhook" element={<TestWebhook />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/builder" element={<SubscriptionBuilder />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/news" element={<News />} />
          <Route path="/vpn-youtube" element={<VpnYoutube />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;