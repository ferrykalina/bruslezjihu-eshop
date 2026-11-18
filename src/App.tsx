import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Account } from './pages/Account';
import { Checkout } from './pages/Checkout';
import { CartProvider } from './lib/CartContext';
import { AuthProvider } from './lib/AuthContext';
import { CartDrawer } from './components/cart/CartDrawer';
import { OlikHelper } from './components/ui/OlikHelper';

// Komponenta pro skrolování nahoru při změně trasy
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <div className="min-h-screen bg-background font-sans selection:bg-primary/30">
            <Header />
            <CartDrawer />
            <OlikHelper />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/katalog" element={<Catalog />} />
                <Route path="/produkt/:id" element={<ProductDetail />} />
                <Route path="/ucet" element={<Account />} />
                <Route path="/pokladna" element={<Checkout />} />
              </Routes>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
