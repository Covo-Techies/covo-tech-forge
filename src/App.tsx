import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import FeaturedProducts from "./pages/admin/FeaturedProducts";
import OrderManagement from "./pages/admin/OrderManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import Analytics from "./pages/admin/Analytics";
import Promotions from "./pages/admin/Promotions";
import UserRoles from "./pages/admin/UserRoles";
import Messages from "./pages/admin/Messages";
import Settings from "./pages/admin/Settings";
import Payments from "./pages/admin/Payments";
import ProductImages from "./pages/admin/ProductImages";
import ReviewManagement from "./pages/admin/ReviewManagement";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import HelpCenter from "./pages/HelpCenter";
import Returns from "./pages/Returns";
import Warranty from "./pages/Warranty";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import WhatsAppSupport from "./components/WhatsAppSupport";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/auth';
  const shouldShowWhatsApp = !isAdminPage && !isAuthPage;

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/warranty" element={<Warranty />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="featured-products" element={<FeaturedProducts />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="payments" element={<Payments />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="roles" element={<UserRoles />} />
          <Route path="messages" element={<Messages />} />
          <Route path="product-images" element={<ProductImages />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* WhatsApp Support - Show on customer pages only */}
      {shouldShowWhatsApp && <WhatsAppSupport />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
