import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Zap, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCart } from '../../lib/CartContext';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  isNew?: boolean;
}

const SIZES = ['39', '40', '41', '42', '42.5', '43', '44', '45'];

export function ProductCard({ id, name, price, imageUrl, category, isNew }: ProductCardProps) {
  const { addItem } = useCart();
  const [isOpenQuickBuy, setIsOpenQuickBuy] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  // Zjistíme, zda produkt dává smysl mít velikosti (např. brusle)
  const isSkate = name.toLowerCase().includes('brusle') || name.toLowerCase().includes('skate');

  // Stabilní simulace pro každý produkt na základě jeho ID
  const isOutOfStock = id.charCodeAt(0) % 7 === 0;
  const isLastPieces = id.charCodeAt(0) % 5 === 0 && !isOutOfStock;
  const isPopular = id.charCodeAt(0) % 3 === 0 && !isOutOfStock && !isLastPieces;

  const handleQuickBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!isSkate) {
      // Pokud to není brusle (tzn. nepotřebuje velikost), rovnou vložíme
      addItem({
        id: `${id}-none`,
        productId: id,
        name,
        price,
        imageUrl
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } else {
      setIsOpenQuickBuy(true);
    }
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSkate && !selectedSize) return;

    addItem({
      id: `${id}-${selectedSize || 'none'}`,
      productId: id,
      name,
      price,
      imageUrl,
      size: selectedSize || undefined
    });

    setIsAdded(true);
    setIsOpenQuickBuy(false);
    setSelectedSize(null);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="relative group flex flex-col bg-background border border-border/50 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden h-full">
      <Link to={`/produkt/${id}`} className="flex flex-col flex-1">
        {/* Obrázek - pevný čtverec */}
        <div className="relative w-full aspect-square overflow-hidden bg-white p-4 flex items-center justify-center">
          {isNew && (
            <div className="absolute top-3 left-3 z-10 bg-primary px-2.5 py-0.5 text-[9px] font-bold text-primary-foreground uppercase tracking-wider rounded shadow-sm">
              Novinka
            </div>
          )}
          {isLastPieces && (
            <div className="absolute top-3 left-3 z-10 bg-red-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider rounded shadow-sm animate-pulse">
              🔥 Poslední 2 ks!
            </div>
          )}
          {isPopular && (
            <div className="absolute top-3 left-3 z-10 bg-amber-500 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider rounded shadow-sm">
              ✨ Populární
            </div>
          )}

          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />

          {/* Quick Buy Button Overlay on Hover */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
              <button
                onClick={handleQuickBuyClick}
                className="px-4 py-2.5 bg-white hover:bg-primary hover:text-white text-foreground font-bold text-xs rounded-xl shadow-lg transition-all transform translate-y-4 group-hover:translate-y-0 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Rychlý nákup
              </button>
            </div>
          )}
        </div>

        {/* Informace */}
        <div className="flex flex-col flex-1 p-4 border-t border-border/30">
          <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{category}</span>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {/* Spodní část: Sklad, Cena, Košík */}
          <div className="mt-auto flex flex-col gap-2 pt-4">
            {isOutOfStock ? (
              <span className="text-xs font-bold text-red-500/80 flex items-center gap-1">
                ✕ Není skladem
              </span>
            ) : isLastPieces ? (
              <span className="text-xs font-bold text-red-600 animate-pulse flex items-center gap-1">
                ⚠️ Poslední kusy na skladě!
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                ✓ Skladem &gt; 5 ks (Zítra u vás)
              </span>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-red-600">{price.toLocaleString('cs-CZ')} Kč</p>
              
              <button 
                onClick={handleQuickBuyClick}
                disabled={isOutOfStock}
                className={cn(
                  "p-2.5 border rounded-xl transition-all shadow-sm flex items-center justify-center shrink-0",
                  isAdded 
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isOutOfStock
                      ? "opacity-30 cursor-not-allowed bg-muted text-muted-foreground"
                      : "border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                )}
              >
                {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* QUICK BUY SIZE SELECTOR POP-UP OVERLAY */}
      <AnimatePresence>
        {isOpenQuickBuy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-md z-20 flex flex-col p-4 justify-between"
          >
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <span className="font-bold text-xs text-foreground">Vyberte velikost</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpenQuickBuy(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-bold p-1"
              >
                Zavřít
              </button>
            </div>

            {/* Sizes selector grid */}
            <div className="grid grid-cols-4 gap-1.5 my-3">
              {SIZES.map(size => {
                const isSizeOutOfStock = size === '41' || size === '44';
                return (
                  <button
                    key={size}
                    disabled={isSizeOutOfStock}
                    onClick={(e) => handleSizeSelect(e, size)}
                    className={cn(
                      "h-9 text-xs font-bold rounded-lg border transition-all flex items-center justify-center",
                      isSizeOutOfStock
                        ? "opacity-30 bg-muted text-muted-foreground line-through cursor-not-allowed"
                        : selectedSize === size
                          ? "bg-primary border-primary text-white shadow-sm"
                          : "border-border hover:border-primary text-foreground"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {selectedSize && (
                <span className="text-[10px] text-muted-foreground block text-center">
                  Zvolená velikost: <strong className="text-primary font-mono">{selectedSize}</strong>
                </span>
              )}
              <button
                onClick={handleAddToCart}
                disabled={isSkate && !selectedSize}
                className="w-full premium-gradient text-white text-xs font-bold py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
              >
                Vložit do košíku
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
