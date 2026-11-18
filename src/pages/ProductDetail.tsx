import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Truck, ShieldCheck, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProductCard } from '../components/product/ProductCard';
import PREVIEW_PRODUCTS from '../preview_data.json';
import { useCart } from '../lib/CartContext';

const SIZES = ['39', '40', '41', '42', '42.5', '43', '44', '45'];

export function ProductDetail() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCart();

  // Size Advisor state
  const [isOpenSizeAdvisor, setIsOpenSizeAdvisor] = useState(false);
  const [footLength, setFootLength] = useState<number>(270);
  const [footWidth, setFootWidth] = useState<'D' | 'EE'>('D');

  // Hlídací pes (In-Stock Alert) state
  const [watchEmail, setWatchEmail] = useState('');
  const [watchSuccess, setWatchSuccess] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const calculateSize = (lengthMm: number) => {
    if (lengthMm < 240) return '39';
    if (lengthMm < 250) return '40';
    if (lengthMm < 260) return '41';
    if (lengthMm < 265) return '42';
    if (lengthMm < 272) return '42.5';
    if (lengthMm < 280) return '43';
    if (lengthMm < 290) return '44';
    return '45';
  };

  const recommendedSize = calculateSize(footLength);

  // V reálné aplikaci bychom načetli detail z API, tady si vezmeme ukázkový (nebo první z preview)
  const product = PREVIEW_PRODUCTS.find(p => p.id === id) || PREVIEW_PRODUCTS[0];

  // Zjistíme, zda produkt dává smysl mít velikosti (hrubá simulace pro náhled)
  const isSkate = product.name.toLowerCase().includes('brusle') || product.name.toLowerCase().includes('skate');
  const needsSize = isSkate;

  return (
    <div className="pt-24 pb-32 max-w-7xl mx-auto px-6 lg:px-8">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-primary transition-colors">Domů</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/katalog" className="hover:text-primary transition-colors">Katalog</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 mb-20">
        
        {/* LEVÝ SLOUPEC - GALERIE */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square md:aspect-[4/3] bg-white border border-border/50 rounded-2xl overflow-hidden flex items-center justify-center p-8 group">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
          {/* Miniatury (dummy) */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <button key={i} className="w-24 h-24 shrink-0 bg-white border border-border rounded-xl p-2 hover:border-primary transition-colors">
                <img src={product.imageUrl} className="w-full h-full object-contain mix-blend-multiply opacity-50 hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* PRAVÝ SLOUPEC - INFORMACE */}
        <div className="flex flex-col">
          <h1 className="text-3xl lg:text-4xl font-outfit font-bold text-foreground mb-4">{product.name}</h1>
          
          {/* Recenze a kategorie */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current opacity-30" />
            </div>
            <span className="text-sm text-muted-foreground border-l border-border pl-4">{product.category}</span>
          </div>

          {product.description ? (
            <div 
              className="text-muted-foreground mb-8 text-sm leading-relaxed max-h-48 overflow-y-auto pr-2 border-b border-border/40 pb-4 prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : (
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              Vysoce kvalitní vybavení z kolekce 2026. Přesná specifikace podle originálního dodavatele. Ideální pro ty, kteří hledají maximální výkon na ledě.
            </p>
          )}

          <div className="bg-muted/50 p-6 rounded-2xl mb-8 border border-border/50">
            {/* FOMO BADGE */}
            <div className="flex items-center gap-2 mb-4 bg-red-500/10 text-red-600 px-3 py-1.5 rounded-xl border border-red-500/20 text-xs font-bold w-fit animate-pulse select-none">
              🔥 Tento produkt si právě prohlíží 5 lidí a zbývají poslední 2 kusy!
            </div>

            <div className="flex items-end gap-4 mb-6">
              <span className="text-4xl font-bold text-red-600 tracking-tight">{product.price.toLocaleString('cs-CZ')} Kč</span>
              <span className="text-sm text-muted-foreground mb-1">vč. DPH</span>
            </div>

            {/* Doručení a Sklad */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-3 text-emerald-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Skladem &gt; 5 ks
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground bg-background border border-border rounded-lg p-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <span className="font-semibold block">Kdy to dostanu?</span>
                  <span className="text-muted-foreground">Při objednání do 16:00 doručíme zítra.</span>
                </div>
              </div>
            </div>

            {/* Varianty (zobrazí se pouze u bruslí) */}
            {needsSize && (
              <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                  <span className="font-semibold text-sm">Velikost (EUR)</span>
                  <button 
                    type="button" 
                    onClick={() => setIsOpenSizeAdvisor(true)} 
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    📐 Průvodce velikostí (Size Advisor)
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => {
                    const isSizeOutOfStock = size === '41' || size === '44';
                    return (
                      <button 
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setWatchSuccess(false);
                        }}
                        className={cn(
                          "w-12 h-12 rounded-xl border flex items-center justify-center font-medium transition-all relative",
                          isSizeOutOfStock 
                            ? "border-amber-200 bg-amber-50/20 text-amber-600" 
                            : selectedSize === size 
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border bg-background hover:border-primary",
                          isSizeOutOfStock && selectedSize === size && "border-amber-500 bg-amber-100/50 text-amber-800"
                        )}
                      >
                        {size}
                        {isSizeOutOfStock && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && <p className="text-xs text-red-500 mt-2">* Vyberte velikost pro přidání do košíku</p>}
              </div>
            )}

            {/* HLÍDACÍ PES PRO VYPRODANÉ VELIKOSTI */}
            {selectedSize && (selectedSize === '41' || selectedSize === '44') ? (
              <div className="mb-6 p-4 border border-amber-500/20 rounded-2xl bg-amber-500/5 space-y-3">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide block">🔔 Tato velikost je dočasně vyprodaná</span>
                <p className="text-xs text-muted-foreground">Zadejte svůj e-mail a my vám pošleme zprávu hned, jak ji naskladníme!</p>
                {watchSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs font-bold text-center">
                    ✓ Hlídací pes byl úspěšně aktivován!
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="vas@email.cz" 
                      value={watchEmail} 
                      onChange={e => setWatchEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:border-primary text-xs"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (watchEmail) {
                          setWatchSuccess(true);
                        }
                      }}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow transition-colors"
                    >
                      Hlídat
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                disabled={needsSize && !selectedSize}
                onClick={() => {
                  addItem({
                    id: `${product.id}-${selectedSize || 'none'}`,
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    size: selectedSize || undefined
                  });
                }}
                className="w-full premium-gradient text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ShoppingCart className="w-6 h-6" />
                Vložit do košíku
              </button>
            )}
          </div>

          <ul className="space-y-4 text-sm font-medium text-foreground">
            <li className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Záruka vrácení peněz do 30 dnů.
            </li>
          </ul>

        </div>
      </div>



      {/* CROSS SELLING */}
      <section className="pt-12 border-t border-border">
        <h2 className="text-2xl font-outfit font-bold mb-8">Zákazníci také kupují</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
          {PREVIEW_PRODUCTS.slice(10, 16).map((p, i) => (
            <ProductCard key={`${p.id}-${i}`} {...p} />
          ))}
        </div>
      </section>

      {/* SIZE ADVISOR MODAL */}
      {isOpenSizeAdvisor && (
        <>
          <div 
            onClick={() => setIsOpenSizeAdvisor(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200]"
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-border shadow-2xl rounded-3xl z-[210] p-6 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h3 className="font-outfit font-bold text-xl flex items-center gap-2 text-foreground">
                  📐 3D Size Advisor
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Interaktivní průvodce velikostí na základě délky chodidla.</p>
              </div>
              <button 
                onClick={() => setIsOpenSizeAdvisor(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-sm font-bold text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Foot Length Input slider */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  Délka Vašeho chodidla: <span className="text-primary font-mono text-sm">{footLength} mm</span>
                </label>
                <input 
                  type="range" 
                  min="230" 
                  max="300" 
                  value={footLength} 
                  onChange={e => setFootLength(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                  <span>230 mm</span>
                  <span>265 mm</span>
                  <span>300 mm</span>
                </div>
              </div>

              {/* Foot Width selector */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">Šířka nohy</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setFootWidth('D')}
                    className={cn(
                      "p-3 border rounded-xl text-xs font-bold transition-all text-foreground",
                      footWidth === 'D' 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border hover:bg-muted/40"
                    )}
                  >
                    D - Standardní šířka
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFootWidth('EE')}
                    className={cn(
                      "p-3 border rounded-xl text-xs font-bold transition-all text-foreground",
                      footWidth === 'EE' 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border hover:bg-muted/40"
                    )}
                  >
                    EE - Široká noha
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                  * EE je přibližně o 3-5 mm širší než standard D. Doporučujeme pro hokejisty s širším nártem nebo plochou nohou.
                </p>
              </div>

              {/* Recommendation results */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-center">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Doporučená velikost brusle</span>
                <span className="text-3xl font-bold text-primary font-mono block mb-1">{recommendedSize} {footWidth}</span>
                <span className="text-[10px] text-muted-foreground block">Doporučeno na základě délky chodidla {footLength} mm a šířky {footWidth}.</span>
              </div>

              <button 
                type="button"
                onClick={() => {
                  setSelectedSize(recommendedSize);
                  setIsOpenSizeAdvisor(false);
                }}
                className="w-full premium-gradient text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
              >
                Použít doporučenou velikost: {recommendedSize}
              </button>
            </div>
          </div>
        </>
      )}

      {/* STICKY MOBILE CART BUTTON */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border z-50">
         <button 
            disabled={needsSize && (!selectedSize || selectedSize === '41' || selectedSize === '44')}
            onClick={() => {
              addItem({
                id: `${product.id}-${selectedSize || 'none'}`,
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                size: selectedSize || undefined
              });
            }}
            className="w-full premium-gradient text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
          >
            Vložit do košíku - {product.price.toLocaleString('cs-CZ')} Kč
          </button>
      </div>

    </div>
  );
}
