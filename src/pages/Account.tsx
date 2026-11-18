import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { User, Mail, Phone, MapPin, ShoppingBag, Plus, Trash2, LogOut, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Account() {
  const { 
    user, 
    isAuthenticated, 
    login, 
    register, 
    logout, 
    savedAddresses, 
    saveAddress, 
    deleteAddress, 
    orderHistory,
    isLoading 
  } = useAuth();

  // Auth form states
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');

  // Address form states
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('CZ');
  const [isDefaultShipping, setIsDefaultShipping] = useState(true);

  // Active tab inside Account
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Vyplňte prosím všechna povinná pole.');
      return;
    }

    try {
      if (isLoginView) {
        const success = await login(email, password);
        if (!success) setAuthError('Neplatné e-mailové adresa nebo heslo.');
      } else {
        if (!name) {
          setAuthError('Zadejte prosím své jméno.');
          return;
        }
        const success = await register(email, password, name, phone);
        if (!success) setAuthError('Chyba při vytváření účtu. Zkontrolujte údaje.');
      }
    } catch {
      setAuthError('Něco se nepodařilo. Zkuste to znovu.');
    }
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !zip) return;

    saveAddress({
      street,
      city,
      zip,
      country,
      isDefaultShipping,
      isDefaultBilling: isDefaultShipping // zjednodušené na stejné
    });

    // Reset form
    setStreet('');
    setCity('');
    setZip('');
    setIsAddingAddress(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-28 pb-32 flex justify-center items-center px-4 bg-muted/10 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border border-border/80 rounded-2xl shadow-xl p-8 overflow-hidden relative"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User className="w-8 h-8" />
            </div>
          </div>

          <h2 className="text-2xl font-bold font-outfit text-center mb-2">
            {isLoginView ? 'Přihlásit se k účtu' : 'Vytvořit nový účet'}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {isLoginView 
              ? 'Získejte přístup k historii objednávek a uloženým adresám.' 
              : 'Zaregistrujte se pro bleskový nákup a osobní výhody.'}
          </p>

          {authError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginView && (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">Celé Jméno *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Jan Novák"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">Telefon (volitelný)</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+420 123 456 789"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">E-mailová adresa *</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="email@priklad.cz"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1">Heslo *</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full premium-gradient text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLoginView ? 'Přihlásit se' : 'Zaregistrovat se'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-border/80 pt-6">
            <button 
              onClick={() => {
                setIsLoginView(!isLoginView);
                setAuthError('');
              }}
              className="text-primary font-semibold hover:underline text-sm"
            >
              {isLoginView ? 'Nemáte ještě účet? Zaregistrujte se' : 'Již máte účet? Přihlaste se'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentUser = user!;

  return (
    <div className="pt-28 pb-32 max-w-7xl mx-auto px-4 md:px-8 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: NAVIGATION / SIDEBAR */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="bg-white border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center font-outfit text-3xl font-bold mb-4 shadow-md">
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="font-outfit font-bold text-xl">{currentUser.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{currentUser.email}</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold mb-6">
              <Shield className="w-3.5 h-3.5" /> Registrovaný zákazník
            </div>

            <button 
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" /> Odhlásit se
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border border-border/80 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-5 py-4 text-left font-semibold text-sm transition-all border-b border-border/50 ${
                activeTab === 'profile' ? 'bg-primary/5 text-primary border-l-4 border-l-primary' : 'hover:bg-muted/30 text-foreground'
              }`}
            >
              <User className="w-4 h-4" /> Osobní profil
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-5 py-4 text-left font-semibold text-sm transition-all border-b border-border/50 ${
                activeTab === 'orders' ? 'bg-primary/5 text-primary border-l-4 border-l-primary' : 'hover:bg-muted/30 text-foreground'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Moje objednávky
            </button>
            <button 
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-3 px-5 py-4 text-left font-semibold text-sm transition-all ${
                activeTab === 'addresses' ? 'bg-primary/5 text-primary border-l-4 border-l-primary' : 'hover:bg-muted/30 text-foreground'
              }`}
            >
              <MapPin className="w-4 h-4" /> Uložené adresy
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT PANEL */}
        <div className="flex-1 bg-white border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm">
          
          <AnimatePresence mode="wait">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold font-outfit mb-2">Osobní profil</h2>
                  <p className="text-sm text-muted-foreground">Zde naleznete své základní údaje propojené s účtem.</p>
                </div>
                <hr className="border-border/80" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-border rounded-xl bg-muted/10 flex items-center gap-4">
                    <div className="p-3 bg-white border rounded-lg text-primary shadow-sm"><User className="w-5 h-5" /></div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Celé jméno</span>
                      <span className="font-semibold">{currentUser.name}</span>
                    </div>
                  </div>

                  <div className="p-4 border border-border rounded-xl bg-muted/10 flex items-center gap-4">
                    <div className="p-3 bg-white border rounded-lg text-primary shadow-sm"><Mail className="w-5 h-5" /></div>
                    <div>
                      <span className="text-xs text-muted-foreground block">E-mailová adresa</span>
                      <span className="font-semibold">{currentUser.email}</span>
                    </div>
                  </div>

                  <div className="p-4 border border-border rounded-xl bg-muted/10 flex items-center gap-4">
                    <div className="p-3 bg-white border rounded-lg text-primary shadow-sm"><Phone className="w-5 h-5" /></div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Telefonní číslo</span>
                      <span className="font-semibold">{currentUser.phone || 'Nezadáno'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold font-outfit mb-2">Moje objednávky</h2>
                  <p className="text-sm text-muted-foreground">Přehled a stav všech vašich nákupů na našem e-shopu.</p>
                </div>
                <hr className="border-border/80" />

                {orderHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                    <ShoppingBag className="w-16 h-16 opacity-25" />
                    <p className="text-lg font-medium">Zatím jste neprovedli žádnou objednávku.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map(order => (
                      <div key={order.id} className="border border-border rounded-2xl overflow-hidden shadow-sm bg-white">
                        {/* Header objednávky */}
                        <div className="bg-muted/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
                          <div>
                            <span className="text-xs text-muted-foreground block">ČÍSLO OBJEDNÁVKY</span>
                            <span className="font-bold font-outfit text-primary">{order.orderNumber}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 sm:text-right">
                            <div>
                              <span className="text-xs text-muted-foreground block">DATUM NÁKUPU</span>
                              <span className="font-semibold text-sm">{order.createdAt}</span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">CELKOVÁ ČÁSTKA</span>
                              <span className="font-bold text-sm">{order.totalAmount.toLocaleString('cs-CZ')} Kč</span>
                            </div>
                          </div>
                          <div>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'paid' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                              {order.status === 'paid' ? 'Zaplaceno' : 'Čeká na platbu'}
                            </span>
                          </div>
                        </div>
                        {/* Položky objednávky */}
                        <div className="p-6 divide-y divide-border/60">
                          {order.items.map(item => (
                            <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                              <div className="w-14 h-14 bg-white border rounded-lg p-1 shrink-0 flex items-center justify-center">
                                <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-sm block truncate">{item.name}</span>
                                {item.size && <span className="text-xs text-muted-foreground block">Velikost: {item.size}</span>}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-sm font-medium text-muted-foreground">{item.quantity} ks x </span>
                                <span className="font-bold text-sm">{item.price.toLocaleString('cs-CZ')} Kč</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <motion.div 
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold font-outfit mb-2">Uložené adresy</h2>
                    <p className="text-sm text-muted-foreground">Uložte si své adresy pro okamžité předvyplnění při nákupu.</p>
                  </div>
                  {!isAddingAddress && (
                    <button 
                      onClick={() => setIsAddingAddress(true)}
                      className="premium-gradient text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" /> Přidat adresu
                    </button>
                  )}
                </div>
                <hr className="border-border/80" />

                {isAddingAddress && (
                  <motion.form 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleAddAddressSubmit} 
                    className="p-6 border border-primary/20 rounded-2xl bg-primary/5 space-y-4"
                  >
                    <h3 className="font-bold text-sm uppercase tracking-wide text-primary">Nová Adresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground font-bold block mb-1">Ulice a č. popisné *</label>
                        <input 
                          type="text" required value={street} onChange={e => setStreet(e.target.value)} placeholder="Hlavní 123"
                          className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-bold block mb-1">Město *</label>
                        <input 
                          type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="České Budějovice"
                          className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-bold block mb-1">PSČ *</label>
                        <input 
                          type="text" required value={zip} onChange={e => setZip(e.target.value)} placeholder="370 01"
                          className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-bold block mb-1">Země</label>
                        <select 
                          value={country} onChange={e => setCountry(e.target.value)}
                          className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
                        >
                          <option value="CZ">Česká Republika</option>
                          <option value="SK">Slovenská Republika</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" checked={isDefaultShipping} onChange={e => setIsDefaultShipping(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-semibold">Nastavit jako výchozí doručovací adresu</span>
                    </label>

                    <div className="flex gap-4 pt-2">
                      <button 
                        type="button" onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted/50 bg-white"
                      >
                        Zrušit
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 premium-gradient text-white font-bold rounded-lg text-sm shadow hover:shadow-md"
                      >
                        Uložit adresu
                      </button>
                    </div>
                  </motion.form>
                )}

                {savedAddresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                    <MapPin className="w-16 h-16 opacity-25" />
                    <p className="text-lg font-medium">Nemáte uložené žádné adresy.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedAddresses.map(addr => (
                      <div key={addr.id} className="p-6 border border-border rounded-2xl bg-white shadow-sm hover:border-primary/40 transition-colors relative flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="p-2 bg-primary/10 rounded-lg text-primary"><MapPin className="w-4 h-4" /></span>
                            {addr.isDefaultShipping && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                Výchozí
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-foreground mb-1">{addr.street}</p>
                          <p className="text-sm text-muted-foreground mb-4">{addr.city}, {addr.zip}</p>
                          <p className="text-xs text-muted-foreground uppercase font-bold">{addr.country === 'CZ' ? 'Česká Republika' : 'Slovensko'}</p>
                        </div>
                        <div className="flex justify-end pt-4 border-t mt-6">
                          <button 
                            onClick={() => deleteAddress(addr.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Smazat adresu"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
