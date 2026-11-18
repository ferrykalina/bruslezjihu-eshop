import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, User, ChevronDown, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useCart } from '../../lib/CartContext';
import logoImg from '../../../Assets/Logo eshop.webp';
import PREVIEW_PRODUCTS from '../../preview_data.json';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, openCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
          scrolled ? "bg-background/80 backdrop-blur-md border-border shadow-sm py-4" : "bg-transparent py-6"
        )}
      >
        <div className="w-full px-4 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center relative z-50">
            <img src={logoImg} alt="Brusle z Jihu" className="h-12 w-auto object-contain mix-blend-multiply [filter:brightness(1.15)_contrast(1.2)]" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/katalog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Hokej
            </Link>
            <Link to="/katalog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Krasobruslení
            </Link>
            <Link to="/katalog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Doplňky
            </Link>
            <Link to="/katalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Výprodej
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="text-foreground hover:text-primary transition-colors p-1"
              title={darkMode ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setSearchOpen(!searchOpen)} 
                className="text-foreground hover:text-primary transition-colors p-1"
                title="Vyhledávání"
              >
                <Search className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <>
                    <div 
                      onClick={() => setSearchOpen(false)} 
                      className="fixed inset-0 z-40 bg-black/10" 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-border shadow-2xl rounded-2xl p-4 z-50 select-none text-foreground"
                    >
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Hledat brusle, chrániče, doplňky..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary text-xs mb-3 text-foreground bg-white"
                      />
                      
                      {/* Zero-Search Recommendations */}
                      {searchQuery.trim() === '' ? (
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Populární kategorie</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Brusle Bauer', 'Hokejky CCM', 'Chrániče nožů', 'Vosk na tkaničky'].map((tag) => (
                                <button 
                                  key={tag}
                                  onClick={() => {
                                    setSearchQuery(tag);
                                  }}
                                  className="px-2.5 py-1 bg-muted/60 hover:bg-primary/5 hover:text-primary text-[10px] font-bold rounded-lg border border-border/45 transition-colors"
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Doporučené produkty</span>
                            <div className="space-y-2">
                              {PREVIEW_PRODUCTS.slice(0, 3).map((p) => (
                                <Link 
                                  key={p.id}
                                  to={`/produkt/${p.id}`}
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                                >
                                  <div className="w-8 h-8 bg-white border rounded flex items-center justify-center p-0.5 shrink-0">
                                    <img src={p.imageUrl} className="max-w-full max-h-full object-contain" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold block truncate leading-tight">{p.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{p.category}</span>
                                  </div>
                                  <span className="text-xs font-bold text-red-500">{p.price.toLocaleString('cs-CZ')} Kč</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Nalezené produkty</span>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {PREVIEW_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                              .slice(0, 5)
                              .map((p) => (
                                <Link 
                                  key={p.id}
                                  to={`/produkt/${p.id}`}
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                                >
                                  <div className="w-8 h-8 bg-white border rounded flex items-center justify-center p-0.5 shrink-0">
                                    <img src={p.imageUrl} className="max-w-full max-h-full object-contain" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold block truncate leading-tight">{p.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{p.category}</span>
                                  </div>
                                  <span className="text-xs font-bold text-red-500">{p.price.toLocaleString('cs-CZ')} Kč</span>
                                </Link>
                              ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <Link to="/ucet" className="text-foreground hover:text-primary transition-colors hidden sm:block">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={openCart} className="relative text-foreground hover:text-primary transition-colors group">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center scale-100 group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              className="md:hidden text-foreground ml-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-background border-l border-border z-[70] p-6 shadow-2xl md:hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="font-outfit font-bold text-xl tracking-tight">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 bg-muted rounded-full text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-6">
                <Link to="/katalog" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Hokej</Link>
                <Link to="/katalog" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Krasobruslení</Link>
                <Link to="/katalog" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Doplňky</Link>
                <Link to="/katalog" className="text-lg font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Výprodej</Link>
                <hr className="border-border my-4" />
                <Link to="/ucet" className="text-lg font-medium flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-5 h-5" /> Můj Účet / Přihlásit se
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
