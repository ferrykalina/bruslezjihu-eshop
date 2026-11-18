import React, { useState } from 'react';
import { ChevronRight, ChevronDown, SlidersHorizontal, Check, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/product/ProductCard';
import { CategorySidebar } from '../components/layout/CategorySidebar';
import { cn } from '../lib/utils';
import PREVIEW_PRODUCTS from '../preview_data.json';

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 25000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Nejprodávanější');
  const maxPrice = 25000;

  // Filtrování produktů
  const filteredProducts = PREVIEW_PRODUCTS.filter(product => {
    // Filtr kategorií
    if (categoryParam) {
      const catLower = categoryParam.toLowerCase();
      const prodCatLower = (product.category || '').toLowerCase();
      // Matchuje buď přesný název nebo částečnou shodu
      if (!prodCatLower.includes(catLower)) {
        return false;
      }
    }
    // Filtr pouze skladem
    // Ve feedu mají mockované stock >= 0. Předpokládáme, že pokud stock chybí, je skladem 5
    const stock = 'stock' in product ? (product as any).stock : 5;
    if (inStockOnly && stock <= 0) {
      return false;
    }
    // Filtr ceny
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    // Vyhledávání textu
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Řazení produktů
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'Od nejlevnějšího') {
      return a.price - b.price;
    }
    if (sortOption === 'Od nejdražšího') {
      return b.price - a.price;
    }
    if (sortOption === 'Novinky') {
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    }
    return 0; // Nejprodávanější
  });

  return (
    <>
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          appearance: none;
          background: #fff;
          border: 2px solid #0f172a;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        }
        .slider-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          appearance: none;
          background: #fff;
          border: 2px solid #0f172a;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
      <div className="pt-24 pb-20 w-full px-4 md:px-8">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <span>Domů</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Všechny produkty</span>
        {categoryParam && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-bold capitalize">{categoryParam}</span>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Levý panel - Kategorie a Filtry */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 gap-6">
          {/* Kategorie */}
          <CategorySidebar />

          {/* Filtry */}
          <div className="border border-border/80 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="bg-muted/50 px-4 py-3 border-b border-border/80 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-foreground uppercase tracking-wide text-sm">Filtrování</h3>
            </div>
            
            <div className="p-5 flex flex-col gap-6">
              {/* Vyhledávání v katalogu */}
              <div>
                <span className="text-sm font-bold block mb-3">Vyhledat</span>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Název produktu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-border/80 rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                </div>
              </div>

              <hr className="border-border/60" />

              {/* Dostupnost */}
              <div>
                <span className="text-sm font-bold block mb-3">Dostupnost</span>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">Pouze skladem</span>
                </label>
              </div>

              <hr className="border-border/60" />

              {/* Cena */}
              <div>
                <span className="text-sm font-bold block mb-4">Cena (Kč)</span>
                
                <div className="relative w-full h-1.5 bg-muted rounded-full mt-2 mb-6">
                  <div 
                    className="absolute h-full bg-primary z-10 rounded-full pointer-events-none" 
                    style={{ left: `${(priceRange[0]/maxPrice)*100}%`, right: `${100 - (priceRange[1]/maxPrice)*100}%` }}
                  ></div>

                  <input 
                    type="range" min="0" max={maxPrice} step="100" value={priceRange[0]} 
                    onChange={e => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1] - 500), priceRange[1]])}
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20 slider-thumb"
                  />
                  <input 
                    type="range" min="0" max={maxPrice} step="100" value={priceRange[1]} 
                    onChange={e => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 500)])}
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20 slider-thumb"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-full border border-border/80 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center"
                  />
                  <span className="text-muted-foreground">-</span>
                  <input 
                    type="number" 
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                    className="w-full border border-border/80 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRAVÝ PANEL - PRODUKTY */}
        <div className="flex-1">
          {/* Header katalogu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-outfit font-bold">
                {categoryParam ? `Kategorie: ${categoryParam}` : 'Všechny produkty'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Nalezeno {sortedProducts.length} položek</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Řadit podle:</span>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                <option>Nejprodávanější</option>
                <option>Od nejlevnějšího</option>
                <option>Od nejdražšího</option>
                <option>Novinky</option>
              </select>
            </div>
          </div>

          {/* Grid Produktů */}
          {sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-xl gap-3">
              <span className="text-lg font-medium">Nebyly nalezeny žádné produkty</span>
              <p className="text-sm">Zkuste změnit nastavení filtrů nebo vyhledávaný výraz.</p>
              <button 
                onClick={() => {
                  setPriceRange([0, maxPrice]);
                  setInStockOnly(false);
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="text-primary font-bold hover:underline mt-2"
              >
                Resetovat všechny filtry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
          
          {/* Stránkování */}
          {sortedProducts.length > 20 && (
            <div className="mt-12 flex justify-center">
              <button className="bg-muted hover:bg-muted/80 text-foreground px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                Načíst další produkty
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
    </>
  );
}

