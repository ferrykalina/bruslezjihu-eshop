import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { CategorySidebar } from '../components/layout/CategorySidebar';
import PREVIEW_PRODUCTS from '../preview_data.json';

export function Home() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-20">
      
      {/* HERO SECTION & SIDEBAR */}
      <div className="flex items-stretch gap-8 px-4 md:px-8 w-full mb-32">
        
        {/* Levý panel (Kategorie) - viditelný pouze na velkých obrazovkách */}
        <div className="hidden lg:block w-64 shrink-0">
          <CategorySidebar />
        </div>

        {/* Hero Banner */}
        <section className="flex-1 relative rounded-3xl overflow-hidden bg-zinc-900 flex items-center shadow-2xl min-h-[400px]">
          {/* Ochranný gradient pro čitelnost textu */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
          
          <img 
            src="https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Hockey" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
          />

          <div className="relative z-20 px-8 md:px-16 max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold tracking-widest uppercase mb-4 border border-white/20"
            >
              Nová kolekce 2026
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-outfit font-bold text-white mb-6 leading-[1.1] tracking-tight"
            >
              Ovládněte led <br/>s nejlepším vybavením.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-zinc-300 mb-8 max-w-lg font-medium"
            >
              Profesionální hokejové a krasobruslařské vybavení pro ty, kteří nechtějí dělat kompromisy.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button className="bg-white text-black px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-colors transform hover:scale-105 duration-200 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                Procházet katalog <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="px-4 md:px-8 w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-outfit font-bold tracking-tight text-foreground">Nejžádanější kousky</h2>
            <p className="text-muted-foreground mt-2 font-medium">To nejlepší, co právě frčí na ledě.</p>
          </div>
          <button className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            Zobrazit vše <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
          {PREVIEW_PRODUCTS.slice(0, 12).map((product, i) => (
            <ProductCard key={`${product.id}-${i}`} {...product} />
          ))}
        </div>
        
        <button className="sm:hidden w-full mt-8 py-4 rounded-xl border-2 border-border font-semibold text-foreground hover:bg-muted transition-colors">
          Zobrazit celý katalog
        </button>
      </section>

      {/* HOKEJISTÉ REVIEWS SECTION */}
      <section className="px-4 md:px-8 w-full mt-32 pt-16 border-t border-border/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">Reference</span>
            <h2 className="text-3xl md:text-4xl font-outfit font-bold tracking-tight text-foreground mt-4">Co říkají hokejisté o Bruslích z Jihu</h2>
            <p className="text-muted-foreground mt-2 font-medium">Reálné hodnocení a fotky od našich spokojených zákazníků přímo z ledu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Marek H. (Hobby liga)', rating: 5, date: 'před 2 dny', text: 'Skvělé brusle na ledu! Noha perfektně sedí, EE šířka mi zachránila otlaky. Doporučuji všem. Rychlé doručení a dárky potěšily.', img: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&q=80&w=800' },
              { name: 'Lukáš K. (HC Budějovice)', rating: 5, date: 'před 1 týdnem', text: 'Rychlé doručení (druhý den doma). Nabroušení od e-shopu je perfektní. Pevný skelet a skvělá odezva při odrazu. Doporučuji!', img: null },
              { name: 'Jan M. (Hobby hokejista)', rating: 5, date: 'před 3 dny', text: 'Byl jsem skeptický k nákupu online, ale Size Advisor mi doporučil přesnou velikost. Sedí to milimetrově. Parádní práce!', img: null }
            ].map((rev, i) => (
              <div key={i} className="p-6 bg-white dark:bg-muted/10 border border-border/80 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm block text-foreground">{rev.name}</span>
                      <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <span key={idx}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.text}</p>
                </div>
                {rev.img && (
                  <div className="w-16 h-16 bg-white border border-border rounded-2xl p-1 overflow-hidden flex items-center justify-center shadow-sm mt-4">
                    <img src={rev.img} className="max-w-full max-h-full object-contain" alt="Recenze" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
