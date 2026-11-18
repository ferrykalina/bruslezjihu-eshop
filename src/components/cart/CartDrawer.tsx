import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../../lib/CartContext';
import { Link } from 'react-router-dom';

export function CartDrawer() {
  const { 
    isCartOpen, 
    closeCart, 
    items, 
    removeItem, 
    updateQuantity, 
    cartTotal, 
    addItem,
    serviceSharpen,
    setServiceSharpen,
    serviceInsurance,
    setServiceInsurance
  } = useCart();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Časový zámek košíku
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (!isCartOpen || items.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCartOpen, items.length]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const calculatedTotal = cartTotal + (serviceSharpen ? 199 : 0) + (serviceInsurance ? 99 : 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-outfit font-bold text-xl flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Váš nákupní košík
              </h2>
              <button 
                onClick={closeCart}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ČASOVÝ ZÁMEK (CART LOCK TIMER) */}
            {items.length > 0 && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-600 font-semibold select-none">
                <span className="flex items-center gap-1.5">⏱️ Položky Vám rezervujeme ještě po dobu:</span>
                <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded text-amber-700 text-sm font-bold">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {/* PROGRESIVNÍ DOPRAVA ZDARMA & DÁRKY K NÁKUPU */}
            {items.length > 0 && (
              <div className="px-6 py-4 bg-muted/10 border-b border-border/80 select-none">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span>
                    {cartTotal >= 2500 ? (
                      <span className="text-emerald-600 font-bold">✓ Máte DOPRAVU ZDARMA!</span>
                    ) : (
                      <span>K dopravě zdarma chybí <strong className="text-primary">{(2500 - cartTotal).toLocaleString('cs-CZ')} Kč</strong></span>
                    )}
                  </span>
                  <span className="text-muted-foreground font-mono">{cartTotal.toLocaleString('cs-CZ')} / 2 500 Kč</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${Math.min((cartTotal / 2500) * 100, 100)}%` }}
                  />
                </div>
                {/* Dárky milníky */}
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-2">
                  <span className={cartTotal >= 1500 ? 'text-primary' : 'opacity-60'}>🎁 Dárek: Tkaničky (od 1 500 Kč)</span>
                  <span className={cartTotal >= 3000 ? 'text-primary' : 'opacity-60'}>🎁 Dárek: Láhev (od 3 000 Kč)</span>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                  <ShoppingCart className="w-16 h-16 opacity-20" />
                  <p>Váš košík je prázdný.</p>
                  <button 
                    onClick={closeCart}
                    className="text-primary font-medium hover:underline"
                  >
                    Pokračovat v nákupu
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="relative flex gap-4 p-4 border border-border rounded-xl bg-muted/20 overflow-hidden">
                    <div className="w-20 h-20 bg-white rounded-lg p-2 border border-border flex shrink-0 items-center justify-center">
                      <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{item.name}</h4>
                        {item.size && <p className="text-xs text-muted-foreground mt-1">Velikost: {item.size}</p>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-lg bg-background">
                          <button 
                            onClick={() => {
                              if (item.quantity === 1) {
                                setItemToDelete(item.id);
                              } else {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center hover:text-primary"
                          >-</button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:text-primary"
                          >+</button>
                        </div>
                        <span className="font-bold text-primary">{item.price.toLocaleString('cs-CZ')} Kč</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setItemToDelete(item.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* INLINE CONFIRMATION OVERLAY */}
                    <AnimatePresence>
                      {itemToDelete === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute inset-0 bg-background/95 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 border border-red-500/20"
                        >
                          <p className="text-sm font-bold text-foreground mb-3 text-center">Opravdu odstranit?</p>
                          <div className="flex gap-3 w-full max-w-[200px]">
                            <button 
                              onClick={() => setItemToDelete(null)}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                            >
                              Ne
                            </button>
                            <button 
                              onClick={() => {
                                removeItem(item.id);
                                setItemToDelete(null);
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
                            >
                              Ano
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                ))
              )}

              {/* DYNAMICKÉ ODEMČENÉ DÁRKY V SEZNAMU (ALZA-STYLE) */}
              {items.length > 0 && cartTotal >= 1500 && (
                <div className="relative flex gap-4 p-4 border border-emerald-500/20 rounded-xl bg-emerald-500/5 overflow-hidden select-none">
                  <div className="w-20 h-20 bg-white rounded-lg p-2 border border-emerald-500/20 flex shrink-0 items-center justify-center text-3xl shadow-sm">
                    🎗️
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded uppercase tracking-wider block w-fit mb-1">Dárek zdarma</span>
                      <h4 className="font-bold text-sm leading-tight text-foreground">Vosk na tkaničky / Tkaničky (pár)</h4>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">Odemčeno k nákupu nad 1 500 Kč</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground font-semibold">1 ks</span>
                      <span className="font-bold text-emerald-600 text-sm">ZDARMA</span>
                    </div>
                  </div>
                </div>
              )}

              {items.length > 0 && cartTotal >= 3000 && (
                <div className="relative flex gap-4 p-4 border border-emerald-500/20 rounded-xl bg-emerald-500/5 overflow-hidden select-none">
                  <div className="w-20 h-20 bg-white rounded-lg p-2 border border-emerald-500/20 flex shrink-0 items-center justify-center text-3xl shadow-sm">
                    🍼
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded uppercase tracking-wider block w-fit mb-1">Dárek zdarma</span>
                      <h4 className="font-bold text-sm leading-tight text-foreground">Sportovní láhev Bauer (0.75l)</h4>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">Odemčeno k nákupu nad 3 000 Kč</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground font-semibold">1 ks</span>
                      <span className="font-bold text-emerald-600 text-sm">ZDARMA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DYNAMICKÝ UPSELL (ALZA-STYLE) */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-t border-border bg-primary/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Doporučené příslušenství</h4>
                <div className="flex gap-4 items-center bg-white p-3 border border-primary/10 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-slate-50 border rounded-lg flex items-center justify-center p-1 shrink-0 text-lg">
                    🎗️
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs block truncate">Prémiové tkaničky do bruslí (pár)</span>
                    <span className="text-xs text-primary font-bold">149 Kč</span>
                  </div>
                  <button 
                    onClick={() => addItem({
                      id: 'upsell-laces',
                      productId: 'upsell-laces',
                      name: 'Prémiové tkaničky do bruslí (pár)',
                      price: 149,
                      imageUrl: 'https://hejduksport.blob.core.windows.net/hejduksport/Media/Pohoda/Images/6P0J34C0/blatniky_Powers_3445_default-p.jpeg',
                    })}
                    className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                  >
                    + Přidat
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 bg-muted/20">
                {/* Doplňkové prémiové služby */}
                <div className="mb-6 space-y-3 border-b border-border/60 pb-4 select-none">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Doplňkové prémiové služby</span>
                  <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-muted/40 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={serviceSharpen} 
                      onChange={(e) => setServiceSharpen(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary mt-0.5"
                    />
                    <div className="text-xs">
                      <span className="font-bold block text-foreground">⛸️ První profesionální nabroušení bruslí</span>
                      <span className="text-muted-foreground">Ostré a připravené ihned na led (+199 Kč)</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-muted/40 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={serviceInsurance} 
                      onChange={(e) => setServiceInsurance(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary mt-0.5"
                    />
                    <div className="text-xs">
                      <span className="font-bold block text-foreground">🛡️ Pojištění proti poškození a rozbití</span>
                      <span className="text-muted-foreground">Klid na duši na celých 12 měsíců (+99 Kč)</span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground">Celkem k úhradě</span>
                  <span className="font-bold text-2xl text-foreground">{calculatedTotal.toLocaleString('cs-CZ')} Kč</span>
                </div>
                <Link 
                  to="/pokladna"
                  onClick={closeCart}
                  className="w-full premium-gradient text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
                >
                  Přejít k pokladně <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
