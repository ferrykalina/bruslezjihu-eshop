import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const ESHOP_CATEGORIES = [
  { id: 'all', name: 'Všechny produkty', param: '' },
  { id: 'hockey', name: 'Hokejové vybavení', param: 'Hokejové vybavení', children: [
    { id: 'skates', name: 'Brusle', param: 'brusle' },
    { id: 'sticks', name: 'Hokejky', param: 'hokej' },
    { id: 'helmets', name: 'Helmy & Ochrana', param: 'helm' },
    { id: 'pads', name: 'Chrániče', param: 'chránič' },
  ]},
  { id: 'wheels', name: 'Kolečka & Ložiska', param: 'koleč', children: [
    { id: 'bearings', name: 'Ložiska', param: 'ložisk' },
    { id: 'wheels-only', name: 'Kolečka', param: 'koleč' }
  ]},
  { id: 'accessories', name: 'Doplňky', param: 'doplň', children: [
    { id: 'bags', name: 'Tašky', param: 'tašk' },
    { id: 'laces', name: 'Tkaničky & Ostatní', param: 'tkanič' },
  ]},
];

export function CategorySidebar() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  return (
    <div className="border border-border/80 rounded-xl bg-white shadow-sm relative z-50">
      <div className="bg-muted/50 px-4 py-3 border-b border-border/80 rounded-t-xl">
        <h3 className="font-bold text-foreground uppercase tracking-wide text-sm">Kategorie</h3>
      </div>
      <div className="p-2">
        {ESHOP_CATEGORIES.map(category => {
          const isActive = activeCategory === category.param;
          const hasChildren = category.children && category.children.length > 0;

          return (
            <div key={category.id} className="group relative">
              <Link 
                to={category.param ? `/katalog?category=${encodeURIComponent(category.param)}` : '/katalog'}
                className={`flex items-center justify-between w-full text-left py-2.5 px-3 hover:bg-muted/50 transition-colors rounded-lg text-sm font-medium ${
                  isActive ? 'text-primary bg-primary/5 font-bold' : 'text-foreground'
                } group-hover:text-primary`}
              >
                <span>{category.name}</span>
                {hasChildren && <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
              </Link>

              {/* Flyout Podkategorie */}
              {hasChildren && category.children && (
                <div className="absolute left-[102%] top-0 w-56 bg-white border border-border shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-muted/50 px-4 py-3 border-b border-border/80 rounded-t-xl">
                    <h4 className="font-bold text-sm text-foreground">{category.name}</h4>
                  </div>
                  <div className="p-2 flex flex-col gap-0.5">
                    {category.children.map(child => {
                      const isChildActive = activeCategory === child.param;
                      return (
                        <Link 
                          to={`/katalog?category=${encodeURIComponent(child.param)}`}
                          key={child.id}
                          className={`flex items-center justify-between w-full text-left py-2 px-3 text-sm rounded-md transition-colors font-medium ${
                            isChildActive ? 'text-primary bg-primary/5 font-bold' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                          }`}
                        >
                          <span>{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

